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
}function FaGlobe (props) {
  return GenIcon({"attr":{"viewBox":"0 0 496 512"},"child":[{"tag":"path","attr":{"d":"M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z"},"child":[]}]})(props);
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
    appTitle: "GitHub Updates",
    languageLabel: "Language", languageAuto: "Automatic from Steam", languageName: "English",
    disconnected: "Backend unavailable", unknownBackend: "Unknown backend version",
    timeout: "Decky backend did not respond within 12 seconds.",
    repoNotFound: "GitHub repository not found or not public.",
    error: "Error", updatedList: "Repository list updated", saved: "Saved",
    added: "{count} added, {invalid} invalid lines.",
    noCheck: "No check performed yet", checkingReleases: "Checking GitHub releases…",
    finished: "{updated} installed · {skipped} skipped · {errors} errors · {pending} awaiting approval",
    finishedToast: "Check complete", restartSoon: "Steam UI will restart shortly",
    restartSignalFailed: "Steam UI could not be restarted. Check that Steam is running or restart it manually.",
    restartLaunchFailed: "Automatic restart could not be scheduled. Restart Steam and Decky manually or try again.",
    retryRestart: "Try restart again",
    checkFailed: "Check failed", checking: "Checking…", check: "Check for updates",
    updates: "Updates", reposBadge: "{count} repos", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
    lastCheck: "Last check: {date}", runningRepo: "Checking {repo}",
    noRepos: "No repositories followed. Add plugins from the catalog.",
    autoRestart: "New versions are installed. Afterward, the Steam UI restarts.",
    allRows: "Show all {count}", fewerRows: "Show fewer", allErrors: "Show all {count} errors",
    hideErrors: "Hide errors", repositories: "Followed repositories ({count})",
    showList: "Show list", closeList: "Close list", refreshInstalled: "Refresh installations",
    installedVersion: "{name} · installed: {version}", missing: "Not installed · newest version will be installed",
    assign: "Assign", pluginFor: "Installed plugin for {repo}", saveAssignment: "Save assignment",
    settings: "Settings", storageLabel: "Repository storage", storageInfo: "Stored in Decky settings", modeTitle: "Installation mode", automatic: "Install automatically",
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
    phaseFile: "Loading repository list", phaseRelease: "Checking release", phaseDownload: "Downloading ZIP",
    phaseInstall: "Installing ZIP", phaseCompleteRepo: "Repository complete", phaseComplete: "Check complete",
    progress: "Update progress", awaitingBadge: "{count} awaiting approval",
    browsePlugins: "Browse Decky Plugins", catalogTitle: "Browse Decky Plugins", catalogBack: "Back",
    catalogIntro: "Find a plugin and add its GitHub repository to the Updater. The next check will consider it.",
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
    githubSearchTitle: "Search GitHub", githubSearchIntro: "Search GitHub by plugin name, owner/repo or URL. Check the release ZIP before installing.",
    githubSearchHint: "Plugin name, owner/repo or GitHub URL", githubSearchButton: "Search GitHub",
    githubSearchResults: "GitHub repositories", githubArchived: "Archived", searchFailed: "GitHub search failed",
    otherVersions: "Other versions", releaseTitle: "Versions · {repo}", releaseList: "Release ZIPs",
    releaseIntro: "Choose a ZIP to install. Older versions and prereleases may replace an installed plugin.",
    releaseFailed: "Could not load releases", prerelease: "Prerelease", selectedTitle: "Confirm installation",
    selectedConfirm: "Install {version}?", selectedCancel: "No, cancel", selectedInstall: "Select version",
    selectedReplace: "Installed: {version}. This choice may replace it with an older version.",
    selectedNew: "This version will be installed as a new plugin and added to your followed repositories.",
    selectedInstalled: "Installed: {version}", pinnedVersion: "Selected version: {version} · automatic updates paused",
    followLatest: "Follow latest version",
    installedPlugins: "Installed plugins ({count})", unknownRepository: "GitHub repository unknown",
    selfUpdateInfo: "This updater checks its own GitHub releases automatically and installs newer versions, even when 'Ask before installing' is selected. No repository entry is needed.",
    importTitle: "Import from Downloads", importDescription: "Found {file}. Add its GitHub links to the followed list; existing entries stay unchanged.",
    importButton: "Import repos.txt", importDone: "Import complete",
    importSummary: "{added} added · {existing} already present · {invalid} invalid lines",
    importMissing: "No repos.txt found in a Downloads folder.",
    importTooLarge: "repos.txt is larger than 128 KB.",
    importUnreadable: "Could not read repos.txt as a UTF-8 text file.",
    importTimeout: "Reading repos.txt took too long. Please try again.",
    importCheckRunning: "Wait for the current update check before importing.",
    importSaveFailed: "Could not save the imported repositories.",
};
const messages = {
    en,
    de: {
        appTitle: "GitHub-Updates",
        languageLabel: "Sprache", languageAuto: "Automatisch aus Steam", languageName: "Deutsch",
        disconnected: "Keine Backend-Verbindung", unknownBackend: "Backend-Version unbekannt",
        timeout: "Keine Antwort vom Decky-Backend nach 12 Sekunden.",
        repoNotFound: "GitHub-Repository nicht gefunden oder nicht öffentlich.",
        error: "Fehler", updatedList: "Repository-Liste aktualisiert", saved: "Gespeichert",
        added: "{count} hinzugefügt, {invalid} ungültige Zeilen.",
        noCheck: "Noch keine Prüfung durchgeführt", checkingReleases: "GitHub-Releases werden geprüft …",
        finished: "{updated} installiert · {skipped} übersprungen · {errors} Fehler · {pending} zur Freigabe",
        finishedToast: "Prüfung abgeschlossen", restartSoon: "Steam-Oberfläche startet gleich neu",
        restartSignalFailed: "Die Steam-Oberfläche konnte nicht neu gestartet werden. Prüfe, ob Steam läuft, oder starte es manuell neu.",
        restartLaunchFailed: "Der automatische Neustart konnte nicht eingeplant werden. Starte Steam und Decky manuell neu oder versuche es erneut.",
        retryRestart: "Neustart erneut versuchen",
        checkFailed: "Prüfung fehlgeschlagen", checking: "Prüfe …", check: "Updates prüfen",
        updates: "Updates", reposBadge: "{count} Repos", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
        lastCheck: "Letzte Prüfung: {date}", runningRepo: "Prüfe {repo}",
        noRepos: "Keine Repositories abonniert. Füge Plugins über den Katalog hinzu.",
        autoRestart: "Neue Versionen werden installiert. Danach startet die Steam-Oberfläche neu.",
        allRows: "Alle {count} anzeigen", fewerRows: "Weniger anzeigen", allErrors: "Alle {count} Fehler anzeigen",
        hideErrors: "Fehler einklappen", repositories: "Überwachte Repositories ({count})",
        showList: "Liste anzeigen", closeList: "Liste schließen", refreshInstalled: "Installationen aktualisieren",
        installedVersion: "{name} · installiert: {version}", missing: "Nicht installiert · neueste Version wird installiert",
        assign: "Zuordnen", pluginFor: "Installiertes Plugin für {repo}", saveAssignment: "Zuordnung speichern",
        settings: "Einstellungen", storageLabel: "Repository-Speicher", storageInfo: "In Decky-Einstellungen gespeichert", modeTitle: "Installationsmodus", automatic: "Immer installieren",
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
        phaseFile: "Repository-Liste laden", phaseRelease: "Release prüfen", phaseDownload: "ZIP herunterladen",
        phaseInstall: "ZIP installieren", phaseCompleteRepo: "Repository abgeschlossen", phaseComplete: "Prüfung abgeschlossen",
        progress: "Update-Fortschritt", awaitingBadge: "{count} zur Freigabe",
        browsePlugins: "Decky-Plugins durchsuchen", catalogTitle: "Decky-Plugins durchsuchen", catalogBack: "Zurück",
        catalogIntro: "Plugin suchen und sein GitHub-Repository zum Updater hinzufügen. Es wird bei der nächsten Prüfung berücksichtigt.",
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
        githubSearchTitle: "GitHub durchsuchen", githubSearchIntro: "Suche nach Plugin-Name, Owner/Repo oder URL. Prüfe die Release-ZIP vor der Installation.",
        githubSearchHint: "Plugin-Name, Owner/Repo oder GitHub-URL", githubSearchButton: "Auf GitHub suchen",
        githubSearchResults: "GitHub-Repositories", githubArchived: "Archiviert", searchFailed: "GitHub-Suche fehlgeschlagen",
        otherVersions: "Andere Versionen", releaseTitle: "Versionen · {repo}", releaseList: "Release-ZIPs",
        releaseIntro: "Wähle eine ZIP zur Installation. Ältere Versionen und Vorabversionen können ein installiertes Plugin ersetzen.",
        releaseFailed: "Releases konnten nicht geladen werden", prerelease: "Vorabversion", selectedTitle: "Installation bestätigen",
        selectedConfirm: "{version} installieren?", selectedCancel: "Nein, abbrechen", selectedInstall: "Version auswählen",
        selectedReplace: "Installiert: {version}. Die Auswahl kann eine ältere Version darüber installieren.",
        selectedNew: "Diese Version wird neu installiert und zu den überwachten Repositories hinzugefügt.",
        selectedInstalled: "Installiert: {version}", pinnedVersion: "Gewählte Version: {version} · automatische Updates pausiert",
        followLatest: "Wieder neueste Version verfolgen",
        installedPlugins: "Installierte Plugins ({count})", unknownRepository: "GitHub-Repository unbekannt",
        selfUpdateInfo: "Der Updater prüft seine eigenen GitHub-Releases und installiert neuere Versionen automatisch – auch bei „Vor Installation fragen“. Ein Repository-Eintrag ist nicht nötig.",
        importTitle: "Aus Downloads importieren", importDescription: "Datei gefunden: {file}. Neue GitHub-Links zur internen Liste hinzufügen; vorhandene Einträge bleiben erhalten.",
        importButton: "repos.txt importieren", importDone: "Import abgeschlossen",
        importSummary: "{added} hinzugefügt · {existing} bereits vorhanden · {invalid} ungültige Zeilen",
        importMissing: "Keine repos.txt in einem Downloads-Ordner gefunden.",
        importTooLarge: "Die repos.txt ist größer als 128 KB.",
        importUnreadable: "Die repos.txt konnte nicht als UTF-8-Textdatei gelesen werden.",
        importTimeout: "Das Einlesen der repos.txt dauerte zu lange. Bitte erneut versuchen.",
        importCheckRunning: "Bitte erst die laufende Update-Prüfung abschließen.",
        importSaveFailed: "Die importierten Repositories konnten nicht gespeichert werden.",
    },
    es: {
        appTitle: "Actualizaciones de GitHub",
        languageLabel: "Idioma", languageAuto: "Automático según Steam", languageName: "Español",
        disconnected: "Backend no disponible", unknownBackend: "Versión del backend desconocida",
        timeout: "El backend de Decky no respondió en 12 segundos.",
        repoNotFound: "Repositorio de GitHub inexistente o no público.",
        error: "Error", updatedList: "Lista de repositorios actualizada", saved: "Guardado",
        added: "{count} añadidos, {invalid} líneas no válidas.",
        noCheck: "Aún no se ha comprobado", checkingReleases: "Comprobando versiones de GitHub…",
        finished: "{updated} instalados · {skipped} omitidos · {errors} errores · {pending} por aprobar",
        finishedToast: "Comprobación terminada", restartSoon: "La interfaz de Steam se reiniciará pronto",
        restartSignalFailed: "No se pudo reiniciar la interfaz de Steam. Comprueba que Steam esté abierto o reinícialo manualmente.",
        restartLaunchFailed: "No se pudo programar el reinicio. Reinicia Steam y Decky manualmente o inténtalo de nuevo.",
        retryRestart: "Reintentar el reinicio",
        checkFailed: "La comprobación ha fallado", checking: "Comprobando…", check: "Buscar actualizaciones",
        updates: "Actualizaciones", reposBadge: "{count} repos", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
        lastCheck: "Última comprobación: {date}", runningRepo: "Comprobando {repo}",
        noRepos: "No hay repositorios seguidos. Añade plugins desde el catálogo.",
        autoRestart: "Se instalan las nuevas versiones. Después se reinicia la interfaz de Steam.",
        allRows: "Mostrar los {count}", fewerRows: "Mostrar menos", allErrors: "Mostrar los {count} errores",
        hideErrors: "Ocultar errores", repositories: "Repositorios seguidos ({count})",
        showList: "Mostrar lista", closeList: "Cerrar lista", refreshInstalled: "Actualizar instalaciones",
        installedVersion: "{name} · instalado: {version}", missing: "No instalado · se instalará la última versión",
        assign: "Asignar", pluginFor: "Plugin instalado para {repo}", saveAssignment: "Guardar asignación",
        settings: "Ajustes", storageLabel: "Almacenamiento", storageInfo: "Guardado en los ajustes de Decky", modeTitle: "Modo de instalación", automatic: "Instalar siempre",
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
        phaseFile: "Cargando repositorios", phaseRelease: "Comprobando versión", phaseDownload: "Descargando ZIP",
        phaseInstall: "Instalando ZIP", phaseCompleteRepo: "Repositorio terminado", phaseComplete: "Comprobación terminada",
        progress: "Progreso de actualización", awaitingBadge: "{count} por aprobar",
        browsePlugins: "Explorar plugins de Decky", catalogTitle: "Explorar plugins de Decky", catalogBack: "Volver",
        catalogIntro: "Busca un plugin y añade su repositorio de GitHub al actualizador. Se tendrá en cuenta en la próxima comprobación.",
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
        githubSearchTitle: "Buscar en GitHub", githubSearchIntro: "Busca por nombre del plugin, owner/repo o URL. Revisa el ZIP antes de instalar.",
        githubSearchHint: "Nombre, owner/repo o URL de GitHub", githubSearchButton: "Buscar en GitHub",
        githubSearchResults: "Repositorios de GitHub", githubArchived: "Archivado", searchFailed: "Error en la búsqueda de GitHub",
        otherVersions: "Otras versiones", releaseTitle: "Versiones · {repo}", releaseList: "ZIP de versiones",
        releaseIntro: "Elige un ZIP. Las versiones anteriores o preliminares pueden sustituir al plugin instalado.",
        releaseFailed: "No se pudieron cargar las versiones", prerelease: "Versión preliminar", selectedTitle: "Confirmar instalación",
        selectedConfirm: "¿Instalar {version}?", selectedCancel: "No, cancelar", selectedInstall: "Elegir versión",
        selectedReplace: "Instalado: {version}. Esta elección puede sustituirlo por una versión anterior.",
        selectedNew: "Esta versión se instalará y añadirá a los repositorios seguidos.",
        selectedInstalled: "Instalado: {version}", pinnedVersion: "Versión elegida: {version} · actualizaciones automáticas en pausa",
        followLatest: "Seguir la última versión",
        installedPlugins: "Plugins instalados ({count})", unknownRepository: "Repositorio de GitHub desconocido",
        selfUpdateInfo: "El Updater comprueba e instala automáticamente sus nuevas versiones, incluso con «Preguntar antes de instalar». No hace falta añadir su repositorio.",
        importTitle: "Importar desde Descargas", importDescription: "Archivo encontrado: {file}. Añade sus enlaces de GitHub a la lista sin cambiar las entradas existentes.",
        importButton: "Importar repos.txt", importDone: "Importación completada",
        importSummary: "{added} añadidos · {existing} ya existentes · {invalid} líneas no válidas",
        importMissing: "No se encontró repos.txt en Descargas.",
        importTooLarge: "repos.txt supera los 128 KB.",
        importUnreadable: "No se pudo leer repos.txt como archivo de texto UTF-8.",
        importTimeout: "La lectura de repos.txt tardó demasiado. Inténtalo de nuevo.",
        importCheckRunning: "Espera a que termine la comprobación de actualizaciones.",
        importSaveFailed: "No se pudieron guardar los repositorios importados.",
    },
    fr: {
        appTitle: "Mises à jour GitHub",
        languageLabel: "Langue", languageAuto: "Automatique selon Steam", languageName: "Français",
        disconnected: "Backend indisponible", unknownBackend: "Version du backend inconnue",
        timeout: "Aucune réponse du backend Decky après 12 secondes.",
        repoNotFound: "Dépôt GitHub introuvable ou non public.",
        error: "Erreur", updatedList: "Liste des dépôts mise à jour", saved: "Enregistré",
        added: "{count} ajoutés, {invalid} lignes invalides.",
        noCheck: "Aucune vérification effectuée", checkingReleases: "Vérification des versions GitHub…",
        finished: "{updated} installés · {skipped} ignorés · {errors} erreurs · {pending} à approuver",
        finishedToast: "Vérification terminée", restartSoon: "L'interface Steam va redémarrer",
        restartSignalFailed: "Impossible de redémarrer l'interface Steam. Vérifiez que Steam fonctionne ou redémarrez-le manuellement.",
        restartLaunchFailed: "Impossible de programmer le redémarrage. Redémarrez Steam et Decky manuellement ou réessayez.",
        retryRestart: "Réessayer le redémarrage",
        checkFailed: "Échec de la vérification", checking: "Vérification…", check: "Vérifier les mises à jour",
        updates: "Mises à jour", reposBadge: "{count} dépôts", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed}s",
        lastCheck: "Dernière vérification : {date}", runningRepo: "Vérification de {repo}",
        noRepos: "Aucun dépôt suivi. Ajoutez des plugins depuis le catalogue.",
        autoRestart: "Les nouvelles versions sont installées. L'interface Steam redémarre ensuite.",
        allRows: "Afficher les {count}", fewerRows: "Afficher moins", allErrors: "Afficher les {count} erreurs",
        hideErrors: "Masquer les erreurs", repositories: "Dépôts suivis ({count})",
        showList: "Afficher la liste", closeList: "Fermer la liste", refreshInstalled: "Actualiser les installations",
        installedVersion: "{name} · installé : {version}", missing: "Non installé · dernière version à installer",
        assign: "Associer", pluginFor: "Plugin installé pour {repo}", saveAssignment: "Enregistrer l'association",
        settings: "Paramètres", storageLabel: "Stockage des dépôts", storageInfo: "Enregistré dans les paramètres Decky", modeTitle: "Mode d'installation", automatic: "Toujours installer",
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
        phaseFile: "Chargement des dépôts", phaseRelease: "Vérification de version", phaseDownload: "Téléchargement du ZIP",
        phaseInstall: "Installation du ZIP", phaseCompleteRepo: "Dépôt terminé", phaseComplete: "Vérification terminée",
        progress: "Progression de la mise à jour", awaitingBadge: "{count} à approuver",
        browsePlugins: "Parcourir les plugins Decky", catalogTitle: "Parcourir les plugins Decky", catalogBack: "Retour",
        catalogIntro: "Cherchez un plugin et ajoutez son dépôt GitHub à l'Updater. Il sera pris en compte lors de la prochaine vérification.",
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
        githubSearchTitle: "Rechercher sur GitHub", githubSearchIntro: "Recherchez par nom, owner/repo ou URL. Vérifiez le ZIP avant installation.",
        githubSearchHint: "Nom, owner/repo ou URL GitHub", githubSearchButton: "Rechercher sur GitHub",
        githubSearchResults: "Dépôts GitHub", githubArchived: "Archivé", searchFailed: "Recherche GitHub échouée",
        otherVersions: "Autres versions", releaseTitle: "Versions · {repo}", releaseList: "ZIP des versions",
        releaseIntro: "Choisissez un ZIP. Les versions précédentes ou préliminaires peuvent remplacer le plugin installé.",
        releaseFailed: "Impossible de charger les versions", prerelease: "Version préliminaire", selectedTitle: "Confirmer l'installation",
        selectedConfirm: "Installer {version} ?", selectedCancel: "Non, annuler", selectedInstall: "Choisir la version",
        selectedReplace: "Installée : {version}. Cette version peut la remplacer par une version précédente.",
        selectedNew: "Cette version sera installée et ajoutée aux dépôts suivis.",
        selectedInstalled: "Installée : {version}", pinnedVersion: "Version choisie : {version} · mises à jour automatiques suspendues",
        followLatest: "Suivre la dernière version",
        installedPlugins: "Plugins installés ({count})", unknownRepository: "Dépôt GitHub inconnu",
        selfUpdateInfo: "L'Updater vérifie et installe automatiquement ses nouvelles versions, même avec « Demander avant installation ». Aucun dépôt à ajouter.",
        importTitle: "Importer depuis Téléchargements", importDescription: "Fichier trouvé : {file}. Ajouter ses liens GitHub à la liste sans modifier les entrées existantes.",
        importButton: "Importer repos.txt", importDone: "Importation terminée",
        importSummary: "{added} ajoutés · {existing} déjà présents · {invalid} lignes invalides",
        importMissing: "Aucun repos.txt trouvé dans Téléchargements.",
        importTooLarge: "repos.txt dépasse 128 Ko.",
        importUnreadable: "Impossible de lire repos.txt comme fichier texte UTF-8.",
        importTimeout: "La lecture de repos.txt a pris trop de temps. Réessayez.",
        importCheckRunning: "Attendez la fin de la vérification des mises à jour.",
        importSaveFailed: "Impossible d'enregistrer les dépôts importés.",
    },
    ru: {
        appTitle: "Обновления GitHub",
        languageLabel: "Язык", languageAuto: "Автоматически по настройкам Steam", languageName: "Русский",
        disconnected: "Нет связи с серверной частью", unknownBackend: "Версия серверной части неизвестна",
        timeout: "Серверная часть Decky не ответила за 12 секунд.",
        repoNotFound: "Репозиторий GitHub не найден или не является публичным.",
        error: "Ошибка", updatedList: "Список репозиториев обновлён", saved: "Сохранено",
        added: "Добавлено: {count}, неверных строк: {invalid}.",
        noCheck: "Проверка ещё не выполнялась", checkingReleases: "Проверка релизов GitHub…",
        finished: "Установлено: {updated} · пропущено: {skipped} · ошибок: {errors} · ожидают: {pending}",
        finishedToast: "Проверка завершена", restartSoon: "Интерфейс Steam скоро перезапустится",
        restartSignalFailed: "Не удалось перезапустить интерфейс Steam. Проверьте, работает ли Steam, или перезапустите его вручную.",
        restartLaunchFailed: "Не удалось запланировать перезапуск. Перезапустите Steam и Decky вручную или попробуйте снова.",
        retryRestart: "Повторить перезапуск",
        checkFailed: "Ошибка проверки", checking: "Проверка…", check: "Проверить обновления",
        updates: "Обновления", reposBadge: "Репозиториев: {count}", phaseStatus: "{index}/{total} · {phase}{transferred} · {elapsed} с",
        lastCheck: "Последняя проверка: {date}", runningRepo: "Проверяется {repo}",
        noRepos: "Нет отслеживаемых репозиториев. Добавьте плагины из каталога.",
        autoRestart: "Новые версии устанавливаются, затем интерфейс Steam перезапускается.",
        allRows: "Показать все ({count})", fewerRows: "Показать меньше", allErrors: "Показать все ошибки ({count})",
        hideErrors: "Скрыть ошибки", repositories: "Отслеживаемые репозитории ({count})",
        showList: "Показать список", closeList: "Скрыть список", refreshInstalled: "Обновить список установленных",
        installedVersion: "{name} · установлено: {version}", missing: "Не установлен · будет установлена новая версия",
        assign: "Назначить", pluginFor: "Установленный плагин для {repo}", saveAssignment: "Сохранить назначение",
        settings: "Настройки", storageLabel: "Хранение репозиториев", storageInfo: "Сохранено в настройках Decky", modeTitle: "Режим установки", automatic: "Всегда устанавливать",
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
        phaseFile: "Загрузка списка репозиториев", phaseRelease: "Проверка релиза", phaseDownload: "Загрузка ZIP",
        phaseInstall: "Установка ZIP", phaseCompleteRepo: "Репозиторий обработан", phaseComplete: "Проверка завершена",
        progress: "Ход обновления", awaitingBadge: "Ожидают: {count}",
        browsePlugins: "Каталог плагинов Decky", catalogTitle: "Каталог плагинов Decky", catalogBack: "Назад",
        catalogIntro: "Найдите плагин и добавьте его репозиторий GitHub в Updater. Он будет учтён при следующей проверке.",
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
        githubSearchTitle: "Поиск на GitHub", githubSearchIntro: "Поиск по названию, owner/repo или URL. Проверьте ZIP перед установкой.",
        githubSearchHint: "Название, owner/repo или URL GitHub", githubSearchButton: "Искать на GitHub",
        githubSearchResults: "Репозитории GitHub", githubArchived: "В архиве", searchFailed: "Ошибка поиска GitHub",
        otherVersions: "Другие версии", releaseTitle: "Версии · {repo}", releaseList: "ZIP-файлы релизов",
        releaseIntro: "Выберите ZIP. Старые или предварительные версии могут заменить установленный плагин.",
        releaseFailed: "Не удалось загрузить релизы", prerelease: "Предварительная версия", selectedTitle: "Подтвердить установку",
        selectedConfirm: "Установить {version}?", selectedCancel: "Нет, отменить", selectedInstall: "Выбрать версию",
        selectedReplace: "Установлено: {version}. Выбор может заменить плагин более старой версией.",
        selectedNew: "Эта версия будет установлена и добавлена в отслеживаемые репозитории.",
        selectedInstalled: "Установлено: {version}", pinnedVersion: "Выбранная версия: {version} · автообновления приостановлены",
        followLatest: "Следить за последней версией",
        installedPlugins: "Установленные плагины ({count})", unknownRepository: "Репозиторий GitHub неизвестен",
        selfUpdateInfo: "Updater автоматически проверяет и устанавливает свои новые версии даже в режиме запроса подтверждения. Добавлять его репозиторий не требуется.",
        importTitle: "Импорт из Загрузок", importDescription: "Найден файл: {file}. Добавить ссылки GitHub в список, сохранив существующие записи.",
        importButton: "Импортировать repos.txt", importDone: "Импорт завершён",
        importSummary: "Добавлено: {added} · уже есть: {existing} · неверных строк: {invalid}",
        importMissing: "Файл repos.txt не найден в папке Загрузки.",
        importTooLarge: "Размер repos.txt превышает 128 КБ.",
        importUnreadable: "Не удалось прочитать repos.txt как текст UTF-8.",
        importTimeout: "Чтение repos.txt заняло слишком много времени. Повторите попытку.",
        importCheckRunning: "Дождитесь окончания проверки обновлений перед импортом.",
        importSaveFailed: "Не удалось сохранить импортированные репозитории.",
    },
};
function systemLanguage(value) {
    const code = String(value || "").trim().toLowerCase().replace(/[_-].*$/, "");
    if (code === "german" || code === "de")
        return "de";
    if (["spanish", "latamspanish", "spanishlatam", "spanishlatinamerica", "latam", "es"].includes(code))
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
const importReposFile = callable("import_repos_file");
const getCheckStatus = callable("get_check_status");
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
const startGithubSearch = callable("start_github_search");
const getGithubSearchStatus = callable("get_github_search_status");
const startReleaseLookup = callable("start_release_lookup");
const getReleaseStatus = callable("get_release_status");
const startSelectedInstall = callable("start_selected_install");
const clearVersionPin = callable("clear_version_pin");
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
function useSystemLanguage() {
    const [language, setLanguage] = SP_REACT.useState("en");
    SP_REACT.useEffect(() => {
        let active = true;
        let request = 0;
        const readLanguage = () => {
            const current = ++request;
            if (typeof SteamClient === "undefined" || !SteamClient.Settings?.GetCurrentLanguage) {
                if (active)
                    setLanguage("en");
                return;
            }
            try {
                void SteamClient.Settings.GetCurrentLanguage().then(value => {
                    if (active && current === request)
                        setLanguage(systemLanguage(value));
                }).catch(() => {
                    if (active && current === request)
                        setLanguage("en");
                });
            }
            catch {
                if (active && current === request)
                    setLanguage("en");
            }
        };
        readLanguage();
        let listener = null;
        try {
            if (typeof SteamClient !== "undefined" && SteamClient.Settings?.RegisterForSettingsChanges) {
                listener = SteamClient.Settings.RegisterForSettingsChanges(readLanguage);
            }
        }
        catch { /* The current language still works if Steam cannot register a listener. */ }
        return () => { active = false; try {
            listener?.unregister();
        }
        catch { /* Steam may already be gone. */ } };
    }, []);
    return language;
}
function LocalizedTitle() {
    const language = useSystemLanguage();
    return SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: t(language, "appTitle") });
}
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
    const reason = {
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
    const names = { "Repository-Liste laden": "phaseFile", "Release prüfen": "phaseRelease",
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
function CatalogBrowser({ language, onClose, onReposChanged, onVersions }) {
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
    return SP_JSX.jsxs("div", { style: { width: "100%", minWidth: 0, overflowWrap: "anywhere" }, children: [SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "catalogTitle"), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { onClick: onClose, children: ["\u2190 ", t(language, "catalogBack")] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "catalogIntro") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { onKeyDownCapture: event => {
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
                                } }) }) }), SP_JSX.jsxs(DFL.PanelSectionRow, { children: [SP_JSX.jsx("div", { style: small, children: t(language, "catalogSort") }), SP_JSX.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }, children: [["stars", "catalogStars"], ["downloads", "catalogDownloads"],
                                    ["recent", "catalogRecent"], ["name", "catalogName"]].map(([choice, label]) => SP_JSX.jsx(FilterButton, { selected: sort === choice, onClick: () => {
                                        setSort(choice);
                                        setPage(0);
                                    }, children: t(language, label) }, choice)) })] }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { onClick: () => setShowTags(value => !value), children: [t(language, "catalogTags"), ": ", tag || t(language, "catalogAllTags"), " ", showTags ? "▴" : "▾"] }) }), showTags && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6,
                                maxHeight: 185, overflowY: "auto" }, children: [SP_JSX.jsx(FilterButton, { selected: !tag, onClick: () => {
                                        setTag("");
                                        setPage(0);
                                        setShowTags(false);
                                    }, children: t(language, "catalogAllTags") }), topTags.map(([item, count]) => SP_JSX.jsxs(FilterButton, { selected: tag === item, onClick: () => {
                                        setTag(item);
                                        setPage(0);
                                        setShowTags(false);
                                    }, children: [item, " (", count, ")"] }, item))] }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "catalogResults", { count: filtered.length, total: plugins.length }), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: loading, onClick: () => void loadCatalog(true), children: t(language, "catalogRefresh") }) }), loading && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: small, children: [SP_JSX.jsx(FaCircleNotch, {}), " ", t(language, "catalogLoading")] }) }), error && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { color: colors.red, fontSize: 12 }, children: [t(language, "catalogFailed"), ": ", error, SP_JSX.jsx("div", { style: { marginTop: 8 }, children: SP_JSX.jsx(CompactButton, { onClick: () => void loadCatalog(true), children: t(language, "catalogRetry") }) })] }) }), !loading && !error && !filtered.length && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "catalogEmpty") }) }), filtered.slice(shownPage * 12, (shownPage + 1) * 12).map(plugin => {
                        const follows = trackedSet.has(plugin.repo.toLowerCase());
                        return SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Field, { label: plugin.name, icon: SP_JSX.jsx(FaGithub, {}), description: `${plugin.repo} · ${plugin.author}`, padding: "compact", childrenLayout: "below", bottomSeparator: "standard", children: [plugin.description && SP_JSX.jsx("div", { style: { fontSize: 12, lineHeight: 1.35, opacity: 0.82,
                                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }, children: plugin.description }), SP_JSX.jsxs("div", { style: { ...small, marginTop: 5 }, children: ["\u2605 ", plugin.stars, plugin.downloads > 0
                                                ? ` · ↓ ${plugin.downloads.toLocaleString(language)}` : "", " \u00B7 ", plugin.latest_tag
                                                ? t(language, "catalogRelease", { version: plugin.latest_tag }) : t(language, "catalogNoRelease")] }), plugin.tags.length > 0 && SP_JSX.jsx("div", { style: { ...small, marginTop: 4 }, children: plugin.tags.slice(0, 4).join(" · ") }), SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 8 }, children: [SP_JSX.jsx(CompactButton, { disabled: !!changing || loading, onClick: () => void toggleRepo(plugin.repo, !follows), children: changing === plugin.repo ? t(language, "processing") : t(language, follows ? "catalogRemove" : "catalogAdd") }), SP_JSX.jsx(CompactButton, { onClick: () => onVersions(plugin.repo), children: t(language, "otherVersions") }), SP_JSX.jsx("a", { href: `https://github.com/${plugin.repo}`, target: "_blank", rel: "noopener noreferrer", children: "GitHub \u2197" })] })] }) }, plugin.repo);
                    }), pageCount > 1 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center",
                                flexWrap: "wrap", gap: 8 }, children: [SP_JSX.jsx(CompactButton, { disabled: shownPage === 0, onClick: () => setPage(shownPage - 1), children: t(language, "catalogPrev") }), SP_JSX.jsx("span", { style: small, children: t(language, "catalogPage", { page: shownPage + 1, pages: pageCount }) }), SP_JSX.jsx(CompactButton, { disabled: shownPage + 1 >= pageCount, onClick: () => setPage(shownPage + 1), children: t(language, "catalogNext") })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "catalogNote") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("a", { href: "https://safetzahirovic.github.io/decky-plugins-explorer/", target: "_blank", rel: "noopener noreferrer", children: t(language, "catalogSource") }) })] })] });
}
function GithubSearch({ language, onClose, onVersions, onReposChanged }) {
    const [query, setQuery] = SP_REACT.useState("");
    const [status, setStatus] = SP_REACT.useState(null);
    const [changing, setChanging] = SP_REACT.useState("");
    const [error, setError] = SP_REACT.useState("");
    const active = SP_REACT.useRef(true);
    const read = async () => {
        try {
            const next = await withTimeout(getGithubSearchStatus(), t(language, "timeout"));
            if (active.current) {
                setStatus(next);
                setError("");
            }
        }
        catch (caught) {
            if (active.current)
                setError(String(caught));
        }
    };
    SP_REACT.useEffect(() => {
        active.current = true;
        void getGithubSearchStatus().then(next => {
            if (active.current) {
                setStatus(next);
                setQuery(next.query || "");
            }
        });
        const timer = window.setInterval(() => void read(), 1000);
        return () => { active.current = false; window.clearInterval(timer); };
    }, []);
    const search = async (page = 1) => {
        if (!query.trim())
            return;
        setError("");
        setStatus(previous => ({ running: true, query: query.trim(), page, plugins: [],
            tracked: previous?.tracked || [], has_more: false, error: "" }));
        try {
            const result = await withTimeout(startGithubSearch(query.trim(), page), t(language, "timeout"));
            if (!result.success)
                throw new Error(result.error || t(language, "searchFailed"));
            await read();
        }
        catch (caught) {
            setError(String(caught));
        }
    };
    const toggle = async (repo, follow) => {
        setChanging(repo);
        try {
            const result = await withTimeout(setCatalogRepo(repo, follow), t(language, "timeout"));
            if (!result.success)
                throw new Error(result.error || t(language, "actionFailed"));
            setStatus(previous => previous ? { ...previous, tracked: result.repos || [] } : previous);
            onReposChanged();
        }
        catch (caught) {
            toaster.toast({ title: t(language, "error"), body: String(caught) });
        }
        finally {
            setChanging("");
        }
    };
    const tracked = new Set((status?.tracked || []).map(repo => repo.toLowerCase()));
    return SP_JSX.jsxs("div", { style: { width: "100%", minWidth: 0, overflowWrap: "anywhere" }, children: [SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "githubSearchTitle"), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { onClick: onClose, children: ["\u2190 ", t(language, "catalogBack")] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "githubSearchIntro") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { onKeyDownCapture: event => {
                                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }, onKeyUpCapture: event => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }, children: SP_JSX.jsx(DFL.TextField, { label: t(language, "githubSearchHint"), value: query, onChange: event => setQuery(event.target.value) }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { disabled: !query.trim() || !!status?.running, onClick: () => void search(1), children: [SP_JSX.jsx(FaSearch, {}), " ", t(language, "githubSearchButton")] }) }), (error || status?.error) && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: colors.red, fontSize: 12 }, children: error || status?.error }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "githubSearchResults"), children: [status?.running && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: small, children: [SP_JSX.jsx(FaCircleNotch, {}), " ", t(language, "catalogLoading")] }) }), !status?.running && !!status?.query && !status?.plugins.length && !status?.error &&
                        SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "catalogEmpty") }) }), status?.plugins.map(plugin => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Field, { label: plugin.name, icon: SP_JSX.jsx(FaGithub, {}), description: plugin.repo, padding: "compact", childrenLayout: "below", bottomSeparator: "standard", children: [plugin.description && SP_JSX.jsx("div", { style: { ...small, marginTop: 6 }, children: plugin.description }), SP_JSX.jsxs("div", { style: { ...small, marginTop: 5 }, children: ["\u2605 ", plugin.stars, " \u00B7 ", plugin.author, plugin.archived ? ` · ${t(language, "githubArchived")}` : ""] }), SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }, children: [SP_JSX.jsx(CompactButton, { disabled: !!changing, onClick: () => void toggle(plugin.repo, !tracked.has(plugin.repo.toLowerCase())), children: changing === plugin.repo ? t(language, "processing") : t(language, tracked.has(plugin.repo.toLowerCase()) ? "catalogRemove" : "catalogAdd") }), SP_JSX.jsx(CompactButton, { onClick: () => onVersions(plugin.repo), children: t(language, "otherVersions") }), SP_JSX.jsx("a", { href: `https://github.com/${plugin.repo}`, target: "_blank", rel: "noopener noreferrer", children: "GitHub \u2197" })] })] }) }, plugin.repo)), !!status?.plugins.length && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [SP_JSX.jsx(CompactButton, { disabled: !!status?.running || status.page <= 1, onClick: () => void search(status.page - 1), children: t(language, "catalogPrev") }), SP_JSX.jsx("span", { style: small, children: status.page }), SP_JSX.jsx(CompactButton, { disabled: !!status?.running || !status.has_more || status.page >= 10, onClick: () => void search(status.page + 1), children: t(language, "catalogNext") })] }) })] })] });
}
function ReleaseBrowser({ repo, language, onClose, onStarted, onReposChanged }) {
    const [status, setStatus] = SP_REACT.useState(null);
    const [error, setError] = SP_REACT.useState("");
    const [busy, setBusy] = SP_REACT.useState(false);
    const active = SP_REACT.useRef(true);
    const read = async () => {
        try {
            const next = await withTimeout(getReleaseStatus(), t(language, "timeout"));
            if (active.current && next.repo.toLowerCase() === repo.toLowerCase())
                setStatus(next);
        }
        catch (caught) {
            if (active.current)
                setError(String(caught));
        }
    };
    const load = async (page) => {
        setError("");
        setStatus(previous => ({ running: true, repo, page, releases: [], has_more: false,
            tracked: previous?.tracked || [], pinned_versions: previous?.pinned_versions || {},
            installed_version: previous?.installed_version || "", error: "" }));
        try {
            const result = await withTimeout(startReleaseLookup(repo, page), t(language, "timeout"));
            if (!result.success)
                throw new Error(result.error || t(language, "releaseFailed"));
            await read();
        }
        catch (caught) {
            setError(String(caught));
        }
    };
    SP_REACT.useEffect(() => {
        active.current = true;
        void load(1);
        const timer = window.setInterval(() => void read(), 1000);
        return () => { active.current = false; window.clearInterval(timer); };
    }, [repo]);
    const select = (release) => {
        const warning = status?.installed_version
            ? t(language, "selectedReplace", { version: status.installed_version })
            : t(language, "selectedNew");
        let handle = null;
        const install = async () => {
            handle?.Close();
            setBusy(true);
            try {
                const result = await withTimeout(startSelectedInstall(release.token, true), t(language, "timeout"));
                if (!result.success)
                    throw new Error(result.error || t(language, "actionFailed"));
                onStarted();
            }
            catch (caught) {
                toaster.toast({ title: t(language, "error"), body: String(caught) });
            }
            finally {
                setBusy(false);
            }
        };
        handle = DFL.showModal(SP_JSX.jsx(DFL.ModalRoot, { onCancel: () => handle?.Close(), bDisableBackgroundDismiss: true, children: SP_JSX.jsxs("div", { style: { maxWidth: 500, overflowWrap: "anywhere" }, children: [SP_JSX.jsx("strong", { children: t(language, "selectedConfirm", { version: release.tag }) }), SP_JSX.jsxs("div", { style: { ...small, marginTop: 6 }, children: [repo, " \u00B7 ", release.asset_name] }), SP_JSX.jsx("div", { style: { marginTop: 9, fontSize: 12 }, children: warning }), SP_JSX.jsx("div", { style: { ...small, marginTop: 12 }, children: t(language, "notes") }), SP_JSX.jsx("div", { style: { maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap", fontSize: 12,
                            lineHeight: 1.4, marginTop: 7 }, children: release.changelog || t(language, "noNotes") }), SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }, children: [SP_JSX.jsx(CompactButton, { onClick: () => void install(), children: t(language, "approve") }), SP_JSX.jsx(CompactButton, { onClick: () => handle?.Close(), children: t(language, "selectedCancel") })] })] }) }), undefined, { strTitle: t(language, "selectedTitle") });
    };
    const pin = status?.pinned_versions[repo];
    return SP_JSX.jsxs("div", { style: { width: "100%", minWidth: 0, overflowWrap: "anywhere" }, children: [SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "releaseTitle", { repo }), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { onClick: onClose, children: ["\u2190 ", t(language, "catalogBack")] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "selectedInstalled", {
                                version: status?.installed_version || t(language, "notInstalled")
                            }) }) }), pin && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: small, children: [t(language, "pinnedVersion", { version: pin }), SP_JSX.jsx("div", { style: { marginTop: 7 }, children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => {
                                            setBusy(true);
                                            void withTimeout(clearVersionPin(repo), t(language, "timeout")).then(result => {
                                                if (!result.success)
                                                    throw new Error(result.error || t(language, "actionFailed"));
                                                onReposChanged();
                                                void read();
                                            }).catch(caught => toaster.toast({ title: t(language, "error"), body: String(caught) }))
                                                .finally(() => setBusy(false));
                                        }, children: t(language, "followLatest") }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "releaseIntro") }) }), error && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: colors.red, fontSize: 12 }, children: error }) }), status?.error && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: colors.red, fontSize: 12 }, children: status.error }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "releaseList"), children: [status?.running && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: small, children: [SP_JSX.jsx(FaCircleNotch, {}), " ", t(language, "catalogLoading")] }) }), !status?.running && !status?.releases.length && !status?.error &&
                        SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "noRelease") }) }), status?.releases.map(release => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Field, { label: release.tag, description: `${release.asset_name}${release.prerelease
                                ? ` · ${t(language, "prerelease")}` : ""}`, icon: SP_JSX.jsx(FaDownload, {}), padding: "compact", childrenLayout: "below", bottomSeparator: "standard", children: [release.published_at && SP_JSX.jsx("div", { style: small, children: release.published_at.slice(0, 10) }), SP_JSX.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }, children: [SP_JSX.jsx(CompactButton, { disabled: busy || !!status?.running, onClick: () => select(release), children: t(language, "selectedInstall") }), SP_JSX.jsx("a", { href: `https://github.com/${repo}/releases/tag/${encodeURIComponent(release.tag)}`, target: "_blank", rel: "noopener noreferrer", children: "GitHub \u2197" })] })] }) }, release.token)), !!status?.releases.length && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [SP_JSX.jsx(CompactButton, { disabled: !!status?.running || status.page <= 1, onClick: () => void load(status.page - 1), children: t(language, "catalogPrev") }), SP_JSX.jsx("span", { style: small, children: status.page }), SP_JSX.jsx(CompactButton, { disabled: !!status?.running || !status.has_more || status.page >= 10, onClick: () => void load(status.page + 1), children: t(language, "catalogNext") })] }) })] })] });
}
function Content() {
    const language = useSystemLanguage();
    const [repos, setRepos] = SP_REACT.useState([]);
    const [importFile, setImportFile] = SP_REACT.useState("");
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
    const [busy, setBusy] = SP_REACT.useState(false);
    const [showRepos, setShowRepos] = SP_REACT.useState(false);
    const [showInstalled, setShowInstalled] = SP_REACT.useState(false);
    const [showCatalog, setShowCatalog] = SP_REACT.useState(false);
    const [showGithubSearch, setShowGithubSearch] = SP_REACT.useState(false);
    const [selectedRepo, setSelectedRepo] = SP_REACT.useState("");
    const [pins, setPins] = SP_REACT.useState({});
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
                throw new Error(backendMessage(language, result.error || t(language, "actionFailed")));
            if (result.repos)
                setRepos(result.repos);
            await refreshRepos();
            toaster.toast({ title: t(language, result.file ? "importDone" : "saved"),
                body: result.file ? t(language, "importSummary", {
                    added: result.added || 0, existing: result.existing || 0, invalid: result.invalid || 0,
                }) : t(language, "updatedList") });
        }
        catch (error) {
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
                repo: "", phase: "Repository-Liste laden", bytes_done: 0, bytes_total: 0,
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
        if (showCatalog || showGithubSearch || selectedRepo || updateMode !== "ask" || !progress || progress.running || busy || promptBlocked
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
    }, [showCatalog, showGithubSearch, selectedRepo, updateMode, pendingUpdates, progress?.running, busy, promptBlocked, popupAttempt, language]);
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
    if (selectedRepo)
        return SP_JSX.jsx("div", { style: { padding: "0 8px" }, children: SP_JSX.jsx(ReleaseBrowser, { repo: selectedRepo, language: language, onClose: () => setSelectedRepo(""), onStarted: () => { setSelectedRepo(""); setShowGithubSearch(false); setShowCatalog(false); }, onReposChanged: () => void refreshRepos(true) }) });
    if (showGithubSearch)
        return SP_JSX.jsx("div", { style: { padding: "0 8px" }, children: SP_JSX.jsx(GithubSearch, { language: language, onClose: () => setShowGithubSearch(false), onVersions: setSelectedRepo, onReposChanged: () => void refreshRepos(true) }) });
    if (showCatalog)
        return SP_JSX.jsx("div", { style: { padding: "0 8px" }, children: SP_JSX.jsx(CatalogBrowser, { language: language, onClose: () => setShowCatalog(false), onVersions: setSelectedRepo, onReposChanged: () => void refreshRepos(true) }) });
    return SP_JSX.jsxs("div", { children: [updateMode === "ask" && pendingUpdates.length > 0 && SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "approvalTitle", { count: pendingUpdates.length }), children: [progress?.running && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "waitForScan") }) }), !progress?.running && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => {
                                approvalModal.current?.Close();
                                approvalModal.current = null;
                                promptedReleases.current.clear();
                                saveApprovalSession();
                                resumePrompts();
                                setPopupAttempt(value => value + 1);
                            }, children: t(language, "resumeApprovals") }) }), pendingUpdates.map(item => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Field, { label: item.name, icon: SP_JSX.jsx(FaClock, { color: "#ffd577" }), description: `${item.repo} · ${item.installed_version || t(language, "notInstalled")} → ${item.version}`, padding: "compact", childrenLayout: "below", bottomSeparator: "standard", children: [SP_JSX.jsx("div", { style: { marginTop: 7 }, children: SP_JSX.jsx(CompactButton, { onClick: () => setOpenedNotes(openedNotes === item.repo ? "" : item.repo), children: openedNotes === item.repo ? t(language, "hideNotes") : t(language, "notes") }) }), openedNotes === item.repo && SP_JSX.jsx("div", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere",
                                        maxHeight: 180, overflowY: "auto", fontSize: 11, lineHeight: 1.5, margin: "9px 0",
                                        padding: 8, background: "rgba(0, 0, 0, 0.18)", borderRadius: 4 }, children: item.changelog || t(language, "noNotes") }), SP_JSX.jsxs("div", { style: { display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }, children: [SP_JSX.jsx(CompactButton, { disabled: busy || !!progress?.running, onClick: () => void decide(item.repo, true), children: busy ? t(language, "processing") : t(language, "approve") }), SP_JSX.jsx(CompactButton, { disabled: busy || !!progress?.running, onClick: () => void decide(item.repo, false), children: t(language, "decline") })] })] }) }, item.repo))] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "updates"), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", minWidth: 0, padding: "3px 0 8px" }, children: [SP_JSX.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center",
                                        gap: 8, fontSize: 12, marginBottom: 8 }, children: [SP_JSX.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [SP_JSX.jsx(FaGithub, {}), " ", t(language, "appTitle")] }), SP_JSX.jsx("span", { style: { opacity: 0.7 }, children: t(language, "reposBadge", { count: repos.length }) })] }), SP_JSX.jsx("div", { style: { height: 6, borderRadius: 6, overflow: "hidden",
                                        background: "rgba(255, 255, 255, 0.17)" }, role: "progressbar", "aria-label": t(language, "progress"), "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": progress?.running ? progress.percent : progress?.completed_at ? 100 : 0, children: SP_JSX.jsx("div", { style: { height: "100%", width: `${progress?.running ? progress.percent : progress?.completed_at ? 100 : 0}%`,
                                            background: colors.cyan, borderRadius: 6 } }) }), SP_JSX.jsx("div", { style: { fontSize: 12, opacity: 0.8, marginTop: 8,
                                        overflowWrap: "anywhere" }, children: summary }), progress?.running && progress.repo && SP_JSX.jsx("div", { style: { fontSize: 12, overflowWrap: "anywhere",
                                        marginTop: 5 }, children: progress.repo })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { disabled: checking || restarting || (restartPending && !restartError) || pendingUpdates.length > 0, onClick: () => void check(), children: [SP_JSX.jsx(FaDownload, {}), " ", checking ? t(language, "checking") : t(language, "check")] }) }), rows.slice(0, showAllRows ? rows.length : 4).map(row => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: row.name, description: SP_JSX.jsx("span", { style: { color: row.state === "error" ? colors.red : undefined,
                                    overflowWrap: "anywhere" }, children: rowSubtitle(language, row) }), icon: SP_JSX.jsx(CheckIcon, { state: row.state }), padding: "compact", bottomSeparator: "standard" }) }, row.repo)), rows.length > 4 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => setShowAllRows(!showAllRows), children: showAllRows ? t(language, "fewerRows") : t(language, "allRows", { count: rows.length }) }) }), !rows.length && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "noRepos") }) }), restartError && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { color: colors.red, fontSize: 12 }, children: [t(language, restartError === "restartSignalFailed" ? "restartSignalFailed" : "restartLaunchFailed"), restartErrorDetail && SP_JSX.jsx("div", { style: { fontSize: 11, marginTop: 5, overflowWrap: "anywhere" }, children: restartErrorDetail }), SP_JSX.jsx("div", { style: { marginTop: 8 }, children: SP_JSX.jsx(CompactButton, { disabled: busy || !!progress?.running, onClick: () => void retrySteamRestart(), children: t(language, "retryRestart") }) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: updateMode === "automatic"
                                ? t(language, "autoRestart") : t(language, "askDescription") }) }), errors.length > 2 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => setShowErrors(!showErrors), children: showErrors ? t(language, "hideErrors") : t(language, "allErrors", { count: errors.length }) }) }), (showErrors ? errors : errors.slice(0, 2)).map((error, index) => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "0.85em", color: "#ffaaaa", overflowWrap: "anywhere" }, children: error }) }, index))] }), SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { disabled: checking || restarting || pendingUpdates.length > 0, onClick: () => setShowGithubSearch(true), children: [SP_JSX.jsx(FaSearch, {}), " ", t(language, "githubSearchTitle")] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { disabled: checking || restarting || pendingUpdates.length > 0, onClick: () => setShowCatalog(true), children: [SP_JSX.jsx(FaSearch, {}), " ", t(language, "browsePlugins")] }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "installedPlugins", { count: installed.length }), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(CompactButton, { onClick: () => setShowInstalled(value => !value), children: [SP_JSX.jsx(FaChevronDown, {}), " ", showInstalled ? t(language, "closeList") : t(language, "showList")] }) }), showInstalled && installed.map(plugin => {
                        const repo = Object.keys(matches).find(item => matches[item]?.folder === plugin.folder) || plugin.repo || "";
                        return SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: plugin.name, description: `v${plugin.version} · ${repo || t(language, "unknownRepository")}`, padding: "compact", bottomSeparator: "standard", childrenLayout: "below", icon: SP_JSX.jsx(FaGithub, {}), children: SP_JSX.jsx("div", { style: { marginTop: 7 }, children: SP_JSX.jsx(CompactButton, { disabled: checking || busy || pendingUpdates.length > 0, onClick: () => repo ? setSelectedRepo(repo) : setShowGithubSearch(true), children: repo ? t(language, "otherVersions") : t(language, "githubSearchTitle") }) }) }) }, plugin.folder);
                    })] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "repositories", { count: repos.length }), children: [importFile && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: t(language, "importTitle"), description: t(language, "importDescription", { file: importFile }), padding: "compact", icon: SP_JSX.jsx(FaDownload, {}), childrenLayout: "below", children: SP_JSX.jsx("div", { style: { marginTop: 6 }, children: SP_JSX.jsx(CompactButton, { disabled: checking || busy || pendingUpdates.length > 0, onClick: () => void mutate(() => withTimeout(importReposFile(), t(language, "timeout"), 10000)), children: t(language, "importButton") }) }) }) }), repos.length > 0 && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { ...spaced, flexWrap: "wrap" }, children: SP_JSX.jsxs(CompactButton, { onClick: () => setShowRepos(!showRepos), children: [SP_JSX.jsx(FaChevronDown, {}), " ", showRepos ? t(language, "closeList") : t(language, "showList")] }) }) }), showRepos && SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { onClick: () => void refreshRepos(), children: t(language, "refreshInstalled") }) }), showRepos && repos.map(repo => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Field, { label: repo, icon: SP_JSX.jsx(FaGithub, {}), padding: "compact", bottomSeparator: "standard", childrenLayout: "below", description: matches[repo] ? t(language, "installedVersion", {
                                name: matches[repo]?.name || "", version: matches[repo]?.version || "",
                            }) : matchReasons[repo] ? backendMessage(language, matchReasons[repo] || "") : t(language, "missing"), children: [pins[repo] && SP_JSX.jsx("div", { style: { ...small, marginBottom: 6 }, children: t(language, "pinnedVersion", { version: pins[repo] }) }), SP_JSX.jsxs("div", { style: { ...spaced, flexWrap: "wrap" }, children: [SP_JSX.jsx(CompactButton, { disabled: checking || busy || pendingUpdates.length > 0, onClick: () => setSelectedRepo(repo), children: t(language, "otherVersions") }), pins[repo] && SP_JSX.jsx(CompactButton, { disabled: checking || busy || pendingUpdates.length > 0, onClick: () => void mutate(() => clearVersionPin(repo)), children: t(language, "followLatest") }), SP_JSX.jsx(CompactButton, { disabled: !installed.length, onClick: () => {
                                                setMappingRepo(mappingRepo === repo ? "" : repo);
                                                setMappingIndex(Math.max(0, installed.findIndex(p => p.folder === matches[repo]?.folder)));
                                            }, children: t(language, "assign") }), SP_JSX.jsx(CompactButton, { disabled: checking || busy || pendingUpdates.length > 0, onClick: () => void mutate(async () => {
                                                const result = await setCatalogRepo(repo, false);
                                                if (result.success && mappingRepo === repo)
                                                    setMappingRepo("");
                                                return result;
                                            }), children: t(language, "catalogRemove") })] })] }) }, repo)), showRepos && mappingRepo && installed.length > 0 && SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "pluginFor", { repo: mappingRepo }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6,
                                        maxHeight: 170, overflowY: "auto" }, children: installed.map((plugin, index) => SP_JSX.jsxs(FilterButton, { selected: mappingIndex === index, onClick: () => setMappingIndex(index), children: [plugin.name, " (", plugin.version, ")"] }, plugin.folder)) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CompactButton, { disabled: busy, onClick: () => void mutate(async () => {
                                        const result = await setMapping(mappingRepo, installed[mappingIndex].folder);
                                        if (result.success)
                                            setMappingRepo("");
                                        return result;
                                    }), children: t(language, "saveAssignment") }) })] })] }), SP_JSX.jsxs(DFL.PanelSection, { title: t(language, "settings"), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: t(language, "storageLabel"), description: `${t(language, "storageInfo")} · ${backendVersion
                                ? `Backend v${backendVersion}` : t(language, "disconnected")}`, icon: SP_JSX.jsx(FaGithub, {}), padding: "compact" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: t(language, "modeTitle"), description: t(language, updateMode === "automatic" ? "autoDescription" : "askDescription"), checked: updateMode === "automatic", disabled: checking || busy || pendingUpdates.length > 0, onChange: checked => void saveMode(checked ? "automatic" : "ask") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: small, children: t(language, "selfUpdateInfo") }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: t(language, "languageLabel"), description: `${t(language, "languageAuto")} · ${t(language, "languageName")}`, icon: SP_JSX.jsx(FaGlobe, {}), padding: "compact" }) })] })] });
}
var index = definePlugin(() => ({
    name: "Github Plugin Updater",
    titleView: SP_JSX.jsx(LocalizedTitle, {}),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaGithub, {}),
}));

export { index as default };
//# sourceMappingURL=index.js.map
