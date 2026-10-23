# FormuLater

FormuLater is an Android app for organizing engineering and math formulas. It includes an editable formula library, memorization tools, a beam diagram editor, and OCR for importing formulas from PDFs and images.

Formulas and study data are stored on the device. You do not need an account to use the app. An internet connection is only needed for tasks such as checking for and downloading updates.

## Features

- Browse formulas in the built-in `MSTC`, `HPGE`, and `PSAD` categories.
- Add, edit, organize, and favorite your own formulas.
- Review formulas with Flashcards, Memorization, or View All.
- Draw beam diagrams with supports, loads, moments, point labels, and span dimensions.
- Import formula content from PDFs and images using OCR.
- Format equations with the built-in symbol keyboard or formula shorthand.
- Export and import JSON backups, with an option to back up to a folder on the device.
- Choose a theme, accent color, font, text size, and other display settings.

## Install the app

1. Open the project's GitHub repository and go to **Releases**.
2. Download `FormuLater.apk` from the latest release.
3. Open the APK on your Android device. If prompted, allow your browser or file manager to install unknown apps.
4. Confirm the installation.

Updates are installed through Android's normal APK installer; the app does not install them silently.

## Project files

| Path | Description |
| --- | --- |
| `www/index.html` | Main app interface, formula editor, study screens, beam diagram editor, keyboard, and settings. |
| `www/formulas.js` | Built-in formula catalog. |
| `www/upload.js` | PDF/image import and OCR workflow. |
| `www/responsive.js` | Layout adjustments for screen size and orientation. |
| `www/sw.js` | Service-worker cache used by the web app. |
| `www/lib/` | PDF.js, Tesseract.js, and related OCR assets. |
| `native/android/FormulaFolderPlugin.java` | Android folder picker used for backups. |
| `native/android/SystemBarsPlugin.java` | Android system bar and display-inset handling. |
| `capacitor.config.json` | Capacitor configuration. |
| `.github/workflows/build-apk.yml` | GitHub Actions workflow for building and publishing the APK. |

## Editing the built-in formulas

The built-in catalog is in `www/formulas.js`. Formulas are grouped under `MSTC`, `HPGE`, and `PSAD`. A formula entry can contain these fields:

- `name`: the formula's display name.
- `formula`: the expression shown in the app.
- `where`: an array describing the variables and symbols.
- `mnemonics`: an optional memory aid.
- `acceptedAnswers`: optional alternate answers for Memorization mode.

For example:

```js
{
  "name": "Newton's Second Law",
  "formula": "F = ma",
  "where": [
    "F = force",
    "m = mass",
    "a = acceleration"
  ],
  "mnemonics": "Force equals mass times acceleration",
  "acceptedAnswers": ["F=ma"]
}
```

Add the entry to the appropriate category array. Keep the surrounding brackets and commas valid, and make sure each `where` item is a string. Changes to `www/formulas.js` affect the built-in catalog in the app; they do not overwrite formulas saved by a user on their device.

## Beam diagrams

The diagram editor is available when creating or editing a formula. You can add supports, point and distributed loads, moments, and section shapes. Support points are labeled from left to right by default (`Point A`, `Point B`, and so on), and the labels can be changed in Advanced Options.

The overall span label defaults to `L`. When a point load divides the span, the diagram can also show the segment dimensions `a` and `b`. The preview stays at the top of the editor while its controls scroll. Saved diagrams appear in formula details above the **Where** and **Mnemonics** sections and are also shown in Memorization mode.

## Importing from a PDF or image

Go to **Build & Edit → New → Upload**, then choose a PDF or image. Image formats include JPG/JPEG, PNG, WebP, GIF, and BMP.

### Read specific areas

1. Open the file in the preview.
2. Place a **Name**, **Formula**, **Where**, or **Mnemonic** box over the text you want to capture.
3. Move or resize the boxes as needed.
4. Select **Read boxes**, then review the results in Summary before saving.

You can add multiple boxes of the same type. Each box is handled separately.

### Read a page or a PDF with multiple pages

Use **Read whole page** to read the current page, or choose the multi-page option for a PDF. Review the extracted formulas in Summary, correct any errors, and save individual cards or use **Save All**. The multi-page reader lets you choose how many pages to process, starting from the current page, and can be cancelled while it is running.

OCR can misread complex equations. Check fractions, powers, subscripts, Greek letters, and operators before saving. Release builds include English and Greek language data; if Greek data is missing, the app may fall back to English recognition and show a warning.

In the preview, pinch to zoom and drag to move around the page. The on-screen zoom controls are available as well. Use **Remove file** to close the current document; the app asks before clearing it and any unsaved box selections.

## Formula keyboard and shorthand

The formula editor has **ABC**, **123**, **αβ**, and **sin ln** keyboard layouts. Common structures can also be entered using shorthand:

| Entry | Result |
| --- | --- |
| `1/2` | Fraction |
| `a_b` | Subscript |
| `a^b` or `a^(bc)` | Superscript |
| `rt(ab)` | Square root of `ab` |
| `rt^3(ab)` | Cube root of `ab` |
| `\theta`, `\alpha`, `\Theta` | Greek letters |
| `$ab` | Integral notation |
| `$^a_b(dc)` | Integral with limits |
| `+-` | `±` |
| `*` | `×` |

A typing guide is available in the app. Check the rendered formula before saving, especially when entering a longer expression.

## Storage and backups

User-created formulas are stored locally by the app. Open **Storage & Import / Export** from the main menu or Settings to export a JSON backup or import one. You can also select a folder through Android's folder picker; when enabled, FormuLater writes `FormuLater.json` to that folder after changes.

Imports use the app's version 1 JSON backup format and are checked before they are added. The importer checks the file structure, field types, category names, text sizes, expression nesting, and file size. Files larger than 5 MB or containing more than 5,000 formulas are rejected. Imports are treated as data, not as executable code.

Import conflicts are checked against formulas created by the user, not the built-in reference catalog. Depending on the conflict, you can replace, update, or skip an incoming formula.

**Keep a separate backup of formulas you need.** Uninstalling the app or clearing its data can remove locally stored formulas. FormuLater does not upload them to a cloud service.

## Building an Android APK

The repository includes a GitHub Actions workflow at `.github/workflows/build-apk.yml`. It runs when code is pushed to `main`, or when started manually from the repository's **Actions** tab.

Before running a release build, add these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore. |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password. |
| `ANDROID_KEY_ALIAS` | Alias of the private key entry inside your release keystore. |
| `ANDROID_KEY_PASSWORD` | Password for the signing key. |

The workflow uses Node.js 20 and Java 17, prepares the Capacitor Android project, checks the OCR language files, builds the signed APK, and publishes the release assets. It expects the release tag `latest-apk` and the assets `FormuLater.apk` and `FormuLater-version.json`.

Android only installs an APK as an update when its application ID and signing certificate match the installed app. Keep the same release keystore for future builds. Do not commit the keystore or passwords to the repository, and keep a secure backup of the keystore. Losing it may prevent you from publishing updates that install over existing copies of the app.

The workflow generates the version metadata for the repository used to run it and increases the Android version code on each run. If you change the release tag or asset names, update the corresponding app update configuration too.


## Troubleshooting

**The update will not install over the current app**  
Check that the APK was signed with the same release keystore as the installed version. A debug-signed APK or a different signing certificate may be rejected by Android.

**OCR has trouble with Greek letters**  
Check the warning in Summary and make sure the APK includes the Greek language data. Correct the extracted formula before saving it.

**My saved formulas are missing**  
If the app was uninstalled or its data was cleared, restore from a JSON export or the folder you selected for automatic backups.

**Android will not open the downloaded APK**  
Allow your browser or file manager to install unknown apps when prompted, then open the file again.

## License

See [`LICENSE`](LICENSE) for the license terms.
