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
}function FaSearch (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"},"child":[]}]})(props);
}function FaMinusCircle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zM124 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H124z"},"child":[]}]})(props);
}function FaFileUpload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 384 512"},"child":[{"tag":"path","attr":{"d":"M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"},"child":[]}]})(props);
}function FaExclamationTriangle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"},"child":[]}]})(props);
}function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}function FaClock (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"},"child":[]}]})(props);
}function FaCircleNotch (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M288 39.056v16.659c0 10.804 7.281 20.159 17.686 23.066C383.204 100.434 440 171.518 440 256c0 101.689-82.295 184-184 184-101.689 0-184-82.295-184-184 0-84.47 56.786-155.564 134.312-177.219C216.719 75.874 224 66.517 224 55.712V39.064c0-15.709-14.834-27.153-30.046-23.234C86.603 43.482 7.394 141.206 8.003 257.332c.72 137.052 111.477 246.956 248.531 246.667C393.255 503.711 504 392.788 504 256c0-115.633-79.14-212.779-186.211-240.236C302.678 11.889 288 23.456 288 39.056z"},"child":[]}]})(props);
}function FaChevronDown (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"},"child":[]}]})(props);
}function FaCheckCircle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"},"child":[]}]})(props);
}

const en = {
    disconnected: "Backend unavailable", unknownBackend: "Unknown backend version",
    timeout: "Decky backend did not respond within 12 seconds.", missingFile: "repos.txt is missing. Checked:",
    repoNotFound: "GitHub repository not found or not public.",
    error: "Error", updatedList: "Repository list updated", saved: "Saved",
    added: "{count} added, {invalid} invalid lines.", importDone: "Import complete",
    imported: "{count} repositories added", searchingFile: "Searching Downloads for repos.txt…",
    fileReadError: "Unable to read repos.txt", importInfo: "repos.txt is read at startup and before each check.",
    fileResult: "{count} repositories from {file} · {invalid} invalid lines.",
    noCheck: "No check performed yet", checkingReleases: "Checking GitHub releases…",
    finished: "{updated} installed · {skipped} skipped · {errors} errors · {pending} awaiting approval",
    finishedToast: "Check complete", restartSoon: "Steam UI will restart shortly",
    restartSignalFailed: "Steam UI could not be restarted. Check that Steam is running or restart it manually.",
    restartLaunchFailed: "Automatic restart could not be scheduled. Restart Steam and Decky manually or try again.",
    retryRestart: "Try restart again",
    checkFailed: "Check failed", checking: "Checking…", check: "Check for updates",
    updates: "Updates", reposBadge: "{count} repos", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
    lastCheck: "Last check: {date}", runningRepo: "Checking {repo}",
    noRepos: "No repositories loaded. Add repos.txt to Downloads.",
    autoRestart: "New versions are installed. Afterward, the Steam UI restarts.",
    allRows: "Show all {count}", fewerRows: "Show fewer", allErrors: "Show all {count} errors",
    hideErrors: "Hide errors", repositories: "Repositories from repos.txt ({count})",
    showList: "Show list", closeList: "Close list", refreshInstalled: "Refresh installations",
    installedVersion: "{name} · installed: {version}", missing: "Not installed · newest version will be installed",
    assign: "Assign", pluginFor: "Installed plugin for {repo}", saveAssignment: "Save assignment",
    import: "Import", close: "Close", openFile: "Open repos.txt", reloadFile: "Reload repos.txt",
    settings: "Settings", modeTitle: "Installation mode", automatic: "Install automatically",
    ask: "Ask before installing", autoDescription: "Install new versions without confirmation and restart Steam afterward.",
    askDescription: "Review each changelog and choose Yes or No. Steam restarts after all decisions.",
    modeSaved: "Installation mode saved", approvalTitle: "Updates awaiting approval ({count})",
    resumeApprovals: "Open next approval popup",
    waitForScan: "The check is still running. You can decide once it finishes.",
    notes: "Show changelog", hideNotes: "Hide changelog", noNotes: "No changelog is available for this release.",
    approve: "Yes, install", decline: "No, skip this release", approvalSaved: "Update approved",
    approvalDeclined: "Release skipped", actionFailed: "Action failed", processing: "Please wait…",
    notInstalled: "Not installed", current: "v{version} · up to date",
    newInstalled: "v{version} · newly installed", oldToNew: "v{old} → v{version} · installed",
    downloadRow: "v{old} → {version} · downloading ZIP",
    installRow: "v{old} → {version} · installing",
    checkingRow: "Checking GitHub release…", waitingRow: "v{version} · awaiting approval",
    pendingRow: "Installed: v{version}", skipRow: "Skipped", ambiguous: "Multiple matches; assign a plugin.",
    selfMissing: "Updater installation not found.", noRelease: "No release ZIP found.",
    invalidVersion: "Installed version cannot be compared.", unknownVersion: "Release version could not be determined.",
    declinedRow: "This release was declined.", removedRow: "Repository removed from list.",
    phaseFile: "Reading repos.txt", phaseRelease: "Checking release", phaseDownload: "Downloading ZIP",
    phaseInstall: "Installing ZIP", phaseCompleteRepo: "Repository complete", phaseComplete: "Check complete",
    progress: "Update progress", awaitingBadge: "{count} awaiting approval",
    browsePlugins: "Browse Decky Plugins", catalogTitle: "Browse Decky Plugins", catalogBack: "Back",
    catalogIntro: "Find a plugin and add its GitHub repository to repos.txt. The next update check will consider it.",
    catalogSearch: "Search plugins, authors or tags", catalogStars: "Most stars", catalogDownloads: "Most downloads",
    catalogRecent: "Latest release", catalogName: "Name A–Z", catalogAllTags: "All tags",
    catalogSort: "Sort by", catalogTags: "Filter by tag",
    catalogResults: "{count} of {total} plugins", catalogLoading: "Loading plugin catalog…",
    catalogFailed: "Catalog could not be loaded", catalogRefresh: "Refresh", catalogRetry: "Try again",
    catalogEmpty: "No matching plugins found.", catalogAdded: "Added to Updater",
    catalogRemoved: "Removed from Updater", catalogAdd: "Add to Updater",
    catalogRemove: "Remove from Updater", catalogRelease: "Latest release: {version}",
    catalogNoRelease: "No release listed", catalogPrev: "Previous", catalogNext: "Next",
    catalogPage: "Page {page} of {pages}",
    catalogNote: "Independent, unvetted index. Follow only repositories you trust; installation requires a valid Decky release ZIP.",
    catalogSource: "Catalog data: Decky Plugin Explorer by Safet Zahirovic ↗",
};
const messages = {
    en,
    de: {
        disconnected: "Keine Backend-Verbindung", unknownBackend: "Backend-Version unbekannt",
        timeout: "Keine Antwort vom Decky-Backend nach 12 Sekunden.", missingFile: "repos.txt fehlt. Geprüft:",
        repoNotFound: "GitHub-Repository nicht gefunden oder nicht öffentlich.",
        error: "Fehler", updatedList: "Repository-Liste aktualisiert", saved: "Gespeichert",
        added: "{count} hinzugefügt, {invalid} ungültige Zeilen.", importDone: "Import abgeschlossen",
        imported: "{count} Repositories hinzugefügt", searchingFile: "Suche repos.txt in Downloads …",
        fileReadError: "repos.txt konnte nicht gelesen werden", importInfo: "repos.txt wird beim Start und vor jeder Prüfung eingelesen.",
        fileResult: "{count} Repositories aus {file} · {invalid} ungültige Zeilen.",
        noCheck: "Noch keine Prüfung durchgeführt", checkingReleases: "GitHub-Releases werden geprüft …",
        finished: "{updated} installiert · {skipped} übersprungen · {errors} Fehler · {pending} zur Freigabe",
        finishedToast: "Prüfung abgeschlossen", restartSoon: "Steam-Oberfläche startet gleich neu",
        restartSignalFailed: "Die Steam-Oberfläche konnte nicht neu gestartet werden. Prüfe, ob Steam läuft, oder starte es manuell neu.",
        restartLaunchFailed: "Der automatische Neustart konnte nicht eingeplant werden. Starte Steam und Decky manuell neu oder versuche es erneut.",
        retryRestart: "Neustart erneut versuchen",
        checkFailed: "Prüfung fehlgeschlagen", checking: "Prüfe …", check: "Updates prüfen",
        updates: "Updates", reposBadge: "{count} Repos", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
        lastCheck: "Letzte Prüfung: {date}", runningRepo: "Prüfe {repo}",
        noRepos: "Keine Repositories geladen. Lege repos.txt in Downloads ab.",
        autoRestart: "Neue Versionen werden installiert. Danach startet die Steam-Oberfläche neu.",
        allRows: "Alle {count} anzeigen", fewerRows: "Weniger anzeigen", allErrors: "Alle {count} Fehler anzeigen",
        hideErrors: "Fehler einklappen", repositories: "Repositories aus repos.txt ({count})",
        showList: "Liste anzeigen", closeList: "Liste schließen", refreshInstalled: "Installationen aktualisieren",
        installedVersion: "{name} · installiert: {version}", missing: "Nicht installiert · neueste Version wird installiert",
        assign: "Zuordnen", pluginFor: "Installiertes Plugin für {repo}", saveAssignment: "Zuordnung speichern",
        import: "Import", close: "Schließen", openFile: "repos.txt öffnen", reloadFile: "repos.txt neu einlesen",
        settings: "Einstellungen", modeTitle: "Installationsmodus", automatic: "Immer installieren",
        ask: "Vor Installation fragen", autoDescription: "Neue Versionen ohne Nachfrage installieren und danach Steam neu starten.",
        askDescription: "Jeden Changelog lesen und Ja oder Nein wählen. Steam startet erst nach allen Entscheidungen neu.",
        modeSaved: "Installationsmodus gespeichert", approvalTitle: "Updates zur Freigabe ({count})",
        resumeApprovals: "Nächste Freigabe als Popup öffnen",
        waitForScan: "Die Prüfung läuft noch. Nach Abschluss kannst du entscheiden.",
        notes: "Changelog anzeigen", hideNotes: "Changelog schließen", noNotes: "Für dieses Release ist kein Changelog verfügbar.",
        approve: "Ja, installieren", decline: "Nein, dieses Release überspringen", approvalSaved: "Update freigegeben",
        approvalDeclined: "Release übersprungen", actionFailed: "Aktion fehlgeschlagen", processing: "Bitte warten …",
        notInstalled: "Nicht installiert", current: "v{version} · aktuell",
        newInstalled: "v{version} · neu installiert", oldToNew: "v{old} → v{version} · installiert",
        downloadRow: "v{old} → {version} · ZIP herunterladen",
        installRow: "v{old} → {version} · wird installiert",
        checkingRow: "GitHub-Release wird geprüft …", waitingRow: "v{version} · wartet auf Freigabe",
        pendingRow: "Installiert: v{version}", skipRow: "Übersprungen", ambiguous: "Mehrere passende Installationen; bitte zuordnen.",
        selfMissing: "Updater-Installation nicht gefunden.", noRelease: "Keine Release-ZIP gefunden.",
        invalidVersion: "Installierte Version nicht vergleichbar.", unknownVersion: "Release-Version nicht erkennbar.",
        declinedRow: "Dieses Release wurde abgelehnt.", removedRow: "Repository aus der Liste entfernt.",
        phaseFile: "repos.txt einlesen", phaseRelease: "Release prüfen", phaseDownload: "ZIP herunterladen",
        phaseInstall: "ZIP installieren", phaseCompleteRepo: "Repository abgeschlossen", phaseComplete: "Prüfung abgeschlossen",
        progress: "Update-Fortschritt", awaitingBadge: "{count} zur Freigabe",
        browsePlugins: "Decky-Plugins durchsuchen", catalogTitle: "Decky-Plugins durchsuchen", catalogBack: "Zurück",
        catalogIntro: "Plugin suchen und sein GitHub-Repository zu repos.txt hinzufügen. Es wird bei der nächsten Update-Prüfung berücksichtigt.",
        catalogSearch: "Plugins, Autoren oder Tags suchen", catalogStars: "Meiste Sterne", catalogDownloads: "Meiste Downloads",
        catalogRecent: "Neuestes Release", catalogName: "Name A–Z", catalogAllTags: "Alle Tags",
        catalogSort: "Sortieren nach", catalogTags: "Nach Tag filtern",
        catalogResults: "{count} von {total} Plugins", catalogLoading: "Plugin-Katalog wird geladen …",
        catalogFailed: "Katalog konnte nicht geladen werden", catalogRefresh: "Aktualisieren", catalogRetry: "Erneut versuchen",
        catalogEmpty: "Keine passenden Plugins gefunden.", catalogAdded: "Zum Updater hinzugefügt",
        catalogRemoved: "Aus dem Updater entfernt", catalogAdd: "Zum Updater hinzufügen",
        catalogRemove: "Aus dem Updater entfernen", catalogRelease: "Letztes Release: {version}",
        catalogNoRelease: "Kein Release verzeichnet", catalogPrev: "Zurück", catalogNext: "Weiter",
        catalogPage: "Seite {page} von {pages}",
        catalogNote: "Unabhängiger, nicht geprüfter Katalog. Überwache nur vertraute Repos; die Installation benötigt eine gültige Decky-Release-ZIP.",
        catalogSource: "Katalogdaten: Decky Plugin Explorer von Safet Zahirovic ↗",
    },
    es: {
        disconnected: "Backend no disponible", unknownBackend: "Versión del backend desconocida",
        timeout: "El backend de Decky no respondió en 12 segundos.", missingFile: "Falta repos.txt. Se buscó en:",
        repoNotFound: "Repositorio de GitHub inexistente o no público.",
        error: "Error", updatedList: "Lista de repositorios actualizada", saved: "Guardado",
        added: "{count} añadidos, {invalid} líneas no válidas.", importDone: "Importación completada",
        imported: "{count} repositorios añadidos", searchingFile: "Buscando repos.txt en Descargas…",
        fileReadError: "No se pudo leer repos.txt", importInfo: "repos.txt se lee al iniciar y antes de cada comprobación.",
        fileResult: "{count} repositorios de {file} · {invalid} líneas no válidas.",
        noCheck: "Aún no se ha comprobado", checkingReleases: "Comprobando versiones de GitHub…",
        finished: "{updated} instalados · {skipped} omitidos · {errors} errores · {pending} por aprobar",
        finishedToast: "Comprobación terminada", restartSoon: "La interfaz de Steam se reiniciará pronto",
        restartSignalFailed: "No se pudo reiniciar la interfaz de Steam. Comprueba que Steam esté abierto o reinícialo manualmente.",
        restartLaunchFailed: "No se pudo programar el reinicio. Reinicia Steam y Decky manualmente o inténtalo de nuevo.",
        retryRestart: "Reintentar el reinicio",
        checkFailed: "La comprobación ha fallado", checking: "Comprobando…", check: "Buscar actualizaciones",
        updates: "Actualizaciones", reposBadge: "{count} repos", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
        lastCheck: "Última comprobación: {date}", runningRepo: "Comprobando {repo}",
        noRepos: "No hay repositorios. Añade repos.txt a Descargas.",
        autoRestart: "Se instalan las nuevas versiones. Después se reinicia la interfaz de Steam.",
        allRows: "Mostrar los {count}", fewerRows: "Mostrar menos", allErrors: "Mostrar los {count} errores",
        hideErrors: "Ocultar errores", repositories: "Repositorios de repos.txt ({count})",
        showList: "Mostrar lista", closeList: "Cerrar lista", refreshInstalled: "Actualizar instalaciones",
        installedVersion: "{name} · instalado: {version}", missing: "No instalado · se instalará la última versión",
        assign: "Asignar", pluginFor: "Plugin instalado para {repo}", saveAssignment: "Guardar asignación",
        import: "Importar", close: "Cerrar", openFile: "Abrir repos.txt", reloadFile: "Volver a leer repos.txt",
        settings: "Ajustes", modeTitle: "Modo de instalación", automatic: "Instalar siempre",
        ask: "Preguntar antes de instalar", autoDescription: "Instalar nuevas versiones sin confirmar y reiniciar Steam después.",
        askDescription: "Lee los cambios y elige Sí o No. Steam se reinicia después de todas las decisiones.",
        modeSaved: "Modo de instalación guardado", approvalTitle: "Actualizaciones pendientes ({count})",
        resumeApprovals: "Abrir siguiente aprobación",
        waitForScan: "La búsqueda sigue en curso. Podrás decidir cuando termine.",
        notes: "Ver cambios", hideNotes: "Ocultar cambios", noNotes: "No hay notas de cambios para esta versión.",
        approve: "Sí, instalar", decline: "No, omitir esta versión", approvalSaved: "Actualización aprobada",
        approvalDeclined: "Versión omitida", actionFailed: "La acción ha fallado", processing: "Espera…",
        notInstalled: "No instalado", current: "v{version} · actualizado",
        newInstalled: "v{version} · recién instalado", oldToNew: "v{old} → v{version} · instalado",
        downloadRow: "v{old} → {version} · descargando ZIP",
        installRow: "v{old} → {version} · instalando",
        checkingRow: "Comprobando versión de GitHub…", waitingRow: "v{version} · pendiente de aprobación",
        pendingRow: "Instalado: v{version}", skipRow: "Omitido", ambiguous: "Varias coincidencias; asigna un plugin.",
        selfMissing: "No se encontró la instalación del actualizador.", noRelease: "No se encontró ningún ZIP de versión.",
        invalidVersion: "No se puede comparar la versión instalada.", unknownVersion: "No se reconoce la versión.",
        declinedRow: "Se rechazó esta versión.", removedRow: "Repositorio eliminado de la lista.",
        phaseFile: "Leyendo repos.txt", phaseRelease: "Comprobando versión", phaseDownload: "Descargando ZIP",
        phaseInstall: "Instalando ZIP", phaseCompleteRepo: "Repositorio terminado", phaseComplete: "Comprobación terminada",
        progress: "Progreso de actualización", awaitingBadge: "{count} por aprobar",
        browsePlugins: "Explorar plugins de Decky", catalogTitle: "Explorar plugins de Decky", catalogBack: "Volver",
        catalogIntro: "Busca un plugin y añade su repositorio de GitHub a repos.txt. Se tendrá en cuenta en la próxima comprobación.",
        catalogSearch: "Buscar plugins, autores o etiquetas", catalogStars: "Más estrellas", catalogDownloads: "Más descargas",
        catalogRecent: "Última versión", catalogName: "Nombre A–Z", catalogAllTags: "Todas las etiquetas",
        catalogSort: "Ordenar por", catalogTags: "Filtrar por etiqueta",
        catalogResults: "{count} de {total} plugins", catalogLoading: "Cargando catálogo de plugins…",
        catalogFailed: "No se pudo cargar el catálogo", catalogRefresh: "Actualizar", catalogRetry: "Reintentar",
        catalogEmpty: "No se encontraron plugins.", catalogAdded: "Añadido al actualizador",
        catalogRemoved: "Eliminado del actualizador", catalogAdd: "Añadir al actualizador",
        catalogRemove: "Quitar del actualizador", catalogRelease: "Última versión: {version}",
        catalogNoRelease: "No se indica ninguna versión", catalogPrev: "Anterior", catalogNext: "Siguiente",
        catalogPage: "Página {page} de {pages}",
        catalogNote: "Índice independiente sin verificar. Sigue solo repositorios de confianza; se necesita un ZIP válido de Decky para instalar.",
        catalogSource: "Datos: Decky Plugin Explorer de Safet Zahirovic ↗",
    },
    fr: {
        disconnected: "Backend indisponible", unknownBackend: "Version du backend inconnue",
        timeout: "Aucune réponse du backend Decky après 12 secondes.", missingFile: "repos.txt introuvable. Dossiers vérifiés :",
        repoNotFound: "Dépôt GitHub introuvable ou non public.",
        error: "Erreur", updatedList: "Liste des dépôts mise à jour", saved: "Enregistré",
        added: "{count} ajoutés, {invalid} lignes invalides.", importDone: "Importation terminée",
        imported: "{count} dépôts ajoutés", searchingFile: "Recherche de repos.txt dans Téléchargements…",
        fileReadError: "Impossible de lire repos.txt", importInfo: "repos.txt est lu au démarrage et avant chaque vérification.",
        fileResult: "{count} dépôts depuis {file} · {invalid} lignes invalides.",
        noCheck: "Aucune vérification effectuée", checkingReleases: "Vérification des versions GitHub…",
        finished: "{updated} installés · {skipped} ignorés · {errors} erreurs · {pending} à approuver",
        finishedToast: "Vérification terminée", restartSoon: "L'interface Steam va redémarrer",
        restartSignalFailed: "Impossible de redémarrer l'interface Steam. Vérifiez que Steam fonctionne ou redémarrez-le manuellement.",
        restartLaunchFailed: "Impossible de programmer le redémarrage. Redémarrez Steam et Decky manuellement ou réessayez.",
        retryRestart: "Réessayer le redémarrage",
        checkFailed: "Échec de la vérification", checking: "Vérification…", check: "Vérifier les mises à jour",
        updates: "Mises à jour", reposBadge: "{count} dépôts", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
        lastCheck: "Dernière vérification : {date}", runningRepo: "Vérification de {repo}",
        noRepos: "Aucun dépôt chargé. Ajoutez repos.txt dans Téléchargements.",
        autoRestart: "Les nouvelles versions sont installées. L'interface Steam redémarre ensuite.",
        allRows: "Afficher les {count}", fewerRows: "Afficher moins", allErrors: "Afficher les {count} erreurs",
        hideErrors: "Masquer les erreurs", repositories: "Dépôts de repos.txt ({count})",
        showList: "Afficher la liste", closeList: "Fermer la liste", refreshInstalled: "Actualiser les installations",
        installedVersion: "{name} · installé : {version}", missing: "Non installé · dernière version à installer",
        assign: "Associer", pluginFor: "Plugin installé pour {repo}", saveAssignment: "Enregistrer l'association",
        import: "Importer", close: "Fermer", openFile: "Ouvrir repos.txt", reloadFile: "Relire repos.txt",
        settings: "Paramètres", modeTitle: "Mode d'installation", automatic: "Toujours installer",
        ask: "Demander avant installation", autoDescription: "Installer sans confirmation et redémarrer Steam ensuite.",
        askDescription: "Lire les changements puis choisir Oui ou Non. Steam redémarre après toutes les décisions.",
        modeSaved: "Mode d'installation enregistré", approvalTitle: "Mises à jour à approuver ({count})",
        resumeApprovals: "Ouvrir la prochaine confirmation",
        waitForScan: "La vérification est en cours. Vous pourrez décider à la fin.",
        notes: "Afficher les changements", hideNotes: "Masquer les changements", noNotes: "Aucune note de version disponible.",
        approve: "Oui, installer", decline: "Non, ignorer cette version", approvalSaved: "Mise à jour approuvée",
        approvalDeclined: "Version ignorée", actionFailed: "Échec de l'action", processing: "Veuillez patienter…",
        notInstalled: "Non installé", current: "v{version} · à jour",
        newInstalled: "v{version} · nouvellement installé", oldToNew: "v{old} → v{version} · installé",
        downloadRow: "v{old} → {version} · téléchargement du ZIP",
        installRow: "v{old} → {version} · installation",
        checkingRow: "Vérification de la version GitHub…", waitingRow: "v{version} · en attente d'approbation",
        pendingRow: "Installé : v{version}", skipRow: "Ignoré", ambiguous: "Plusieurs correspondances ; associez un plugin.",
        selfMissing: "Installation de l'outil introuvable.", noRelease: "Aucun ZIP de version trouvé.",
        invalidVersion: "Version installée non comparable.", unknownVersion: "Version de la publication introuvable.",
        declinedRow: "Cette version a été refusée.", removedRow: "Dépôt supprimé de la liste.",
        phaseFile: "Lecture de repos.txt", phaseRelease: "Vérification de version", phaseDownload: "Téléchargement du ZIP",
        phaseInstall: "Installation du ZIP", phaseCompleteRepo: "Dépôt terminé", phaseComplete: "Vérification terminée",
        progress: "Progression de la mise à jour", awaitingBadge: "{count} à approuver",
        browsePlugins: "Parcourir les plugins Decky", catalogTitle: "Parcourir les plugins Decky", catalogBack: "Retour",
        catalogIntro: "Cherchez un plugin et ajoutez son dépôt GitHub à repos.txt. Il sera pris en compte lors de la prochaine vérification.",
        catalogSearch: "Rechercher plugins, auteurs ou tags", catalogStars: "Plus d'étoiles", catalogDownloads: "Plus de téléchargements",
        catalogRecent: "Dernière version", catalogName: "Nom A–Z", catalogAllTags: "Tous les tags",
        catalogSort: "Trier par", catalogTags: "Filtrer par tag",
        catalogResults: "{count} plugins sur {total}", catalogLoading: "Chargement du catalogue…",
        catalogFailed: "Impossible de charger le catalogue", catalogRefresh: "Actualiser", catalogRetry: "Réessayer",
        catalogEmpty: "Aucun plugin correspondant.", catalogAdded: "Ajouté à l'Updater",
        catalogRemoved: "Retiré de l'Updater", catalogAdd: "Ajouter à l'Updater",
        catalogRemove: "Retirer de l'Updater", catalogRelease: "Dernière version : {version}",
        catalogNoRelease: "Aucune version indiquée", catalogPrev: "Précédent", catalogNext: "Suivant",
        catalogPage: "Page {page} sur {pages}",
        catalogNote: "Index indépendant non vérifié. N'utilisez que des dépôts fiables ; un ZIP Decky valide est requis pour installer.",
        catalogSource: "Données : Decky Plugin Explorer par Safet Zahirovic ↗",
    },
    ru: {
        disconnected: "Нет связи с серверной частью", unknownBackend: "Версия серверной части неизвестна",
        timeout: "Серверная часть Decky не ответила за 12 секунд.", missingFile: "Файл repos.txt не найден. Проверены:",
        repoNotFound: "Репозиторий GitHub не найден или не является публичным.",
        error: "Ошибка", updatedList: "Список репозиториев обновлён", saved: "Сохранено",
        added: "Добавлено: {count}, неверных строк: {invalid}.", importDone: "Импорт завершён",
        imported: "Добавлено репозиториев: {count}", searchingFile: "Поиск repos.txt в Загрузках…",
        fileReadError: "Не удалось прочитать repos.txt", importInfo: "repos.txt читается при запуске и перед каждой проверкой.",
        fileResult: "Репозиториев из {file}: {count} · неверных строк: {invalid}.",
        noCheck: "Проверка ещё не выполнялась", checkingReleases: "Проверка релизов GitHub…",
        finished: "Установлено: {updated} · пропущено: {skipped} · ошибок: {errors} · ожидают: {pending}",
        finishedToast: "Проверка завершена", restartSoon: "Интерфейс Steam скоро перезапустится",
        restartSignalFailed: "Не удалось перезапустить интерфейс Steam. Проверьте, работает ли Steam, или перезапустите его вручную.",
        restartLaunchFailed: "Не удалось запланировать перезапуск. Перезапустите Steam и Decky вручную или попробуйте снова.",
        retryRestart: "Повторить перезапуск",
        checkFailed: "Ошибка проверки", checking: "Проверка…", check: "Проверить обновления",
        updates: "Обновления", reposBadge: "Репозиториев: {count}", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed} с",
        lastCheck: "Последняя проверка: {date}", runningRepo: "Проверяется {repo}",
        noRepos: "Нет репозиториев. Добавьте repos.txt в папку Загрузки.",
        autoRestart: "Новые версии устанавливаются, затем интерфейс Steam перезапускается.",
        allRows: "Показать все ({count})", fewerRows: "Показать меньше", allErrors: "Показать все ошибки ({count})",
        hideErrors: "Скрыть ошибки", repositories: "Репозитории из repos.txt ({count})",
        showList: "Показать список", closeList: "Скрыть список", refreshInstalled: "Обновить список установленных",
        installedVersion: "{name} · установлено: {version}", missing: "Не установлен · будет установлена новая версия",
        assign: "Назначить", pluginFor: "Установленный плагин для {repo}", saveAssignment: "Сохранить назначение",
        import: "Импорт", close: "Закрыть", openFile: "Открыть repos.txt", reloadFile: "Перечитать repos.txt",
        settings: "Настройки", modeTitle: "Режим установки", automatic: "Всегда устанавливать",
        ask: "Спрашивать перед установкой", autoDescription: "Устанавливать без подтверждения и перезапускать Steam.",
        askDescription: "Прочитайте список изменений и выберите Да или Нет. Steam перезапустится после всех решений.",
        modeSaved: "Режим установки сохранён", approvalTitle: "Ожидают подтверждения ({count})",
        resumeApprovals: "Открыть следующее подтверждение",
        waitForScan: "Проверка ещё идёт. Вы сможете выбрать после её завершения.",
        notes: "Показать изменения", hideNotes: "Скрыть изменения", noNotes: "Для этого релиза нет списка изменений.",
        approve: "Да, установить", decline: "Нет, пропустить релиз", approvalSaved: "Обновление подтверждено",
        approvalDeclined: "Релиз пропущен", actionFailed: "Ошибка действия", processing: "Подождите…",
        notInstalled: "Не установлен", current: "v{version} · актуально",
        newInstalled: "v{version} · установлен впервые", oldToNew: "v{old} → v{version} · установлен",
        downloadRow: "v{old} → {version} · загрузка ZIP",
        installRow: "v{old} → {version} · установка",
        checkingRow: "Проверка релиза GitHub…", waitingRow: "v{version} · ожидает подтверждения",
        pendingRow: "Установлено: v{version}", skipRow: "Пропущено", ambiguous: "Найдено несколько плагинов; выберите нужный.",
        selfMissing: "Установка этого плагина не найдена.", noRelease: "ZIP-файл релиза не найден.",
        invalidVersion: "Версии нельзя сравнить.", unknownVersion: "Версия релиза неизвестна.",
        declinedRow: "Этот релиз отклонён.", removedRow: "Репозиторий удалён из списка.",
        phaseFile: "Чтение repos.txt", phaseRelease: "Проверка релиза", phaseDownload: "Загрузка ZIP",
        phaseInstall: "Установка ZIP", phaseCompleteRepo: "Репозиторий обработан", phaseComplete: "Проверка завершена",
        progress: "Ход обновления", awaitingBadge: "Ожидают: {count}",
        browsePlugins: "Каталог плагинов Decky", catalogTitle: "Каталог плагинов Decky", catalogBack: "Назад",
        catalogIntro: "Найдите плагин и добавьте его репозиторий GitHub в repos.txt. Он будет учтён при следующей проверке.",
        catalogSearch: "Поиск плагинов, авторов и тегов", catalogStars: "Больше звёзд", catalogDownloads: "Больше загрузок",
        catalogRecent: "Свежий выпуск", catalogName: "Имя А–Я", catalogAllTags: "Все теги",
        catalogSort: "Сортировать по", catalogTags: "Фильтр по тегу",
        catalogResults: "{count} из {total} плагинов", catalogLoading: "Загрузка каталога плагинов…",
        catalogFailed: "Не удалось загрузить каталог", catalogRefresh: "Обновить", catalogRetry: "Повторить",
        catalogEmpty: "Подходящих плагинов нет.", catalogAdded: "Добавлено в обновлятор",
        catalogRemoved: "Удалено из обновлятора", catalogAdd: "Добавить в обновлятор",
        catalogRemove: "Удалить из обновлятора", catalogRelease: "Последний выпуск: {version}",
        catalogNoRelease: "Выпуск не указан", catalogPrev: "Назад", catalogNext: "Далее",
        catalogPage: "Страница {page} из {pages}",
        catalogNote: "Независимый непроверенный каталог. Используйте только надёжные репозитории; для установки нужен корректный ZIP Decky.",
        catalogSource: "Данные: Decky Plugin Explorer от Safet Zahirovic ↗",
    },
};
function systemLanguage(value) {
    const code = value.toLowerCase().replace(/[_-].*$/, "");
    if (code === "german" || code === "de")
        return "de";
    if (code === "spanish" || code === "latamspanish" || code === "latam" || code === "es")
        return "es";
    if (code === "french" || code === "fr")
        return "fr";
    if (code === "russian" || code === "ru")
        return "ru";
    return "en";
}
function t(lang, key, values = {}) {
    return messages[lang][key].replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}

const getRepos = callable("get_repos");
const getCheckStatus = callable("get_check_status");
const importDefault = callable("import_default_repos_file");
const startCheck = callable("start_check");
const setMapping = callable("set_plugin_mapping");
const setUpdateMode = callable("set_update_mode");
const approvePending = callable("approve_pending_update");
const declinePending = callable("decline_pending_update");
const retryRestart = callable("retry_restart");
const claimUiRestart = callable("claim_ui_restart");
const reportUiRestartFailure = callable("report_ui_restart_failure");
const startCatalog = callable("start_catalog");
const getCatalogStatus = callable("get_catalog_status");
const setCatalogRepo = callable("set_catalog_repo");
// Steam can remount or reload the entire Decky view while opening a modal.
// Keep the guard across both events so a dismissed popup cannot reopen in a loop.
const approvalStorageKey = "github-plugin-updater.approvals.v1";
function loadApprovalSession() {
    try {
        const saved = JSON.parse(window.sessionStorage.getItem(approvalStorageKey) || "null");
        return { blocked: saved?.blocked === true,
            prompted: new Set(Array.isArray(saved?.prompted)
                ? saved.prompted.filter((value) => typeof value === "string").slice(-100) : []) };
    }
    catch {
        return { blocked: false, prompted: new Set() };
    }
}
const approvalSession = loadApprovalSession();
function saveApprovalSession() {
    try {
        window.sessionStorage.setItem(approvalStorageKey, JSON.stringify({
            blocked: approvalSession.blocked, prompted: [...approvalSession.prompted],
        }));
    }
    catch { /* Steam may disable session storage; the in-memory guard still works. */ }
}
function withTimeout(request, message, milliseconds = 12000) {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), milliseconds);
        request.then(value => { window.clearTimeout(timer); resolve(value); }, error => {
            window.clearTimeout(timer);
            reject(error);
        });
    });
}
const small = { fontSize: "0.85em", opacity: 0.8 };
const spaced = { display: "flex", alignItems: "center", gap: 8 };
const colors = { cyan: "#45d9f2", green: "#69dda8", red: "#ff9c9c", muted: "#aab9cf" };
function CheckIcon({ state }) {
    if (state === "updated" || state === "current")
        return SP_JSX.jsx(FaCheckCircle, { color: colors.green, size: 17 });
    if (state === "error")
        return SP_JSX.jsx(FaExclamationTriangle, { color: colors.red, size: 16 });
    if (state === "skipped")
        return SP_JSX.jsx(FaMinusCircle, { color: colors.muted, size: 17 });
    if (state === "awaiting")
        return SP_JSX.jsx(FaClock, { color: "#ffd577", size: 17 });
    if (state === "pending")
        return SP_JSX.jsx(FaClock, { color: colors.muted, size: 16 });
    return SP_JSX.jsx(FaCircleNotch, { color: colors.cyan, size: 17 });
}
function backendMessage(lang, message) {
    if (message.startsWith("repos.txt fehlt. Geprüft:"))
        return message.replace("repos.txt fehlt. Geprüft:", t(lang, "missingFile"));
    const reason = {
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
function rowSubtitle(lang, row) {
    if (row.state === "updated")
        return row.previous
            ? t(lang, "oldToNew", { old: row.previous, version: row.version })
            : t(lang, "newInstalled", { version: row.version });
    if (row.state === "current")
        return t(lang, "current", { version: row.previous || row.version });
    if (row.state === "error" || row.state === "skipped")
        return backendMessage(lang, row.message) || t(lang, "skipRow");
    if (row.state === "awaiting")
        return t(lang, "waitingRow", { version: row.version });
    if (row.state === "downloading")
        return t(lang, "downloadRow", { old: row.previous || "–", version: row.version });
    if (row.state === "installing")
        return t(lang, "installRow", { old: row.previous || "–", version: row.version });
    if (row.state === "checking")
        return t(lang, "checkingRow");
    return row.previous ? t(lang, "pendingRow", { version: row.previous }) : t(lang, "notInstalled");
}
function phaseName(lang, phase) {
    const names = { "repos.txt einlesen": "phaseFile", "Release prüfen": "phaseRelease",
        "ZIP herunterladen": "phaseDownload", "ZIP installieren": "phaseInstall",
        "Repository abgeschlossen": "phaseCompleteRepo", "Prüfung abgeschlossen": "phaseComplete" };
    return names[phase] ? t(lang, names[phase]) : phase;
}
function CompactButton({ children, onClick, disabled = false }) {
    return SP_JSX.jsx(DFL.DialogButton, { disabled: disabled, onClick: onClick, style: {
            width: "auto", minWidth: 0, minHeight: 30, height: "auto", flexShrink: 0,
            padding: "5px 10px", fontSize: 13, lineHeight: "18px", whiteSpace: "normal",
        }, children: children });
}
function FilterButton({ children, onClick, selected }) {
    return SP_JSX.jsxs(DFL.DialogButton, { onClick: onClick, style: { width: "auto", minWidth: 0, minHeight: 30,
            height: "auto", padding: "5px 9px", fontSize: 12, lineHeight: "18px", whiteSpace: "normal",
            border: selected ? `1px solid ${colors.cyan}` : "1px solid transparent",
            background: selected ? "#15566d" : undefined,
        }, children: [selected ? "✓ " : "", children] });
}
function CatalogBrowser({ language, onClose, onReposChanged }) {
    const [plugins, setPlugins] = SP_REACT.useState([]);
    const [tracked, setTracked] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    const [error, setError] = SP_REACT.useState("");
    const [search, setSearch] = SP_REACT.useState("");
    const [tag, setTag] = SP_REACT.useState("");
    const [sort, setSort] = SP_REACT.useState("stars");
    const [showTags, setShowTags] = SP_REACT.useState(false);
    const [page, setPage] = SP_REACT.useState(0);
    const [changing, setChanging] = SP_REACT.useState("");
    const active = SP_REACT.useRef(false);
    const timer = SP_REACT.useRef(null);
    const readCatalog = async () => {
        try {
            const status = await withTimeout(getCatalogStatus(), t(language, "timeout"));
            if (!active.current)
                return;
            setPlugins(status.plugins || []);
            setTracked(status.tracked || []);
            setLoading(status.running);
            setError(status.error || "");
            if (status.running)
                timer.current = window.setTimeout(() => void readCatalog(), 1000);
        }
        catch (caught) {
            if (active.current) {
                setLoading(false);
                setError(String(caught));
            }
        }
    };
    const loadCatalog = async (force = false) => {
        if (timer.current !== null)
            window.clearTimeout(timer.current);
        setLoading(true);
        setError("");
        try {
            const result = await withTimeout(startCatalog(force), t(language, "timeout"));
            if (!result.success)
                throw new Error(result.error || t(language, "catalogFailed"));
            if (active.current)
                await readCatalog();
        }
        catch (caught) {
            if (active.current) {
                setLoading(false);
                setError(String(caught));
            }
        }
    };
    SP_REACT.useEffect(() => {
        active.current = true;
        void loadCatalog();
        return () => { active.current = false; if (timer.current !== null)
            window.clearTimeout(timer.current); };
    }, []);
    const topTags = SP_REACT.useMemo(() => {
        const counts = new Map();
        for (const plugin of plugins)
            for (const item of plugin.tags)
                counts.set(item, (counts.get(item) || 0) + 1);
        return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 25);
    }, [plugins]);
    const filtered = SP_REACT.useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        return plugins.filter(plugin => (!tag || plugin.tags.includes(tag)) && (!query
            || [plugin.name, plugin.repo, plugin.author, plugin.description, ...plugin.tags]
                .join(" ").toLocaleLowerCase().includes(query))).sort((a, b) => {
            if (sort === "recent")
                return b.released_at.localeCompare(a.released_at) || a.name.localeCompare(b.name);
            if (sort === "downloads")
                return b.downloads - a.downloads || a.name.localeCompare(b.name);
            if (sort === "name")
                return a.name.localeCompare(b.name);
            return b.stars - a.stars || a.name.localeCompare(b.name);
        });
    }, [plugins, search, sort, tag]);
    const pageCount = Math.max(1, Math.ceil(filtered.length / 12));
    const shownPage = Math.min(page, pageCount - 1);
    const trackedSet = new Set(tracked.map(repo => repo.toLowerCase()));
    const toggleRepo = async (repo, follow) => {
        setChanging(repo);
        try {
            const result = await withTimeout(setCatalogRepo(repo, follow), t(language, "timeout"));
            if (!result.success)
                throw new Error(result.error || t(language, "actionFailed"));
            setTracked(result.repos || []);
            onReposChanged();
            toaster.toast({ title: t(language, follow ? "catalogAdded" : "catalogRemoved"), body: repo });
        }
        catch (caught) {
            toaster.toast({ title: t(language, "error"), body: String(caught) });
        }
        finally {
            setChanging("");
        }
    };
    return SP_JSX.jsxs("div", { style: { width: "100%", minWidth: 0,
            boxSizing: "border-box", padding: "0 3px 8px", color: "#edf5ff", overflowWrap: "anywhere" }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [SP_JSX.jsx("strong", { style: { fontSize: 17 }, children: t(language, "catalogTitle") }), SP_JSX.jsx(CompactButton, { onClick: onClose, children: t(language, "catalogBack") })] }), SP_JSX.jsx("div", { style: { ...small, margin: "8px 0" }, children: t(language, "catalogIntro") }), SP_JSX.jsx("div", { onKeyDownCapture: event => {
                    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }, onKeyUpCapture: event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }, children: SP_JSX.jsx(DFL.TextField, { label: t(language, "catalogSearch"), value: search, onChange: event => {
                        setSearch(event.target.value);
                        setPage(0);
                    } }) }), SP_JSX.jsx("div", { style: { ...small, margin: "12px 0 5px" }, children: t(language, "catalogSort") }), SP_JSX.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: [["stars", "catalogStars"], ["downloads", "catalogDownloads"],
                    ["recent", "catalogRecent"], ["name", "catalogName"]].map(([choice, label]) => SP_JSX.jsx(FilterButton, { selected: sort === choice, onClick: () => {
                        setSort(choice);
                        setPage(0);
                    }, children: t(language, label) }, choice)) }), SP_JSX.jsx("div", { style: { marginTop: 10 }, children: SP_JSX.jsxs(CompactButton, { onClick: () => setShowTags(value => !value), children: [t(language, "catalogTags"), ": ", tag || t(language, "catalogAllTags"), " ", showTags ? "▴" : "▾"] }) }), showTags && SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 185,
                    overflowY: "auto", padding: "7px 2px" }, children: [SP_JSX.jsx(FilterButton, { selected: !tag, onClick: () => {
                            setTag("");
                            setPage(0);
                            setShowTags(false);
                        }, children: t(language, "catalogAllTags") }), topTags.map(([item, count]) => SP_JSX.jsxs(FilterButton, { selected: tag === item, onClick: () => {
                            setTag(item);
                            setPage(0);
                            setShowTags(false);
                        }, children: [item, " (", count, ")"] }, item))] }), SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "10px 0" }, children: [SP_JSX.jsx("span", { style: small, children: t(language, "catalogResults", { count: filtered.length, total: plugins.length }) }), SP_JSX.jsx(CompactButton, { disabled: loading, onClick: () => void loadCatalog(true), children: t(language, "catalogRefresh") })] }), loading && SP_JSX.jsxs("div", { style: { ...small, padding: 8 }, children: [SP_JSX.jsx(FaCircleNotch, {}), " ", t(language, "catalogLoading")] }), error && SP_JSX.jsxs("div", { style: { color: colors.red, fontSize: 12, margin: "8px 0" }, children: [t(language, "catalogFailed"), ": ", error, SP_JSX.jsx("div", { style: { marginTop: 8 }, children: SP_JSX.jsx(CompactButton, { onClick: () => void loadCatalog(true), children: t(language, "catalogRetry") }) })] }), !loading && !error && !filtered.length && SP_JSX.jsx("div", { style: { ...small, padding: 8 }, children: t(language, "catalogEmpty") }), filtered.slice(shownPage * 12, (shownPage + 1) * 12).map(plugin => {
                const follows = trackedSet.has(plugin.repo.toLowerCase());
                return SP_JSX.jsxs("div", { style: { padding: "10px 11px", background: "#202e42",
                        borderRadius: 9, marginTop: 7, minWidth: 0 }, children: [SP_JSX.jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }, children: [SP_JSX.jsx("strong", { style: { fontSize: 13 }, children: plugin.name }), SP_JSX.jsxs("span", { style: { ...small, whiteSpace: "nowrap" }, children: ["\u2605 ", plugin.stars, plugin.downloads > 0
                                            ? ` · ↓ ${plugin.downloads.toLocaleString(language)}` : ""] })] }), SP_JSX.jsxs("div", { style: { fontSize: 11, color: colors.muted, marginTop: 2 }, children: [plugin.repo, " \u00B7 ", plugin.author] }), plugin.description && SP_JSX.jsx("div", { style: { fontSize: 12, marginTop: 6, lineHeight: 1.35 }, children: plugin.description }), plugin.tags.length > 0 && SP_JSX.jsx("div", { style: { ...small, marginTop: 5 }, children: plugin.tags.slice(0, 4).join(" · ") }), SP_JSX.jsx("div", { style: { ...small, marginTop: 5 }, children: plugin.latest_tag
                                ? t(language, "catalogRelease", { version: plugin.latest_tag }) : t(language, "catalogNoRelease") }), SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 8 }, children: [SP_JSX.jsx(CompactButton, { disabled: !!changing || loading, onClick: () => void toggleRepo(plugin.repo, !follows), children: changing === plugin.repo ? t(language, "processing") : t(language, follows ? "catalogRemove" : "catalogAdd") }), SP_JSX.jsx("a", { style: { fontSize: 12, color: colors.cyan }, href: `https://github.com/${plugin.repo}`, target: "_blank", rel: "noopener noreferrer", children: "GitHub \u2197" })] })] }, plugin.repo);
            }), pageCount > 1 && SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12 }, children: [SP_JSX.jsx(CompactButton, { disabled: shownPage === 0, onClick: () => setPage(shownPage - 1), children: t(language, "catalogPrev") }), SP_JSX.jsx("span", { style: small, children: t(language, "catalogPage", { page: shownPage + 1, pages: pageCount }) }), SP_JSX.jsx(CompactButton, { disabled: shownPage + 1 >= pageCount, onClick: () => setPage(shownPage + 1), children: t(language, "catalogNext") })] }), SP_JSX.jsx("div", { style: { ...small, marginTop: 12 }, children: t(language, "catalogNote") }), SP_JSX.jsx("a", { style: { fontSize: 11, color: colors.cyan }, href: "https://safetzahirovic.github.io/decky-plugins-explorer/", target: "_blank", rel: "noopener noreferrer", children: t(language, "catalogSource") })] });
}
function Content() {
    const [language, setLanguage] = SP_REACT.useState("en");
    const [repos, setRepos] = SP_REACT.useState([]);
    const [backendVersion, setBackendVersion] = SP_REACT.useState("");
    const [updateMode, setMode] = SP_REACT.useState("automatic");
    const [pendingUpdates, setPendingUpdates] = SP_REACT.useState([]);
    const [promptBlocked, setPromptBlocked] = SP_REACT.useState(() => approvalSession.blocked);
    const [popupAttempt, setPopupAttempt] = SP_REACT.useState(0);
    const [restartPending, setRestartPending] = SP_REACT.useState(false);
    const [restartError, setRestartError] = SP_REACT.useState("");
    const [restartErrorDetail, setRestartErrorDetail] = SP_REACT.useState("");
    const [restarting, setRestarting] = SP_REACT.useState(false);
    const [openedNotes, setOpenedNotes] = SP_REACT.useState("");
    const [installed, setInstalled] = SP_REACT.useState([]);
    const [matches, setMatches] = SP_REACT.useState({});
    const [matchReasons, setMatchReasons] = SP_REACT.useState({});
    const [mappingRepo, setMappingRepo] = SP_REACT.useState("");
    const [mappingIndex, setMappingIndex] = SP_REACT.useState(0);
    const [fileMessage, setFileMessage] = SP_REACT.useState("");
    const [busy, setBusy] = SP_REACT.useState(false);
    const [showImport, setShowImport] = SP_REACT.useState(false);
    const [showRepos, setShowRepos] = SP_REACT.useState(false);
    const [showCatalog, setShowCatalog] = SP_REACT.useState(false);
    const [status, setStatus] = SP_REACT.useState("");
    const [progress, setProgress] = SP_REACT.useState(null);
    const [now, setNow] = SP_REACT.useState(Date.now());
    const [errors, setErrors] = SP_REACT.useState([]);
    const [showAllRows, setShowAllRows] = SP_REACT.useState(false);
    const [showErrors, setShowErrors] = SP_REACT.useState(false);
    const lastCompletion = SP_REACT.useRef(0);
    const lastAwaiting = SP_REACT.useRef(0);
    const sawRunning = SP_REACT.useRef(false);
    const pollInFlight = SP_REACT.useRef(false);
    const restartRequested = SP_REACT.useRef(false);
    const approvalModal = SP_REACT.useRef(null);
    const promptedReleases = SP_REACT.useRef(approvalSession.prompted);
    const blockPrompts = () => { approvalSession.blocked = true; saveApprovalSession(); setPromptBlocked(true); };
    const resumePrompts = () => { approvalSession.blocked = false; saveApprovalSession(); setPromptBlocked(false); };
    const languageRef = SP_REACT.useRef(language);
    SP_REACT.useEffect(() => { languageRef.current = language; }, [language]);
    const showError = (error) => toaster.toast({ title: t(language, "error"),
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
        }
        catch (error) {
            if (!silent) {
                setBackendVersion("");
                showError(error);
            }
        }
    };
    SP_REACT.useEffect(() => {
        void refreshRepos();
        let active = true;
        const readLanguage = () => {
            if (typeof SteamClient !== "undefined" && SteamClient.Settings?.GetCurrentLanguage) {
                void SteamClient.Settings.GetCurrentLanguage().then(value => {
                    if (active)
                        setLanguage(systemLanguage(value));
                }).catch(() => { if (active)
                    setLanguage(systemLanguage(navigator.language || "en")); });
            }
            else
                setLanguage(systemLanguage(navigator.language || "en"));
        };
        readLanguage();
        const localeListener = typeof SteamClient !== "undefined" && SteamClient.Settings?.RegisterForSettingsChanges
            ? SteamClient.Settings.RegisterForSettingsChanges(readLanguage) : null;
        const update = () => {
            if (pollInFlight.current)
                return;
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
                    if (result.running && result.operation === "scan")
                        sawRunning.current = true;
                    const awaiting = result.rows.filter(row => row.state === "awaiting").length;
                    if (awaiting !== lastAwaiting.current) {
                        lastAwaiting.current = awaiting;
                        if (awaiting > 0)
                            void refreshRepos(true);
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
                            if (notify)
                                toaster.toast({ title: t(currentLanguage, "finishedToast"), body: finished });
                        }
                        void refreshRepos(true);
                    }
                }
            }).catch(() => { }).finally(() => {
                pollInFlight.current = false;
            });
        };
        update();
        const poll = window.setInterval(update, 1000);
        const clock = window.setInterval(() => setNow(Date.now()), 1000);
        return () => {
            active = false;
            if (approvalModal.current) {
                approvalSession.blocked = true;
                saveApprovalSession();
                approvalModal.current.Close();
                approvalModal.current = null;
            }
            localeListener?.unregister();
            window.clearInterval(poll);
            window.clearInterval(clock);
        };
    }, []);
    SP_REACT.useEffect(() => {
        if (!restartPending || restartError || pendingUpdates.length || progress?.running || busy
            || restartRequested.current)
            return;
        restartRequested.current = true;
        const reportFailure = (reason) => {
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
                if (result.error)
                    setRestartErrorDetail(result.error);
                return;
            }
            setRestartPending(false);
            setRestarting(true);
            setStatus(t(languageRef.current, "restartSoon"));
            window.setTimeout(() => {
                const backend = globalThis.DeckyBackend;
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
                }
                catch (error) {
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
    const mutate = async (action) => {
        setBusy(true);
        try {
            const result = await action();
            if (!result.success)
                throw new Error(result.error || t(language, "actionFailed"));
            if (result.repos)
                setRepos(result.repos);
            await refreshRepos();
            toaster.toast({ title: t(language, "saved"), body: result.added === undefined
                    ? t(language, "updatedList")
                    : t(language, "added", { count: result.added, invalid: result.invalid || 0 }) });
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
        setFileMessage(t(language, "searchingFile"));
        try {
            const result = await withTimeout(importDefault(), t(language, "timeout"));
            if (!result.success)
                throw new Error(result.error || t(language, "fileReadError"));
            setFileMessage(t(language, "fileResult", { count: result.repos?.length || 0,
                file: result.file || "repos.txt", invalid: result.invalid || 0 }));
            await refreshRepos();
            toaster.toast({ title: t(language, "importDone"), body: t(language, "imported", { count: result.added || 0 }) });
        }
        catch (error) {
            setFileMessage(backendMessage(language, error instanceof Error ? error.message : String(error)));
            showError(error);
        }
        finally {
            setBusy(false);
        }
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
            if (!result.success)
                throw new Error(result.error || t(language, "checkFailed"));
            sawRunning.current = true;
            setProgress({ running: true, percent: 0, index: 0, total: repos.length,
                repo: "", phase: "repos.txt einlesen", bytes_done: 0, bytes_total: 0,
                started: Date.now() / 1000, completed_at: 0, rows: [] });
        }
        catch (error) {
            setStatus(t(language, "checkFailed"));
            setErrors([String(error)]);
            showError(error);
        }
        finally {
            setBusy(false);
        }
    };
    const saveMode = async (mode) => {
        setBusy(true);
        try {
            const result = await setUpdateMode(mode);
            if (!result.success)
                throw new Error(result.error || t(language, "actionFailed"));
            setMode(mode);
            toaster.toast({ title: t(language, "modeSaved"), body: t(language, mode === "ask" ? "askDescription" : "autoDescription") });
        }
        catch (error) {
            showError(error);
        }
        finally {
            setBusy(false);
        }
    };
    const decide = async (repo, install) => {
        setBusy(true);
        try {
            const result = await (install ? approvePending(repo) : declinePending(repo));
            if (!result.success)
                throw new Error(result.error || t(language, "actionFailed"));
            setOpenedNotes("");
            await refreshRepos();
            setProgress(await getCheckStatus());
            // Advance the popup queue only after an explicit, successful decision.
            resumePrompts();
            if (result.restart_scheduled)
                setStatus(t(language, "restartSoon"));
            toaster.toast({ title: t(language, install ? "approvalSaved" : "approvalDeclined"),
                body: result.restart_scheduled ? t(language, "restartSoon") : undefined });
        }
        catch (error) {
            blockPrompts();
            showError(error);
        }
        finally {
            setBusy(false);
        }
    };
    const retrySteamRestart = async () => {
        setBusy(true);
        try {
            const result = await withTimeout(retryRestart(), t(language, "timeout"));
            if (!result.success)
                throw new Error(result.error || t(language, "actionFailed"));
            setRestartError("");
            setRestartErrorDetail("");
            restartRequested.current = false;
            setStatus(t(language, "restartSoon"));
            await refreshRepos(true);
        }
        catch (error) {
            showError(error);
        }
        finally {
            setBusy(false);
        }
    };
    SP_REACT.useEffect(() => {
        if (showCatalog || updateMode !== "ask" || !progress || progress.running || busy || promptBlocked
            || approvalSession.blocked || approvalModal.current)
            return;
        const item = pendingUpdates.find(update => !promptedReleases.current.has(`${update.repo}:${update.tag}`));
        if (!item)
            return;
        promptedReleases.current.add(`${item.repo}:${item.tag}`);
        saveApprovalSession();
        let handle = null;
        let decisionStarted = false;
        const close = () => {
            if (!decisionStarted)
                blockPrompts();
            if (approvalModal.current === handle)
                approvalModal.current = null;
            handle?.Close();
        };
        const choose = (install) => {
            if (decisionStarted)
                return;
            decisionStarted = true;
            close();
            void decide(item.repo, install);
        };
        try {
            handle = DFL.showModal(SP_JSX.jsx(DFL.ModalRoot, { onCancel: close, bDisableBackgroundDismiss: true, children: SP_JSX.jsxs("div", { style: { maxWidth: 500, overflowWrap: "anywhere" }, children: [SP_JSX.jsx("strong", { children: item.name }), SP_JSX.jsxs("div", { style: { ...small, marginTop: 5 }, children: [item.repo, " \u00B7 ", item.installed_version || t(language, "notInstalled"), " \u2192 ", item.version] }), SP_JSX.jsx("div", { style: { ...small, marginTop: 12 }, children: t(language, "notes") }), SP_JSX.jsx("div", { style: { maxHeight: 240, overflowY: "auto", whiteSpace: "pre-wrap", fontSize: 13,
                                lineHeight: 1.45, marginTop: 12 }, children: item.changelog || t(language, "noNotes") }), SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }, children: [SP_JSX.jsx(CompactButton, { onClick: () => choose(true), children: t(language, "approve") }), SP_JSX.jsx(CompactButton, { onClick: () => choose(false), children: t(language, "decline") })] })] }) }), undefined, { strTitle: t(language, "approvalTitle", { count: pendingUpdates.length }),
                fnOnClose: () => {
                    if (approvalModal.current === handle)
                        approvalModal.current = null;
                    if (!decisionStarted)
                        blockPrompts();
                } });
            approvalModal.current = handle;
        }
        catch (error) {
            // The approval cards below still work if Steam's modal API is unavailable.
            blockPrompts();
            showError(error);
        }
    }, [showCatalog, updateMode, pendingUpdates, progress?.running, busy, promptBlocked, popupAttempt, language]);
    const checking = busy || !!progress?.running;
    const elapsed = progress?.running && progress.started ? Math.max(0, Math.floor(now / 1000 - progress.started)) : 0;
    const transferred = progress?.bytes_done ? ` · ${(progress.bytes_done / 1048576).toFixed(1)}${progress.bytes_total
        ? ` / ${(progress.bytes_total / 1048576).toFixed(1)}` : ""} MiB` : "";
    const rows = progress?.rows?.length ? progress.rows : repos.map(repo => ({
        repo, name: matches[repo]?.name || repo.split("/")[1] || repo,
        previous: matches[repo]?.version || "", version: "", state: "pending", message: "",
    }));
    const summary = progress?.running
        ? t(language, "phaseStatus", { index: progress.index, total: progress.total,
            phase: phaseName(language, progress.phase), transferred, elapsed })
        : status || (progress?.completed_at
            ? t(language, "lastCheck", { date: new Date(progress.completed_at * 1000).toLocaleString(language) })
            : t(language, "noCheck"));
    if (showCatalog)
        return SP_JSX.jsx("div", { style: { padding: "0 8px" }, children: SP_JSX.jsx(CatalogBrowser, { language: language, onClose: () => setShowCatalog(false), onReposChanged: () => void refreshRepos(true) }) });
    return SP_JSX.jsxs("div", { children: [updateMode === "ask" && pendingUpdates.length > 0 && SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "approvalTitle", { count: pendingUpdates.length }), children: [progress?.running && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "waitForScan") }) }), !progress?.running && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => {
                                approvalModal.current?.Close();
                                approvalModal.current = null;
                                promptedReleases.current.clear();
                                saveApprovalSession();
                                resumePrompts();
                                setPopupAttempt(value => value + 1);
                            }, children: t(language, "resumeApprovals") }) }), pendingUpdates.map(item => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { background: "#213149", borderRadius: 9, padding: 10, width: "100%", minWidth: 0,
                                boxSizing: "border-box", color: "#edf5ff" }, children: [SP_JSX.jsx("strong", { style: { fontSize: 13, overflowWrap: "anywhere" }, children: item.name }), SP_JSX.jsxs("div", { style: { fontSize: 11, color: colors.muted, overflowWrap: "anywhere", marginTop: 3 }, children: [item.repo, " \u00B7 ", item.installed_version || t(language, "notInstalled"), " \u2192 ", item.version] }), SP_JSX.jsx("div", { style: { marginTop: 8 }, children: SP_JSX.jsx(CompactButton, { onClick: () => setOpenedNotes(openedNotes === item.repo ? "" : item.repo), children: openedNotes === item.repo ? t(language, "hideNotes") : t(language, "notes") }) }), openedNotes === item.repo && SP_JSX.jsx("div", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere",
                                        maxHeight: 180, overflowY: "auto", fontSize: 11, lineHeight: 1.5, margin: "9px 0",
                                        padding: 8, background: "#111b2b", borderRadius: 7 }, children: item.changelog || t(language, "noNotes") }), SP_JSX.jsxs("div", { style: { display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }, children: [SP_JSX.jsx(CompactButton, { disabled: busy || !!progress?.running, onClick: () => void decide(item.repo, true), children: busy ? t(language, "processing") : t(language, "approve") }), SP_JSX.jsx(CompactButton, { disabled: busy || !!progress?.running, onClick: () => void decide(item.repo, false), children: t(language, "decline") })] })] }) }, item.repo))] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "updates"), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", minWidth: 0, boxSizing: "border-box",
                                padding: 12, borderRadius: 12, color: "#edf5ff",
                                background: "linear-gradient(145deg, #142338, #101827)", border: "1px solid #304761" }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }, children: [SP_JSX.jsx("div", { style: { width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
                                                background: "#243950", color: colors.cyan, flexShrink: 0 }, children: SP_JSX.jsx(FaGithub, { size: 18 }) }), SP_JSX.jsx("strong", { style: { fontSize: 15, flex: 1, minWidth: 0 }, children: "GitHub Updates" }), SP_JSX.jsx("span", { style: { color: colors.muted, fontSize: 11, whiteSpace: "nowrap" }, children: t(language, "reposBadge", { count: repos.length }) })] }), SP_JSX.jsx("div", { style: { height: 7, borderRadius: 7, overflow: "hidden", background: "#2b3e56" }, role: "progressbar", "aria-label": t(language, "progress"), "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": progress?.running ? progress.percent : progress?.completed_at ? 100 : 0, children: SP_JSX.jsx("div", { style: { height: "100%", width: `${progress?.running ? progress.percent : progress?.completed_at ? 100 : 0}%`,
                                            background: `linear-gradient(90deg, #33c5e9, ${colors.cyan})`, borderRadius: 7 } }) }), SP_JSX.jsx("div", { style: { color: colors.muted, fontSize: 11, marginTop: 7, marginBottom: 11,
                                        overflowWrap: "anywhere" }, children: summary }), progress?.running && progress.repo && SP_JSX.jsx("div", { style: { color: colors.cyan, fontSize: 11,
                                        overflowWrap: "anywhere", marginBottom: 8 }, children: progress.repo }), rows.slice(0, showAllRows ? rows.length : 4).map(row => SP_JSX.jsxs("div", { title: row.repo, style: { display: "flex", alignItems: "center", gap: 9, minWidth: 0,
                                        padding: "9px 8px", marginTop: 5, borderRadius: 8, background: "#202e42" }, children: [SP_JSX.jsx("span", { style: { width: 20, flexShrink: 0, color: colors.cyan }, children: SP_JSX.jsx(FaDownload, { size: 13 }) }), SP_JSX.jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [SP_JSX.jsx("div", { style: { fontSize: 12, fontWeight: 600, overflowWrap: "anywhere" }, children: row.name }), SP_JSX.jsx("div", { style: { fontSize: 11, color: row.state === "error" ? colors.red : colors.muted,
                                                        overflowWrap: "anywhere", lineHeight: 1.35 }, children: rowSubtitle(language, row) })] }), SP_JSX.jsx("span", { style: { flexShrink: 0 }, children: SP_JSX.jsx(CheckIcon, { state: row.state }) })] }, row.repo)), rows.length > 4 && SP_JSX.jsx("div", { style: { marginTop: 9 }, children: SP_JSX.jsx(CompactButton, { onClick: () => setShowAllRows(!showAllRows), children: showAllRows ? t(language, "fewerRows") : t(language, "allRows", { count: rows.length }) }) }), !rows.length && SP_JSX.jsx("div", { style: { fontSize: 12, color: colors.muted }, children: t(language, "noRepos") })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { disabled: checking || restarting || (restartPending && !restartError) || pendingUpdates.length > 0, onClick: () => void check(), children: [SP_JSX.jsx(FaDownload, {}), " ", checking ? t(language, "checking") : t(language, "check")] }) }), restartError && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { color: colors.red, fontSize: 12 }, children: [t(language, restartError === "restartSignalFailed" ? "restartSignalFailed" : "restartLaunchFailed"), restartErrorDetail && SP_JSX.jsx("div", { style: { fontSize: 11, marginTop: 5, overflowWrap: "anywhere" }, children: restartErrorDetail }), SP_JSX.jsx("div", { style: { marginTop: 8 }, children: SP_JSX.jsx(CompactButton, { disabled: busy || !!progress?.running, onClick: () => void retrySteamRestart(), children: t(language, "retryRestart") }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: updateMode === "automatic"
                                ? t(language, "autoRestart") : t(language, "askDescription") }) }), errors.length > 2 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => setShowErrors(!showErrors), children: showErrors ? t(language, "hideErrors") : t(language, "allErrors", { count: errors.length }) }) }), (showErrors ? errors : errors.slice(0, 2)).map((error, index) => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "0.85em", color: "#ffaaaa", overflowWrap: "anywhere" }, children: error }) }, index))] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "settings"), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "modeTitle") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Dropdown, { rgOptions: [
                                { label: t(language, "automatic"), data: "automatic" },
                                { label: t(language, "ask"), data: "ask" },
                            ], selectedOption: updateMode, disabled: checking || pendingUpdates.length > 0, onChange: item => void saveMode(item.data) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, updateMode === "ask" ? "askDescription" : "autoDescription") }) })] }), SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { disabled: checking || restarting || pendingUpdates.length > 0, onClick: () => setShowCatalog(true), children: [SP_JSX.jsx(FaSearch, {}), " ", t(language, "browsePlugins")] }) }) }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "repositories", { count: repos.length }), children: [repos.length > 0 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { ...spaced, flexWrap: "wrap" }, children: SP_JSX.jsxs(CompactButton, { onClick: () => setShowRepos(!showRepos), children: [SP_JSX.jsx(FaChevronDown, {}), " ", showRepos ? t(language, "closeList") : t(language, "showList")] }) }) }), showRepos && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => void refreshRepos(), children: t(language, "refreshInstalled") }) }), showRepos && repos.map(repo => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { children: [SP_JSX.jsx("div", { style: { ...spaced }, children: SP_JSX.jsxs("span", { style: { fontSize: "0.86em", overflowWrap: "anywhere" }, children: [SP_JSX.jsx(FaGithub, {}), " ", repo] }) }), SP_JSX.jsx("div", { style: small, children: matches[repo] ? t(language, "installedVersion", { name: matches[repo]?.name || "",
                                        version: matches[repo]?.version || "" })
                                        : matchReasons[repo] ? backendMessage(language, matchReasons[repo] || "") : t(language, "missing") }), SP_JSX.jsx(CompactButton, { disabled: !installed.length, onClick: () => {
                                        setMappingRepo(mappingRepo === repo ? "" : repo);
                                        setMappingIndex(Math.max(0, installed.findIndex(p => p.folder === matches[repo]?.folder)));
                                    }, children: t(language, "assign") })] }) }, repo)), showRepos && mappingRepo && installed.length > 0 && SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "pluginFor", { repo: mappingRepo }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Dropdown, { rgOptions: installed.map((plugin, index) => ({ label: `${plugin.name} (${plugin.version})`, data: index })), selectedOption: mappingIndex, onChange: item => setMappingIndex(Number(item.data)) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => void mutate(async () => {
                                        const result = await setMapping(mappingRepo, installed[mappingIndex].folder);
                                        if (result.success)
                                            setMappingRepo("");
                                        return result;
                                    }), children: t(language, "saveAssignment") }) })] })] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "import"), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: backendVersion ? `Backend v${backendVersion}` : t(language, "disconnected") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { onClick: () => setShowImport(!showImport), children: [SP_JSX.jsx(FaFileUpload, {}), " ", showImport ? t(language, "close") : t(language, "openFile")] }) }), showImport && SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { ...small, overflowWrap: "anywhere" }, children: fileMessage || t(language, "importInfo") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => void importKnownFile(), children: t(language, "reloadFile") }) })] })] })] });
}
var index = definePlugin(() => ({
    name: "Github Plugin Updater",
    titleView: SP_JSX.jsx("div", { style: { fontSize: 19, lineHeight: "24px", fontWeight: 600 }, children: "GitHub Updates" }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaGithub, {}),
}));

export { index as default };
//# sourceMappingURL=index.js.map
