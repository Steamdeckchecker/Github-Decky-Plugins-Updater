import { DialogButton, Field, ModalRoot, PanelSection, PanelSectionRow, TextField,
  ToggleField, showModal, staticClasses } from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FaGithub, FaDownload, FaChevronDown, FaCheckCircle, FaGlobe,
  FaClock, FaExclamationTriangle, FaCircleNotch, FaMinusCircle, FaSearch } from "react-icons/fa";
import { systemLanguage, t, type Language, type MessageKey } from "./i18n";

type Installed = { folder: string; name: string; version: string; repo?: string | null };
type Repos = { backend_version?: string; repos: string[]; installed: Installed[]; matches: Record<string, Installed | null>;
  import_file?: string | null;
  match_reasons: Record<string, string | null>; update_mode: "automatic" | "ask";
  pinned_versions: Record<string, string>;
  pending_updates: PendingUpdate[]; restart_pending?: boolean; restart_error?: string;
  restart_error_detail?: string };
type PendingUpdate = { repo: string; name: string; installed_version: string; version: string;
  tag: string; changelog: string };
type Mutation = { success: boolean; repos?: string[]; error?: string; added?: number; invalid?: number;
  existing?: number;
  file?: string; changed?: boolean; restart_scheduled?: boolean; remaining?: number };
type CatalogPlugin = { repo: string; name: string; author: string; description: string;
  tags: string[]; stars: number; downloads: number; latest_tag: string; released_at: string };
type CatalogStatus = { running: boolean; plugins: CatalogPlugin[]; tracked: string[];
  error: string; fetched_at: number };
type GithubPlugin = { repo: string; name: string; author: string; description: string;
  stars: number; archived: boolean };
type GithubSearchStatus = { running: boolean; query: string; page: number;
  plugins: GithubPlugin[]; has_more: boolean; tracked: string[]; error: string };
type Release = { token: string; tag: string; asset_name: string; changelog: string;
  prerelease: boolean; published_at: string };
type ReleaseStatus = { running: boolean; repo: string; page: number; releases: Release[];
  has_more: boolean; tracked: string[]; pinned_versions: Record<string, string>;
  installed_version: string; error: string };
type CheckSummary = { success: boolean; updated: number; skipped: number; pending: number;
  errors: { repo: string; error: string }[] };
type CheckRow = { repo: string; name: string; previous: string; version: string;
  state: "pending" | "checking" | "downloading" | "installing" | "updated" | "current" | "skipped" | "error" | "awaiting";
  message: string };
type CheckProgress = { running: boolean; percent: number; index: number; total: number;
  repo: string; phase: string; operation?: "idle" | "scan" | "install";
  bytes_done: number; bytes_total: number;
  started?: number; completed_at?: number; rows: CheckRow[]; result?: CheckSummary | null;
  restart_pending?: boolean; restart_error?: string; restart_error_detail?: string };
const getRepos = callable<[], Repos>("get_repos");
const importReposFile = callable<[], Mutation>("import_repos_file");
const getCheckStatus = callable<[], CheckProgress>("get_check_status");
const startCheck = callable<[], { success: boolean; started: boolean; error?: string }>("start_check");
const setMapping = callable<[repo: string, folder: string], Mutation>("set_plugin_mapping");
const setUpdateMode = callable<[mode: "automatic" | "ask"], Mutation>("set_update_mode");
const approvePending = callable<[repo: string], Mutation>("approve_pending_update");
const declinePending = callable<[repo: string], Mutation>("decline_pending_update");
const retryRestart = callable<[], Mutation>("retry_restart");
const claimUiRestart = callable<[], Mutation>("claim_ui_restart");
const reportUiRestartFailure = callable<[detail: string], Mutation>("report_ui_restart_failure");
const startCatalog = callable<[force: boolean], { success: boolean; error?: string }>("start_catalog");
const getCatalogStatus = callable<[], CatalogStatus>("get_catalog_status");
const setCatalogRepo = callable<[repo: string, follow: boolean], Mutation>("set_catalog_repo");
const startGithubSearch = callable<[query: string, page: number], Mutation>("start_github_search");
const getGithubSearchStatus = callable<[], GithubSearchStatus>("get_github_search_status");
const startReleaseLookup = callable<[repo: string, page: number], Mutation>("start_release_lookup");
const getReleaseStatus = callable<[], ReleaseStatus>("get_release_status");
const startSelectedInstall = callable<[token: string, confirmed: boolean], Mutation>("start_selected_install");
const clearVersionPin = callable<[repo: string], Mutation>("clear_version_pin");
// Steam can remount or reload the entire Decky view while opening a modal.
// Keep the guard across both events so a dismissed popup cannot reopen in a loop.
const approvalStorageKey = "github-plugin-updater.approvals.v1";
function loadApprovalSession(): { blocked: boolean; prompted: Set<string> } {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(approvalStorageKey) || "null");
    return { blocked: saved?.blocked === true,
      prompted: new Set<string>(Array.isArray(saved?.prompted)
        ? saved.prompted.filter((value: unknown): value is string => typeof value === "string").slice(-100) : []) };
  } catch { return { blocked: false, prompted: new Set<string>() }; }
}
const approvalSession = loadApprovalSession();
function saveApprovalSession() {
  try { window.sessionStorage.setItem(approvalStorageKey, JSON.stringify({
    blocked: approvalSession.blocked, prompted: [...approvalSession.prompted],
  })); } catch { /* Steam may disable session storage; the in-memory guard still works. */ }
}

function withTimeout<T>(request: Promise<T>, message: string, milliseconds = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), milliseconds);
    request.then(value => { window.clearTimeout(timer); resolve(value); }, error => {
      window.clearTimeout(timer); reject(error);
    });
  });
}

const small = { fontSize: "0.85em", opacity: 0.8 } as const;
const spaced = { display: "flex", alignItems: "center", gap: 8 } as const;
const colors = { cyan: "#45d9f2", green: "#69dda8", red: "#ff9c9c", muted: "#aab9cf" };

function useSystemLanguage(): Language {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    let active = true;
    let request = 0;
    const readLanguage = () => {
      const current = ++request;
      if (typeof SteamClient === "undefined" || !SteamClient.Settings?.GetCurrentLanguage) {
        if (active) setLanguage("en");
        return;
      }
      try {
        void SteamClient.Settings.GetCurrentLanguage().then(value => {
          if (active && current === request) setLanguage(systemLanguage(value));
        }).catch(() => {
          if (active && current === request) setLanguage("en");
        });
      } catch { if (active && current === request) setLanguage("en"); }
    };
    readLanguage();
    let listener: { unregister: () => void } | null = null;
    try {
      if (typeof SteamClient !== "undefined" && SteamClient.Settings?.RegisterForSettingsChanges) {
        listener = SteamClient.Settings.RegisterForSettingsChanges(readLanguage);
      }
    } catch { /* The current language still works if Steam cannot register a listener. */ }
    return () => { active = false; try { listener?.unregister(); } catch { /* Steam may already be gone. */ } };
  }, []);
  return language;
}

function LocalizedTitle() {
  const language = useSystemLanguage();
  return <div className={staticClasses.Title}>{t(language, "appTitle")}</div>;
}

function CheckIcon({ state }: { state: CheckRow["state"] }) {
  if (state === "updated" || state === "current") return <FaCheckCircle color={colors.green} size={17} />;
  if (state === "error") return <FaExclamationTriangle color={colors.red} size={16} />;
  if (state === "skipped") return <FaMinusCircle color={colors.muted} size={17} />;
  if (state === "awaiting") return <FaClock color="#ffd577" size={17} />;
  if (state === "pending") return <FaClock color={colors.muted} size={16} />;
  return <FaCircleNotch color={colors.cyan} size={17} />;
}

function backendMessage(lang: Language, message: string): string {
  const reason: Record<string, MessageKey> = {
    "Mehrere passende Installationen; bitte zuordnen.": "ambiguous",
    "Updater-Installation nicht eindeutig gefunden.": "selfMissing",
    "Keine Release-ZIP unter den letzten 20 Releases.": "noRelease",
    "Installierte Version fehlt oder ist nicht vergleichbar.": "invalidVersion",
    "Release-Version nicht erkennbar; kein Download.": "unknownVersion",
    "Dieses Release wurde abgelehnt.": "declinedRow",
    "Repository aus der Liste entfernt.": "removedRow",
    "GitHub-Repository nicht gefunden oder nicht öffentlich.": "repoNotFound",
    repo_import_missing: "importMissing", repo_import_too_large: "importTooLarge",
    repo_import_unreadable: "importUnreadable", repo_import_timeout: "importTimeout",
    repo_import_check_running: "importCheckRunning", repo_import_save_failed: "importSaveFailed",
  };
  return reason[message] ? t(lang, reason[message]) : message;
}

function rowSubtitle(lang: Language, row: CheckRow): string {
  if (row.state === "updated") return row.previous
    ? t(lang, "oldToNew", { old: row.previous, version: row.version })
    : t(lang, "newInstalled", { version: row.version });
  if (row.state === "current") return t(lang, "current", { version: row.previous || row.version });
  if (row.state === "error" || row.state === "skipped") return backendMessage(lang, row.message) || t(lang, "skipRow");
  if (row.state === "awaiting") return t(lang, "waitingRow", { version: row.version });
  if (row.state === "downloading") return t(lang, "downloadRow", { old: row.previous || "–", version: row.version });
  if (row.state === "installing") return t(lang, "installRow", { old: row.previous || "–", version: row.version });
  if (row.state === "checking") return t(lang, "checkingRow");
  return row.previous ? t(lang, "pendingRow", { version: row.previous }) : t(lang, "notInstalled");
}

function phaseName(lang: Language, phase: string): string {
  const names: Record<string, MessageKey> = { "Repository-Liste laden": "phaseFile", "Release prüfen": "phaseRelease",
    "ZIP herunterladen": "phaseDownload", "ZIP installieren": "phaseInstall",
    "Repository abgeschlossen": "phaseCompleteRepo", "Prüfung abgeschlossen": "phaseComplete" };
  return names[phase] ? t(lang, names[phase]) : phase;
}

function CompactButton({ children, onClick, disabled = false }: {
  children: ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return <DialogButton disabled={disabled} onClick={onClick} style={{
    width: "auto", minWidth: 0, minHeight: 30, height: "auto", flexShrink: 0,
    padding: "5px 10px", fontSize: 13, lineHeight: "18px", whiteSpace: "normal",
  }}>{children}</DialogButton>;
}

function FilterButton({ children, onClick, selected }: {
  children: ReactNode; onClick: () => void; selected: boolean;
}) {
  return <DialogButton onClick={onClick} style={{ width: "auto", minWidth: 0, minHeight: 30,
    height: "auto", padding: "5px 9px", fontSize: 12, lineHeight: "18px", whiteSpace: "normal",
    border: selected ? `1px solid ${colors.cyan}` : "1px solid transparent",
    background: selected ? "#15566d" : undefined,
  }}>{selected ? "✓ " : ""}{children}</DialogButton>;
}

function CatalogBrowser({ language, onClose, onReposChanged, onVersions }: {
  language: Language; onClose: () => void; onReposChanged: () => void; onVersions: (repo: string) => void;
}) {
  const [plugins, setPlugins] = useState<CatalogPlugin[]>([]);
  const [tracked, setTracked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("stars");
  const [showTags, setShowTags] = useState(false);
  const [page, setPage] = useState(0);
  const [changing, setChanging] = useState("");
  const active = useRef(false);
  const timer = useRef<number | null>(null);

  const readCatalog = async () => {
    try {
      const status = await withTimeout(getCatalogStatus(), t(language, "timeout"));
      if (!active.current) return;
      setPlugins(status.plugins || []);
      setTracked(status.tracked || []);
      setLoading(status.running);
      setError(status.error || "");
      if (status.running) timer.current = window.setTimeout(() => void readCatalog(), 1000);
    } catch (caught) {
      if (active.current) { setLoading(false); setError(String(caught)); }
    }
  };

  const loadCatalog = async (force = false) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setLoading(true);
    setError("");
    try {
      const result = await withTimeout(startCatalog(force), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "catalogFailed"));
      if (active.current) await readCatalog();
    } catch (caught) {
      if (active.current) { setLoading(false); setError(String(caught)); }
    }
  };

  useEffect(() => {
    active.current = true;
    void loadCatalog();
    return () => { active.current = false; if (timer.current !== null) window.clearTimeout(timer.current); };
  }, []);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const plugin of plugins) for (const item of plugin.tags) counts.set(item, (counts.get(item) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 25);
  }, [plugins]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return plugins.filter(plugin => (!tag || plugin.tags.includes(tag)) && (!query
      || [plugin.name, plugin.repo, plugin.author, plugin.description, ...plugin.tags]
        .join(" ").toLocaleLowerCase().includes(query))).sort((a, b) => {
      if (sort === "recent") return b.released_at.localeCompare(a.released_at) || a.name.localeCompare(b.name);
      if (sort === "downloads") return b.downloads - a.downloads || a.name.localeCompare(b.name);
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.stars - a.stars || a.name.localeCompare(b.name);
    });
  }, [plugins, search, sort, tag]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12));
  const shownPage = Math.min(page, pageCount - 1);
  const trackedSet = new Set(tracked.map(repo => repo.toLowerCase()));

  const toggleRepo = async (repo: string, follow: boolean) => {
    setChanging(repo);
    try {
      const result = await withTimeout(setCatalogRepo(repo, follow), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
      setTracked(result.repos || []);
      onReposChanged();
      toaster.toast({ title: t(language, follow ? "catalogAdded" : "catalogRemoved"), body: repo });
    } catch (caught) {
      toaster.toast({ title: t(language, "error"), body: String(caught) });
    } finally { setChanging(""); }
  };

  return <div style={{ width: "100%", minWidth: 0, overflowWrap: "anywhere" }}>
    <PanelSection title={t(language, "catalogTitle")}>
      <PanelSectionRow><CompactButton onClick={onClose}>← {t(language, "catalogBack")}</CompactButton></PanelSectionRow>
      <PanelSectionRow><div style={small}>{t(language, "catalogIntro")}</div></PanelSectionRow>
      <PanelSectionRow><div onKeyDownCapture={event => {
        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
          event.preventDefault(); event.stopPropagation();
        }
      }} onKeyUpCapture={event => {
        if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); }
      }}>
        <TextField label={t(language, "catalogSearch")} value={search} onChange={event => {
          setSearch(event.target.value); setPage(0);
        }} />
      </div></PanelSectionRow>
      <PanelSectionRow><div style={small}>{t(language, "catalogSort")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {([ ["stars", "catalogStars"], ["downloads", "catalogDownloads"],
            ["recent", "catalogRecent"], ["name", "catalogName"] ] as const).map(([choice, label]) =>
            <FilterButton key={choice} selected={sort === choice} onClick={() => {
              setSort(choice); setPage(0);
            }}>{t(language, label)}</FilterButton>)}
        </div>
      </PanelSectionRow>
      <PanelSectionRow><CompactButton onClick={() => setShowTags(value => !value)}>
        {t(language, "catalogTags")}: {tag || t(language, "catalogAllTags")} {showTags ? "▴" : "▾"}
      </CompactButton></PanelSectionRow>
      {showTags && <PanelSectionRow><div style={{ display: "flex", flexWrap: "wrap", gap: 6,
        maxHeight: 185, overflowY: "auto" }}>
        <FilterButton selected={!tag} onClick={() => {
          setTag(""); setPage(0); setShowTags(false);
        }}>{t(language, "catalogAllTags")}</FilterButton>
        {topTags.map(([item, count]) => <FilterButton key={item} selected={tag === item} onClick={() => {
          setTag(item); setPage(0); setShowTags(false);
        }}>{item} ({count})</FilterButton>)}
      </div></PanelSectionRow>}
    </PanelSection>

    <PanelSection title={t(language, "catalogResults", { count: filtered.length, total: plugins.length })}>
      <PanelSectionRow><CompactButton disabled={loading} onClick={() => void loadCatalog(true)}>
        {t(language, "catalogRefresh")}</CompactButton></PanelSectionRow>
      {loading && <PanelSectionRow><div style={small}><FaCircleNotch /> {t(language, "catalogLoading")}</div></PanelSectionRow>}
      {error && <PanelSectionRow><div style={{ color: colors.red, fontSize: 12 }}>
        {t(language, "catalogFailed")}: {error}
        <div style={{ marginTop: 8 }}><CompactButton onClick={() => void loadCatalog(true)}>
          {t(language, "catalogRetry")}</CompactButton></div>
      </div></PanelSectionRow>}
      {!loading && !error && !filtered.length && <PanelSectionRow><div style={small}>
        {t(language, "catalogEmpty")}</div></PanelSectionRow>}
      {filtered.slice(shownPage * 12, (shownPage + 1) * 12).map(plugin => {
        const follows = trackedSet.has(plugin.repo.toLowerCase());
        return <PanelSectionRow key={plugin.repo}><Field label={plugin.name} icon={<FaGithub />}
          description={`${plugin.repo} · ${plugin.author}`} padding="compact"
          childrenLayout="below" bottomSeparator="standard">
          {plugin.description && <div style={{ fontSize: 12, lineHeight: 1.35, opacity: 0.82,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {plugin.description}</div>}
          <div style={{ ...small, marginTop: 5 }}>★ {plugin.stars}{plugin.downloads > 0
            ? ` · ↓ ${plugin.downloads.toLocaleString(language)}` : ""} · {plugin.latest_tag
            ? t(language, "catalogRelease", { version: plugin.latest_tag }) : t(language, "catalogNoRelease")}</div>
          {plugin.tags.length > 0 && <div style={{ ...small, marginTop: 4 }}>
            {plugin.tags.slice(0, 4).join(" · ")}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 8 }}>
            <CompactButton disabled={!!changing || loading} onClick={() => void toggleRepo(plugin.repo, !follows)}>
              {changing === plugin.repo ? t(language, "processing") : t(language, follows ? "catalogRemove" : "catalogAdd")}
            </CompactButton>
            <CompactButton onClick={() => onVersions(plugin.repo)}>{t(language, "otherVersions")}</CompactButton>
            <a href={`https://github.com/${plugin.repo}`} target="_blank" rel="noopener noreferrer">
              GitHub ↗</a>
          </div>
        </Field></PanelSectionRow>;
      })}
      {pageCount > 1 && <PanelSectionRow><div style={{ display: "flex", alignItems: "center",
        flexWrap: "wrap", gap: 8 }}>
        <CompactButton disabled={shownPage === 0} onClick={() => setPage(shownPage - 1)}>
          {t(language, "catalogPrev")}</CompactButton>
        <span style={small}>{t(language, "catalogPage", { page: shownPage + 1, pages: pageCount })}</span>
        <CompactButton disabled={shownPage + 1 >= pageCount} onClick={() => setPage(shownPage + 1)}>
          {t(language, "catalogNext")}</CompactButton>
      </div></PanelSectionRow>}
      <PanelSectionRow><div style={small}>{t(language, "catalogNote")}</div></PanelSectionRow>
      <PanelSectionRow><a href="https://safetzahirovic.github.io/decky-plugins-explorer/"
        target="_blank" rel="noopener noreferrer">{t(language, "catalogSource")}</a></PanelSectionRow>
    </PanelSection>
  </div>;
}

function GithubSearch({ language, onClose, onVersions, onReposChanged }: {
  language: Language; onClose: () => void; onVersions: (repo: string) => void; onReposChanged: () => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<GithubSearchStatus | null>(null);
  const [changing, setChanging] = useState("");
  const [error, setError] = useState("");
  const active = useRef(true);
  const read = async () => {
    try {
      const next = await withTimeout(getGithubSearchStatus(), t(language, "timeout"));
      if (active.current) { setStatus(next); setError(""); }
    } catch (caught) { if (active.current) setError(String(caught)); }
  };
  useEffect(() => {
    active.current = true;
    void getGithubSearchStatus().then(next => {
      if (active.current) { setStatus(next); setQuery(next.query || ""); }
    });
    const timer = window.setInterval(() => void read(), 1000);
    return () => { active.current = false; window.clearInterval(timer); };
  }, []);
  const search = async (page = 1) => {
    if (!query.trim()) return;
    setError("");
    setStatus(previous => ({ running: true, query: query.trim(), page, plugins: [],
      tracked: previous?.tracked || [], has_more: false, error: "" }));
    try {
      const result = await withTimeout(startGithubSearch(query.trim(), page), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "searchFailed"));
      await read();
    } catch (caught) { setError(String(caught)); }
  };
  const toggle = async (repo: string, follow: boolean) => {
    setChanging(repo);
    try {
      const result = await withTimeout(setCatalogRepo(repo, follow), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
      setStatus(previous => previous ? { ...previous, tracked: result.repos || [] } : previous);
      onReposChanged();
    } catch (caught) { toaster.toast({ title: t(language, "error"), body: String(caught) }); }
    finally { setChanging(""); }
  };
  const tracked = new Set((status?.tracked || []).map(repo => repo.toLowerCase()));
  return <div style={{ width: "100%", minWidth: 0, overflowWrap: "anywhere" }}>
    <PanelSection title={t(language, "githubSearchTitle")}>
      <PanelSectionRow><CompactButton onClick={onClose}>← {t(language, "catalogBack")}</CompactButton></PanelSectionRow>
      <PanelSectionRow><div style={small}>{t(language, "githubSearchIntro")}</div></PanelSectionRow>
      <PanelSectionRow><div onKeyDownCapture={event => {
        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
          event.preventDefault(); event.stopPropagation();
        }
      }} onKeyUpCapture={event => {
        if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); }
      }}><TextField label={t(language, "githubSearchHint")} value={query}
          onChange={event => setQuery(event.target.value)} /></div></PanelSectionRow>
      <PanelSectionRow><CompactButton disabled={!query.trim() || !!status?.running}
        onClick={() => void search(1)}><FaSearch /> {t(language, "githubSearchButton")}</CompactButton></PanelSectionRow>
      {(error || status?.error) && <PanelSectionRow><div style={{ color: colors.red, fontSize: 12 }}>
        {error || status?.error}</div></PanelSectionRow>}
    </PanelSection>
    <PanelSection title={t(language, "githubSearchResults")}>
      {status?.running && <PanelSectionRow><div style={small}><FaCircleNotch /> {t(language, "catalogLoading")}</div></PanelSectionRow>}
      {!status?.running && !!status?.query && !status?.plugins.length && !status?.error &&
        <PanelSectionRow><div style={small}>{t(language, "catalogEmpty")}</div></PanelSectionRow>}
      {status?.plugins.map(plugin => <PanelSectionRow key={plugin.repo}><Field
        label={plugin.name} icon={<FaGithub />} description={plugin.repo}
        padding="compact" childrenLayout="below" bottomSeparator="standard">
        {plugin.description && <div style={{ ...small, marginTop: 6 }}>{plugin.description}</div>}
        <div style={{ ...small, marginTop: 5 }}>★ {plugin.stars} · {plugin.author}
          {plugin.archived ? ` · ${t(language, "githubArchived")}` : ""}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <CompactButton disabled={!!changing} onClick={() => void toggle(plugin.repo, !tracked.has(plugin.repo.toLowerCase()))}>
            {changing === plugin.repo ? t(language, "processing") : t(language,
              tracked.has(plugin.repo.toLowerCase()) ? "catalogRemove" : "catalogAdd")}</CompactButton>
          <CompactButton onClick={() => onVersions(plugin.repo)}>{t(language, "otherVersions")}</CompactButton>
          <a href={`https://github.com/${plugin.repo}`} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </Field></PanelSectionRow>)}
      {!!status?.plugins.length && <PanelSectionRow><div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <CompactButton disabled={!!status?.running || status.page <= 1}
          onClick={() => void search(status.page - 1)}>{t(language, "catalogPrev")}</CompactButton>
        <span style={small}>{status.page}</span>
        <CompactButton disabled={!!status?.running || !status.has_more || status.page >= 10}
          onClick={() => void search(status.page + 1)}>{t(language, "catalogNext")}</CompactButton>
      </div></PanelSectionRow>}
    </PanelSection>
  </div>;
}

function ReleaseBrowser({ repo, language, onClose, onStarted, onReposChanged }: {
  repo: string; language: Language; onClose: () => void; onStarted: () => void; onReposChanged: () => void;
}) {
  const [status, setStatus] = useState<ReleaseStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef(true);
  const read = async () => {
    try {
      const next = await withTimeout(getReleaseStatus(), t(language, "timeout"));
      if (active.current && next.repo.toLowerCase() === repo.toLowerCase()) setStatus(next);
    } catch (caught) { if (active.current) setError(String(caught)); }
  };
  const load = async (page: number) => {
    setError("");
    setStatus(previous => ({ running: true, repo, page, releases: [], has_more: false,
      tracked: previous?.tracked || [], pinned_versions: previous?.pinned_versions || {},
      installed_version: previous?.installed_version || "", error: "" }));
    try {
      const result = await withTimeout(startReleaseLookup(repo, page), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "releaseFailed"));
      await read();
    } catch (caught) { setError(String(caught)); }
  };
  useEffect(() => {
    active.current = true;
    void load(1);
    const timer = window.setInterval(() => void read(), 1000);
    return () => { active.current = false; window.clearInterval(timer); };
  }, [repo]);
  const select = (release: Release) => {
    const warning = status?.installed_version
      ? t(language, "selectedReplace", { version: status.installed_version })
      : t(language, "selectedNew");
    let handle: { Close: () => void } | null = null;
    const install = async () => {
      handle?.Close();
      setBusy(true);
      try {
        const result = await withTimeout(startSelectedInstall(release.token, true), t(language, "timeout"));
        if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
        onStarted();
      } catch (caught) { toaster.toast({ title: t(language, "error"), body: String(caught) }); }
      finally { setBusy(false); }
    };
    handle = showModal(<ModalRoot onCancel={() => handle?.Close()} bDisableBackgroundDismiss>
      <div style={{ maxWidth: 500, overflowWrap: "anywhere" }}>
        <strong>{t(language, "selectedConfirm", { version: release.tag })}</strong>
        <div style={{ ...small, marginTop: 6 }}>{repo} · {release.asset_name}</div>
        <div style={{ marginTop: 9, fontSize: 12 }}>{warning}</div>
        <div style={{ ...small, marginTop: 12 }}>{t(language, "notes")}</div>
        <div style={{ maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap", fontSize: 12,
          lineHeight: 1.4, marginTop: 7 }}>{release.changelog || t(language, "noNotes")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          <CompactButton onClick={() => void install()}>{t(language, "approve")}</CompactButton>
          <CompactButton onClick={() => handle?.Close()}>{t(language, "selectedCancel")}</CompactButton>
        </div>
      </div>
    </ModalRoot>, undefined, { strTitle: t(language, "selectedTitle") });
  };
  const pin = status?.pinned_versions[repo];
  return <div style={{ width: "100%", minWidth: 0, overflowWrap: "anywhere" }}>
    <PanelSection title={t(language, "releaseTitle", { repo })}>
      <PanelSectionRow><CompactButton onClick={onClose}>← {t(language, "catalogBack")}</CompactButton></PanelSectionRow>
      <PanelSectionRow><div style={small}>{t(language, "selectedInstalled", {
        version: status?.installed_version || t(language, "notInstalled") })}</div></PanelSectionRow>
      {pin && <PanelSectionRow><div style={small}>
        {t(language, "pinnedVersion", { version: pin })}
        <div style={{ marginTop: 7 }}><CompactButton disabled={busy} onClick={() => {
          setBusy(true);
          void withTimeout(clearVersionPin(repo), t(language, "timeout")).then(result => {
            if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
            onReposChanged(); void read();
          }).catch(caught => toaster.toast({ title: t(language, "error"), body: String(caught) }))
            .finally(() => setBusy(false));
        }}>{t(language, "followLatest")}</CompactButton></div>
      </div></PanelSectionRow>}
      <PanelSectionRow><div style={small}>{t(language, "releaseIntro")}</div></PanelSectionRow>
      {error && <PanelSectionRow><div style={{ color: colors.red, fontSize: 12 }}>{error}</div></PanelSectionRow>}
      {status?.error && <PanelSectionRow><div style={{ color: colors.red, fontSize: 12 }}>{status.error}</div></PanelSectionRow>}
    </PanelSection>
    <PanelSection title={t(language, "releaseList")}>
      {status?.running && <PanelSectionRow><div style={small}><FaCircleNotch /> {t(language, "catalogLoading")}</div></PanelSectionRow>}
      {!status?.running && !status?.releases.length && !status?.error &&
        <PanelSectionRow><div style={small}>{t(language, "noRelease")}</div></PanelSectionRow>}
      {status?.releases.map(release => <PanelSectionRow key={release.token}>
        <Field label={release.tag} description={`${release.asset_name}${release.prerelease
          ? ` · ${t(language, "prerelease")}` : ""}`} icon={<FaDownload />}
          padding="compact" childrenLayout="below" bottomSeparator="standard">
          {release.published_at && <div style={small}>{release.published_at.slice(0, 10)}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <CompactButton disabled={busy || !!status?.running} onClick={() => select(release)}>
              {t(language, "selectedInstall")}</CompactButton>
            <a href={`https://github.com/${repo}/releases/tag/${encodeURIComponent(release.tag)}`}
              target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </Field>
      </PanelSectionRow>)}
      {!!status?.releases.length && <PanelSectionRow><div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <CompactButton disabled={!!status?.running || status.page <= 1}
          onClick={() => void load(status.page - 1)}>{t(language, "catalogPrev")}</CompactButton>
        <span style={small}>{status.page}</span>
        <CompactButton disabled={!!status?.running || !status.has_more || status.page >= 10}
          onClick={() => void load(status.page + 1)}>{t(language, "catalogNext")}</CompactButton>
      </div></PanelSectionRow>}
    </PanelSection>
  </div>;
}

function Content() {
  const language = useSystemLanguage();
  const [repos, setRepos] = useState<string[]>([]);
  const [importFile, setImportFile] = useState("");
  const [backendVersion, setBackendVersion] = useState("");
  const [updateMode, setMode] = useState<"automatic" | "ask">("automatic");
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [promptBlocked, setPromptBlocked] = useState(() => approvalSession.blocked);
  const [popupAttempt, setPopupAttempt] = useState(0);
  const [restartPending, setRestartPending] = useState(false);
  const [restartError, setRestartError] = useState("");
  const [restartErrorDetail, setRestartErrorDetail] = useState("");
  const [restarting, setRestarting] = useState(false);
  const [openedNotes, setOpenedNotes] = useState("");
  const [installed, setInstalled] = useState<Installed[]>([]);
  const [matches, setMatches] = useState<Record<string, Installed | null>>({});
  const [matchReasons, setMatchReasons] = useState<Record<string, string | null>>({});
  const [mappingRepo, setMappingRepo] = useState("");
  const [mappingIndex, setMappingIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showRepos, setShowRepos] = useState(false);
  const [showInstalled, setShowInstalled] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showGithubSearch, setShowGithubSearch] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [pins, setPins] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<CheckProgress | null>(null);
  const [now, setNow] = useState(Date.now());
  const [errors, setErrors] = useState<string[]>([]);
  const [showAllRows, setShowAllRows] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const lastCompletion = useRef(0);
  const lastAwaiting = useRef(0);
  const sawRunning = useRef(false);
  const pollInFlight = useRef(false);
  const restartRequested = useRef(false);
  const approvalModal = useRef<{ Close: () => void } | null>(null);
  const promptedReleases = useRef(approvalSession.prompted);
  const blockPrompts = () => { approvalSession.blocked = true; saveApprovalSession(); setPromptBlocked(true); };
  const resumePrompts = () => { approvalSession.blocked = false; saveApprovalSession(); setPromptBlocked(false); };
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);
  const showError = (error: unknown) => toaster.toast({ title: t(language, "error"),
    body: backendMessage(language, error instanceof Error ? error.message : String(error)) });

  const refreshRepos = async (silent = false) => {
    try {
      const repoState = await withTimeout(getRepos(), t(language, "timeout"));
      setBackendVersion(repoState.backend_version || "");
      setRepos(repoState.repos);
      setImportFile(repoState.import_file || "");
      setInstalled(repoState.installed || []);
      setMatches(repoState.matches || {});
      setPins(repoState.pinned_versions || {});
      setMatchReasons(repoState.match_reasons || {});
      setMode(repoState.update_mode || "automatic");
      setPendingUpdates(repoState.pending_updates || []);
      setRestartPending(repoState.restart_pending === true);
      setRestartError(repoState.restart_error || "");
      setRestartErrorDetail(repoState.restart_error_detail || "");
    } catch (error) { if (!silent) { setBackendVersion(""); showError(error); } }
  };

  useEffect(() => {
    void refreshRepos();
    let active = true;
    const update = () => {
      if (pollInFlight.current) return;
      pollInFlight.current = true;
      void withTimeout(getCheckStatus(), t(languageRef.current, "timeout")).then(result => {
      if (active) {
        setProgress(result);
        setRestartPending(result.restart_pending === true);
        setRestartError(result.restart_error || "");
        setRestartErrorDetail(result.restart_error_detail || "");
        if (result.running && result.operation === "scan" && !sawRunning.current) {
          promptedReleases.current.clear();
          saveApprovalSession();
          setPendingUpdates([]);
          lastAwaiting.current = 0;
        }
        if (result.running && result.operation === "scan") sawRunning.current = true;
        const awaiting = result.rows.filter(row => row.state === "awaiting").length;
        if (awaiting !== lastAwaiting.current) {
          lastAwaiting.current = awaiting;
          if (awaiting > 0) void refreshRepos(true);
        }
        if (result.completed_at && result.completed_at !== lastCompletion.current) {
          const notify = sawRunning.current;
          lastCompletion.current = result.completed_at;
          sawRunning.current = false;
          if (result.result) {
            const currentLanguage = languageRef.current;
            const finished = t(currentLanguage, "finished", { updated: result.result.updated,
              skipped: result.result.skipped, errors: result.result.errors.length,
              pending: result.result.pending });
            setStatus(result.result.updated ? `${finished} · ${t(currentLanguage, "restartSoon")}` : finished);
            setErrors(result.result.errors.map(error => `${error.repo}: ${backendMessage(currentLanguage, error.error)}`));
            if (notify) toaster.toast({ title: t(currentLanguage, "finishedToast"), body: finished });
          }
          void refreshRepos(true);
        }
      }
    }).catch(() => { /* Backend may restart after an installation. */ }).finally(() => {
      pollInFlight.current = false;
    });
    };
    update();
    const poll = window.setInterval(update, 1000);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false;
      if (approvalModal.current) {
        approvalSession.blocked = true;
        saveApprovalSession();
        approvalModal.current.Close();
        approvalModal.current = null;
      }
      window.clearInterval(poll); window.clearInterval(clock); };
  }, []);

  useEffect(() => {
    if (!restartPending || restartError || pendingUpdates.length || progress?.running || busy
        || restartRequested.current) return;
    restartRequested.current = true;
    const reportFailure = (reason: unknown) => {
      const detail = reason instanceof Error ? reason.message : String(reason);
      setRestarting(false);
      setRestartPending(true);
      setRestartError("restartLaunchFailed");
      setRestartErrorDetail(detail);
      void withTimeout(reportUiRestartFailure(detail), detail, 5000).catch(() => {
        /* Keep the failure visible even if the Decky connection drops. */
      });
    };
    // Decky's restart utility can destroy the current Steam page, so finish
    // the plugin RPC first. Neither a restart nor a service reload runs inside
    // the backend call that the frontend is waiting for.
    void withTimeout(claimUiRestart(), t(languageRef.current, "timeout"), 5000).then(result => {
      if (!result.success) {
        restartRequested.current = false;
        if (result.error) setRestartErrorDetail(result.error);
        return;
      }
      setRestartPending(false);
      setRestarting(true);
      setStatus(t(languageRef.current, "restartSoon"));
      window.setTimeout(() => {
        const backend = (globalThis as typeof globalThis & {
          DeckyBackend?: { callable: (route: string) => () => Promise<void> };
        }).DeckyBackend;
        if (!backend?.callable) {
          reportFailure("DeckyBackend.restart_webhelper ist nicht verfügbar.");
          return;
        }
        // If the page is still alive after eight seconds, the restart did not
        // take effect. A successful restart destroys this timer with the page.
        const watchdog = window.setTimeout(() => reportFailure("Steam-Oberfläche wurde nicht neu gestartet."), 8000);
        try {
          void backend.callable("utilities/restart_webhelper")().catch(error => {
            window.clearTimeout(watchdog);
            reportFailure(error);
          });
        } catch (error) {
          window.clearTimeout(watchdog);
          reportFailure(error);
        }
      }, 400);
    }).catch(error => {
      restartRequested.current = false;
      setRestarting(false);
      setRestartError("restartLaunchFailed");
      setRestartErrorDetail(error instanceof Error ? error.message : String(error));
    });
  }, [restartPending, restartError, pendingUpdates.length, progress?.running, busy]);

  const mutate = async (action: () => Promise<Mutation>) => {
    setBusy(true);
    try {
      const result = await action();
      if (!result.success) throw new Error(backendMessage(language, result.error || t(language, "actionFailed")));
      if (result.repos) setRepos(result.repos);
      await refreshRepos();
      toaster.toast({ title: t(language, result.file ? "importDone" : "saved"),
        body: result.file ? t(language, "importSummary", {
          added: result.added || 0, existing: result.existing || 0, invalid: result.invalid || 0,
        }) : t(language, "updatedList") });
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  };

  const check = async () => {
    setBusy(true);
    setStatus(t(language, "checkingReleases"));
    setErrors([]);
    setShowAllRows(false);
    setShowErrors(false);
    setPendingUpdates([]);
    promptedReleases.current.clear();
    saveApprovalSession();
    resumePrompts();
    lastAwaiting.current = 0;
    try {
      const result = await withTimeout(startCheck(), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "checkFailed"));
      sawRunning.current = true;
      setProgress({ running: true, percent: 0, index: 0, total: repos.length,
        repo: "", phase: "Repository-Liste laden", bytes_done: 0, bytes_total: 0,
        started: Date.now() / 1000, completed_at: 0, rows: [] });
    } catch (error) {
      setStatus(t(language, "checkFailed"));
      setErrors([String(error)]);
      showError(error);
    } finally { setBusy(false); }
  };

  const saveMode = async (mode: "automatic" | "ask") => {
    setBusy(true);
    try {
      const result = await setUpdateMode(mode);
      if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
      setMode(mode);
      toaster.toast({ title: t(language, "modeSaved"), body: t(language, mode === "ask" ? "askDescription" : "autoDescription") });
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  };

  const decide = async (repo: string, install: boolean) => {
    setBusy(true);
    try {
      const result = await (install ? approvePending(repo) : declinePending(repo));
      if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
      setOpenedNotes("");
      await refreshRepos();
      setProgress(await getCheckStatus());
      // Advance the popup queue only after an explicit, successful decision.
      resumePrompts();
      if (result.restart_scheduled) setStatus(t(language, "restartSoon"));
      toaster.toast({ title: t(language, install ? "approvalSaved" : "approvalDeclined"),
        body: result.restart_scheduled ? t(language, "restartSoon") : undefined });
    } catch (error) { blockPrompts(); showError(error); }
    finally { setBusy(false); }
  };

  const retrySteamRestart = async () => {
    setBusy(true);
    try {
      const result = await withTimeout(retryRestart(), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
      setRestartError("");
      setRestartErrorDetail("");
      restartRequested.current = false;
      setStatus(t(language, "restartSoon"));
      await refreshRepos(true);
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (showCatalog || showGithubSearch || selectedRepo || updateMode !== "ask" || !progress || progress.running || busy || promptBlocked
        || approvalSession.blocked || approvalModal.current) return;
    const item = pendingUpdates.find(update => !promptedReleases.current.has(`${update.repo}:${update.tag}`));
    if (!item) return;
    promptedReleases.current.add(`${item.repo}:${item.tag}`);
    saveApprovalSession();
    let handle: { Close: () => void } | null = null;
    let decisionStarted = false;
    const close = () => {
      if (!decisionStarted) blockPrompts();
      if (approvalModal.current === handle) approvalModal.current = null;
      handle?.Close();
    };
    const choose = (install: boolean) => {
      if (decisionStarted) return;
      decisionStarted = true;
      close();
      void decide(item.repo, install);
    };
    try {
      handle = showModal(<ModalRoot onCancel={close} bDisableBackgroundDismiss>
        <div style={{ maxWidth: 500, overflowWrap: "anywhere" }}>
          <strong>{item.name}</strong>
          <div style={{ ...small, marginTop: 5 }}>{item.repo} · {item.installed_version || t(language, "notInstalled")} → {item.version}</div>
          <div style={{ ...small, marginTop: 12 }}>{t(language, "notes")}</div>
          <div style={{ maxHeight: 240, overflowY: "auto", whiteSpace: "pre-wrap", fontSize: 13,
            lineHeight: 1.45, marginTop: 12 }}>{item.changelog || t(language, "noNotes")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <CompactButton onClick={() => choose(true)}>{t(language, "approve")}</CompactButton>
            <CompactButton onClick={() => choose(false)}>{t(language, "decline")}</CompactButton>
          </div>
        </div>
      </ModalRoot>, undefined, { strTitle: t(language, "approvalTitle", { count: pendingUpdates.length }),
        fnOnClose: () => {
          if (approvalModal.current === handle) approvalModal.current = null;
          if (!decisionStarted) blockPrompts();
        } });
      approvalModal.current = handle;
    } catch (error) {
      // The approval cards below still work if Steam's modal API is unavailable.
      blockPrompts();
      showError(error);
    }
  }, [showCatalog, showGithubSearch, selectedRepo, updateMode, pendingUpdates, progress?.running, busy, promptBlocked, popupAttempt, language]);

  const checking = busy || !!progress?.running;
  const elapsed = progress?.running && progress.started ? Math.max(0, Math.floor(now / 1000 - progress.started)) : 0;
  const transferred = progress?.bytes_done ? ` · ${(progress.bytes_done / 1048576).toFixed(1)}${progress.bytes_total
    ? ` / ${(progress.bytes_total / 1048576).toFixed(1)}` : ""} MiB` : "";
  const rows: CheckRow[] = progress?.rows?.length ? progress.rows : repos.map(repo => ({
    repo, name: matches[repo]?.name || repo.split("/")[1] || repo,
    previous: matches[repo]?.version || "", version: "", state: "pending", message: "",
  }));
  const summary = progress?.running
    ? t(language, "phaseStatus", { index: progress.index, total: progress.total,
      phase: phaseName(language, progress.phase), transferred, elapsed })
    : status || (progress?.completed_at
      ? t(language, "lastCheck", { date: new Date(progress.completed_at * 1000).toLocaleString(language) })
      : t(language, "noCheck"));

  if (selectedRepo) return <div style={{ padding: "0 8px" }}>
    <ReleaseBrowser repo={selectedRepo} language={language} onClose={() => setSelectedRepo("")}
      onStarted={() => { setSelectedRepo(""); setShowGithubSearch(false); setShowCatalog(false); }}
      onReposChanged={() => void refreshRepos(true)} />
  </div>;

  if (showGithubSearch) return <div style={{ padding: "0 8px" }}>
    <GithubSearch language={language} onClose={() => setShowGithubSearch(false)}
      onVersions={setSelectedRepo} onReposChanged={() => void refreshRepos(true)} />
  </div>;

  if (showCatalog) return <div style={{ padding: "0 8px" }}>
    <CatalogBrowser language={language} onClose={() => setShowCatalog(false)}
      onVersions={setSelectedRepo} onReposChanged={() => void refreshRepos(true)} />
  </div>;

  return <div>
    {updateMode === "ask" && pendingUpdates.length > 0 && <PanelSection
      title={t(language, "approvalTitle", { count: pendingUpdates.length })}>
      {progress?.running && <PanelSectionRow><div style={small}>{t(language, "waitForScan")}</div></PanelSectionRow>}
      {!progress?.running && <PanelSectionRow><CompactButton disabled={busy} onClick={() => {
        approvalModal.current?.Close();
        approvalModal.current = null;
        promptedReleases.current.clear();
        saveApprovalSession();
        resumePrompts();
        setPopupAttempt(value => value + 1);
      }}>{t(language, "resumeApprovals")}</CompactButton></PanelSectionRow>}
      {pendingUpdates.map(item => <PanelSectionRow key={item.repo}>
        <Field label={item.name} icon={<FaClock color="#ffd577" />}
          description={`${item.repo} · ${item.installed_version || t(language, "notInstalled")} → ${item.version}`}
          padding="compact" childrenLayout="below" bottomSeparator="standard">
          <div style={{ marginTop: 7 }}><CompactButton onClick={() => setOpenedNotes(openedNotes === item.repo ? "" : item.repo)}>
            {openedNotes === item.repo ? t(language, "hideNotes") : t(language, "notes")}
          </CompactButton></div>
          {openedNotes === item.repo && <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere",
            maxHeight: 180, overflowY: "auto", fontSize: 11, lineHeight: 1.5, margin: "9px 0",
            padding: 8, background: "rgba(0, 0, 0, 0.18)", borderRadius: 4 }}>
            {item.changelog || t(language, "noNotes")}
          </div>}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
            <CompactButton disabled={busy || !!progress?.running}
              onClick={() => void decide(item.repo, true)}>{busy ? t(language, "processing") : t(language, "approve")}</CompactButton>
            <CompactButton disabled={busy || !!progress?.running}
              onClick={() => void decide(item.repo, false)}>{t(language, "decline")}</CompactButton>
          </div>
        </Field>
      </PanelSectionRow>)}
    </PanelSection>}

    <PanelSection title={t(language, "updates")}>
      <PanelSectionRow><div style={{ width: "100%", minWidth: 0, padding: "3px 0 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 8, fontSize: 12, marginBottom: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><FaGithub /> {t(language, "appTitle")}</span>
          <span style={{ opacity: 0.7 }}>{t(language, "reposBadge", { count: repos.length })}</span>
        </div>
        <div style={{ height: 6, borderRadius: 6, overflow: "hidden",
          background: "rgba(255, 255, 255, 0.17)" }}
          role="progressbar" aria-label={t(language, "progress")} aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={progress?.running ? progress.percent : progress?.completed_at ? 100 : 0}>
          <div style={{ height: "100%", width: `${progress?.running ? progress.percent : progress?.completed_at ? 100 : 0}%`,
            background: colors.cyan, borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8,
          overflowWrap: "anywhere" }}>{summary}</div>
        {progress?.running && progress.repo && <div style={{ fontSize: 12, overflowWrap: "anywhere",
          marginTop: 5 }}>{progress.repo}</div>}
      </div></PanelSectionRow>
      <PanelSectionRow><CompactButton disabled={checking || restarting || (restartPending && !restartError) || pendingUpdates.length > 0} onClick={() => void check()}>
        <FaDownload /> {checking ? t(language, "checking") : t(language, "check")}
      </CompactButton></PanelSectionRow>
      {rows.slice(0, showAllRows ? rows.length : 4).map(row => <PanelSectionRow key={row.repo}>
        <Field label={row.name} description={<span style={{ color: row.state === "error" ? colors.red : undefined,
          overflowWrap: "anywhere" }}>{rowSubtitle(language, row)}</span>}
          icon={<CheckIcon state={row.state} />} padding="compact" bottomSeparator="standard" />
      </PanelSectionRow>)}
      {rows.length > 4 && <PanelSectionRow><CompactButton onClick={() => setShowAllRows(!showAllRows)}>
        {showAllRows ? t(language, "fewerRows") : t(language, "allRows", { count: rows.length })}
      </CompactButton></PanelSectionRow>}
      {!rows.length && <PanelSectionRow><div style={small}>{t(language, "noRepos")}</div></PanelSectionRow>}
      {restartError && <PanelSectionRow><div style={{ color: colors.red, fontSize: 12 }}>
        {t(language, restartError === "restartSignalFailed" ? "restartSignalFailed" : "restartLaunchFailed")}
        {restartErrorDetail && <div style={{ fontSize: 11, marginTop: 5, overflowWrap: "anywhere" }}>
          {restartErrorDetail}</div>}
        <div style={{ marginTop: 8 }}><CompactButton disabled={busy || !!progress?.running} onClick={() => void retrySteamRestart()}>
          {t(language, "retryRestart")}</CompactButton></div>
      </div></PanelSectionRow>}
      <PanelSectionRow><div style={small}>{updateMode === "automatic"
        ? t(language, "autoRestart") : t(language, "askDescription")}</div></PanelSectionRow>
      {errors.length > 2 && <PanelSectionRow><CompactButton onClick={() => setShowErrors(!showErrors)}>
        {showErrors ? t(language, "hideErrors") : t(language, "allErrors", { count: errors.length })}
      </CompactButton></PanelSectionRow>}
      {(showErrors ? errors : errors.slice(0, 2)).map((error, index) => <PanelSectionRow key={index}>
        <div style={{ fontSize: "0.85em", color: "#ffaaaa", overflowWrap: "anywhere" }}>{error}</div>
      </PanelSectionRow>)}
    </PanelSection>

    <PanelSection>
      <PanelSectionRow><CompactButton disabled={checking || restarting || pendingUpdates.length > 0}
        onClick={() => setShowGithubSearch(true)}><FaSearch /> {t(language, "githubSearchTitle")}</CompactButton></PanelSectionRow>
      <PanelSectionRow><CompactButton disabled={checking || restarting || pendingUpdates.length > 0}
        onClick={() => setShowCatalog(true)}>
        <FaSearch /> {t(language, "browsePlugins")}
      </CompactButton></PanelSectionRow>
    </PanelSection>

    <PanelSection title={t(language, "installedPlugins", { count: installed.length })}>
      <PanelSectionRow><CompactButton onClick={() => setShowInstalled(value => !value)}>
        <FaChevronDown /> {showInstalled ? t(language, "closeList") : t(language, "showList")}
      </CompactButton></PanelSectionRow>
      {showInstalled && installed.map(plugin => {
        const repo = Object.keys(matches).find(item => matches[item]?.folder === plugin.folder) || plugin.repo || "";
        return <PanelSectionRow key={plugin.folder}><Field label={plugin.name}
          description={`v${plugin.version} · ${repo || t(language, "unknownRepository")}`}
          padding="compact" bottomSeparator="standard" childrenLayout="below" icon={<FaGithub />}>
          <div style={{ marginTop: 7 }}><CompactButton disabled={checking || busy || pendingUpdates.length > 0}
            onClick={() => repo ? setSelectedRepo(repo) : setShowGithubSearch(true)}>
            {repo ? t(language, "otherVersions") : t(language, "githubSearchTitle")}
          </CompactButton></div>
        </Field></PanelSectionRow>;
      })}
    </PanelSection>

    <PanelSection title={t(language, "repositories", { count: repos.length })}>
      {importFile && <PanelSectionRow><Field label={t(language, "importTitle")}
        description={t(language, "importDescription", { file: importFile })}
        padding="compact" icon={<FaDownload />} childrenLayout="below">
        <div style={{ marginTop: 6 }}><CompactButton disabled={checking || busy || pendingUpdates.length > 0}
          onClick={() => void mutate(() => withTimeout(importReposFile(), t(language, "timeout"), 10000))}>
          {t(language, "importButton")}
        </CompactButton></div>
      </Field></PanelSectionRow>}
      {repos.length > 0 && <PanelSectionRow><div style={{ ...spaced, flexWrap: "wrap" }}>
        <CompactButton onClick={() => setShowRepos(!showRepos)}>
          <FaChevronDown /> {showRepos ? t(language, "closeList") : t(language, "showList")}
        </CompactButton>
      </div></PanelSectionRow>}
      {showRepos && <PanelSectionRow><CompactButton onClick={() => void refreshRepos()}>
        {t(language, "refreshInstalled")}
      </CompactButton></PanelSectionRow>}
      {showRepos && repos.map(repo => <PanelSectionRow key={repo}>
        <Field label={repo} icon={<FaGithub />} padding="compact" bottomSeparator="standard"
          childrenLayout="below" description={matches[repo] ? t(language, "installedVersion", {
            name: matches[repo]?.name || "", version: matches[repo]?.version || "",
          }) : matchReasons[repo] ? backendMessage(language, matchReasons[repo] || "") : t(language, "missing")}>
          {pins[repo] && <div style={{ ...small, marginBottom: 6 }}>
            {t(language, "pinnedVersion", { version: pins[repo] })}</div>}
          <div style={{ ...spaced, flexWrap: "wrap" }}>
            <CompactButton disabled={checking || busy || pendingUpdates.length > 0}
              onClick={() => setSelectedRepo(repo)}>{t(language, "otherVersions")}</CompactButton>
            {pins[repo] && <CompactButton disabled={checking || busy || pendingUpdates.length > 0}
              onClick={() => void mutate(() => clearVersionPin(repo))}>{t(language, "followLatest")}</CompactButton>}
            <CompactButton disabled={!installed.length} onClick={() => {
              setMappingRepo(mappingRepo === repo ? "" : repo);
              setMappingIndex(Math.max(0, installed.findIndex(p => p.folder === matches[repo]?.folder)));
            }}>{t(language, "assign")}</CompactButton>
            <CompactButton disabled={checking || busy || pendingUpdates.length > 0}
              onClick={() => void mutate(async () => {
                const result = await setCatalogRepo(repo, false);
                if (result.success && mappingRepo === repo) setMappingRepo("");
                return result;
              })}>{t(language, "catalogRemove")}</CompactButton>
          </div>
        </Field>
      </PanelSectionRow>)}
      {showRepos && mappingRepo && installed.length > 0 && <>
        <PanelSectionRow><div style={small}>{t(language, "pluginFor", { repo: mappingRepo })}</div></PanelSectionRow>
        <PanelSectionRow><div style={{ display: "flex", flexWrap: "wrap", gap: 6,
          maxHeight: 170, overflowY: "auto" }}>
          {installed.map((plugin, index) => <FilterButton key={plugin.folder}
            selected={mappingIndex === index} onClick={() => setMappingIndex(index)}>
            {plugin.name} ({plugin.version})
          </FilterButton>)}
        </div></PanelSectionRow>
        <PanelSectionRow><CompactButton disabled={busy} onClick={() => void mutate(async () => {
          const result = await setMapping(mappingRepo, installed[mappingIndex].folder);
          if (result.success) setMappingRepo("");
          return result;
        })}>{t(language, "saveAssignment")}</CompactButton></PanelSectionRow>
      </>}
    </PanelSection>

    <PanelSection title={t(language, "settings")}>
      <PanelSectionRow><Field label={t(language, "storageLabel")}
        description={`${t(language, "storageInfo")} · ${backendVersion
          ? `Backend v${backendVersion}` : t(language, "disconnected")}`}
        icon={<FaGithub />} padding="compact" /></PanelSectionRow>
      <PanelSectionRow><ToggleField label={t(language, "modeTitle")}
        description={t(language, updateMode === "automatic" ? "autoDescription" : "askDescription")}
        checked={updateMode === "automatic"} disabled={checking || busy || pendingUpdates.length > 0}
        onChange={checked => void saveMode(checked ? "automatic" : "ask")} /></PanelSectionRow>
      <PanelSectionRow><div style={small}>{t(language, "selfUpdateInfo")}</div></PanelSectionRow>
      <PanelSectionRow><Field label={t(language, "languageLabel")}
        description={`${t(language, "languageAuto")} · ${t(language, "languageName")}`}
        icon={<FaGlobe />} padding="compact" /></PanelSectionRow>
    </PanelSection>
  </div>;
}
export default definePlugin(() => ({
  name: "Github Plugin Updater",
  titleView: <LocalizedTitle />,
  content: <Content />,
  icon: <FaGithub />,
}));
