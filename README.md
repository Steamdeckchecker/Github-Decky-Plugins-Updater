# GitHub Plugin Updater

![Logo des GitHub Plugin Updaters](Logo.png)

**Decky-Plugin für SteamOS und Bazzite:** Liest `repos.txt`, prüft GitHub-Releases und installiert neue oder neuere Plugin-Versionen automatisch.

**Sprache:** [Deutsch](README.md) · [English](README_EN.md)

## Funktionen

- Liest Repositories ausschließlich aus `repos.txt`: eine GitHub-URL oder `owner/repo` pro Zeile. Eine manuelle Link-Eingabe im Plugin ist nicht nötig.
- Sucht unter veröffentlichten GitHub-Releases nach hochgeladenen Plugin-ZIPs. Die automatisch erzeugten Quellcode-Archive zählen nicht als Plugin-ZIP.
- Installiert noch nicht vorhandene Plugins und ersetzt ältere installierte Versionen; aktuelle Versionen werden übersprungen.
- Gleicht Installationen über Repository, Plugin-Ordner und Plugin-Namen ab. Unter **Repositories → Zuordnen** lässt sich bei abweichenden Namen ein vorhandenes Plugin manuell zuordnen.
- Zeigt einen Fortschrittsbalken mit Repository, Arbeitsschritt, Laufzeit und, beim Download soweit verfügbar, der übertragenen Datenmenge.
- Sichert die vorherige Version, entpackt das Update in Deckys Plugin-Verzeichnis und lädt danach Decky Loader und die Steam-Oberfläche neu.
- Prüft zusätzlich etwa alle 24 Stunden automatisch, solange Decky läuft.

## Installation

1. Die bereitgestellte `github-plugin-updater-v1.5.1.zip` herunterladen und entpacken.
2. Den darin enthaltenen Ordner `github-plugin-updater` nach `~/homebrew/plugins/` kopieren. Bei einem Update den bisherigen Ordner ersetzen; keine zweite Installation unter anderem Namen anlegen.
3. Decky Loader oder das Gerät neu starten. Unter **Import** sollte **Backend v1.5.1** stehen.

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

## Updates prüfen

1. In Decky **GitHub Updates → Updates prüfen** auswählen.
2. Repository, Arbeitsschritt und Fortschritt beobachten. Während GitHub antwortet, kann die Prozentanzeige vorübergehend stehen bleiben; die Laufzeit läuft weiter.
3. Ergebnisse und mögliche Fehlermeldungen im Plugin anzeigen. Nach erfolgreichen Installationen startet die Steam-Oberfläche kurz neu.

Eine Release-ZIP muss ein gebautes Decky-Plugin mit `plugin.json`, `package.json`, `main.py` und `dist/index.js` enthalten. Ihr Anzeigename darf vom GitHub-Repository abweichen. Version, Archivgröße und Archivpfade werden vor der Installation geprüft. Alte Installationen liegen unter `~/homebrew/data/github-plugin-updater/backups/`; heruntergeladene ZIPs liegen in `~/Downloads`.

Bei einem GitHub-API-Limit versucht das Plugin die öffentliche Release-Seite. Nach einem Python-SSL-Handshake-Fehler versucht es außerdem System-`curl` mit Zertifikatsprüfung. Tatsächliche Netzwerkprobleme oder verweigerte Downloads können weiterhin Updates verhindern.

## Entwicklung

Mit `pnpm install` und `pnpm run build` im Quellverzeichnis wird `dist/index.js` erzeugt. Die Installations-ZIP muss die gebaute Datei bereits enthalten; auf dem Steam Deck ist Node.js nicht erforderlich.
