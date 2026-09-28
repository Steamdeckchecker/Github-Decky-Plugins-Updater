# GitHub Plugin Updater

![GitHub Plugin Updater logo](Logo.png)

**Decky plugin for SteamOS and Bazzite:** Reads `repos.txt`, checks GitHub releases, and automatically installs new plugins or newer versions.

**Language:** [Deutsch](README.md) · [English](README_EN.md)

## Features

- Reads repositories exclusively from `repos.txt`: one GitHub URL or `owner/repo` per line. No need to enter links individually in the plugin UI.
- **Browse Decky Plugins** opens a searchable catalog of plugins, authors, tags and releases. **Add to Updater** writes a repository URL to `repos.txt`; existing entries show **Remove from Updater**.
- Finds uploaded plugin ZIP assets in published GitHub releases. GitHub's auto-generated source archives are not used as plugin ZIPs.
- Installs plugins that are missing and replaces older installed versions; up-to-date versions are skipped.
- Matches installations by repository, plugin folder, and plugin name. For differing names, use **Repositories → Zuordnen** in the UI to associate an existing installation manually.
- Shows a compact Decky dashboard with a progress bar, current repository, step, elapsed time, and transferred data during downloads when available. Status rows show plugin names, version changes, and check results; the latest results remain visible after a Decky restart.
- Backs up the previous version, extracts updates into Decky's plugin directory, and restarts the Steam UI using Decky's own restart utility. With multiple approvals, this happens only once after every update has been approved or skipped.
- Also checks automatically about every 24 hours while Decky is running.
- Runs long update checks in the background so progress remains available during slow GitHub downloads.
- In **Ask before installing** mode, a popup appears after the check for each pending update, showing the changelog and **Yes, install** / **No, skip this release**. Updates found during the scan also appear at the top of the plugin. Closing a popup or pressing B does not decline the update; you can reopen it later.

## Installation

1. Download and extract the supplied `github-plugin-updater-v1.7.2.zip`.
2. Copy its `github-plugin-updater` folder into `~/homebrew/plugins/`. For upgrades, replace the existing folder rather than creating another installation with a different name.
3. Restart Decky Loader or the device. Under **Import**, you should see **Backend v1.7.2**.

If Decky is missing after a restart with an older updater version, run `sudo systemctl restart plugin_loader.service` in a terminal to restore Decky Loader, then install this update.

If the 12-second timeout occurs during a restart in version 1.6.7, install version 1.6.8 manually and restart Decky once. If the old restart failure is still shown, select **Try restart again**.

If version 1.6.0 or 1.6.1 reports “No response from the Decky backend after 12 seconds”, install this update manually and restart Decky. In 1.6.1, the backend may continue installing plugins despite that message. Check the results after restarting.

The plugin uses Decky's `root` flag because automatic installation requires write access to the plugin directory. Only follow GitHub repositories and release ZIPs you trust.

## Set up `repos.txt`

Create `repos.txt` in your Downloads folder. The plugin checks the configured XDG Downloads folder, `~/Downloads`, `/home/deck/Downloads`, and `/home/bazzite/Downloads`. The first file found takes precedence.

```text
# One repository per line
https://github.com/Steamdeckchecker/SDC-Benchmark-
https://github.com/Hooandee/panel-de-control/releases
Ciphay/Decky-File-Manager
```

Blank lines and lines beginning with `#` are ignored. Both `owner/repo` and URLs ending in `/releases` work. The file holds your **complete** monitored list. Removing a line and reloading the file stops monitoring that repository; it does not uninstall an already installed plugin.

The file is read at startup, before every update check, and through **Import → repos.txt öffnen → repos.txt neu einlesen**. If it is missing, the saved list is retained; an update check reports the missing file path and installs nothing.

## Browse Decky Plugins

Use the separate **Browse Decky Plugins** button just above **Repositories from repos.txt**. The browser uses its own Decky view with a Back button, so pressing Enter on the virtual keyboard does not close the browser. Search by name, author, repository, description or tag. Sort by stars, downloads, release date or name using the buttons on the page; **Filter by tag** expands a list of popular tags. These controls stay within the browser view. The catalog loads the [plugin list from Safet Zahirovic's Decky Plugin Explorer](https://safetzahirovic.github.io/decky-plugins-explorer/) in the background, so a slow network request does not block the Decky backend. Use **Refresh** to load a newer catalog.

**Add to Updater** writes the GitHub URL into the detected `repos.txt`; if the file does not exist, it is created in the first existing Downloads directory. For a repository already in the file, the button reads **Remove from Updater**. Removing a repo deletes only its entry from `repos.txt` and stops following it; it does not uninstall the plugin. Comments, blank lines, other entries and existing line endings are preserved. The updated file is used for future automatic checks and after restarting. New repositories are considered on the next check according to your installation mode.

The Explorer is an independent, automatically maintained GitHub index; its entries have not been vetted for security. A catalog entry does not guarantee a compatible release ZIP. Review source code and follow only repositories you trust.

## Check for updates

1. In Decky, select **GitHub Updates → Updates prüfen**.
2. Follow the current repository, step, and progress. The percentage may pause while GitHub responds; elapsed time keeps running.
3. View the results and any error messages in the plugin. The Steam UI briefly restarts after successful installations.

A release ZIP must contain a built Decky plugin with `plugin.json`, `package.json`, `main.py`, and `dist/index.js`. Its display name may differ from the GitHub repository name. Versions, archive sizes, and archive paths are checked before installation. Old installations are stored under `~/homebrew/data/github-plugin-updater/backups/`; downloaded ZIPs go to `~/Downloads`.

When the GitHub API rate limit is reached, the plugin tries the public releases page. After a Python TLS handshake error, it can also retry with system `curl` while still verifying certificates. Real network failures and denied downloads can still prevent updates.

## Language and confirmation mode

The interface follows your Steam language setting: German, English, Spanish, French, or Russian. Any other language falls back to English.

Under **Settings → Installation mode**, choose **Install automatically** (the existing behavior) or **Ask before installing**. In confirmation mode the plugin still checks releases, but it downloads and installs nothing until you approve each update. After the scan, a popup shows the **changelog** (GitHub release notes) for each pending update with **Yes, install** and **No, skip this release** buttons. When a release has no notes, the interface says so. A declined release stays skipped on subsequent scheduled checks; a newer release is offered again. Pending approvals survive a Decky restart and are also shown at the top of the plugin. Only clicking **Yes** or **No** records a decision. Pressing B closes the popup without declining; **Open next approval popup** lets you return to it. An unexpectedly closed popup will not trigger a series of new popups. Each decision is followed by the next prompt. Once you have answered them all, the Steam UI restarts once, provided at least one update was installed. Declining every update needs no restart. A new scan waits until all pending approvals are resolved.

## Self-updates

If `https://github.com/Steamdeckchecker/Github-Decky-Plugins-Updater` appears in `repos.txt`, the plugin checks its own repository for releases. It only accepts ZIPs whose plugin identity and package name match the installed updater. It then replaces its plugin directory. In confirmation mode, the self-update also requires your approval; restarting waits until the remaining prompts have been answered.

From version 1.6.8, the frontend invokes Decky's own Steam UI restart utility once the installation and approvals have finished. The plugin RPC completes before Steam is restarted; Decky Loader itself is not stopped. If the utility reports an error or the UI is still present eight seconds later, the plugin offers **Try restart again**. You can still check for updates after a restart failure.

**Verify that this URL exactly matches your published GitHub repository.** Updates require a reachable repository with built plugin ZIPs attached to its releases.

## Development

Run `pnpm install` and `pnpm run build` in the source directory to produce `dist/index.js`. The installable ZIP must already contain this file; Node.js is not needed on the Steam Deck.
