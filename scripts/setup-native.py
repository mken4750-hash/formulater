#!/usr/bin/env python3
"""Run from the project root AFTER `npx cap add android` (or on an existing android/ folder),
and BEFORE building in Android Studio / gradle. Safe to run repeatedly.
Installs the FormulaFolder + SystemBars native plugins, registers them in MainActivity,
and sets up the FileProvider used by the share menu."""
import re, shutil, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pkg_dir = root / 'android/app/src/main/java/com/formulater/app'
if not (root / 'android').exists():
    sys.exit('No android/ folder found. Run: npx cap add android')
pkg_dir.mkdir(parents=True, exist_ok=True)
for f in ('FormulaFolderPlugin.java', 'SystemBarsPlugin.java'):
    shutil.copy(root / 'native/android' / f, pkg_dir / f)
    print('copied', f)

# Register plugins in MainActivity
main = pkg_dir / 'MainActivity.java'
if not main.exists():
    cands = list((root / 'android/app/src/main/java').rglob('MainActivity.java'))
    if not cands: sys.exit('MainActivity.java not found')
    main = cands[0]
s = main.read_text()
regs = ''.join(f'        registerPlugin({c}.class);\n' for c in ('FormulaFolderPlugin', 'SystemBarsPlugin')
               if f'registerPlugin({c}.class)' not in s)
if regs:
    if 'void onCreate(' in s:
        s = re.sub(r'(void onCreate\([^)]*\)\s*\{)', lambda m: m.group(1) + '\n' + regs.rstrip('\n'), s, count=1)
    else:
        s = re.sub(r'(public class MainActivity extends BridgeActivity\s*\{)',
                   lambda m: m.group(1) + '\n    @Override\n    public void onCreate(android.os.Bundle savedInstanceState) {\n' + regs +
                   '        super.onCreate(savedInstanceState);\n    }\n', s, count=1)
    if 'registerPlugin(FormulaFolderPlugin.class)' not in s: sys.exit('Could not register plugins in MainActivity.java')
    main.write_text(s)
    print('registered plugins in', main)

# FileProvider for the share sheet
xml = root / 'android/app/src/main/res/xml'
xml.mkdir(parents=True, exist_ok=True)
(xml / 'file_paths.xml').write_text('<?xml version="1.0" encoding="utf-8"?>\n<paths xmlns:android="http://schemas.android.com/apk/res/android">\n    <external-path name="my_images" path="." />\n    <cache-path name="my_cache_images" path="." />\n</paths>\n')
man = root / 'android/app/src/main/AndroidManifest.xml'
m = man.read_text()
if 'androidx.core.content.FileProvider' not in m:
    prov = ('<provider android:name="androidx.core.content.FileProvider" android:authorities="${applicationId}.fileprovider" '
            'android:exported="false" android:grantUriPermissions="true"><meta-data android:name="android.support.FILE_PROVIDER_PATHS" '
            'android:resource="@xml/file_paths" /></provider>')
    m = m.replace('</application>', prov + '</application>', 1)
    man.write_text(m)
    print('added FileProvider')
print('Done. Now run: npx cap sync android  then rebuild and reinstall the app.')
