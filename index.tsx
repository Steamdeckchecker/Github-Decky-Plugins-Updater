import { DialogButton, Dropdown, ModalRoot, PanelSection, PanelSectionRow, TextField, showModal } from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FaGithub, FaDownload, FaFileUpload, FaChevronDown, FaCheckCircle,
  FaClock, FaExclamationTriangle, FaCircleNotch, FaMinusCircle, FaSearch } from "react-icons/fa";
import { systemLanguage, t, type Language, type MessageKey } from "./i18n";

type Installed = { folder: string; name: string; version: string };
type Repos = { backend_version?: string; repos: string[]; installed: Installed[]; matches: Record<string, Installed | null>;
  match_reasons: Record<string, string | null>; update_mode: "automatic" | "ask";
  pending_updates: PendingUpdate[]; restart_pending?: boolean; restart_error?: string;
  restart_error_detail?: string };
type PendingUpdate = { repo: string; name: string; installed_version: string; version: string;
  tag: string; changelog: string };
type Mutation = { success: boolean; repos?: string[]; error?: string; added?: number; invalid?: number;
  file?: string; changed?: boolean; restart_scheduled?: boolean; remaining?: number };
type CatalogPlugin = { repo: string; name: string; author: string; description: string;
  tags: string[]; stars: number; downloads: number; latest_tag: string; released_at: string };
type CatalogStatus = { running: boolean; plugins: CatalogPlugin[]; tracked: string[];
  error: string; fetched_at: number };
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
const getCheckStatus = callable<[], CheckProgress>("get_check_status");
const importDefault = callable<[], Mutation>("import_default_repos_file");
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

function CheckIcon({ state }: { state: CheckRow["state"] }) {
  if (state === "updated" || state === "current") return <FaCheckCircle color={colors.green} size={17} />;
  if (state === "error") return <FaExclamationTriangle color={colors.red} size={16} />;
  if (state === "skipped") return <FaMinusCircle color={colors.muted} size={17} />;
  if (state === "awaiting") return <FaClock color="#ffd577" size={17} />;
  if (state === "pending") return <FaClock color={colors.muted} size={16} />;
  return <FaCircleNotch color={colors.cyan} size={17} />;
}

function backendMessage(lang: Language, message: string): string {
  if (message.startsWith("repos.txt fehlt. Geprüft:"))
    return message.replace("repos.txt fehlt. Geprüft:", t(lang, "missingFile"));
  const reason: Record<string, MessageKey> = {
    "Mehrere passende Installationen; bitte zuordnen.": "ambiguous",
    "Updater-Installation nicht eindeutig gefunden.": "selfMissing",
    "Keine Release-ZIP unter den letzten 20 Releases.": "noRelease",
    "Installierte Version fehlt oder ist nicht vergleichbar.": "invalidVersion",
    "Release-Version nicht erkennbar; kein Download.": "unknownVersion",
    "Dieses Release wurde abgelehnt.": "declinedRow",
    "Repository aus der Liste entfernt.": "removedRow",
    "GitHub-Repository nicht gefunden oder nicht öffentlich.": "repoNotFound",
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
  const names: Record<string, MessageKey> = { "repos.txt einlesen": "phaseFile", "Release prüfen": "phaseRelease",
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

function CatalogBrowser({ language, onClose, onReposChanged }: {
  language: Language; onClose: () => void; onReposChanged: () => void;
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

  return <div style={{ width: "100%", minWidth: 0,
    boxSizing: "border-box", padding: "0 3px 8px", color: "#edf5ff", overflowWrap: "anywhere" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <strong style={{ fontSize: 17 }}>{t(language, "catalogTitle")}</strong>
      <CompactButton onClick={onClose}>{t(language, "catalogBack")}</CompactButton>
    </div>
    <div style={{ ...small, margin: "8px 0" }}>{t(language, "catalogIntro")}</div>
    <div onKeyDownCapture={event => {
      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
        event.preventDefault(); event.stopPropagation();
      }
    }} onKeyUpCapture={event => {
      if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); }
    }}>
      <TextField label={t(language, "catalogSearch")} value={search} onChange={event => {
        setSearch(event.target.value); setPage(0);
      }} />
    </div>
    <div style={{ ...small, margin: "12px 0 5px" }}>{t(language, "catalogSort")}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {([ ["stars", "catalogStars"], ["downloads", "catalogDownloads"],
        ["recent", "catalogRecent"], ["name", "catalogName"] ] as const).map(([choice, label]) =>
        <FilterButton key={choice} selected={sort === choice} onClick={() => {
          setSort(choice); setPage(0);
        }}>{t(language, label)}</FilterButton>)}
    </div>
    <div style={{ marginTop: 10 }}>
      <CompactButton onClick={() => setShowTags(value => !value)}>
        {t(language, "catalogTags")}: {tag || t(language, "catalogAllTags")} {showTags ? "▴" : "▾"}
      </CompactButton>
    </div>
    {showTags && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 185,
      overflowY: "auto", padding: "7px 2px" }}>
      <FilterButton selected={!tag} onClick={() => {
        setTag(""); setPage(0); setShowTags(false);
      }}>{t(language, "catalogAllTags")}</FilterButton>
      {topTags.map(([item, count]) => <FilterButton key={item} selected={tag === item} onClick={() => {
        setTag(item); setPage(0); setShowTags(false);
      }}>{item} ({count})</FilterButton>)}
    </div>}
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
      <span style={small}>{t(language, "catalogResults", { count: filtered.length, total: plugins.length })}</span>
      <CompactButton disabled={loading} onClick={() => void loadCatalog(true)}>{t(language, "catalogRefresh")}</CompactButton>
    </div>
    {loading && <div style={{ ...small, padding: 8 }}><FaCircleNotch /> {t(language, "catalogLoading")}</div>}
    {error && <div style={{ color: colors.red, fontSize: 12, margin: "8px 0" }}>
      {t(language, "catalogFailed")}: {error}
      <div style={{ marginTop: 8 }}><CompactButton onClick={() => void loadCatalog(true)}>{t(language, "catalogRetry")}</CompactButton></div>
    </div>}
    {!loading && !error && !filtered.length && <div style={{ ...small, padding: 8 }}>{t(language, "catalogEmpty")}</div>}
    {filtered.slice(shownPage * 12, (shownPage + 1) * 12).map(plugin => {
      const follows = trackedSet.has(plugin.repo.toLowerCase());
      return <div key={plugin.repo} style={{ padding: "10px 11px", background: "#202e42",
        borderRadius: 9, marginTop: 7, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
          <strong style={{ fontSize: 13 }}>{plugin.name}</strong>
          <span style={{ ...small, whiteSpace: "nowrap" }}>★ {plugin.stars}{plugin.downloads > 0
            ? ` · ↓ ${plugin.downloads.toLocaleString(language)}` : ""}</span>
        </div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{plugin.repo} · {plugin.author}</div>
        {plugin.description && <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.35 }}>
          {plugin.description}</div>}
        {plugin.tags.length > 0 && <div style={{ ...small, marginTop: 5 }}>{plugin.tags.slice(0, 4).join(" · ")}</div>}
        <div style={{ ...small, marginTop: 5 }}>{plugin.latest_tag
          ? t(language, "catalogRelease", { version: plugin.latest_tag }) : t(language, "catalogNoRelease")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 8 }}>
          <CompactButton disabled={!!changing || loading} onClick={() => void toggleRepo(plugin.repo, !follows)}>
            {changing === plugin.repo ? t(language, "processing") : t(language, follows ? "catalogRemove" : "catalogAdd")}
          </CompactButton>
          <a style={{ fontSize: 12, color: colors.cyan }} href={`https://github.com/${plugin.repo}`}
            target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </div>;
    })}
    {pageCount > 1 && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
      <CompactButton disabled={shownPage === 0} onClick={() => setPage(shownPage - 1)}>
        {t(language, "catalogPrev")}</CompactButton>
      <span style={small}>{t(language, "catalogPage", { page: shownPage + 1, pages: pageCount })}</span>
      <CompactButton disabled={shownPage + 1 >= pageCount} onClick={() => setPage(shownPage + 1)}>
        {t(language, "catalogNext")}</CompactButton>
    </div>}
    <div style={{ ...small, marginTop: 12 }}>{t(language, "catalogNote")}</div>
    <a style={{ fontSize: 11, color: colors.cyan }} href="https://safetzahirovic.github.io/decky-plugins-explorer/"
      target="_blank" rel="noopener noreferrer">{t(language, "catalogSource")}</a>
  </div>;
}

function Content() {
  const [language, setLanguage] = useState<Language>("en");
  const [repos, setRepos] = useState<string[]>([]);
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
  const [fileMessage, setFileMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showRepos, setShowRepos] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
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
      setInstalled(repoState.installed || []);
      setMatches(repoState.matches || {});
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
    const readLanguage = () => {
      if (typeof SteamClient !== "undefined" && SteamClient.Settings?.GetCurrentLanguage) {
        void SteamClient.Settings.GetCurrentLanguage().then(value => {
          if (active) setLanguage(systemLanguage(value));
        }).catch(() => { if (active) setLanguage(systemLanguage(navigator.language || "en")); });
      } else setLanguage(systemLanguage(navigator.language || "en"));
    };
    readLanguage();
    const localeListener = typeof SteamClient !== "undefined" && SteamClient.Settings?.RegisterForSettingsChanges
      ? SteamClient.Settings.RegisterForSettingsChanges(readLanguage) : null;
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
      localeListener?.unregister(); window.clearInterval(poll); window.clearInterval(clock); };
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
      if (!result.success) throw new Error(result.error || t(language, "actionFailed"));
      if (result.repos) setRepos(result.repos);
      await refreshRepos();
      toaster.toast({ title: t(language, "saved"), body: result.added === undefined
        ? t(language, "updatedList")
        : t(language, "added", { count: result.added, invalid: result.invalid || 0 }) });
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  };

  const importKnownFile = async () => {
    setBusy(true);
    setFileMessage(t(language, "searchingFile"));
    try {
      const result = await withTimeout(importDefault(), t(language, "timeout"));
      if (!result.success) throw new Error(result.error || t(language, "fileReadError"));
      setFileMessage(t(language, "fileResult", { count: result.repos?.length || 0,
        file: result.file || "repos.txt", invalid: result.invalid || 0 }));
      await refreshRepos();
      toaster.toast({ title: t(language, "importDone"), body: t(language, "imported", { count: result.added || 0 }) });
    } catch (error) { setFileMessage(backendMessage(language, error instanceof Error ? error.message : String(error))); showError(error); }
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
        repo: "", phase: "repos.txt einlesen", bytes_done: 0, bytes_total: 0,
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
    if (showCatalog || updateMode !== "ask" || !progress || progress.running || busy || promptBlocked
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
  }, [showCatalog, updateMode, pendingUpdates, progress?.running, busy, promptBlocked, popupAttempt, language]);

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

  if (showCatalog) return <div style={{ padding: "0 8px" }}>
    <CatalogBrowser language={language} onClose={() => setShowCatalog(false)}
      onReposChanged={() => void refreshRepos(true)} />
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
        <div style={{ background: "#213149", borderRadius: 9, padding: 10, width: "100%", minWidth: 0,
          boxSizing: "border-box", color: "#edf5ff" }}>
          <strong style={{ fontSize: 13, overflowWrap: "anywhere" }}>{item.name}</strong>
          <div style={{ fontSize: 11, color: colors.muted, overflowWrap: "anywhere", marginTop: 3 }}>
            {item.repo} · {item.installed_version || t(language, "notInstalled")} → {item.version}
          </div>
          <div style={{ marginTop: 8 }}><CompactButton onClick={() => setOpenedNotes(openedNotes === item.repo ? "" : item.repo)}>
            {openedNotes === item.repo ? t(language, "hideNotes") : t(language, "notes")}
          </CompactButton></div>
          {openedNotes === item.repo && <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere",
            maxHeight: 180, overflowY: "auto", fontSize: 11, lineHeight: 1.5, margin: "9px 0",
            padding: 8, background: "#111b2b", borderRadius: 7 }}>
            {item.changelog || t(language, "noNotes")}
          </div>}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
            <CompactButton disabled={busy || !!progress?.running}
              onClick={() => void decide(item.repo, true)}>{busy ? t(language, "processing") : t(language, "approve")}</CompactButton>
            <CompactButton disabled={busy || !!progress?.running}
              onClick={() => void decide(item.repo, false)}>{t(language, "decline")}</CompactButton>
          </div>
        </div>
      </PanelSectionRow>)}
    </PanelSection>}

    <PanelSection title={t(language, "updates")}>
      <PanelSectionRow><div style={{ width: "100%", minWidth: 0, boxSizing: "border-box",
        padding: 12, borderRadius: 12, color: "#edf5ff",
        background: "linear-gradient(145deg, #142338, #101827)", border: "1px solid #304761" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
            background: "#243950", color: colors.cyan, flexShrink: 0 }}><FaGithub size={18} /></div>
          <strong style={{ fontSize: 15, flex: 1, minWidth: 0 }}>GitHub Updates</strong>
          <span style={{ color: colors.muted, fontSize: 11, whiteSpace: "nowrap" }}>
            {t(language, "reposBadge", { count: repos.length })}</span>
        </div>
        <div style={{ height: 7, borderRadius: 7, overflow: "hidden", background: "#2b3e56" }}
          role="progressbar" aria-label={t(language, "progress")} aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={progress?.running ? progress.percent : progress?.completed_at ? 100 : 0}>
          <div style={{ height: "100%", width: `${progress?.running ? progress.percent : progress?.completed_at ? 100 : 0}%`,
            background: `linear-gradient(90deg, #33c5e9, ${colors.cyan})`, borderRadius: 7 }} />
        </div>
        <div style={{ color: colors.muted, fontSize: 11, marginTop: 7, marginBottom: 11,
          overflowWrap: "anywhere" }}>{summary}</div>
        {progress?.running && progress.repo && <div style={{ color: colors.cyan, fontSize: 11,
          overflowWrap: "anywhere", marginBottom: 8 }}>{progress.repo}</div>}
        {rows.slice(0, showAllRows ? rows.length : 4).map(row => <div key={row.repo}
          title={row.repo} style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0,
            padding: "9px 8px", marginTop: 5, borderRadius: 8, background: "#202e42" }}>
          <span style={{ width: 20, flexShrink: 0, color: colors.cyan }}><FaDownload size={13} /></span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflowWrap: "anywhere" }}>{row.name}</div>
            <div style={{ fontSize: 11, color: row.state === "error" ? colors.red : colors.muted,
              overflowWrap: "anywhere", lineHeight: 1.35 }}>{rowSubtitle(language, row)}</div>
          </div>
          <span style={{ flexShrink: 0 }}><CheckIcon state={row.state} /></span>
        </div>)}
        {rows.length > 4 && <div style={{ marginTop: 9 }}><CompactButton onClick={() => setShowAllRows(!showAllRows)}>
          {showAllRows ? t(language, "fewerRows") : t(language, "allRows", { count: rows.length })}
        </CompactButton></div>}
        {!rows.length && <div style={{ fontSize: 12, color: colors.muted }}>
          {t(language, "noRepos")}
        </div>}
      </div></PanelSectionRow>
      <PanelSectionRow><CompactButton disabled={checking || restarting || (restartPending && !restartError) || pendingUpdates.length > 0} onClick={() => void check()}>
        <FaDownload /> {checking ? t(language, "checking") : t(language, "check")}
      </CompactButton></PanelSectionRow>
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

    <PanelSection title={t(language, "settings")}>
      <PanelSectionRow><div style={small}>{t(language, "modeTitle")}</div></PanelSectionRow>
      <PanelSectionRow><Dropdown rgOptions={[
        { label: t(language, "automatic"), data: "automatic" },
        { label: t(language, "ask"), data: "ask" },
      ]} selectedOption={updateMode} disabled={checking || pendingUpdates.length > 0}
        onChange={item => void saveMode(item.data as "automatic" | "ask")} /></PanelSectionRow>
      <PanelSectionRow><div style={small}>{t(language, updateMode === "ask" ? "askDescription" : "autoDescription")}</div></PanelSectionRow>
    </PanelSection>

    <PanelSection>
      <PanelSectionRow><CompactButton disabled={checking || restarting || pendingUpdates.length > 0}
        onClick={() => setShowCatalog(true)}>
        <FaSearch /> {t(language, "browsePlugins")}
      </CompactButton></PanelSectionRow>
    </PanelSection>

    <PanelSection title={t(language, "repositories", { count: repos.length })}>
      {repos.length > 0 && <PanelSectionRow><div style={{ ...spaced, flexWrap: "wrap" }}>
        <CompactButton onClick={() => setShowRepos(!showRepos)}>
          <FaChevronDown /> {showRepos ? t(language, "closeList") : t(language, "showList")}
        </CompactButton>
      </div></PanelSectionRow>}
      {showRepos && <PanelSectionRow><CompactButton onClick={() => void refreshRepos()}>
        {t(language, "refreshInstalled")}
      </CompactButton></PanelSectionRow>}
      {showRepos && repos.map(repo => <PanelSectionRow key={repo}>
        <div>
          <div style={{ ...spaced }}><span style={{ fontSize: "0.86em", overflowWrap: "anywhere" }}><FaGithub /> {repo}</span></div>
          <div style={small}>{matches[repo] ? t(language, "installedVersion", { name: matches[repo]?.name || "",
            version: matches[repo]?.version || "" })
            : matchReasons[repo] ? backendMessage(language, matchReasons[repo] || "") : t(language, "missing")}</div>
          <CompactButton disabled={!installed.length} onClick={() => {
            setMappingRepo(mappingRepo === repo ? "" : repo);
            setMappingIndex(Math.max(0, installed.findIndex(p => p.folder === matches[repo]?.folder)));
          }}>{t(language, "assign")}</CompactButton>
        </div>
      </PanelSectionRow>)}
      {showRepos && mappingRepo && installed.length > 0 && <>
        <PanelSectionRow><div style={small}>{t(language, "pluginFor", { repo: mappingRepo })}</div></PanelSectionRow>
        <PanelSectionRow><Dropdown
          rgOptions={installed.map((plugin, index) => ({ label: `${plugin.name} (${plugin.version})`, data: index }))}
          selectedOption={mappingIndex} onChange={item => setMappingIndex(Number(item.data))}
        /></PanelSectionRow>
        <PanelSectionRow><CompactButton disabled={busy} onClick={() => void mutate(async () => {
          const result = await setMapping(mappingRepo, installed[mappingIndex].folder);
          if (result.success) setMappingRepo("");
          return result;
        })}>{t(language, "saveAssignment")}</CompactButton></PanelSectionRow>
      </>}
    </PanelSection>

    <PanelSection title={t(language, "import")}>
      <PanelSectionRow><div style={small}>{backendVersion ? `Backend v${backendVersion}` : t(language, "disconnected")}</div></PanelSectionRow>
      <PanelSectionRow><CompactButton onClick={() => setShowImport(!showImport)}>
        <FaFileUpload /> {showImport ? t(language, "close") : t(language, "openFile")}
      </CompactButton></PanelSectionRow>
      {showImport && <>
        <PanelSectionRow><div style={{ ...small, overflowWrap: "anywhere" }}>{fileMessage || t(language, "importInfo")}</div></PanelSectionRow>
        <PanelSectionRow><CompactButton disabled={busy}
          onClick={() => void importKnownFile()}>{t(language, "reloadFile")}</CompactButton></PanelSectionRow>
      </>}
    </PanelSection>
  </div>;
}
export default definePlugin(() => ({
  name: "Github Plugin Updater",
  titleView: <div style={{ fontSize: 19, lineHeight: "24px", fontWeight: 600 }}>GitHub Updates</div>,
  content: <Content />,
  icon: <FaGithub />,
}));
