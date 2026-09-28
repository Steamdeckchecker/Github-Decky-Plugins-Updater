# GitHub Plugin Updater

![Logo des GitHub Plugin Updaters](Logo.png)

**Decky-Plugin für SteamOS und Bazzite:** Liest `repos.txt`, prüft GitHub-Releases und installiert neue oder neuere Plugin-Versionen automatisch.

**Sprache:** [Deutsch](README.md) · [English](README_EN.md)

## Funktionen

- Liest Repositories ausschließlich aus `repos.txt`: eine GitHub-URL oder `owner/repo` pro Zeile. Eine manuelle Link-Eingabe im Plugin ist nicht nötig.
- **Decky-Plugins durchsuchen** öffnet einen durchsuchbaren Katalog mit Plugins, Autoren, Tags und Releases. **Zum Updater hinzufügen** schreibt die GitHub-URL in `repos.txt`; für vorhandene Einträge erscheint **Aus dem Updater entfernen**.
- Sucht unter veröffentlichten GitHub-Releases nach hochgeladenen Plugin-ZIPs. Die automatisch erzeugten Quellcode-Archive zählen nicht als Plugin-ZIP.
- Installiert noch nicht vorhandene Plugins und ersetzt ältere installierte Versionen; aktuelle Versionen werden übersprungen.
- Gleicht Installationen über Repository, Plugin-Ordner und Plugin-Namen ab. Unter **Repositories → Zuordnen** lässt sich bei abweichenden Namen ein vorhandenes Plugin manuell zuordnen.
- Zeigt eine kompakte Decky-Ansicht mit Fortschrittsbalken, Repository, Arbeitsschritt, Laufzeit und, beim Download soweit verfügbar, der übertragenen Datenmenge. Statuszeilen nennen Plugin-Namen, Versionswechsel und Prüfergebnis; die letzten Ergebnisse bleiben nach einem Decky-Neustart sichtbar.
- Sichert die vorherige Version, entpackt das Update in Deckys Plugin-Verzeichnis und startet die Steam-Oberfläche über Deckys eigenen Neustartaufruf neu. Bei mehreren Freigaben geschieht das nur einmal, nachdem alle Updates bestätigt oder übersprungen wurden.
- Prüft zusätzlich etwa alle 24 Stunden automatisch, solange Decky läuft.
- Führt längere Update-Prüfungen im Hintergrund aus; der Fortschritt bleibt auch bei langsamen GitHub-Downloads abrufbar.
- Im Modus **Vor Installation fragen** erscheint nach Abschluss der Prüfung für jedes anstehende Update ein Popup mit Changelog und den Schaltflächen **Ja, installieren** und **Nein, dieses Release überspringen**. Bereits gefundene Freigaben erscheinen während der Prüfung oben im Plugin. Schließt Steam das Popup oder drückst du B, wird das Release nicht abgelehnt; du kannst die Freigabe später wieder öffnen.

## Installation

1. Die bereitgestellte `github-plugin-updater-v1.7.2.zip` herunterladen und entpacken.
2. Den darin enthaltenen Ordner `github-plugin-updater` nach `~/homebrew/plugins/` kopieren. Bei einem Update den bisherigen Ordner ersetzen; keine zweite Installation unter anderem Namen anlegen.
3. Decky Loader oder das Gerät neu starten. Unter **Import** sollte **Backend v1.7.2** stehen.

Ist Decky nach einem Neustart mit einer älteren Updater-Version nicht sichtbar, Decky Loader im Terminal mit `sudo systemctl restart plugin_loader.service` neu starten und danach dieses Update installieren.

Tritt der 12-Sekunden-Fehler beim Neustart in Version 1.6.7 auf, installiere Version 1.6.8 manuell und starte Decky einmal neu. Ist der alte Neustartstatus weiterhin sichtbar, wähle anschließend **Neustart erneut versuchen**.

Zeigt Version 1.6.0 oder 1.6.1 „Keine Antwort vom Decky-Backend nach 12 Sekunden“ an, dieses Update manuell installieren und Decky neu starten. In 1.6.1 kann das Backend während der Meldung dennoch weiter Plugins installieren. Prüfe deshalb die angezeigten Ergebnisse nach dem Neustart.

Das Plugin besitzt das Decky-Flag `root`, weil automatische Installationen Schreibrechte im Plugin-Verzeichnis benötigen. Verwende nur GitHub-Repositories und Release-ZIPs, denen du vertraust.

## `repos.txt` einrichten

Erstelle `repos.txt` in deinem Downloads-Ordner. Das Plugin durchsucht den konfigurierten XDG-Downloads-Ordner, `~/Downloads`, `/home/deck/Downloads` und `/home/bazzite/Downloads`. Die erste gefundene Datei ist maßgeblich.

```text
# Ein Repository pro Zeile
https://github.com/Steamdeckchecker/SDC-Benchmark-
https://github.com/Hooandee/panel-de-control/releases
Ciphay/Decky-File-Manager
```

Leerzeilen und mit `#` beginnende Zeilen werden ignoriert. `owner/repo` und URLs mit `/releases` funktionieren. Die Datei enthält die **gesamte** gewünschte Liste. Entfernst du eine Zeile und liest die Datei neu ein, endet die Überwachung dieses Repositories; ein bereits installiertes Plugin wird dabei nicht gelöscht.

Die Datei wird beim Start, vor jeder Update-Prüfung und über **Import → repos.txt öffnen → repos.txt neu einlesen** gelesen. Fehlt sie, bleibt die gespeicherte Liste erhalten; die Prüfung zeigt den fehlenden Dateipfad an und installiert nichts.

## Decky-Plugins durchsuchen

Öffne im Plugin die eigene Schaltfläche **Decky-Plugins durchsuchen** direkt oberhalb von **Repositories aus repos.txt**. Der Browser erscheint als eigene Decky-Ansicht mit Zurück-Schaltfläche. Die virtuelle Tastatur kann mit Enter geschlossen werden, ohne die Browser-Ansicht zu verlassen. Dort kannst du nach Namen, Autor, Repository, Beschreibung oder Tag suchen. Die Sortierung nach Sternen, Downloads, Release-Datum oder Name erfolgt über direkt sichtbare Schaltflächen; **Nach Tag filtern** klappt eine Liste beliebter Tags auf. Beide Filter bleiben damit innerhalb der Browser-Ansicht. Der Katalog lädt die [Plugin-Liste von Safet Zahirovics Decky Plugin Explorer](https://safetzahirovic.github.io/decky-plugins-explorer/) im Hintergrund; ein langsamer Abruf blockiert das Decky-Backend nicht. Über **Aktualisieren** lädst du den Katalog neu.

**Zum Updater hinzufügen** trägt die GitHub-URL in die gefundene `repos.txt` ein. Existiert sie noch nicht, wird sie im ersten vorhandenen Downloads-Ordner erstellt. Ist ein Repo schon in der Datei, zeigt derselbe Eintrag **Aus dem Updater entfernen**. Die Aktion entfernt nur die betreffende Zeile aus der Datei und stoppt die Überwachung; ein installiertes Plugin bleibt installiert. Kommentare, Leerzeilen, andere Einträge und vorhandene Zeilenumbrüche bleiben erhalten. Die Änderung gilt auch beim nächsten Start und bei automatischen Prüfungen. Die nächste Update-Prüfung berücksichtigt neue Einträge gemäß deinem Installationsmodus.

Der Explorer ist ein unabhängiger, automatisiert gepflegter GitHub-Katalog und prüft die gelisteten Projekte nicht auf Sicherheit. Ein Katalogeintrag garantiert auch keine kompatible Release-ZIP. Lies den Quellcode und wähle nur Repositories, denen du vertraust.

## Updates prüfen

1. In Decky **GitHub Updates → Updates prüfen** auswählen.
2. Repository, Arbeitsschritt und Fortschritt beobachten. Während GitHub antwortet, kann die Prozentanzeige vorübergehend stehen bleiben; die Laufzeit läuft weiter.
3. Ergebnisse und mögliche Fehlermeldungen im Plugin anzeigen. Nach erfolgreichen Installationen startet die Steam-Oberfläche kurz neu.

Eine Release-ZIP muss ein gebautes Decky-Plugin mit `plugin.json`, `package.json`, `main.py` und `dist/index.js` enthalten. Ihr Anzeigename darf vom GitHub-Repository abweichen. Version, Archivgröße und Archivpfade werden vor der Installation geprüft. Alte Installationen liegen unter `~/homebrew/data/github-plugin-updater/backups/`; heruntergeladene ZIPs liegen in `~/Downloads`.

Bei einem GitHub-API-Limit versucht das Plugin die öffentliche Release-Seite. Nach einem Python-SSL-Handshake-Fehler versucht es außerdem System-`curl` mit Zertifikatsprüfung. Tatsächliche Netzwerkprobleme oder verweigerte Downloads können weiterhin Updates verhindern.

## Sprache und Installation mit Nachfrage

Die Oberfläche verwendet automatisch die in Steam eingestellte Sprache: Deutsch, Englisch, Spanisch, Französisch oder Russisch. Bei anderen Sprachen wird Englisch angezeigt.

Unter **Einstellungen → Installationsmodus** kannst du zwischen **Immer installieren** (bisheriges Verhalten) und **Vor Installation fragen** wählen. Im zweiten Modus sucht das Plugin weiterhin nach neuen Releases, lädt aber vor deiner Freigabe keine ZIP herunter und installiert nichts. Nach Abschluss der Prüfung öffnet es für anstehende Updates ein Popup mit dem **Changelog** (GitHub-Release-Notes) und den Optionen **Ja, installieren** oder **Nein, dieses Release überspringen**. Fehlen Release-Notes, wird das ausdrücklich angezeigt. Eine abgelehnte Release-Version wird auch beim nächsten automatischen Check übersprungen; erst eine neue Version wird wieder angeboten. Ausstehende Freigaben bleiben nach einem Decky-Neustart erhalten und stehen zusätzlich oben im Plugin. Nur ein Klick auf **Ja** oder **Nein** trifft eine Entscheidung. Die B-Taste schließt das Popup ohne Entscheidung; über **Nächste Freigabe als Popup öffnen** kannst du es erneut öffnen. So lösen unerwartet geschlossene Popups keine Kette weiterer Popups aus. Nach jeder Entscheidung erscheint die nächste Freigabe. Erst nach der letzten Entscheidung startet die Steam-Oberfläche einmal neu, sofern mindestens ein Update installiert wurde. Wenn du alle Updates ablehnst, ist kein Neustart nötig. Solange Freigaben ausstehen, wird keine neue Update-Prüfung begonnen.

## Selbstupdate

Steht die URL `https://github.com/Steamdeckchecker/Github-Decky-Plugins-Updater` in `repos.txt`, prüft das Plugin auch Veröffentlichungen seines eigenen Repositories. Es akzeptiert nur eine ZIP, deren Name und Paketkennung zum installierten Updater passen. Anschließend ersetzt es seinen eigenen Plugin-Ordner. Im Modus **Vor Installation fragen** wird auch dieses Update erst nach deiner Bestätigung installiert; der Neustart wartet auf alle übrigen Freigaben.

Ab Version 1.6.8 veranlasst die Oberfläche nach abgeschlossener Installation Deckys eigenen Steam-UI-Neustart. Dazu wird zuerst der Backend-Aufruf abgeschlossen; Decky Loader selbst wird während dieses Vorgangs nicht gestoppt. Meldet der Aufruf einen Fehler oder bleibt die Oberfläche nach acht Sekunden bestehen, erscheint **Neustart erneut versuchen**. Die Update-Prüfung bleibt nach einem solchen Fehler verfügbar.

**Prüfe vor dem Eintragen, ob die GitHub-URL deines veröffentlichten Repositories genau so lautet.** Der Updater kann nur ein tatsächlich erreichbares Repository und dort veröffentlichte, gebaute Plugin-ZIPs herunterladen.

## Entwicklung

Mit `pnpm install` und `pnpm run build` im Quellverzeichnis wird `dist/index.js` erzeugt. Die Installations-ZIP muss die gebaute Datei bereits enthalten; auf dem Steam Deck ist Node.js nicht erforderlich.
