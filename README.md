# GitHub Plugin Updater

<img src="Logo.png" alt="Logo des GitHub Plugin Updaters" width="33%">

**Decky-Plugin für SteamOS und Bazzite:** Verwaltet GitHub-Repositories intern, prüft Releases und installiert neue oder neuere Plugin-Versionen automatisch.

**Sprache:** [Deutsch](README.md) · [English](README_EN.md)

## Funktionen

- Speichert überwachte Repositories dauerhaft in den Decky-Einstellungen. Beim ersten Start nach dem Upgrade werden Einträge aus älteren Versionen einmalig übernommen.
- Ist eine `repos.txt` im Downloads-Ordner vorhanden, kannst du ihre Links per Knopfdruck zusätzlich importieren. Bereits überwachte Repositories werden nicht dupliziert.
- **Decky-Plugins durchsuchen** öffnet einen durchsuchbaren Katalog mit Plugins, Autoren, Tags und Releases. **Zum Updater hinzufügen** speichert das Repository intern; für vorhandene Einträge erscheint **Aus dem Updater entfernen**.
- **GitHub durchsuchen** sucht live nach Plugin-Namen, `owner/repo` oder GitHub-URLs, auch außerhalb des kuratierten Katalogs. Suchergebnisse können direkt zur Überwachung hinzugefügt werden.
- **Andere Versionen** zeigt die veröffentlichten Release-ZIPs eines Repositories samt Changelog. Auch ältere Versionen und Vorabversionen können nach einer ausdrücklichen Bestätigung installiert werden. Eine manuell gewählte ältere Version bleibt gespeichert; automatische Updates für dieses Repo pausieren bis **Wieder neueste Version verfolgen** gewählt wird.
- Die einklappbare Liste **Installierte Plugins** öffnet die Versionsauswahl direkt für Plugins mit bekanntem GitHub-Repository. Fehlt der Repository-Link in den Plugin-Metadaten, führt die Schaltfläche zur GitHub-Suche.
- Sucht unter veröffentlichten GitHub-Releases nach hochgeladenen Plugin-ZIPs. Die automatisch erzeugten Quellcode-Archive zählen nicht als Plugin-ZIP.
- Installiert noch nicht vorhandene Plugins und ersetzt ältere installierte Versionen; aktuelle Versionen werden übersprungen.
- Gleicht Installationen über Repository, Plugin-Ordner und Plugin-Namen ab. Unter **Repositories → Zuordnen** lässt sich bei abweichenden Namen ein vorhandenes Plugin manuell zuordnen.
- Zeigt kompakte Decky-Felder für Status, Repositories und Katalog mit Fortschrittsbalken, Repository, Arbeitsschritt, Laufzeit und, beim Download soweit verfügbar, der übertragenen Datenmenge. Statuszeilen nennen Plugin-Namen, Versionswechsel und Prüfergebnis; die letzten Ergebnisse bleiben nach einem Decky-Neustart sichtbar.
- Sichert die vorherige Version, entpackt das Update in Deckys Plugin-Verzeichnis und startet die Steam-Oberfläche über Deckys eigenen Neustartaufruf neu. Bei mehreren Freigaben geschieht das nur einmal, nachdem alle Updates bestätigt oder übersprungen wurden.
- Prüft zusätzlich etwa alle 24 Stunden automatisch, solange Decky läuft.
- Prüft das eigene GitHub-Repository kurz nach Deckys Start und danach bei den regulären Prüfungen automatisch, ohne dass du es zur Liste hinzufügen musst.
- Führt längere Update-Prüfungen im Hintergrund aus; der Fortschritt bleibt auch bei langsamen GitHub-Downloads abrufbar.
- Im Modus **Vor Installation fragen** erscheint nach Abschluss der Prüfung für jedes anstehende Update ein Popup mit Changelog und den Schaltflächen **Ja, installieren** und **Nein, dieses Release überspringen**. Bereits gefundene Freigaben erscheinen während der Prüfung oben im Plugin. Schließt Steam das Popup oder drückst du B, wird das Release nicht abgelehnt; du kannst die Freigabe später wieder öffnen.

## Installation

1. Die bereitgestellte `github-plugin-updater-v1.9.2.zip` herunterladen und entpacken.
2. Den darin enthaltenen Ordner `github-plugin-updater` nach `~/homebrew/plugins/` kopieren. Bei einem Update den bisherigen Ordner ersetzen; keine zweite Installation unter anderem Namen anlegen.
3. Decky Loader oder das Gerät neu starten. Unter **Einstellungen → Repository-Speicher** sollte **Backend v1.9.2** stehen.

Ist Decky nach einem Neustart mit einer älteren Updater-Version nicht sichtbar, Decky Loader im Terminal mit `sudo systemctl restart plugin_loader.service` neu starten und danach dieses Update installieren.

Tritt der 12-Sekunden-Fehler beim Neustart in Version 1.6.7 auf, installiere Version 1.6.8 manuell und starte Decky einmal neu. Ist der alte Neustartstatus weiterhin sichtbar, wähle anschließend **Neustart erneut versuchen**.

Zeigt Version 1.6.0 oder 1.6.1 „Keine Antwort vom Decky-Backend nach 12 Sekunden“ an, dieses Update manuell installieren und Decky neu starten. In 1.6.1 kann das Backend während der Meldung dennoch weiter Plugins installieren. Prüfe deshalb die angezeigten Ergebnisse nach dem Neustart.

Das Plugin besitzt das Decky-Flag `root`, weil automatische Installationen Schreibrechte im Plugin-Verzeichnis benötigen. Verwende nur GitHub-Repositories und Release-ZIPs, denen du vertraust.

## Repositories verwalten

Öffne **Decky-Plugins durchsuchen** und wähle bei gewünschten Plugins **Zum Updater hinzufügen**. In **Überwachte Repositories** kannst du einzelne Einträge wieder entfernen oder einem installierten Decky-Plugin zuordnen. Die Liste wird in Deckys Plugin-Einstellungen gespeichert und bleibt nach Neustarts und Updates erhalten. Zum Prüfen und Installieren ist keine Datei im Downloads-Ordner mehr nötig.

**Optionaler Datei-Import:** Liegt eine `repos.txt` im konfigurierten XDG-Downloads-Ordner, `~/Downloads`, `/home/deck/Downloads` oder `/home/bazzite/Downloads`, erscheint unter **Überwachte Repositories** die Schaltfläche **repos.txt importieren**. Der Klick übernimmt gültige GitHub-Links zusätzlich in die interne Liste. Kommentare und Leerzeilen werden ignoriert, doppelte Einträge übersprungen und die Datei bleibt unverändert. Die Meldung zeigt an, wie viele Einträge hinzugefügt, bereits vorhanden oder ungültig waren. Erstellst du die Datei bei bereits geöffneter Plugin-Ansicht, öffne die Ansicht erneut, damit der Knopf erscheint. Spätere Änderungen an der Datei werden nur nach erneutem Klick eingelesen.

**Upgrade von älteren Versionen:** Beim ersten Start übernimmt das Plugin gültige Repository-Einträge aus der früheren Downloads-Datei einmalig in die interne Liste. Danach verwaltest du alle Repositories direkt im Plugin; spätere Änderungen an der Datei werden nur über den Importknopf übernommen.

## GitHub-Suche und Versionsauswahl

Mit **GitHub durchsuchen** kannst du nach einem Plugin-Namen oder einem konkreten `owner/repo` suchen. Wähle **Andere Versionen** für die ZIP-Dateien der Releases. Die Suche und das Laden der Releases laufen im Hintergrund, damit die Decky-Oberfläche erreichbar bleibt. Bei ausgeschöpftem GitHub-API-Limit versucht die Versionsliste den Abruf über öffentliche Release-Seiten; die GitHub-Suche zeigt in diesem Fall den Fehler an und kann später wiederholt werden.

Vor der manuellen Installation erscheint ein Popup mit ZIP-Dateiname und Changelog. Eine Bestätigung installiert die gewählte Version; bei noch nicht überwachten Repositories wird sie danach zur internen Liste hinzugefügt. Die vorherige Installation wird gesichert. Eine ältere oder andere als die neueste Release-Version wird festgehalten, damit die nächste automatische Prüfung sie nicht sofort überschreibt. **Wieder neueste Version verfolgen** hebt das auf. Die Selbstaktualisierung des Updaters erlaubt weiterhin nur eine neuere Version.

## Decky-Plugins durchsuchen

Öffne im Plugin die eigene Schaltfläche **Decky-Plugins durchsuchen** direkt oberhalb von **Überwachte Repositories**. Der Browser erscheint als eigene Decky-Ansicht mit Zurück-Schaltfläche. Die virtuelle Tastatur kann mit Enter geschlossen werden, ohne die Browser-Ansicht zu verlassen. Dort kannst du nach Namen, Autor, Repository, Beschreibung oder Tag suchen. Die Sortierung nach Sternen, Downloads, Release-Datum oder Name erfolgt über direkt sichtbare Schaltflächen; **Nach Tag filtern** klappt eine Liste beliebter Tags auf. Beide Filter bleiben damit innerhalb der Browser-Ansicht. Der Katalog lädt die [Plugin-Liste von Safet Zahirovics Decky Plugin Explorer](https://safetzahirovic.github.io/decky-plugins-explorer/) im Hintergrund; ein langsamer Abruf blockiert das Decky-Backend nicht. Über **Aktualisieren** lädst du den Katalog neu.

**Zum Updater hinzufügen** speichert das Repository in der internen Liste. Ist es bereits enthalten, zeigt derselbe Eintrag **Aus dem Updater entfernen**. Du kannst es auch unter **Überwachte Repositories** entfernen. Die Überwachung endet, aber ein installiertes Plugin bleibt installiert. Änderungen gelten sofort, auch nach einem Neustart. Die nächste Update-Prüfung berücksichtigt neue Einträge gemäß deinem Installationsmodus.

Der Explorer ist ein unabhängiger, automatisiert gepflegter GitHub-Katalog und prüft die gelisteten Projekte nicht auf Sicherheit. Ein Katalogeintrag garantiert auch keine kompatible Release-ZIP. Lies den Quellcode und wähle nur Repositories, denen du vertraust.

## Updates prüfen

1. In Decky **GitHub Updates → Updates prüfen** auswählen.
2. Repository, Arbeitsschritt und Fortschritt beobachten. Während GitHub antwortet, kann die Prozentanzeige vorübergehend stehen bleiben; die Laufzeit läuft weiter.
3. Ergebnisse und mögliche Fehlermeldungen im Plugin anzeigen. Nach erfolgreichen Installationen startet die Steam-Oberfläche kurz neu.

Eine Release-ZIP muss ein gebautes Decky-Plugin mit `plugin.json`, `package.json`, `main.py` und `dist/index.js` enthalten. Ihr Anzeigename darf vom GitHub-Repository abweichen. Version, Archivgröße und Archivpfade werden vor der Installation geprüft. Alte Installationen liegen unter `~/homebrew/data/github-plugin-updater/backups/`; heruntergeladene ZIPs liegen in `~/Downloads`.

Bei einem GitHub-API-Limit versucht das Plugin die öffentliche Release-Seite. Nach einem Python-SSL-Handshake-Fehler versucht es außerdem System-`curl` mit Zertifikatsprüfung. Tatsächliche Netzwerkprobleme oder verweigerte Downloads können weiterhin Updates verhindern.

## Sprache und Installation mit Nachfrage

Die Oberfläche verwendet automatisch die in Steam eingestellte Sprache: Deutsch, Englisch, Spanisch, Französisch oder Russisch. Unter **Einstellungen → Sprache** wird die erkannte Sprache angezeigt. Ist eine andere Sprache eingestellt oder die Steam-Sprache nicht lesbar, wird Englisch verwendet. Änderungen der Steam-Sprache werden in der geöffneten Plugin-Ansicht übernommen.

Unter **Einstellungen → Installationsmodus** schaltet **Ein** die automatische Installation ein; **Aus** bedeutet **Vor Installation fragen**. Im zweiten Modus lädt das Plugin für **andere Plugins** vor deiner Freigabe keine ZIP herunter und installiert sie nicht. Nach Abschluss der Prüfung öffnet es für anstehende Updates ein Popup mit dem **Changelog** (GitHub-Release-Notes) und den Optionen **Ja, installieren** oder **Nein, dieses Release überspringen**. Fehlen Release-Notes, wird das ausdrücklich angezeigt. Eine abgelehnte Release-Version wird auch beim nächsten automatischen Check übersprungen; erst eine neue Version wird wieder angeboten. Ausstehende Freigaben bleiben nach einem Decky-Neustart erhalten und stehen zusätzlich oben im Plugin. Nur ein Klick auf **Ja** oder **Nein** trifft eine Entscheidung. Die B-Taste schließt das Popup ohne Entscheidung; über **Nächste Freigabe als Popup öffnen** kannst du es erneut öffnen. So lösen unerwartet geschlossene Popups keine Kette weiterer Popups aus. Nach jeder Entscheidung erscheint die nächste Freigabe. Erst nach der letzten Entscheidung startet die Steam-Oberfläche einmal neu, sofern mindestens ein Update installiert wurde. Wenn du alle Updates ablehnst, ist kein Neustart nötig. Solange Freigaben ausstehen, wird keine neue Update-Prüfung begonnen. **Der Updater selbst ist eine Ausnahme und installiert seine neueren Versionen automatisch.**

## Selbstupdate

Das Plugin prüft `https://github.com/Steamdeckchecker/Github-Decky-Plugins-Updater` automatisch etwa 20 Sekunden nach Deckys Start sowie bei jeder regulären Update-Prüfung. Ein Eintrag in der überwachten Liste ist nicht nötig. Nach einem kürzlichen Check wartet es beim erneuten Start mindestens fünf Minuten, um GitHub nicht unnötig oft abzufragen. Eine neue Version wird auch im Modus **Vor Installation fragen** automatisch installiert. Es akzeptiert nur eine gebaute ZIP mit passendem Plugin-Namen, passender Paketkennung und einer neueren Version. Die bisherige Installation wird gesichert. Der Steam-UI-Neustart erfolgt über den bisherigen Decky-Ablauf erst nach einer laufenden Prüfung und allen noch offenen Freigaben anderer Plugins.

Ab Version 1.6.8 veranlasst die Oberfläche nach abgeschlossener Installation Deckys eigenen Steam-UI-Neustart. Dazu wird zuerst der Backend-Aufruf abgeschlossen; Decky Loader selbst wird während dieses Vorgangs nicht gestoppt. Meldet der Aufruf einen Fehler oder bleibt die Oberfläche nach acht Sekunden bestehen, erscheint **Neustart erneut versuchen**. Die Update-Prüfung bleibt nach einem solchen Fehler verfügbar.

Die eigenen Releases müssen als gebaute Plugin-ZIPs in diesem öffentlichen Repository veröffentlicht werden; GitHubs automatische Quellcode-Archive werden nicht installiert.

## Entwicklung

Mit `pnpm install` und `pnpm run build` im Quellverzeichnis wird `dist/index.js` erzeugt. Die Installations-ZIP muss die gebaute Datei bereits enthalten; auf dem Steam Deck ist Node.js nicht erforderlich.
