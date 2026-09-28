"""Decky backend for GitHub release ZIP downloads."""
import asyncio
import json
import logging
import os
import pwd
import re
import shutil
import ssl
import stat
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
import urllib.parse
import zipfile
from pathlib import Path

LOG = logging.getLogger("GithubPluginUpdater")
REPO = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
VERSION = re.compile(r"(?<![A-Za-z0-9])v?(\d+\.\d+(?:\.\d+){0,2})(?:[-_.]?(dev|alpha|beta|rc|pre)[-_.]?(\d*))?(?!\d)", re.I)
MAX_DOWNLOAD = 250 * 1024 * 1024
MAX_UNPACKED = 350 * 1024 * 1024
MAX_CATALOG = 8 * 1024 * 1024
CATALOG_URL = "https://safetzahirovic.github.io/decky-plugins-explorer/data/plugins.json"
HEADERS = {"User-Agent": "GithubPluginUpdater/1.7.2", "Accept": "application/vnd.github+json"}
CA_FILES = ("/etc/ssl/certs/ca-certificates.crt", "/etc/ssl/cert.pem", "/etc/pki/tls/certs/ca-bundle.crt")
SELF_REPOS = frozenset({
    "steamdeckchecker/github-decky-plugins-updatergithub-decky-plugins-updater",
    "steamdeckchecker/github-decky-plugins-updater",
})

def is_self_repo(repo):
    return isinstance(repo, str) and repo.casefold() in SELF_REPOS

def _unescape_entities(value):
    # Decky's bundled Python may omit html and xml.etree. Atom needs only a
    # small set of XML/HTML entities; keep the backend importable without them.
    named = {"amp": "&", "lt": "<", "gt": ">", "quot": '"', "apos": "'", "nbsp": " "}
    def replacement(match):
        code = match.group(1)
        if code.startswith("#"):
            try:
                number = int(code[2:], 16) if code[1:2].lower() == "x" else int(code[1:])
                return chr(number) if 0 < number <= 0x10ffff else match.group(0)
            except ValueError:
                return match.group(0)
        return named.get(code.lower(), match.group(0))
    return re.sub(r"&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);", replacement, value, flags=re.I)

class AlreadyCurrent(ValueError):
    def __init__(self, folder, installed_version):
        super().__init__(f"Installiert: {installed_version}; ZIP ist nicht neuer.")
        self.folder = folder

def _certificate_error(exc):
    return isinstance(exc, urllib.error.URLError) and (
        isinstance(exc.reason, ssl.SSLCertVerificationError)
        or "CERTIFICATE_VERIFY_FAILED" in str(exc))

def _retryable_transport_error(exc):
    reason = exc.reason if isinstance(exc, urllib.error.URLError) else exc
    return _certificate_error(exc) or isinstance(reason, (TimeoutError, ssl.SSLError))

def _verified_open(request, timeout):
    try:
        return urllib.request.urlopen(request, timeout=timeout)
    except urllib.error.URLError as original:
        if not _certificate_error(original):
            raise
        for cafile in CA_FILES:
            if not Path(cafile).is_file():
                continue
            try:
                context = ssl.create_default_context(cafile=cafile)
                return urllib.request.urlopen(request, timeout=timeout, context=context)
            except urllib.error.URLError as exc:
                if not _certificate_error(exc):
                    raise
        raise original

def _curl_get(url, destination=None, timeout=30, max_bytes=None):
    curl = shutil.which("curl")
    if not curl:
        raise RuntimeError("Python kann das GitHub-Zertifikat nicht prüfen; System-curl fehlt ebenfalls.")
    command = [curl, "--fail", "--location", "--silent", "--show-error", "--proto", "=https",
               "--proto-redir", "=https", "--connect-timeout", "10", "--max-time", str(timeout),
               "--max-filesize", str(max_bytes or (MAX_DOWNLOAD if destination else 4 * 1024 * 1024)),
               "-H", f"User-Agent: {HEADERS['User-Agent']}", "-H", f"Accept: {HEADERS['Accept']}"]
    if destination:
        command.extend(["--output", str(destination)])
    command.append(url)
    try:
        result = subprocess.run(command, capture_output=True, timeout=timeout + 5, check=False)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise RuntimeError(f"System-curl konnte GitHub nicht erreichen: {exc}") from exc
    if result.returncode:
        detail = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"GitHub-Abruf mit System-curl fehlgeschlagen: {detail or result.returncode}")
    if max_bytes and len(result.stdout) > max_bytes:
        raise ValueError("Plugin-Katalog ist zu groß.")
    return result.stdout

def _fetch_catalog():
    request = urllib.request.Request(CATALOG_URL, headers={"User-Agent": HEADERS["User-Agent"],
                                                         "Accept": "application/json"})
    try:
        with _verified_open(request, timeout=15) as response:
            content = response.read(MAX_CATALOG + 1)
    except urllib.error.URLError as exc:
        if not _retryable_transport_error(exc):
            raise
        content = _curl_get(CATALOG_URL, timeout=20, max_bytes=MAX_CATALOG)
    if len(content) > MAX_CATALOG:
        raise ValueError("Plugin-Katalog ist zu groß.")
    entries = json.loads(content.decode("utf-8"))
    if not isinstance(entries, list):
        raise ValueError("Plugin-Katalog hat ein unbekanntes Format.")
    plugins, seen = [], set()
    for entry in entries[:2500]:
        if not isinstance(entry, dict) or not (repo := normalize_repo(entry.get("repo"))):
            continue
        if repo.casefold() in seen:
            continue
        seen.add(repo.casefold())
        manifest = entry.get("plugin") if isinstance(entry.get("plugin"), dict) else {}
        publish = manifest.get("publish") if isinstance(manifest.get("publish"), dict) else {}
        release = entry.get("latest_release") if isinstance(entry.get("latest_release"), dict) else {}
        tags = publish.get("tags") if isinstance(publish.get("tags"), list) else manifest.get("tags")
        description = publish.get("description") or manifest.get("description")
        plugins.append({
            "repo": repo,
            "name": (manifest.get("name") if isinstance(manifest.get("name"), str) else repo.split("/")[1])[:100],
            "author": (manifest.get("author") if isinstance(manifest.get("author"), str) else repo.split("/")[0])[:80],
            "description": (description if isinstance(description, str) else "")[:400],
            "tags": [tag[:36] for tag in (tags or [])[:8] if isinstance(tag, str)] if isinstance(tags, list) else [],
            "stars": max(0, entry.get("stars", 0)) if type(entry.get("stars")) is int else 0,
            "downloads": max(0, entry.get("downloads", 0)) if type(entry.get("downloads")) is int else 0,
            "latest_tag": (release.get("tag") if isinstance(release.get("tag"), str) else "")[:80],
            "released_at": (release.get("published_at") if isinstance(release.get("published_at"), str) else "")[:50],
        })
    return plugins

def _read_public_page(url):
    request = urllib.request.Request(url, headers={"User-Agent": HEADERS["User-Agent"]})
    try:
        with _verified_open(request, timeout=25) as response:
            data = response.read(4 * 1024 * 1024 + 1)
    except urllib.error.URLError as exc:
        if not _retryable_transport_error(exc):
            raise
        data = _curl_get(url, timeout=30)
    if len(data) > 4 * 1024 * 1024:
        raise ValueError("GitHub-Release-Seite ist zu groß.")
    return data.decode("utf-8", errors="replace")

def _release_links(page):
    # Decky's bundled Python can omit html.parser. GitHub's release links use
    # quoted href/src attributes; only extract URLs, never render the markup.
    links = []
    for tag in re.finditer(r"<(a|include-fragment)\b([^<>]*)>", page, re.I):
        attribute = "href" if tag.group(1).lower() == "a" else "src"
        match = re.search(r"\b" + attribute + r"\s*=\s*([\"'])(.*?)\1", tag.group(2), re.I | re.S)
        if match:
            links.append(match.group(2).replace("&amp;", "&"))
    return links

def deck_home():
    configured = os.environ.get("DECKY_USER_HOME")
    if configured and Path(configured).is_absolute():
        return Path(configured)
    try:
        return Path(pwd.getpwnam("deck").pw_dir)
    except KeyError:
        return Path.home()

def download_dirs():
    home = deck_home()
    directories = []
    config = home / ".config" / "user-dirs.dirs"
    try:
        for line in config.read_text(encoding="utf-8")[:8192].splitlines():
            match = re.fullmatch(r'\s*XDG_DOWNLOAD_DIR\s*=\s*"([^"]+)"\s*', line)
            if match:
                location = match.group(1).replace("$HOME", str(home))
                if Path(location).is_absolute():
                    directories.append(Path(location))
                break
    except (OSError, UnicodeError):
        pass
    directories.append(home / "Downloads")
    directories.extend((Path("/home/deck/Downloads"), Path("/home/bazzite/Downloads")))
    try:
        directories.extend(path for path in home.iterdir()
                           if path.is_dir() and path.name.lower() in ("download", "downloads"))
    except OSError:
        pass
    if Path("/Downloads").is_dir():
        directories.append(Path("/Downloads"))
    return list(dict.fromkeys(path.resolve() for path in directories))

def repos_file():
    for directory in download_dirs():
        path = directory / "repos.txt"
        if path.is_file() and not path.is_symlink():
            return path
    return None

def normalize_repo(value):
    if not isinstance(value, str):
        return None
    value = value.strip().rstrip("/")
    value = re.sub(r"^https?://(?:www\.)?github\.com/", "", value, flags=re.I)
    value = re.sub(r"/releases(?:/.*)?$", "", value, flags=re.I)
    value = re.sub(r"\.git$", "", value, flags=re.I)
    return value if REPO.fullmatch(value) and ".." not in value else None

def version_key(value):
    if not isinstance(value, str):
        return None
    matches = list(VERSION.finditer(value))
    if not matches:
        return None
    match = matches[-1]
    parts = tuple(int(item) for item in match.group(1).split("."))
    parts += (0,) * (3 - len(parts))
    stage = {None: 4, "rc": 3, "beta": 2, "alpha": 1, "pre": 1, "dev": 0}[match.group(2).lower() if match.group(2) else None]
    return parts + (stage, int(match.group(3) or 0))

def slug(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())

class Plugin:
    async def _main(self):
        self.downloads = deck_home() / "Downloads"
        settings_dir = Path(os.environ.get("DECKY_PLUGIN_SETTINGS_DIR") or
                            deck_home() / ".config" / "github-plugin-updater")
        settings_dir.mkdir(parents=True, exist_ok=True)
        self.settings_path = settings_dir / "settings.json"
        self.lock = asyncio.Lock()
        self.check_lock = asyncio.Lock()
        self.settings = {"repos": [], "downloaded_versions": {}, "repo_plugin_map": {},
                         "last_check": {}, "update_mode": "automatic", "pending_updates": [],
                         "declined_versions": {}, "restart_pending": False,
                         "restart_dispatched": False, "restart_token": "", "restart_error": "",
                         "restart_error_detail": "",
                         "self_update_inflight": {}}
        self.check_progress = {"running": False, "percent": 0, "index": 0, "total": 0,
                               "repo": "", "phase": "Bereit", "bytes_done": 0, "bytes_total": 0,
                               "started": 0, "completed_at": 0, "rows": [], "result": None,
                               "operation": "idle"}
        self.background_check = None
        self.catalog_task = None
        self.catalog_status = {"running": False, "plugins": [], "error": "", "fetched_at": 0}
        self.initializing = True
        self.api_retry_at = 0
        try:
            saved = json.loads(self.settings_path.read_text(encoding="utf-8"))
            self.settings["repos"] = list(dict.fromkeys(
                repo for item in saved.get("repos", [])
                if (repo := normalize_repo(item))
            ))
            versions = saved.get("downloaded_versions", {})
            if isinstance(versions, dict):
                self.settings["downloaded_versions"] = versions
            mapping = saved.get("repo_plugin_map", {})
            if isinstance(mapping, dict):
                self.settings["repo_plugin_map"] = mapping
            if saved.get("update_mode") in ("automatic", "ask"):
                self.settings["update_mode"] = saved["update_mode"]
            pending = saved.get("pending_updates", [])
            if isinstance(pending, list):
                self.settings["pending_updates"] = [item for item in pending[:100]
                                                    if isinstance(item, dict) and item.get("repo") in self.settings["repos"]]
            self.settings["restart_pending"] = saved.get("restart_pending") is True
            self.settings["restart_dispatched"] = saved.get("restart_dispatched") is True
            self.settings["restart_token"] = saved.get("restart_token") if isinstance(saved.get("restart_token"), str) else ""
            self.settings["restart_error"] = saved.get("restart_error") if isinstance(saved.get("restart_error"), str) else ""
            self.settings["restart_error_detail"] = (saved.get("restart_error_detail")
                                                      if isinstance(saved.get("restart_error_detail"), str) else "")
            inflight = saved.get("self_update_inflight", {})
            if isinstance(inflight, dict):
                self.settings["self_update_inflight"] = inflight
            declined = saved.get("declined_versions", {})
            if isinstance(declined, dict):
                self.settings["declined_versions"] = declined
            last_check = saved.get("last_check", {})
            if isinstance(last_check, dict) and isinstance(last_check.get("rows"), list):
                self.settings["last_check"] = last_check
                self.check_progress["rows"] = last_check["rows"][:100]
                self.check_progress["completed_at"] = last_check.get("completed_at", 0)
                if isinstance(last_check.get("result"), dict):
                    self.check_progress["result"] = last_check["result"]
        except (OSError, ValueError, TypeError) as exc:
            LOG.info("Starting with empty settings: %s", exc)
        LOG.info("Github Plugin Updater 1.7.2 bereit; %s Repositories geladen", len(self.settings["repos"]))
        try:
            await self.import_default_repos_file()
        except Exception:
            LOG.exception("repos.txt beim Start nicht lesbar; gespeicherte Liste bleibt erhalten")
        self._recover_self_update()
        # Carry a restart across a self-update. Older releases launched an
        # external restart helper; an acknowledgement means it signalled Steam.
        if not self.settings["pending_updates"] and self.settings["restart_pending"] and self._restart_acknowledged():
            self.settings["restart_pending"] = False
        elif self.settings["restart_pending"] and self.settings["restart_dispatched"]:
            # An unacknowledged helper from 1.6.7 must not lock the UI after
            # upgrading. The frontend will initiate a fresh Decky restart.
            self.settings["restart_dispatched"] = False
        if not self.settings["restart_pending"]:
            self.settings["restart_dispatched"] = False
            self.settings["restart_token"] = ""
            self.settings["restart_error"] = ""
            self.settings["restart_error_detail"] = ""
            try:
                self._save()
            except OSError:
                LOG.exception("Neustartstatus nach Decky-Neuladen konnte nicht gespeichert werden")
        self.initializing = False
        self.task = asyncio.create_task(self._daily_scheduler())

    async def _unload(self):
        if self.catalog_task and not self.catalog_task.done():
            self.catalog_task.cancel()
            try:
                await self.catalog_task
            except asyncio.CancelledError:
                pass
        if self.background_check and not self.background_check.done():
            self.background_check.cancel()
            try:
                await self.background_check
            except asyncio.CancelledError:
                pass
        self.task.cancel()
        try:
            await self.task
        except asyncio.CancelledError:
            pass

    def _save(self):
        fd, name = tempfile.mkstemp(prefix="settings-", dir=self.settings_path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as output:
                json.dump(self.settings, output, indent=2)
            os.replace(name, self.settings_path)
        finally:
            if os.path.exists(name):
                os.unlink(name)

    def _recover_self_update(self):
        inflight = self.settings["self_update_inflight"]
        if not inflight:
            return
        repo = inflight.get("repo")
        previous = version_key(inflight.get("previous_version"))
        expected = version_key(inflight.get("tag"))
        plugin = next((item for item in self._installed_plugins()
                       if item["folder"] == "github-plugin-updater"
                       and item["package"] == "github-plugin-updater"
                       and item["name"] == "Github Plugin Updater"), None)
        actual = version_key(plugin["version"]) if plugin else None
        if (is_self_repo(repo) and previous and expected and actual
                and actual > previous and actual >= expected):
            had_pending = any(item.get("repo") == repo for item in self.settings["pending_updates"])
            self.settings["pending_updates"] = [item for item in self.settings["pending_updates"]
                                                if item.get("repo") != repo]
            self.settings["downloaded_versions"][repo] = inflight["tag"]
            self.settings["repo_plugin_map"][repo] = "github-plugin-updater"
            self.settings["declined_versions"].pop(repo, None)
            self.settings["restart_pending"] = True
            self._status_row(repo, "updated", name=plugin["name"], version=plugin["version"])
            if had_pending:
                self._record_decision(installed=True)
            LOG.info("Unterbrochenes Selbstupdate auf v%s abgeschlossen", plugin["version"])
        else:
            LOG.warning("Unterbrochenes Selbstupdate ohne passende neue Version verworfen")
        self.settings["self_update_inflight"] = {}
        try:
            self._save()
        except OSError:
            LOG.exception("Selbstupdate-Status konnte nicht gespeichert werden")

    async def _mark_self_update(self, repo, tag, installed):
        if is_self_repo(repo) and installed:
            async with self.lock:
                self.settings["self_update_inflight"] = {
                    "repo": repo, "tag": tag, "previous_version": installed["version"]}
                self._save()

    async def get_repos(self):
        installed = self._installed_plugins()
        resolved = {repo: self._match_installed(repo, installed) for repo in self.settings["repos"]}
        return {"backend_version": "1.7.2", "repos": list(self.settings["repos"]), "installed": installed,
                "update_mode": self.settings["update_mode"],
                "pending_updates": [dict(item) for item in self.settings["pending_updates"]],
                "restart_pending": self.settings["restart_pending"],
                "restart_error": self.settings["restart_error"],
                "restart_error_detail": self.settings["restart_error_detail"],
                "matches": {repo: value[0] for repo, value in resolved.items()},
                "match_reasons": {repo: value[1] for repo, value in resolved.items()}}

    async def start_catalog(self, force=False):
        if self.catalog_status["running"]:
            return {"success": True}
        if (not force and self.catalog_status["plugins"]
                and time.time() - self.catalog_status["fetched_at"] < 600):
            return {"success": True}
        self.catalog_status = {**self.catalog_status, "running": True, "error": ""}
        self.catalog_task = asyncio.create_task(self._load_catalog())
        return {"success": True}

    async def _load_catalog(self):
        try:
            plugins = await asyncio.to_thread(_fetch_catalog)
            self.catalog_status = {"running": False, "plugins": plugins, "error": "",
                                   "fetched_at": time.time()}
            LOG.info("Plugin-Katalog geladen: %s Repositories", len(plugins))
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            LOG.warning("Plugin-Katalog konnte nicht geladen werden: %s", exc)
            self.catalog_status = {**self.catalog_status, "running": False,
                                   "error": str(exc)[:300]}

    async def get_catalog_status(self):
        try:
            path = repos_file()
            if path and path.stat().st_size <= 128_000:
                tracked = list(dict.fromkeys(repo for line in path.read_text(encoding="utf-8").splitlines()
                                                 if (repo := normalize_repo(line)) and not line.lstrip().startswith("#")))
            else:
                tracked = []
        except (OSError, UnicodeError):
            tracked = list(self.settings["repos"])
        return {**self.catalog_status, "tracked": tracked}

    async def get_check_status(self):
        return {**self.check_progress, "rows": [dict(row) for row in self.check_progress["rows"]],
                "restart_pending": self.settings["restart_pending"],
                "restart_error": self.settings["restart_error"],
                "restart_error_detail": self.settings["restart_error_detail"]}

    async def start_check(self):
        # A full scan can take several minutes. Return to Decky immediately so
        # progress calls remain responsive while the check runs in the background.
        if self.check_lock.locked() or (self.background_check and not self.background_check.done()):
            return {"success": True, "started": False}
        if self.settings["pending_updates"]:
            return {"success": False, "started": False, "error": "Bitte zuerst alle offenen Freigaben entscheiden."}
        if self.settings["restart_pending"] and not self.settings["restart_error"]:
            return {"success": False, "started": False, "error": "Decky wird nach den Freigaben neu gestartet."}
        self._progress(running=True, percent=0, index=0, total=0, repo="",
                       phase="repos.txt einlesen", operation="scan", bytes_done=0, bytes_total=0,
                       started=time.time(), completed_at=0, rows=[], result=None)
        self.background_check = asyncio.create_task(self._run_background_check())
        LOG.info("Updateprüfung im Hintergrund gestartet")
        return {"success": True, "started": True}

    async def _run_background_check(self):
        try:
            await self.check_updates()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            LOG.exception("Updateprüfung im Hintergrund fehlgeschlagen")
            error = {"repo": "Updateprüfung", "error": str(exc)}
            result = {"success": False, "updated": 0, "errors": [error], "skipped": 0, "pending": 0}
            self._progress(running=False, percent=100, repo="", phase="Prüfung abgeschlossen", operation="idle",
                           completed_at=time.time(), result=result)
            try:
                async with self.lock:
                    self.settings["last_check"] = {"rows": [dict(row) for row in self.check_progress["rows"]],
                                                   "completed_at": self.check_progress["completed_at"],
                                                   "result": result}
                    self._save()
            except OSError:
                LOG.exception("Fehlgeschlagene Hintergrundprüfung konnte nicht gespeichert werden")

    def _progress(self, **fields):
        self.check_progress.update(fields)

    def _status_row(self, repo, state, **fields):
        for row in self.check_progress["rows"]:
            if row["repo"] == repo:
                row.update(state=state, **fields)
                break

    def _record_decision(self, installed=False):
        summary = self.check_progress.get("result")
        if isinstance(summary, dict):
            summary = dict(summary)
            counter = "updated" if installed else "skipped"
            summary[counter] = summary.get(counter, 0) + 1
            summary["pending"] = len(self.settings["pending_updates"])
            self.check_progress["result"] = summary
        finished = time.time()
        self._progress(completed_at=finished)
        self.settings["last_check"] = {"rows": [dict(row) for row in self.check_progress["rows"]],
                                       "completed_at": finished, "result": summary}

    def _installed_plugins(self):
        homebrew = Path(os.environ.get("DECKY_HOME") or deck_home() / "homebrew")
        root = homebrew / "plugins"
        result = []
        try:
            directories = list(root.iterdir())
        except OSError:
            return result
        for folder in directories:
            if not folder.is_dir() or folder.is_symlink():
                continue
            try:
                package = json.loads((folder / "package.json").read_text(encoding="utf-8"))
                manifest = json.loads((folder / "plugin.json").read_text(encoding="utf-8"))
                repo = package.get("repository") or ""
                if isinstance(repo, dict):
                    repo = repo.get("url", "")
                result.append({"folder": folder.name, "name": manifest.get("name") or folder.name,
                               "package": package.get("name") or "", "version": package.get("version") or "",
                               "repo": normalize_repo(repo)})
            except (OSError, ValueError, TypeError):
                continue
        return sorted(result, key=lambda p: p["name"].lower())

    def _match_installed(self, repo, installed):
        if is_self_repo(repo):
            matches = [item for item in installed if item["folder"] == "github-plugin-updater"
                       and item["package"] == "github-plugin-updater"]
            return (matches[0], None) if len(matches) == 1 else (None, "Updater-Installation nicht eindeutig gefunden.")
        folder = self.settings["repo_plugin_map"].get(repo)
        if folder:
            found = [p for p in installed if p["folder"] == folder]
            if len(found) == 1:
                return found[0], None
            # The previously installed folder was removed. A fresh install is
            # still possible from the repository's ZIP.
        matching_repo = [p for p in installed if p["repo"] and p["repo"].lower() == repo.lower()]
        if len(matching_repo) == 1:
            return matching_repo[0], None
        if len(matching_repo) > 1:
            return None, "Mehrere passende Installationen; bitte zuordnen."
        wanted = slug(repo.split("/", 1)[1])
        candidates = [p for p in installed if wanted in {slug(p["folder"]), slug(p["package"]), slug(p["name"])}]
        if len(candidates) == 1:
            return candidates[0], None
        return None, ("Mehrere passende Installationen; bitte zuordnen." if candidates else None)

    async def set_plugin_mapping(self, repo_path, folder):
        async with self.lock:
            if repo_path not in self.settings["repos"]:
                return {"success": False, "error": "Repository nicht gefunden."}
            if is_self_repo(repo_path) and folder != "github-plugin-updater":
                return {"success": False, "error": "Updater-Repository kann nur dem Updater selbst zugeordnet werden."}
            if folder == "github-plugin-updater" and not is_self_repo(repo_path):
                return {"success": False, "error": "Das Updater-Plugin darf nur über sein eigenes Repository aktualisiert werden."}
            if folder and folder not in {p["folder"] for p in self._installed_plugins()}:
                return {"success": False, "error": "Dieses Decky-Plugin ist nicht installiert."}
            if folder:
                self.settings["repo_plugin_map"][repo_path] = folder
            else:
                self.settings["repo_plugin_map"].pop(repo_path, None)
            self._save()
        return {"success": True, "repos": list(self.settings["repos"])}

    async def set_update_mode(self, mode):
        if mode not in ("automatic", "ask"):
            return {"success": False, "error": "Ungültiger Update-Modus."}
        async with self.lock:
            if self.settings["pending_updates"] and mode != self.settings["update_mode"]:
                return {"success": False, "error": "Bitte zuerst alle offenen Freigaben entscheiden."}
            self.settings["update_mode"] = mode
            self._save()
        return {"success": True, "update_mode": mode}

    def _sync_repos_content(self, file_content):
        LOG.info("Textimport begonnen: %s Zeichen", len(file_content))
        if len(file_content) > 128_000:
            return {"success": False, "error": "Liste ist zu groß."}
        lines = [s.strip() for s in file_content.splitlines()
                 if s.strip() and not s.lstrip().startswith("#")]
        invalid = [s for s in lines if not normalize_repo(s)]
        wanted = list(dict.fromkeys(repo for s in lines if (repo := normalize_repo(s))))
        old = set(self.settings["repos"])
        new = [repo for repo in wanted if repo not in old]
        self.settings["repos"] = wanted
        for removed in old - set(wanted):
            self.settings["downloaded_versions"].pop(removed, None)
            self.settings["repo_plugin_map"].pop(removed, None)
            self.settings["declined_versions"].pop(removed, None)
        self.settings["pending_updates"] = [entry for entry in self.settings["pending_updates"]
                                            if entry.get("repo") in wanted]
        self._save()
        LOG.info("repos.txt synchronisiert: %s Repositories, %s neu, %s ungültig", len(wanted), len(new), len(invalid))
        return {"success": True, "added": len(new), "invalid": len(invalid),
                "repos": list(self.settings["repos"])}

    async def _import_repos_content(self, file_content):
        async with self.lock:
            result = self._sync_repos_content(file_content)
        self._schedule_restart_if_ready()
        return result

    async def _import_repos_file(self, file_path):
        LOG.info("Dateiimport angefordert: %s", file_path)
        try:
            if not isinstance(file_path, str) or not file_path.strip():
                return {"success": False, "error": "Bitte eine Textdatei auswählen."}
            directories = download_dirs()
            name = file_path.strip()
            if name.startswith("~/"):
                name = str(deck_home() / name[2:])
            elif not Path(name).is_absolute() and Path(name).name == name:
                found = [directory / name for directory in directories if (directory / name).is_file()]
                if len(found) == 1:
                    name = str(found[0])
            path = Path(name).resolve(strict=True)
            if (path.parent not in directories or path.suffix.lower() != ".txt"
                    or not path.is_file() or Path(name).is_symlink()):
                return {"success": False, "error": "Bitte eine .txt-Datei direkt aus einem angezeigten Downloads-Ordner auswählen."}
            if path.stat().st_size > 128_000:
                return {"success": False, "error": "Datei ist zu groß."}
            async with self.lock:
                content = path.read_text(encoding="utf-8")
                result = self._sync_repos_content(content)
            self._schedule_restart_if_ready()
            return result
        except (OSError, UnicodeError) as exc:
            LOG.warning("Dateiimport gescheitert: %s", exc)
            return {"success": False, "error": str(exc)}

    async def import_default_repos_file(self):
        LOG.info("Direktimport von repos.txt angefordert")
        path = repos_file()
        if path:
            LOG.info("repos.txt gefunden: %s", path)
            result = await self._import_repos_file(str(path))
            result["file"] = str(path)
            return result
        return {"success": False, "error": "repos.txt fehlt. Geprüft: " + " · ".join(str(p) for p in download_dirs())}

    async def set_catalog_repo(self, repo_path, follow):
        repo = normalize_repo(repo_path)
        if not repo or not isinstance(follow, bool):
            return {"success": False, "error": "Ungültiges Repository."}
        if self.check_lock.locked() or (self.background_check and not self.background_check.done()):
            return {"success": False, "error": "Bitte zuerst die laufende Update-Prüfung abschließen."}
        try:
            async with self.lock:
                path = repos_file()
                if path is None:
                    directory = next((folder for folder in download_dirs() if folder.is_dir()), None)
                    if directory is None:
                        return {"success": False, "error": "Downloads-Ordner nicht gefunden."}
                    path = directory / "repos.txt"
                if path.is_symlink() or (path.exists() and not path.is_file()):
                    return {"success": False, "error": "repos.txt ist keine reguläre Datei."}
                existing = path.exists()
                if existing:
                    handle = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
                    with os.fdopen(handle, "r", encoding="utf-8", newline="") as input_file:
                        info = os.fstat(input_file.fileno())
                        if not stat.S_ISREG(info.st_mode):
                            return {"success": False, "error": "repos.txt ist keine reguläre Datei."}
                        if info.st_size > 128_000:
                            return {"success": False, "error": "repos.txt ist zu groß."}
                        content = input_file.read(128_001)
                else:
                    info = path.parent.stat()
                    content = ""
                if len(content) > 128_000:
                    return {"success": False, "error": "repos.txt ist zu groß."}
                lines = content.splitlines(keepends=True)
                matched = lambda line: (not line.lstrip().startswith("#")
                                        and (normalize_repo(line) or "").casefold() == repo.casefold())
                present = any(matched(line) for line in lines)
                if follow and not present:
                    ending = "\r\n" if "\r\n" in content else "\n"
                    new_content = content + (ending if content and not content.endswith(("\n", "\r")) else "")
                    new_content += f"https://github.com/{repo}{ending}"
                elif not follow and present:
                    new_content = "".join(line for line in lines if not matched(line))
                else:
                    new_content = content
                if new_content != content:
                    if len(new_content) > 128_000:
                        return {"success": False, "error": "repos.txt ist zu groß."}
                    fd, temp_name = tempfile.mkstemp(prefix=".repos-", dir=path.parent)
                    try:
                        with os.fdopen(fd, "w", encoding="utf-8", newline="") as output:
                            os.fchmod(output.fileno(), stat.S_IMODE(info.st_mode) if existing else 0o644)
                            if hasattr(os, "fchown"):
                                os.fchown(output.fileno(), info.st_uid, info.st_gid)
                            output.write(new_content)
                            output.flush()
                            os.fsync(output.fileno())
                        if existing:
                            latest = path.stat(follow_symlinks=False)
                            if ((latest.st_ino, latest.st_size, latest.st_mtime_ns)
                                    != (info.st_ino, info.st_size, info.st_mtime_ns)):
                                return {"success": False, "error": "repos.txt wurde zwischenzeitlich geändert. Bitte erneut versuchen."}
                        elif path.exists() or path.is_symlink():
                            return {"success": False, "error": "repos.txt wurde zwischenzeitlich erstellt. Bitte erneut versuchen."}
                        os.replace(temp_name, path)
                    finally:
                        if os.path.exists(temp_name):
                            os.unlink(temp_name)
                result = self._sync_repos_content(new_content)
                result.update(file=str(path), changed=new_content != content)
            self._schedule_restart_if_ready()
            return result
        except (OSError, UnicodeError, ValueError) as exc:
            LOG.warning("repos.txt konnte nicht geändert werden: %s", exc)
            return {"success": False, "error": str(exc)}

    def _check_public_releases(self, repo):
        prefix = f"/{repo}/releases/"
        page = _read_public_page(f"https://github.com{prefix}")
        tags = []
        for link in _release_links(page):
            path = urllib.parse.urlsplit(link).path
            if path.lower().startswith((prefix + "tag/").lower()):
                tag = urllib.parse.unquote(path[len(prefix + "tag/"):])
                if tag and "/" not in tag and tag not in tags:
                    tags.append(tag)
        for tag in tags[:20]:
            fragment = _read_public_page(f"https://github.com{prefix}expanded_assets/{urllib.parse.quote(tag, safe='')}")
            for link in _release_links(fragment):
                path = urllib.parse.urlsplit(link).path
                asset_prefix = prefix + "download/" + urllib.parse.quote(tag, safe='') + "/"
                if path.lower().startswith(asset_prefix.lower()) and path.lower().endswith(".zip"):
                    name = urllib.parse.unquote(path[len(asset_prefix):])
                    if name and "/" not in name:
                        return tag, {"name": name, "browser_download_url": "https://github.com" + path,
                                     "release_notes": ""}
        return None

    def _release_notes_from_feed(self, repo, tag):
        # GitHub's public Atom feed is available when the unauthenticated API
        # limit has been reached. Notes are shown as escaped plain text in UI.
        document = _read_public_page(f"https://github.com/{repo}/releases.atom")
        for entry in re.finditer(r"<(?:[\w-]+:)?entry\b[^>]*>(.*?)</(?:[\w-]+:)?entry>", document, re.I | re.S):
            link = re.search(r"<(?:[\w-]+:)?link\b[^>]*\bhref\s*=\s*([\"'])(.*?)\1", entry.group(1), re.I | re.S)
            if not link:
                continue
            path = urllib.parse.urlsplit(_unescape_entities(link.group(2))).path
            if urllib.parse.unquote(path).rstrip("/").casefold() != f"/{repo}/releases/tag/{tag}".casefold():
                continue
            content = re.search(r"<(?:[\w-]+:)?content\b[^>]*>(.*?)</(?:[\w-]+:)?content>",
                                entry.group(1), re.I | re.S)
            body = _unescape_entities(content.group(1)) if content else ""
            body = re.sub(r"<\s*(br|/p|/li|/h[1-6])\b[^>]*>", "\n", body, flags=re.I)
            return _unescape_entities(re.sub(r"<[^>]*>", "", body)).strip()[:16000]
        return ""

    def _check_one(self, repo):
        if time.time() < self.api_retry_at:
            return self._check_public_releases(repo)
        url = f"https://api.github.com/repos/{repo}/releases?per_page=20"
        request = urllib.request.Request(url, headers=HEADERS)
        try:
            with _verified_open(request, timeout=20) as response:
                releases = json.load(response)
        except urllib.error.HTTPError as exc:
            if exc.code not in (403, 429):
                raise
            # A shared unauthenticated IP can exhaust GitHub's API allowance.
            # Fetch the normal public release pages without further API retries.
            reset = exc.headers.get("x-ratelimit-reset") if exc.headers else None
            try:
                self.api_retry_at = max(time.time() + 60, float(reset)) if reset else time.time() + 3600
            except ValueError:
                self.api_retry_at = time.time() + 3600
            return self._check_public_releases(repo)
        except urllib.error.URLError as exc:
            if not _retryable_transport_error(exc):
                raise
            releases = json.loads(_curl_get(url, timeout=25))
        if not isinstance(releases, list):
            raise ValueError("GitHub hat keine Release-Liste geliefert.")
        # The list endpoint also includes prereleases. Prefer a deployable ZIP
        # asset over GitHub's automatically generated source-code archives.
        releases.sort(key=lambda release: release.get("published_at") or "", reverse=True)
        for release in releases:
            if release.get("draft") or not release.get("tag_name"):
                continue
            assets = [a for a in release.get("assets", [])
                      if isinstance(a.get("name"), str) and a["name"].lower().endswith(".zip")
                      and a.get("state", "uploaded") == "uploaded"]
            if assets:
                asset = dict(assets[0])
                asset["release_notes"] = str(release.get("body") or "")[:16000]
                return release["tag_name"], asset
        return None

    def _download(self, repo, tag, asset, progress_callback=None):
        url = asset.get("browser_download_url", "")
        parts = urllib.parse.urlsplit(url)
        if (parts.scheme != "https" or parts.netloc.lower() != "github.com" or parts.query or parts.fragment
                or not parts.path.lower().startswith(f"/{repo}/releases/download/".lower())):
            raise ValueError("Unexpected GitHub release asset URL")
        self.downloads.mkdir(parents=True, exist_ok=True)
        def safe(value):
            return re.sub(r"[^A-Za-z0-9_.-]", "_", value)[:100]
        target = self.downloads / f"{safe(repo.replace('/', '-'))}-{safe(tag)}-{safe(asset['name'])}"
        fd, temporary = tempfile.mkstemp(prefix=".github-plugin-updater-", dir=self.downloads)
        os.close(fd)
        try:
            try:
                with _verified_open(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
                    with open(temporary, "wb") as output:
                        length = 0
                        try:
                            total = int(response.headers.get("Content-Length", "0"))
                        except (ValueError, AttributeError):
                            total = 0
                        while block := response.read(1024 * 1024):
                            length += len(block)
                            if length > MAX_DOWNLOAD:
                                raise ValueError("ZIP is larger than 250 MB")
                            output.write(block)
                            if progress_callback:
                                progress_callback(length, total)
            except urllib.error.URLError as exc:
                if not (_retryable_transport_error(exc) or isinstance(exc, urllib.error.HTTPError) and exc.code == 403):
                    raise
                try:
                    _curl_get(url, temporary, timeout=60)
                except RuntimeError as fallback_error:
                    if isinstance(exc, urllib.error.HTTPError):
                        raise RuntimeError("ZIP-Download von GitHub verweigert (HTTP 403). Verbindung/Netzwerk prüfen.") from fallback_error
                    raise
                length = Path(temporary).stat().st_size
                if progress_callback:
                    progress_callback(length, length)
                if length > MAX_DOWNLOAD:
                    raise ValueError("ZIP is larger than 250 MB")
            if not length:
                raise ValueError("Empty ZIP download")
            if not zipfile.is_zipfile(temporary):
                raise ValueError("Release asset is not a valid ZIP file")
            os.replace(temporary, target)
            if os.geteuid() == 0:
                try:
                    account = pwd.getpwnam(os.environ.get("DECKY_USER", "deck"))
                    os.chown(target, account.pw_uid, account.pw_gid)
                except KeyError:
                    pass
            return str(target)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)

    def _install_zip(self, repo, zip_path, installed_plugin):
        if os.geteuid() != 0:
            raise PermissionError("Automatische Installation benötigt das Decky-Root-Flag. Plugin neu installieren und Decky neu starten.")
        homebrew = Path(os.environ.get("DECKY_HOME") or deck_home() / "homebrew")
        plugins_dir = homebrew / "plugins"
        if not plugins_dir.is_dir() or plugins_dir.is_symlink():
            raise ValueError("Decky-Plugin-Ordner fehlt oder ist ein Symlink.")
        with zipfile.ZipFile(zip_path) as archive:
            entries = [item for item in archive.infolist() if not item.is_dir()]
            if not entries or len(entries) > 3000 or sum(item.file_size for item in entries) > MAX_UNPACKED:
                raise ValueError("Release-ZIP enthält zu viele oder zu große Dateien.")
            paths = {}
            for item in entries:
                name = item.filename
                parts = name.split("/")
                mode = item.external_attr >> 16
                if (not name or name.startswith("/") or "\\" in name or "\x00" in name
                        or any(part in ("", ".", "..") for part in parts)
                        or (mode and stat.S_IFMT(mode) not in (0, stat.S_IFREG))):
                    raise ValueError("Release-ZIP enthält einen unsicheren Pfad oder Dateityp.")
                if tuple(parts) in paths:
                    raise ValueError("Release-ZIP enthält doppelte Dateinamen.")
                paths[tuple(parts)] = item
            # Decky packages commonly contain one enclosing plugin folder.
            prefix = (next(iter(paths))[0],) if all(len(parts) > 1 and parts[0] == next(iter(paths))[0]
                                                         for parts in paths) else ()
            files = {parts[len(prefix):]: item for parts, item in paths.items()}
            mandatory = [("plugin.json",), ("package.json",), ("main.py",), ("dist", "index.js")]
            if not all(name in files for name in mandatory):
                raise ValueError("Release-ZIP ist kein gebautes Decky-Plugin (plugin.json, package.json, main.py oder dist/index.js fehlt).")
            if any(files[name].file_size > 1024 * 1024 for name in mandatory[:2]):
                raise ValueError("Plugin-Metadaten in der ZIP sind zu groß.")
            manifest = json.loads(archive.read(files[("plugin.json",)]))
            package = json.loads(archive.read(files[("package.json",)]))
            if not isinstance(manifest, dict) or not isinstance(package, dict):
                raise ValueError("Ungültige Plugin-Metadaten in der ZIP.")
            if not isinstance(manifest.get("flags", []), list):
                raise ValueError("Ungültige Plugin-Flags in der ZIP.")
            name = manifest.get("name")
            version = package.get("version")
            if not isinstance(name, str) or not name.strip() or not isinstance(version, str) or not version_key(version):
                raise ValueError("Plugin-Name oder vergleichbare Version fehlt in der ZIP.")
            repo_name = repo.split("/", 1)[1]
            installed_now = self._installed_plugins()
            name_matches = [item for item in installed_now if item["name"].casefold() == name.casefold()]
            matched_by_manifest_name = False
            if not installed_plugin and len(name_matches) == 1:
                candidate = name_matches[0]
                if candidate["repo"] and candidate["repo"].casefold() != repo.casefold():
                    raise ValueError("Ein Plugin mit diesem Namen gehört zu einem anderen Repository.")
                installed_plugin = candidate
                matched_by_manifest_name = True
            if len(name_matches) > 1 and not installed_plugin:
                raise ValueError("Mehrere installierte Plugins tragen denselben Namen; bitte Zuordnung prüfen.")
            folder = installed_plugin["folder"] if installed_plugin else re.sub(r"[^a-zA-Z0-9_-]", "-", repo_name).strip("-")
            if not folder:
                raise ValueError("Plugin-Zielordner fehlt.")
            if folder == "github-plugin-updater" or package.get("name") == "github-plugin-updater":
                if (not is_self_repo(repo) or folder != "github-plugin-updater" or not installed_plugin
                        or installed_plugin["package"] != "github-plugin-updater"
                        or package.get("name") != "github-plugin-updater" or name != "Github Plugin Updater"):
                    raise ValueError("Selbstupdate nur aus dem festgelegten Updater-Repository und mit passender Plugin-Identität erlaubt.")
            if is_self_repo(repo) and folder != "github-plugin-updater":
                raise ValueError("Updater-Repository enthält kein passendes Updater-Plugin.")
            target = plugins_dir / folder
            if target.is_symlink() or (target.exists() and not target.is_dir()):
                raise ValueError("Plugin-Ziel ist kein normaler Ordner.")
            if target.exists() and not installed_plugin:
                raise ValueError("Ein anderer Plugin-Ordner trägt bereits diesen Namen; bitte Zuordnung prüfen.")
            if installed_plugin:
                known = (is_self_repo(repo) and folder == "github-plugin-updater"
                         or matched_by_manifest_name or self.settings["repo_plugin_map"].get(repo) == folder
                         or installed_plugin["repo"] and installed_plugin["repo"].casefold() == repo.casefold()
                         or slug(repo_name) in {slug(installed_plugin[k]) for k in ("folder", "name", "package")})
                if not known:
                    raise ValueError("Installiertes Plugin ist diesem Repository nicht eindeutig zugeordnet.")
                if any(item["folder"] != folder for item in name_matches):
                    raise ValueError("Der neue Plugin-Name wird bereits von einer anderen Installation verwendet.")
            if installed_plugin and version_key(version) <= version_key(installed_plugin["version"]):
                raise AlreadyCurrent(folder, installed_plugin["version"])
            data_dir = homebrew / "data" / "github-plugin-updater"
            data_dir.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory(prefix="install-", dir=data_dir) as temporary:
                staged = Path(temporary) / "plugin"
                staged.mkdir()
                for parts, item in files.items():
                    destination = staged.joinpath(*parts)
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    with archive.open(item) as source, destination.open("wb") as output:
                        shutil.copyfileobj(source, output)
                    os.chmod(destination, 0o755 if (item.external_attr >> 16) & 0o111 else 0o644)
                root_plugin = "root" in manifest.get("flags", [])
                try:
                    account = pwd.getpwnam(os.environ.get("DECKY_USER", "deck"))
                    owner = (0, 0) if root_plugin else (account.pw_uid, account.pw_gid)
                except KeyError:
                    owner = (0, 0)
                for directory, subdirs, filenames in os.walk(staged):
                    os.chmod(directory, 0o755)
                    os.chown(directory, *owner)
                    for filename in filenames:
                        os.chown(Path(directory) / filename, *owner)
                backup = data_dir / "backups" / folder
                backup.parent.mkdir(parents=True, exist_ok=True)
                if backup.exists():
                    shutil.rmtree(backup)
                had_previous = target.exists()
                if had_previous:
                    os.rename(target, backup)
                try:
                    os.rename(staged, target)
                except OSError:
                    if had_previous:
                        os.rename(backup, target)
                    raise
        LOG.info("%s v%s installiert nach %s", name, version, target)
        return {"folder": folder, "version": version, "name": name}

    def _restart_acknowledged(self):
        token = self.settings["restart_token"]
        if not token:
            return False
        try:
            return (self.settings_path.parent / "restart-ack").read_text(encoding="ascii").strip() == token
        except OSError:
            return False

    def _schedule_restart_if_ready(self):
        # Frontend initiates Decky's own webhelper restart only after the last
        # decision. A backend task must never restart its own RPC server.
        if (self.initializing or not self.settings["restart_pending"] or self.settings["pending_updates"]
                or self.settings["restart_dispatched"] or self.settings["restart_error"]):
            return False
        return True

    async def claim_ui_restart(self):
        if self.check_lock.locked() or not self._schedule_restart_if_ready():
            return {"success": False, "error": "Neustart ist nicht bereit oder läuft bereits."}
        async with self.lock:
            if not self._schedule_restart_if_ready():
                return {"success": False, "error": "Neustart ist nicht bereit oder läuft bereits."}
            # Persist the completed install *before* invoking the core loader
            # utility. That call may tear down the frontend immediately.
            self.settings.update(restart_pending=False, restart_dispatched=False,
                                 restart_token="", restart_error="", restart_error_detail="")
            self._save()
        LOG.info("Alle Freigaben abgeschlossen; Steam-UI-Neustart an Decky übergeben")
        return {"success": True}

    async def report_ui_restart_failure(self, detail):
        if not isinstance(detail, str):
            detail = ""
        async with self.lock:
            self.settings["restart_pending"] = True
            self.settings["restart_error"] = "restartLaunchFailed"
            self.settings["restart_error_detail"] = detail[:300]
            self._save()
        LOG.error("Deckys Steam-UI-Neustart fehlgeschlagen: %s", detail)
        return {"success": True}

    async def retry_restart(self):
        if (not self.settings["restart_pending"] or self.settings["pending_updates"]
                or self.check_lock.locked()):
            return {"success": False, "error": "Neustart ist nicht bereit oder läuft bereits."}
        async with self.lock:
            self.settings["restart_error"] = ""
            self.settings["restart_error_detail"] = ""
            self._save()
        return {"success": self._schedule_restart_if_ready()}

    async def check_updates(self):
        updated, errors, skipped = [], [], []
        async with self.check_lock:
            if self.settings["pending_updates"]:
                return {"success": False, "updated": [], "errors": [], "skipped": [],
                        "pending": [dict(item) for item in self.settings["pending_updates"]],
                        "error": "Bitte zuerst alle offenen Freigaben entscheiden."}
            if self.settings["restart_pending"] and not self.settings["restart_error"]:
                return {"success": False, "updated": [], "errors": [], "skipped": [],
                        "pending": [], "error": "Decky wird nach den Freigaben neu gestartet."}
            self._progress(running=True, percent=0, index=0, total=0, repo="",
                           phase="repos.txt einlesen", operation="scan", bytes_done=0, bytes_total=0,
                           started=time.time(), completed_at=0, rows=[], result=None)
            try:
                sync = await self.import_default_repos_file()
                if not sync["success"]:
                    errors.append({"repo": "repos.txt", "error": sync["error"]})
                    self._progress(rows=[{"repo": "repos.txt", "name": "repos.txt", "previous": "",
                                          "version": "", "state": "error", "message": sync["error"]}])
                else:
                    installed = self._installed_plugins()
                    repos = list(self.settings["repos"])
                    total = len(repos)
                    mode = self.settings["update_mode"]
                    async with self.lock:
                        self.settings["pending_updates"] = []
                        self._save()
                    rows = []
                    for item in repos:
                        match, _ = self._match_installed(item, installed)
                        rows.append({"repo": item, "name": match["name"] if match else item.split("/")[-1],
                                     "previous": match["version"] if match else "", "version": "",
                                     "state": "pending", "message": ""})
                    self._progress(rows=rows, total=total)
                    for position, repo in enumerate(repos):
                        self._progress(index=position + 1, total=total, repo=repo,
                                       percent=int(100 * position / max(total, 1)), phase="Release prüfen",
                                       bytes_done=0, bytes_total=0)
                        self._status_row(repo, "checking")
                        try:
                            if repo not in self.settings["repos"]:
                                self._status_row(repo, "skipped", message="Repository aus der Liste entfernt.")
                                continue
                            plugin, reason = self._match_installed(repo, installed)
                            if plugin is None and reason:
                                skipped.append({"repo": repo, "reason": reason})
                                self._status_row(repo, "skipped", message=reason)
                                continue
                            current = version_key(plugin["version"]) if plugin else None
                            if plugin and current is None:
                                reason = "Installierte Version fehlt oder ist nicht vergleichbar."
                                skipped.append({"repo": repo, "reason": reason})
                                self._status_row(repo, "skipped", message=reason)
                                continue
                            result = await asyncio.to_thread(self._check_one, repo)
                            if not result:
                                reason = "Keine Release-ZIP unter den letzten 20 Releases."
                                skipped.append({"repo": repo, "reason": reason})
                                self._status_row(repo, "skipped", message=reason)
                                continue
                            tag, asset = result
                            newest = version_key(asset["name"]) or version_key(tag)
                            if plugin and newest is None:
                                reason = "Release-Version nicht erkennbar; kein Download."
                                skipped.append({"repo": repo, "reason": reason})
                                self._status_row(repo, "skipped", message=reason)
                                continue
                            if plugin and newest <= current:
                                reason = f"Installiert: {plugin['version']}; kein neueres Release."
                                skipped.append({"repo": repo, "reason": reason})
                                self._status_row(repo, "current", version=plugin["version"])
                                continue
                            if repo not in self.settings["repos"]:
                                self._status_row(repo, "skipped", message="Repository aus der Liste entfernt.")
                                continue
                            if mode == "ask":
                                if self.settings["declined_versions"].get(repo) == tag:
                                    skipped.append({"repo": repo, "reason": "Dieses Release wurde abgelehnt."})
                                    self._status_row(repo, "skipped", message="Dieses Release wurde abgelehnt.")
                                    continue
                                notes = str(asset.get("release_notes") or "")[:16000]
                                if not notes:
                                    try:
                                        notes = await asyncio.to_thread(self._release_notes_from_feed, repo, tag)
                                    except (OSError, ValueError, urllib.error.URLError) as exc:
                                        LOG.info("Release-Notes für %s nicht abrufbar: %s", repo, exc)
                                entry = {"repo": repo, "name": plugin["name"] if plugin else repo.split("/")[-1],
                                         "installed_version": plugin["version"] if plugin else "",
                                         "version": tag, "tag": tag, "asset_name": asset["name"],
                                         "changelog": notes}
                                async with self.lock:
                                    self.settings["pending_updates"].append(entry)
                                    self._save()
                                self._status_row(repo, "awaiting", version=tag)
                                continue
                            self._progress(phase="ZIP herunterladen", percent=int(100 * (position + .25) / total))
                            self._status_row(repo, "downloading", version=tag)
                            def download_progress(done, size):
                                fraction = min(done / size, 1) if size else 0
                                self._progress(bytes_done=done, bytes_total=size,
                                               percent=int(100 * (position + .25 + .55 * fraction) / total))
                            file_path = await asyncio.to_thread(self._download, repo, tag, asset, download_progress)
                            self._progress(phase="ZIP installieren", percent=int(100 * (position + .85) / total))
                            self._status_row(repo, "installing")
                            await self._mark_self_update(repo, tag, plugin)
                            installed_result = await asyncio.to_thread(self._install_zip, repo, file_path, plugin)
                            async with self.lock:
                                if is_self_repo(repo):
                                    self.settings["self_update_inflight"] = {}
                                if repo in self.settings["repos"]:
                                    self.settings["downloaded_versions"][repo] = tag
                                    self.settings["repo_plugin_map"][repo] = installed_result["folder"]
                                    self.settings["declined_versions"].pop(repo, None)
                                    self.settings["restart_pending"] = True
                                    self._save()
                            installed = [item for item in installed if item["folder"] != installed_result["folder"]]
                            installed.append({"folder": installed_result["folder"], "name": installed_result["name"],
                                              "package": "", "repo": repo, "version": installed_result["version"]})
                            self._status_row(repo, "updated", name=installed_result["name"],
                                             version=installed_result["version"])
                            updated.append({"repo": repo, "version": tag, "file": file_path, "folder": installed_result["folder"],
                                            "installed_version": plugin["version"] if plugin else None})
                        except AlreadyCurrent as exc:
                            async with self.lock:
                                if is_self_repo(repo):
                                    self.settings["self_update_inflight"] = {}
                                self.settings["repo_plugin_map"][repo] = exc.folder
                                self._save()
                            skipped.append({"repo": repo, "reason": str(exc)})
                            self._status_row(repo, "current", message=str(exc))
                        except Exception as exc:
                            if is_self_repo(repo) and self.settings["self_update_inflight"]:
                                async with self.lock:
                                    self.settings["self_update_inflight"] = {}
                                    self._save()
                            LOG.warning("Update check failed for %s: %s", repo, exc)
                            if isinstance(exc, urllib.error.HTTPError):
                                if exc.code == 404:
                                    detail = "GitHub-Repository nicht gefunden oder nicht öffentlich."
                                elif exc.code in (403, 429):
                                    detail = "GitHub verweigert Release-Seite oder Download (HTTP %s); Verbindung/Netzwerk prüfen." % exc.code
                                else:
                                    detail = "GitHub meldet HTTP %s." % exc.code
                            else:
                                detail = str(exc)
                            errors.append({"repo": repo, "error": detail})
                            self._status_row(repo, "error", message=detail)
                        finally:
                            self._progress(percent=int(100 * (position + 1) / max(total, 1)),
                                           phase="Repository abgeschlossen", bytes_done=0, bytes_total=0)
            finally:
                finished = time.time()
                result = {"success": not errors, "updated": updated, "errors": errors, "skipped": skipped,
                          "pending": [dict(item) for item in self.settings["pending_updates"]]}
                summary = {"success": not errors, "updated": len(updated), "errors": errors,
                           "skipped": len(skipped), "pending": len(result["pending"])}
                self._progress(running=False, percent=100, repo="", phase="Prüfung abgeschlossen", operation="idle",
                               bytes_done=0, bytes_total=0, completed_at=finished, result=summary)
                try:
                    async with self.lock:
                        self.settings["last_check"] = {"rows": [dict(row) for row in self.check_progress["rows"]],
                                                       "completed_at": finished, "result": summary}
                        self._save()
                except OSError:
                    LOG.exception("Ergebnis der letzten Prüfung konnte nicht gespeichert werden")
                LOG.info("Updateprüfung beendet: %s installiert, %s übersprungen, %s Fehler, %s Freigaben",
                         summary["updated"], summary["skipped"], len(errors), summary["pending"])
        self._schedule_restart_if_ready()
        return result

    async def approve_pending_update(self, repo):
        async with self.check_lock:
            pending = next((item for item in self.settings["pending_updates"] if item["repo"] == repo), None)
            if not pending or self.settings["update_mode"] != "ask":
                return {"success": False, "error": "Keine ausstehende Freigabe für dieses Repository."}
            sync = await self.import_default_repos_file()
            if not sync["success"] or repo not in self.settings["repos"]:
                return {"success": False, "error": "repos.txt fehlt oder enthält dieses Repository nicht mehr."}
            installed = self._installed_plugins()
            plugin, reason = self._match_installed(repo, installed)
            if reason:
                return {"success": False, "error": reason}
            self._progress(running=True, percent=0, index=1, total=1, repo=repo,
                           phase="Release prüfen", operation="install", bytes_done=0, bytes_total=0,
                           started=time.time())
            self._status_row(repo, "checking")
            try:
                result = await asyncio.to_thread(self._check_one, repo)
                if (not result or result[0] != pending["tag"]
                        or result[1].get("name") != pending.get("asset_name")):
                    self._status_row(repo, "awaiting", version=pending["tag"])
                    return {"success": False, "error": "GitHub-Release hat sich geändert. Bitte erneut prüfen."}
                tag, asset = result
                newest = version_key(asset["name"]) or version_key(tag)
                if plugin and (not newest or newest <= version_key(plugin["version"])):
                    self._status_row(repo, "awaiting", version=pending["tag"])
                    return {"success": False, "error": "Keine neuere Plugin-Version mehr vorhanden."}
                self._progress(phase="ZIP herunterladen")
                self._status_row(repo, "downloading", version=tag)
                def download_progress(done, size):
                    self._progress(bytes_done=done, bytes_total=size,
                                   percent=int(80 * done / size) if size else 0)
                file_path = await asyncio.to_thread(self._download, repo, tag, asset, download_progress)
                self._progress(phase="ZIP installieren", percent=85)
                self._status_row(repo, "installing")
                await self._mark_self_update(repo, tag, plugin)
                installed_result = await asyncio.to_thread(self._install_zip, repo, file_path, plugin)
                self._status_row(repo, "updated", name=installed_result["name"],
                                 version=installed_result["version"])
                async with self.lock:
                    if is_self_repo(repo):
                        self.settings["self_update_inflight"] = {}
                    self.settings["pending_updates"] = [item for item in self.settings["pending_updates"]
                                                        if item["repo"] != repo]
                    self.settings["downloaded_versions"][repo] = tag
                    self.settings["repo_plugin_map"][repo] = installed_result["folder"]
                    self.settings["declined_versions"].pop(repo, None)
                    self.settings["restart_pending"] = True
                    self._record_decision(installed=True)
                    self._save()
                restart_scheduled = self._schedule_restart_if_ready()
                return {"success": True, "repo": repo, "version": installed_result["version"],
                        "remaining": len(self.settings["pending_updates"]), "restart_scheduled": restart_scheduled}
            except Exception as exc:
                if is_self_repo(repo) and self.settings["self_update_inflight"]:
                    async with self.lock:
                        self.settings["self_update_inflight"] = {}
                        self._save()
                LOG.exception("Freigegebenes Update für %s fehlgeschlagen", repo)
                self._status_row(repo, "error", message=str(exc))
                return {"success": False, "error": str(exc)}
            finally:
                self._progress(running=False, percent=100, repo="", phase="Prüfung abgeschlossen", operation="idle",
                               completed_at=time.time(), bytes_done=0, bytes_total=0)

    async def decline_pending_update(self, repo):
        async with self.check_lock:
            pending = next((item for item in self.settings["pending_updates"] if item["repo"] == repo), None)
            if not pending:
                return {"success": False, "error": "Keine ausstehende Freigabe für dieses Repository."}
            async with self.lock:
                self.settings["declined_versions"][repo] = pending["tag"]
                self.settings["pending_updates"] = [item for item in self.settings["pending_updates"]
                                                    if item["repo"] != repo]
                self._status_row(repo, "skipped", message="Dieses Release wurde abgelehnt.")
                self._record_decision()
                self._save()
            restart_scheduled = self._schedule_restart_if_ready()
            return {"success": True, "remaining": len(self.settings["pending_updates"]),
                    "restart_scheduled": restart_scheduled}

    async def _daily_scheduler(self):
        while True:
            await asyncio.sleep(24 * 60 * 60)
            try:
                if not self.settings["pending_updates"] and not self.settings["restart_pending"]:
                    await self.check_updates()
            except Exception:
                LOG.exception("Scheduled update check failed")
