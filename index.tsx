import { DialogButton, Dropdown, PanelSection, PanelSectionRow } from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { useEffect, useState, type ReactNode } from "react";
import { FaGithub, FaDownload, FaFileUpload, FaChevronDown } from "react-icons/fa";

type Installed = { folder: string; name: string; version: string };
type Repos = { backend_version?: string; repos: string[]; installed: Installed[]; matches: Record<string, Installed | null>;
  match_reasons: Record<string, string | null> };
type Mutation = { success: boolean; repos?: string[]; error?: string; added?: number; invalid?: number; file?: string };
type Check = {
  success: boolean;
  updated: { repo: string; version: string; file: string; folder: string }[];
  errors: { repo: string; error: string }[];
  skipped: { repo: string; reason: string }[];
};
type CheckProgress = { running: boolean; percent: number; index: number; total: number;
  repo: string; phase: string; bytes_done: number; bytes_total: number; started?: number };
const getRepos = callable<[], Repos>("get_repos");
const getCheckStatus = callable<[], CheckProgress>("get_check_status");
const importDefault = callable<[], Mutation>("import_default_repos_file");
const checkUpdates = callable<[], Check>("check_updates");
const setMapping = callable<[repo: string, folder: string], Mutation>("set_plugin_mapping");

function withTimeout<T>(request: Promise<T>, milliseconds = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Keine Antwort vom Decky-Backend nach 12 Sekunden.")), milliseconds);
    request.then(value => { window.clearTimeout(timer); resolve(value); }, error => {
      window.clearTimeout(timer); reject(error);
    });
  });
}

const small = { fontSize: "0.85em", opacity: 0.8 } as const;
const spaced = { display: "flex", alignItems: "center", gap: 8 } as const;

function CompactButton({ children, onClick, disabled = false }: {
  children: ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return <DialogButton disabled={disabled} onClick={onClick} style={{
    width: "auto", minWidth: 0, minHeight: 30, height: "auto", flexShrink: 0,
    padding: "5px 10px", fontSize: 13, lineHeight: "18px", whiteSpace: "normal",
  }}>{children}</DialogButton>;
}

function Content() {
  const [repos, setRepos] = useState<string[]>([]);
  const [backendVersion, setBackendVersion] = useState("Keine Backend-Verbindung");
  const [installed, setInstalled] = useState<Installed[]>([]);
  const [matches, setMatches] = useState<Record<string, Installed | null>>({});
  const [matchReasons, setMatchReasons] = useState<Record<string, string | null>>({});
  const [mappingRepo, setMappingRepo] = useState("");
  const [mappingIndex, setMappingIndex] = useState(0);
  const [fileMessage, setFileMessage] = useState("Die repos.txt wird beim Start und vor jeder Update-Prüfung eingelesen.");
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showRepos, setShowRepos] = useState(false);
  const [status, setStatus] = useState("Noch keine Prüfung durchgeführt.");
  const [progress, setProgress] = useState<CheckProgress | null>(null);
  const [now, setNow] = useState(Date.now());
  const [errors, setErrors] = useState<string[]>([]);
  const [details, setDetails] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const showError = (error: unknown) => toaster.toast({ title: "Fehler", body: String(error) });

  const refreshRepos = async () => {
    try {
      const repoState = await withTimeout(getRepos());
      setBackendVersion(repoState.backend_version ? `Backend v${repoState.backend_version}` : "Backend-Version unbekannt");
      setRepos(repoState.repos);
      setInstalled(repoState.installed || []);
      setMatches(repoState.matches || {});
      setMatchReasons(repoState.match_reasons || {});
    } catch (error) { setBackendVersion("Keine Backend-Verbindung"); showError(error); }
  };

  useEffect(() => {
    void refreshRepos();
    let active = true;
    const update = () => { void getCheckStatus().then(result => {
      if (active) setProgress(result);
    }).catch(() => { /* Backend may restart after an installation. */ }); };
    update();
    const poll = window.setInterval(update, 1000);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; window.clearInterval(poll); window.clearInterval(clock); };
  }, []);

  const mutate = async (action: () => Promise<Mutation>) => {
    setBusy(true);
    try {
      const result = await action();
      if (!result.success) throw new Error(result.error || "Aktion fehlgeschlagen");
      if (result.repos) setRepos(result.repos);
      await refreshRepos();
      toaster.toast({ title: "Gespeichert", body: result.added === undefined
        ? "Repository-Liste aktualisiert."
        : `${result.added} hinzugefügt, ${result.invalid || 0} ungültige Zeilen.` });
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  };

  const importKnownFile = async () => {
    setBusy(true);
    setFileMessage("Suche repos.txt in den Downloads-Ordnern …");
    try {
      const result = await withTimeout(importDefault());
      if (!result.success) throw new Error(result.error || "Textdatei konnte nicht gelesen werden.");
      setFileMessage(`${result.repos?.length || 0} Repositories aus ${result.file || "repos.txt"} übernommen · ${result.invalid || 0} ungültige Zeilen.`);
      await refreshRepos();
      toaster.toast({ title: "Import abgeschlossen", body: `${result.added || 0} Repositories hinzugefügt.` });
    } catch (error) { setFileMessage(String(error)); showError(error); }
    finally { setBusy(false); }
  };

  const check = async () => {
    setBusy(true);
    setStatus("GitHub-Releases werden geprüft …");
    setErrors([]);
    setDetails([]);
    setShowErrors(false);
    try {
      const result = await checkUpdates();
      setProgress(await getCheckStatus());
      await refreshRepos();
      const done = `${result.updated.length} Plugin(s) installiert · ${result.skipped.length} übersprungen · ${result.errors.length} Fehler`;
      setStatus(done);
      setErrors(result.errors.map(error => `${error.repo}: ${error.error}`));
      setDetails([
        ...result.updated.map(item => `${item.repo}: ${item.version} installiert in ${item.folder}`),
        ...result.skipped.map(item => `${item.repo}: ${item.reason}`),
      ]);
      toaster.toast({ title: "Prüfung abgeschlossen", body: done });
      if (result.updated.length) setStatus(`${done} · Steam-Oberfläche startet gleich neu`);
    } catch (error) {
      setStatus("Prüfung fehlgeschlagen.");
      setErrors([String(error)]);
      showError(error);
    } finally { setBusy(false); }
  };

  const checking = busy || !!progress?.running;
  const elapsed = progress?.running && progress.started ? Math.max(0, Math.floor(now / 1000 - progress.started)) : 0;
  const transferred = progress?.bytes_done ? ` · ${(progress.bytes_done / 1048576).toFixed(1)}${progress.bytes_total
    ? ` / ${(progress.bytes_total / 1048576).toFixed(1)}` : ""} MiB` : "";

  return <div>
    <PanelSection title="Updates">
      <PanelSectionRow><CompactButton disabled={busy} onClick={() => void check()}>
        <FaDownload /> {busy ? "Prüfe …" : "Updates prüfen"}
      </CompactButton></PanelSectionRow>
      <PanelSectionRow><div style={small}>{status}</div></PanelSectionRow>
      {checking && <PanelSectionRow><div style={{ width: "100%", fontSize: "0.84em" }}>
        <progress max={100} value={progress?.running ? progress.percent : 0}
          style={{ width: "100%", height: 10 }} />
        <div style={{ overflowWrap: "anywhere" }}>{progress?.running
          ? `${progress.index}/${progress.total} · ${progress.repo || "repos.txt"} · ${progress.phase}${transferred} · ${elapsed}s`
          : "Prüfung wird gestartet …"}</div>
      </div></PanelSectionRow>}
      <PanelSectionRow><div style={small}>Neue Versionen werden installiert. Danach wird die Steam-Oberfläche neu geladen.</div></PanelSectionRow>
      {details.length > 0 && <PanelSectionRow><CompactButton
        onClick={() => setShowDetails(!showDetails)}>{showDetails ? "Ergebnisse schließen" : "Ergebnisse anzeigen"}</CompactButton></PanelSectionRow>}
      {showDetails && details.map((detail, index) => <PanelSectionRow key={index}><div style={small}>{detail}</div></PanelSectionRow>)}
      {errors.length > 2 && <PanelSectionRow><CompactButton onClick={() => setShowErrors(!showErrors)}>
        {showErrors ? "Fehler einklappen" : `Alle ${errors.length} Fehler anzeigen`}
      </CompactButton></PanelSectionRow>}
      {(showErrors ? errors : errors.slice(0, 2)).map((error, index) => <PanelSectionRow key={index}>
        <div style={{ fontSize: "0.85em", color: "#ffaaaa", overflowWrap: "anywhere" }}>{error}</div>
      </PanelSectionRow>)}
    </PanelSection>

    <PanelSection title={`Repositories aus repos.txt (${repos.length})`}>
      <PanelSectionRow><div style={{ ...spaced, flexWrap: "wrap" }}>
        {repos.length > 0 && <CompactButton onClick={() => setShowRepos(!showRepos)}>
          <FaChevronDown /> {showRepos ? "Liste schließen" : "Liste anzeigen"}
        </CompactButton>}
      </div></PanelSectionRow>
      {showRepos && <PanelSectionRow><CompactButton onClick={() => void refreshRepos()}>
        Installationen aktualisieren
      </CompactButton></PanelSectionRow>}
      {showRepos && repos.map(repo => <PanelSectionRow key={repo}>
        <div>
          <div style={{ ...spaced }}><span style={{ fontSize: "0.86em", overflowWrap: "anywhere" }}><FaGithub /> {repo}</span></div>
          <div style={small}>{matches[repo] ? `${matches[repo]?.name} · installiert: ${matches[repo]?.version}`
            : matchReasons[repo] || "Nicht installiert · neueste Version wird installiert"}</div>
          <CompactButton disabled={!installed.length} onClick={() => {
            setMappingRepo(mappingRepo === repo ? "" : repo);
            setMappingIndex(Math.max(0, installed.findIndex(p => p.folder === matches[repo]?.folder)));
          }}>Zuordnen</CompactButton>
        </div>
      </PanelSectionRow>)}
      {showRepos && mappingRepo && installed.length > 0 && <>
        <PanelSectionRow><div style={small}>Installiertes Plugin für {mappingRepo}</div></PanelSectionRow>
        <PanelSectionRow><Dropdown
          rgOptions={installed.map((plugin, index) => ({ label: `${plugin.name} (${plugin.version})`, data: index }))}
          selectedOption={mappingIndex} onChange={item => setMappingIndex(Number(item.data))}
        /></PanelSectionRow>
        <PanelSectionRow><CompactButton disabled={busy} onClick={() => void mutate(async () => {
          const result = await setMapping(mappingRepo, installed[mappingIndex].folder);
          if (result.success) setMappingRepo("");
          return result;
        })}>Zuordnung speichern</CompactButton></PanelSectionRow>
      </>}
    </PanelSection>

    <PanelSection title="Import">
      <PanelSectionRow><div style={small}>{backendVersion}</div></PanelSectionRow>
      <PanelSectionRow><CompactButton onClick={() => setShowImport(!showImport)}>
        <FaFileUpload /> {showImport ? "Schließen" : "repos.txt öffnen"}
      </CompactButton></PanelSectionRow>
      {showImport && <>
        <PanelSectionRow><div style={{ ...small, overflowWrap: "anywhere" }}>{fileMessage}</div></PanelSectionRow>
        <PanelSectionRow><CompactButton disabled={busy}
          onClick={() => void importKnownFile()}>repos.txt neu einlesen</CompactButton></PanelSectionRow>
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
