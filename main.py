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
HEADERS = {"User-Agent": "GithubPluginUpdater/1.5.1", "Accept": "application/vnd.github+json"}
CA_FILES = ("/etc/ssl/certs/ca-certificates.crt", "/etc/ssl/cert.pem", "/etc/pki/tls/certs/ca-bundle.crt")

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

def _curl_get(url, destination=None, timeout=30):
    curl = shutil.which("curl")
    if not curl:
        raise RuntimeError("Python kann das GitHub-Zertifikat nicht prüfen; System-curl fehlt ebenfalls.")
    command = [curl, "--fail", "--location", "--silent", "--show-error", "--proto", "=https",
               "--proto-redir", "=https", "--connect-timeout", "10", "--max-time", str(timeout),
               "--max-filesize", str(MAX_DOWNLOAD if destination else 4 * 1024 * 1024),
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
    return result.stdout

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
        self.settings = {"repos": [], "downloaded_versions": {}, "repo_plugin_map": {}}
        self.check_progress = {"running": False, "percent": 0, "index": 0, "total": 0,
                               "repo": "", "phase": "Bereit", "bytes_done": 0, "bytes_total": 0,
                               "started": 0}
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
        except (OSError, ValueError, TypeError) as exc:
            LOG.info("Starting with empty settings: %s", exc)
        LOG.info("Github Plugin Updater 1.5.1 bereit; %s Repositories geladen", len(self.settings["repos"]))
        try:
            await self.import_default_repos_file()
        except Exception:
            LOG.exception("repos.txt beim Start nicht lesbar; gespeicherte Liste bleibt erhalten")
        self.task = asyncio.create_task(self._daily_scheduler())

    async def _unload(self):
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

    async def get_repos(self):
        installed = self._installed_plugins()
        resolved = {repo: self._match_installed(repo, installed) for repo in self.settings["repos"]}
        return {"backend_version": "1.5.1", "repos": list(self.settings["repos"]), "installed": installed,
                "matches": {repo: value[0] for repo, value in resolved.items()},
                "match_reasons": {repo: value[1] for repo, value in resolved.items()}}

    async def get_check_status(self):
        return dict(self.check_progress)

    def _progress(self, **fields):
        self.check_progress.update(fields)

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
            if folder and folder not in {p["folder"] for p in self._installed_plugins()}:
                return {"success": False, "error": "Dieses Decky-Plugin ist nicht installiert."}
            if folder:
                self.settings["repo_plugin_map"][repo_path] = folder
            else:
                self.settings["repo_plugin_map"].pop(repo_path, None)
            self._save()
        return {"success": True, "repos": list(self.settings["repos"])}

    async def _import_repos_content(self, file_content):
        LOG.info("Textimport begonnen: %s Zeichen", len(file_content))
        if len(file_content) > 128_000:
            return {"success": False, "error": "Liste ist zu groß."}
        lines = [s.strip() for s in file_content.splitlines()
                 if s.strip() and not s.lstrip().startswith("#")]
        invalid = [s for s in lines if not normalize_repo(s)]
        wanted = list(dict.fromkeys(repo for s in lines if (repo := normalize_repo(s))))
        async with self.lock:
            old = set(self.settings["repos"])
            new = [repo for repo in wanted if repo not in old]
            self.settings["repos"] = wanted
            for removed in old - set(wanted):
                self.settings["downloaded_versions"].pop(removed, None)
                self.settings["repo_plugin_map"].pop(removed, None)
            self._save()
        LOG.info("repos.txt synchronisiert: %s Repositories, %s neu, %s ungültig", len(wanted), len(new), len(invalid))
        return {"success": True, "added": len(new), "invalid": len(invalid),
                "repos": list(self.settings["repos"])}

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
            content = await asyncio.to_thread(path.read_text, encoding="utf-8")
            return await self._import_repos_content(content)
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
                        return tag, {"name": name, "browser_download_url": "https://github.com" + path}
        return None

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
                return release["tag_name"], assets[0]
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
            if not folder or folder == "github-plugin-updater":
                raise ValueError("Der Updater installiert keine eigene Aktualisierung während er läuft.")
            target = plugins_dir / folder
            if target.is_symlink() or (target.exists() and not target.is_dir()):
                raise ValueError("Plugin-Ziel ist kein normaler Ordner.")
            if target.exists() and not installed_plugin:
                raise ValueError("Ein anderer Plugin-Ordner trägt bereits diesen Namen; bitte Zuordnung prüfen.")
            if installed_plugin:
                known = (matched_by_manifest_name or self.settings["repo_plugin_map"].get(repo) == folder
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

    async def _restart_ui(self):
        await asyncio.sleep(5)
        try:
            if not shutil.which("systemctl") or not shutil.which("killall"):
                raise RuntimeError("systemctl oder killall fehlt: Decky und Steam bitte manuell neu starten.")
            # Restart the loader as well: only restarting the Steam UI cannot
            # discover a newly installed backend when Decky hot reload is off.
            # Detached process survives the restart of this very plugin.
            subprocess.Popen(["/bin/sh", "-c",
                "sleep 2; systemctl restart plugin_loader.service; killall -s SIGTERM steamwebhelper"],
                stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                start_new_session=True)
            LOG.info("Decky- und Steam-Oberflächen-Neustart eingeleitet")
        except (OSError, RuntimeError):
            LOG.exception("Automatischer Neustart fehlgeschlagen; Decky und Steam bitte manuell neu starten")

    async def check_updates(self):
        updated, errors, skipped = [], [], []
        async with self.check_lock:
            self._progress(running=True, percent=0, index=0, total=0, repo="",
                           phase="repos.txt einlesen", bytes_done=0, bytes_total=0,
                           started=time.time())
            try:
                sync = await self.import_default_repos_file()
                if not sync["success"]:
                    errors.append({"repo": "repos.txt", "error": sync["error"]})
                else:
                    installed = self._installed_plugins()
                    repos = list(self.settings["repos"])
                    total = len(repos)
                    for position, repo in enumerate(repos):
                        self._progress(index=position + 1, total=total, repo=repo,
                                       percent=int(100 * position / max(total, 1)), phase="Release prüfen",
                                       bytes_done=0, bytes_total=0)
                        try:
                            if repo not in self.settings["repos"]:
                                continue
                            plugin, reason = self._match_installed(repo, installed)
                            if plugin is None and reason:
                                skipped.append({"repo": repo, "reason": reason})
                                continue
                            current = version_key(plugin["version"]) if plugin else None
                            if plugin and current is None:
                                skipped.append({"repo": repo, "reason": "Installierte Version fehlt oder ist nicht vergleichbar."})
                                continue
                            result = await asyncio.to_thread(self._check_one, repo)
                            if not result:
                                skipped.append({"repo": repo, "reason": "Keine Release-ZIP unter den letzten 20 Releases."})
                                continue
                            tag, asset = result
                            newest = version_key(asset["name"]) or version_key(tag)
                            if plugin and newest is None:
                                skipped.append({"repo": repo, "reason": "Release-Version nicht erkennbar; kein Download."})
                                continue
                            if plugin and newest <= current:
                                skipped.append({"repo": repo, "reason": f"Installiert: {plugin['version']}; kein neueres Release."})
                                continue
                            if repo not in self.settings["repos"]:
                                continue
                            self._progress(phase="ZIP herunterladen", percent=int(100 * (position + .25) / total))
                            def download_progress(done, size):
                                fraction = min(done / size, 1) if size else 0
                                self._progress(bytes_done=done, bytes_total=size,
                                               percent=int(100 * (position + .25 + .55 * fraction) / total))
                            file_path = await asyncio.to_thread(self._download, repo, tag, asset, download_progress)
                            self._progress(phase="ZIP installieren", percent=int(100 * (position + .85) / total))
                            installed_result = await asyncio.to_thread(self._install_zip, repo, file_path, plugin)
                            async with self.lock:
                                if repo in self.settings["repos"]:
                                    self.settings["downloaded_versions"][repo] = tag
                                    self.settings["repo_plugin_map"][repo] = installed_result["folder"]
                                    self._save()
                            installed = [item for item in installed if item["folder"] != installed_result["folder"]]
                            installed.append({"folder": installed_result["folder"], "name": installed_result["name"],
                                              "package": "", "repo": repo, "version": installed_result["version"]})
                            updated.append({"repo": repo, "version": tag, "file": file_path, "folder": installed_result["folder"],
                                            "installed_version": plugin["version"] if plugin else None})
                        except AlreadyCurrent as exc:
                            async with self.lock:
                                self.settings["repo_plugin_map"][repo] = exc.folder
                                self._save()
                            skipped.append({"repo": repo, "reason": str(exc)})
                        except Exception as exc:
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
                        finally:
                            self._progress(percent=int(100 * (position + 1) / max(total, 1)),
                                           phase="Repository abgeschlossen", bytes_done=0, bytes_total=0)
            finally:
                self._progress(running=False, percent=100, repo="", phase="Prüfung abgeschlossen",
                               bytes_done=0, bytes_total=0)
        if updated:
            asyncio.create_task(self._restart_ui())
        return {"success": not errors, "updated": updated, "errors": errors, "skipped": skipped}

    async def _daily_scheduler(self):
        while True:
            await asyncio.sleep(24 * 60 * 60)
            try:
                await self.check_updates()
            except Exception:
                LOG.exception("Scheduled update check failed")
