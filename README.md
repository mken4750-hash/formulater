# FormuLater (Android APK)
1. Upload ALL files to a GitHub repo (including .github/workflows/build-apk.yml), then add the four signing secrets described in *Release signing* below.
2. Open the Actions tab; the Build APK workflow runs on every push (or press Run workflow).
3. When it turns green (about 5 min), go to Releases > Latest APK and download FormuLater.apk.
4. On your phone, open the APK and allow Install unknown apps for your browser.
Edit the app interface in `www/index.html` and the built-in formula catalog in `www/formulas.js`. It works fully offline.


## Editing the built-in formula catalog

All built-in reference formulas are kept in one file: `www/formulas.js`. The file contains the category groups `MSTC`, `HPGE`, and `PSAD`; each formula record includes its `name`, `formula`, `where` explanations, and `mnemonics` text. Optional `acceptedAnswers` lists alternate formula spellings accepted by the memorization game. You do not need to edit `index.html` to add a formula.

To add a formula, copy a record from the desired category in `www/formulas.js`, paste it into that category's array, and edit the values. Example:

```js
{
  "name": "Example Formula",
  "formula": "F = ma",
  "where": [
    "F = force",
    "m = mass",
    "a = acceleration"
  ],
  "mnemonics": "Force equals mass times acceleration"
}
```

Keep the category array and object syntax valid: put a comma between neighboring records, keep `where` as an array of strings, and use an empty string for `mnemonics` when no memory aid is needed. For formulas with alternate accepted text in memorization, add an `acceptedAnswers` array. Keep each record inside its category (`MSTC`, `HPGE`, or `PSAD`). These are the app's built-in reference formulas; user-added formulas and user edits are stored separately by the app.

## Upload a formula (Build & Edit > New > Upload)
Open a PDF or photo, drag the Name / Formula / Where / Mnemonics boxes onto the matching parts, resize them, then press Read boxes.
OCR runs fully offline (Tesseract.js + pdf.js bundled in `www/lib`). English data is stored as uncompressed `eng.traineddata` because Android packaging can strip a final `.gz` suffix. The GitHub Actions build downloads the official Tesseract `tessdata_fast` Greek (`ell.traineddata`) model, explicitly stages it in Android web assets, and verifies both model files inside the final APK before publishing. At runtime the app checks whether the Greek model is present; if an older or incomplete APK is installed, it falls back to English OCR rather than failing to start and shows a warning in Summary. When the model is present, the worker uses English + Greek to improve recognition of Greek letters in names and formulas. Results open in one common Summary editor, whether you read boxes or a whole page.

## Read a whole page / PDF (no boxes)
Build & Edit > New > Upload > **Read whole page** (or **Read all N pages** for a PDF). Lines are sorted into Name / Formula / Where / Mnemonic, then shown on the shared Summary screen. Edit text, change line labels, preview formulas, remove cards, save a single card, or use Save All. Choose a single target with `Save into:` or select `Individual Category` to assign each card to MSTC, HPGE, or PSAD. Long-press a card to select it and use `Save selected only`.

**Read N pages:** for a PDF with several pages, use the *Pages to read* slider (same style as the scroll-sensitivity slider) to pick how many pages to read, starting from the page you are on, then press *Read N pages*.

## Greek letters, fractions and operators
The OCR engine combines the official English and Greek Tesseract models. This improves recognition of Greek letters, and the cleanup layer also normalizes common Unicode fraction glyphs and math operators. OCR is still an estimate for complex typeset equations: check the formula preview and correct any missed fraction bars, powers, subscripts, or symbols before saving. The formula editor's shorthand guide remains available in Summary.

## Progress, Cancel and slow phones
* Every slow step (opening a file, starting the reader, reading) shows a progress bar, the elapsed time and a **Cancel** button. The phone's Back button also cancels.
* While reading several pages, **Stop & use pages read so far** keeps what was already read.
* If the reader does not respond it is stopped and restarted automatically (blob worker, then plain non-SIMD core). If every method fails you get a message with details (stage reached, file sizes as received, WebView version) instead of an endless 0%.
* `sw.js` no longer touches files in `lib/`.
* On phones pages are drawn smaller and the reader gets a size-limited image (`LIM` at the top of `www/upload.js`); in box mode each box is re-drawn straight from the PDF at the exact size needed, so text stays sharp without a huge canvas in memory.


## Uploaded PDF/photo zoom and removal
Browser-level pinch zoom is disabled for the app so its layout stays at the intended size. Inside the uploaded PDF or photo preview only, use a two-finger pinch to zoom and one-finger drag to pan the page; the existing − / + zoom buttons remain available. Once a file is open, use **Remove file** below the header to clear it and return to the empty upload screen. A confirmation appears before the current file and unsaved box selections are cleared.

## Keyboard shorthand (formula fields on the upload screens)
`1/2` fraction · OCR normalizes common printed fraction glyphs such as ½ and ¾ · `a_b` subscript · `a^b` / `a^(bc)` superscript · `rt(ab)` square root · `rt^3(ab)` cube root · `\theta` `\alpha` … Greek (`\Theta` capital) · `$ab` integral · `$^a_b(dc)` integral with limits · `+-` ±, `*` ×. A guide with live examples is built into the screens.

## Memorization wall tiles & View All navigation
* In Memorization, correct answers flip one by one into persistent green tiles; each tile stays green until the full staggered reveal sequence finishes. Removing a placed block still makes it fall away.
* In View All, there is no separate star beside the gear and no bottom-center chevron. Long-press the visible formula card to open the formula-options sheet.
* In the options sheet, long-press a numbered tile to preview its category, position, formula, Where notes, and mnemonic. Hold and drag a numbered tile to reorder formulas; ordering is saved for the category, including when viewing starred formulas only.
* The star filter is inside the long-press options sheet and toggles between all formulas and starred-only formulas. The individual star on each formula card still marks/unmarks formulas.

## Upload, boxes, and Summary navigation (latest UI update)
* The upload screen has one **Open PDF / photo** action. Supported formats are PDF, JPG/JPEG, PNG, WebP, GIF, and BMP.
* You can place multiple boxes of every type (Name, Formula, Where, Mnemonic). Every box has its own ID, so adding another box with the same label won't replace a previous one. Boxes start square and can still be moved/resized.
* If phone Back leaves Summary and returns to the document, the unsaved Summary draft is retained. **Return to Summary** restores the draft without losing edits.
* Memorization answers blend into the wall background instead of remaining as white tiles; the short accent effect and falling removal animation remain.
* The Flashcards hint is shown once per session and fades after the user has both swiped and flipped a card.
* In View All, the long-press hint fades after opening options, the card counter is centered at the bottom, and a ghost swipe-direction guide disappears after the first successful swipe. The next card tracks continuously with the finger as the current card is dragged.


## Local-only formula storage, folder backups, and sharing
The front screen now offers **Start using FormuLater** and **Import or export formulas**. The app works locally without signing in or connecting a cloud account. Created formulas are saved automatically in the app's local storage on the device.

Open **Storage & Import / Export** from the main menu or Settings. Choose **App storage on this phone** for app-local saving, or **Choose a phone folder for automatic backup** to select a folder through Android's system folder picker. The app writes a `FormuLater.json` backup into that folder after changes. Export also lets you save a portable JSON file wherever you choose, and Import lets you load a backup shared by another person.

### Import safety
Only FormuLater JSON version 1 backups are accepted. The import validates the exact top-level keys and the exact formula fields (`id`, `updatedAt`, `c`, `n`, `f`, `w`, `m`, `ld`, `ci`), field types, category names, string lengths, nested-expression depth, and file size. Unknown fields—including unrecognized configuration or command-like properties—are rejected instead of being interpreted. Imported content is stored as plain text; it is never evaluated or executed as JavaScript, HTML, a script, or a plugin. Formula conflicts are checked against user-created formulas only, so an import cannot replace or edit the app's built-in reference formulas. Similar user-created formulas still prompt you to **Replace**, **Update**, or **Don't import**, with the option to apply your choice to remaining conflicts.

Imported files and exports are limited to 5 MB and 5,000 formulas; the app also applies per-field length limits and a 64-level parenthesis-nesting limit to protect the formula renderer. Invalid files are rejected before any formulas are added, so a malformed backup does not partially import formulas.

### Local data and folder access
The selected-folder permission is provided by Android's system document picker; FormuLater writes only its named `FormuLater.json` backup in the folder you selected. The app does not upload formulas anywhere. Uninstalling the app or clearing its data can remove app-local formulas, so use Export or enable a selected-folder backup if you need a separate copy. Keep exported backup files private if the formulas themselves are sensitive.

## Full-screen display and system bars
The Android build draws the app edge-to-edge and colors the status and navigation bar surfaces to match the currently selected app theme, including in recent-apps previews where transparent bars may otherwise appear black or white. The bar icon colors follow the selected light/dark app theme, and native insets are applied to keep content clear of the clock, camera cutout, and navigation area. Android still owns the status indicators, gesture handle, and notification shade; the app does not hide or recolor the notification shade itself. Some OEMs may draw their own system overlays or enforce platform-specific behavior.

## Phones, tablets and rotation (portrait + landscape)
The app now adapts to any screen size and rotates freely (the activity is never orientation-locked and handles rotation without restarting, so your place and unsaved work are kept).

* **Adaptive layout (pure CSS, `RESPONSIVE LAYER` at the end of the `<style>` in `www/index.html`).** Phones use the original single column. From 600 px wide, content sits in a centred column with comfortable gutters instead of stretching edge to edge, and menus become a 2-column grid. Real tablets (both sides at least 600 dp) also get larger type.
* **Landscape = two panes.** Flashcards fill the height and the answer side splits into formula | notes; View All cards become formula | notes; Memorization shows question + answer on the left and the symbol picker on the right (the picker scrolls on its own); the "You are correct" panel and bottom sheets dock to the side/bottom without covering the whole screen; the upload screen shows its tools on the left and the document on the right.
* **Landscape phones** (very little height) get a compact header, tighter spacing and a one-row category strip in Memorization.
* **Safe areas on all four sides.** `SystemBarsPlugin` now reports top, bottom, left and right insets (camera cut-outs and the side-mounted navigation bar in landscape). They are re-read after every rotation.
* **Rotation animation.** When the width changes (rotation, split-screen, foldables) the screen plays one short fade/settle (about 0.3 s, opacity + transform only, so it stays smooth). It does not play for height-only changes such as the on-screen keyboard, and it is skipped when the phone's "reduce motion" setting is on. After rotating, formulas are re-fitted and the PDF/photo viewer is re-sized automatically (`www/responsive.js`).
* **Build.** The workflow has a step that makes sure `MainActivity` keeps `orientation|screenSize|smallestScreenSize|screenLayout|density` in `configChanges`, removes any `screenOrientation` lock and sets `resizeableActivity="true"`. `manifest.json` declares `"orientation": "any"`.

## Build the APK
Push the project to the `main` branch or run **Actions → Build APK** in GitHub. The workflow builds the Android app, packages English and Greek OCR models, verifies the models inside the APK, and uploads `FormuLater.apk` as a workflow artifact and latest release. No sign-in or online storage configuration is required.


## Check for app updates from GitHub

The app automatically checks GitHub Releases when opened (with a six-hour cache) and also provides **Settings → App updates → Check for updates**. If a newer APK is found, the main menu and Settings show an **Update available** option. The download button opens the released `FormuLater.apk`; Android still requires the user to open the downloaded APK and confirm installation. Updates are not installed silently.

The Build APK workflow generates `www/update-config.js` for the repository that runs the workflow and publishes `FormuLater-version.json` alongside the APK. Keep both release assets named exactly `FormuLater.apk` and `FormuLater-version.json`, and keep the release tag `latest-apk` unless you also update the configuration. The APK's Android `versionCode` increases with every workflow run.

### Release signing: make APK updates install over the existing app

Android only accepts an update when the new APK has the same `applicationId` (`com.formulater.app`) **and** the same signing certificate as the installed app. The `"App not installed as package conflicts with an existing package"` error means one of those differs, usually a debug-signed build installed first and a release-signed build second. To prevent it, the workflow now **always builds a release APK signed with your persistent keystore** and stops with a clear message if the signing secrets are missing, so a throw-away debug-signed APK can never be published.

#### One-time setup in the new GitHub repository

Open **Settings → Secrets and variables → Actions → New repository secret** and add all four secrets:

| Secret name | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | The full Base64 text from `key.txt` (the encoded keystore), pasted as one value |
| `ANDROID_KEYSTORE_PASSWORD` | The keystore (store) password |
| `ANDROID_KEY_ALIAS` | `ceformulas` (the alias stored inside the existing keystore; only change it if you created a new keystore with a different alias) |
| `ANDROID_KEY_PASSWORD` | The key password |

Then run **Actions → Build APK → Run workflow** (or push to `main`). The workflow decodes the keystore, checks the alias and passwords with `keytool`, signs the release build, and publishes `FormuLater.apk` to the `latest-apk` release.

If you ever need a brand-new keystore: `keytool -genkeypair -v -keystore formulater-release.jks -alias formulater -keyalg RSA -keysize 2048 -validity 10000`. Encode it with `base64 -w 0 formulater-release.jks` (Linux), `base64 formulater-release.jks | tr -d '\n'` (macOS) or `[Convert]::ToBase64String([IO.File]::ReadAllBytes('formulater-release.jks'))` (Windows PowerShell), and use that alias in `ANDROID_KEY_ALIAS`. Keep the keystore file and passwords private, never commit them, and keep a safe backup: if the keystore is lost, existing installs can no longer be updated in place.

#### Moving from the old "CE Formulas" app

FormuLater uses a new `applicationId`, so Android treats it as a different app: it installs alongside the old one and does not carry over the old app's data. Before switching, export your formulas from the old app (Storage & Import / Export). FormuLater can import those older backups. Once FormuLater is installed from a release-signed build, every later build signed with the same keystore updates it in place, with no uninstall needed.
