const manifest = {"name":"Github Plugin Updater"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const toaster = api.toaster;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaGithub (props) {
  return GenIcon({"attr":{"viewBox":"0 0 496 512"},"child":[{"tag":"path","attr":{"d":"M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"},"child":[]}]})(props);
}function FaFileUpload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 384 512"},"child":[{"tag":"path","attr":{"d":"M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"},"child":[]}]})(props);
}function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}function FaChevronDown (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"},"child":[]}]})(props);
}

const getRepos = callable("get_repos");
const getCheckStatus = callable("get_check_status");
const importDefault = callable("import_default_repos_file");
const checkUpdates = callable("check_updates");
const setMapping = callable("set_plugin_mapping");
function withTimeout(request, milliseconds = 12000) {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error("Keine Antwort vom Decky-Backend nach 12 Sekunden.")), milliseconds);
        request.then(value => { window.clearTimeout(timer); resolve(value); }, error => {
            window.clearTimeout(timer);
            reject(error);
        });
    });
}
const small = { fontSize: "0.85em", opacity: 0.8 };
const spaced = { display: "flex", alignItems: "center", gap: 8 };
function CompactButton({ children, onClick, disabled = false }) {
    return SP_JSX.jsx(DFL.DialogButton, { disabled: disabled, onClick: onClick, style: {
            width: "auto", minWidth: 0, minHeight: 30, height: "auto", flexShrink: 0,
            padding: "5px 10px", fontSize: 13, lineHeight: "18px", whiteSpace: "normal",
        }, children: children });
}
function Content() {
    const [repos, setRepos] = SP_REACT.useState([]);
    const [backendVersion, setBackendVersion] = SP_REACT.useState("Keine Backend-Verbindung");
    const [installed, setInstalled] = SP_REACT.useState([]);
    const [matches, setMatches] = SP_REACT.useState({});
    const [matchReasons, setMatchReasons] = SP_REACT.useState({});
    const [mappingRepo, setMappingRepo] = SP_REACT.useState("");
    const [mappingIndex, setMappingIndex] = SP_REACT.useState(0);
    const [fileMessage, setFileMessage] = SP_REACT.useState("Die repos.txt wird beim Start und vor jeder Update-Prüfung eingelesen.");
    const [busy, setBusy] = SP_REACT.useState(false);
    const [showImport, setShowImport] = SP_REACT.useState(false);
    const [showRepos, setShowRepos] = SP_REACT.useState(false);
    const [status, setStatus] = SP_REACT.useState("Noch keine Prüfung durchgeführt.");
    const [progress, setProgress] = SP_REACT.useState(null);
    const [now, setNow] = SP_REACT.useState(Date.now());
    const [errors, setErrors] = SP_REACT.useState([]);
    const [details, setDetails] = SP_REACT.useState([]);
    const [showDetails, setShowDetails] = SP_REACT.useState(false);
    const [showErrors, setShowErrors] = SP_REACT.useState(false);
    const showError = (error) => toaster.toast({ title: "Fehler", body: String(error) });
    const refreshRepos = async () => {
        try {
            const repoState = await withTimeout(getRepos());
            setBackendVersion(repoState.backend_version ? `Backend v${repoState.backend_version}` : "Backend-Version unbekannt");
            setRepos(repoState.repos);
            setInstalled(repoState.installed || []);
            setMatches(repoState.matches || {});
            setMatchReasons(repoState.match_reasons || {});
        }
        catch (error) {
            setBackendVersion("Keine Backend-Verbindung");
            showError(error);
        }
    };
    SP_REACT.useEffect(() => {
        void refreshRepos();
        let active = true;
        const update = () => {
            void getCheckStatus().then(result => {
                if (active)
                    setProgress(result);
            }).catch(() => { });
        };
        update();
        const poll = window.setInterval(update, 1000);
        const clock = window.setInterval(() => setNow(Date.now()), 1000);
        return () => { active = false; window.clearInterval(poll); window.clearInterval(clock); };
    }, []);
    const mutate = async (action) => {
        setBusy(true);
        try {
            const result = await action();
            if (!result.success)
                throw new Error(result.error || "Aktion fehlgeschlagen");
            if (result.repos)
                setRepos(result.repos);
            await refreshRepos();
            toaster.toast({ title: "Gespeichert", body: result.added === undefined
                    ? "Repository-Liste aktualisiert."
                    : `${result.added} hinzugefügt, ${result.invalid || 0} ungültige Zeilen.` });
        }
        catch (error) {
            showError(error);
        }
        finally {
            setBusy(false);
        }
    };
    const importKnownFile = async () => {
        setBusy(true);
        setFileMessage("Suche repos.txt in den Downloads-Ordnern …");
        try {
            const result = await withTimeout(importDefault());
            if (!result.success)
                throw new Error(result.error || "Textdatei konnte nicht gelesen werden.");
            setFileMessage(`${result.repos?.length || 0} Repositories aus ${result.file || "repos.txt"} übernommen · ${result.invalid || 0} ungültige Zeilen.`);
            await refreshRepos();
            toaster.toast({ title: "Import abgeschlossen", body: `${result.added || 0} Repositories hinzugefügt.` });
        }
        catch (error) {
            setFileMessage(String(error));
            showError(error);
        }
        finally {
            setBusy(false);
        }
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
            if (result.updated.length)
                setStatus(`${done} · Steam-Oberfläche startet gleich neu`);
        }
        catch (error) {
            setStatus("Prüfung fehlgeschlagen.");
            setErrors([String(error)]);
            showError(error);
        }
        finally {
            setBusy(false);
        }
    };
    const checking = busy || !!progress?.running;
    const elapsed = progress?.running && progress.started ? Math.max(0, Math.floor(now / 1000 - progress.started)) : 0;
    const transferred = progress?.bytes_done ? ` · ${(progress.bytes_done / 1048576).toFixed(1)}${progress.bytes_total
        ? ` / ${(progress.bytes_total / 1048576).toFixed(1)}` : ""} MiB` : "";
    return SP_JSX.jsxs("div", { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Updates", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { disabled: busy, onClick: () => void check(), children: [SP_JSX.jsx(FaDownload, {}), " ", busy ? "Prüfe …" : "Updates prüfen"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: status }) }), checking && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", fontSize: "0.84em" }, children: [SP_JSX.jsx("progress", { max: 100, value: progress?.running ? progress.percent : 0, style: { width: "100%", height: 10 } }), SP_JSX.jsx("div", { style: { overflowWrap: "anywhere" }, children: progress?.running
                                        ? `${progress.index}/${progress.total} · ${progress.repo || "repos.txt"} · ${progress.phase}${transferred} · ${elapsed}s`
                                        : "Prüfung wird gestartet …" })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: "Neue Versionen werden installiert. Danach wird die Steam-Oberfl\u00E4che neu geladen." }) }), details.length > 0 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => setShowDetails(!showDetails), children: showDetails ? "Ergebnisse schließen" : "Ergebnisse anzeigen" }) }), showDetails && details.map((detail, index) => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: detail }) }, index)), errors.length > 2 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => setShowErrors(!showErrors), children: showErrors ? "Fehler einklappen" : `Alle ${errors.length} Fehler anzeigen` }) }), (showErrors ? errors : errors.slice(0, 2)).map((error, index) => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "0.85em", color: "#ffaaaa", overflowWrap: "anywhere" }, children: error }) }, index))] }), SP_JSX.jsxs(DFL.PanelSection, { title: `Repositories aus repos.txt (${repos.length})`, children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { ...spaced, flexWrap: "wrap" }, children: repos.length > 0 && SP_JSX.jsxs(CompactButton, { onClick: () => setShowRepos(!showRepos), children: [SP_JSX.jsx(FaChevronDown, {}), " ", showRepos ? "Liste schließen" : "Liste anzeigen"] }) }) }), showRepos && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => void refreshRepos(), children: "Installationen aktualisieren" }) }), showRepos && repos.map(repo => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { children: [SP_JSX.jsx("div", { style: { ...spaced }, children: SP_JSX.jsxs("span", { style: { fontSize: "0.86em", overflowWrap: "anywhere" }, children: [SP_JSX.jsx(FaGithub, {}), " ", repo] }) }), SP_JSX.jsx("div", { style: small, children: matches[repo] ? `${matches[repo]?.name} · installiert: ${matches[repo]?.version}`
                                        : matchReasons[repo] || "Nicht installiert · neueste Version wird installiert" }), SP_JSX.jsx(CompactButton, { disabled: !installed.length, onClick: () => {
                                        setMappingRepo(mappingRepo === repo ? "" : repo);
                                        setMappingIndex(Math.max(0, installed.findIndex(p => p.folder === matches[repo]?.folder)));
                                    }, children: "Zuordnen" })] }) }, repo)), showRepos && mappingRepo && installed.length > 0 && SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: small, children: ["Installiertes Plugin f\u00FCr ", mappingRepo] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Dropdown, { rgOptions: installed.map((plugin, index) => ({ label: `${plugin.name} (${plugin.version})`, data: index })), selectedOption: mappingIndex, onChange: item => setMappingIndex(Number(item.data)) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => void mutate(async () => {
                                        const result = await setMapping(mappingRepo, installed[mappingIndex].folder);
                                        if (result.success)
                                            setMappingRepo("");
                                        return result;
                                    }), children: "Zuordnung speichern" }) })] })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Import", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: backendVersion }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { onClick: () => setShowImport(!showImport), children: [SP_JSX.jsx(FaFileUpload, {}), " ", showImport ? "Schließen" : "repos.txt öffnen"] }) }), showImport && SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { ...small, overflowWrap: "anywhere" }, children: fileMessage }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => void importKnownFile(), children: "repos.txt neu einlesen" }) })] })] })] });
}
var index = definePlugin(() => ({
    name: "Github Plugin Updater",
    titleView: SP_JSX.jsx("div", { style: { fontSize: 19, lineHeight: "24px", fontWeight: 600 }, children: "GitHub Updates" }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaGithub, {}),
}));

export { index as default };
//# sourceMappingURL=index.js.map
