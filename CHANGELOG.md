# Version 1.9.2

## Deutsch

- Ist eine `repos.txt` in einem Downloads-Ordner vorhanden, erscheint unter „Überwachte Repositories“ ein Knopf zum manuellen Import in die interne Repository-Liste.
- Der Import ergänzt nur neue gültige Links, ignoriert Kommentare und Leerzeilen, überspringt doppelte Einträge und verändert die Datei nicht. Hinzugefügte, vorhandene und ungültige Einträge werden gezählt.
- Der Datei-Import kann später erneut gestartet werden; automatische Update-Prüfungen arbeiten weiterhin ausschließlich mit der gespeicherten Liste.

## English

- When a `repos.txt` exists in a Downloads folder, a manual import button appears under “Followed repositories”.
- Import adds only new valid links, ignores comments and blank lines, skips duplicates, and leaves the file unchanged. Added, existing, and invalid entries are counted.
- The import can be run again later; automatic update checks still use only the saved list.

# Version 1.9.1

## Deutsch

- Der Updater prüft sein eigenes GitHub-Repository jetzt automatisch kurz nach dem Start und bei regulären Update-Prüfungen. Ein Eintrag in der überwachten Repository-Liste ist nicht nötig.
- Neuere Versionen des Updaters werden auch im Modus „Vor Installation fragen“ automatisch installiert; Freigaben für andere Plugins bleiben bestehen und der Steam-UI-Neustart wartet auf deren Abschluss.
- Numerische GitHub-Release-Tags werden anhand der Version im ZIP-Namen geprüft. Nach einem unterbrochenen Selbstupdate kann die Installation anhand dieser Version wiedererkannt werden.
- Wiederholte Startprüfungen innerhalb von fünf Minuten werden vermieden; vor der Installation gelten weiterhin die Identitäts- und Versionsprüfungen sowie das Backup.

## English

- The updater now checks its own GitHub repository shortly after startup and during regular update checks. No entry in the followed repository list is required.
- Newer updater versions install automatically even in “Ask before installing” mode. Approvals for other plugins remain pending, and the Steam UI restart waits until they are resolved.
- Numeric GitHub release tags are checked using the version in the ZIP filename. An interrupted self-update can be recovered using that version.
- Startup checks within five minutes are throttled; identity and version checks and the backup remain in place.

# Version 1.9.0

## Deutsch

- Live-Suche auf GitHub nach Plugin-Namen, `owner/repo` und URLs, zusätzlich zum bisherigen Decky-Plugin-Katalog.
- Release-ZIPs und ältere Versionen lassen sich aus Suchergebnissen, Katalog und überwachten Repositories auswählen. Vor einer manuellen Installation zeigt ein Popup den Changelog und fragt nach Bestätigung.
- Eine einklappbare Liste installierter Plugins bietet bei bekanntem GitHub-Repository direkten Zugriff auf „Andere Versionen“.
- Gewählte ältere Versionen werden gespeichert; automatische Updates für dieses Repository pausieren bis „Wieder neueste Version verfolgen“ gewählt wird.
- Die Suche, Release-Abfrage und manuelle Installation laufen im Hintergrund mit Statusanzeige. ZIP und Plugin-Metadaten werden vor dem Ersetzen geprüft.

## English

- Added live GitHub search by plugin name, `owner/repo`, and URL alongside the existing Decky plugin catalog.
- Select release ZIPs and older versions from search results, the catalog, or followed repositories. A confirmation popup shows the changelog before manual installation.
- A collapsible installed plugin list links directly to “Other versions” when the GitHub repository is known.
- Selected older versions are retained; automatic updates for that repository pause until “Follow latest version” is chosen.
- Search, release lookup, and manual installation run in the background with progress status. ZIPs and plugin metadata are validated before replacement.

# Version 1.8.0

## Deutsch

- Überwachte GitHub-Repositories werden dauerhaft in den Decky-Einstellungen gespeichert. Für Update-Prüfungen wird keine `repos.txt` mehr benötigt.
- Eine vorhandene `repos.txt` wird beim ersten Start nach dem Upgrade einmalig übernommen. Die Datei bleibt unverändert; spätere Änderungen daran werden nicht synchronisiert.
- Der Plugin-Browser fügt Repositories direkt zur internen Liste hinzu oder entfernt sie daraus. Auch in der Repository-Liste gibt es nun eine Schaltfläche zum Entfernen.
- Der Datei-Import wurde aus der Oberfläche entfernt. Status, Browser und Update-Freigaben verwenden die interne Liste.

## English

- Followed GitHub repositories are stored persistently in Decky settings. Update checks no longer require `repos.txt`.
- An existing `repos.txt` is imported once on the first start after upgrading. The file stays unchanged; later edits to it are not synchronized.
- The plugin browser adds or removes repositories directly in the internal list. The repository list also has a remove button.
- The file import was removed from the UI. Status, browser, and update approvals use the internal list.
