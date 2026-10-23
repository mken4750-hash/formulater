package com.formulater.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.content.Context;
import android.util.Log;

import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import androidx.core.content.FileProvider;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "FormulaFolder")
public class FormulaFolderPlugin extends Plugin {
    private static final String PREFS = "formulater_folder_access";
    private static final String TREE_KEY = "tree_uri";
    private static final String FILE_NAME = "FormuLater.json";

    @PluginMethod
    public void pickFolder(PluginCall call) {
        try {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                    | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                    | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                    | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
            startActivityForResult(call, intent, "folderPicked");
        } catch (Exception e) {
            call.reject("Android could not open the folder picker: " + e.getMessage(), e);
        }
    }

    @ActivityCallback
    private void folderPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent data = result == null ? null : result.getData();
        if (result == null || result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
            JSObject out = new JSObject();
            out.put("cancelled", true);
            call.resolve(out);
            return;
        }
        Uri tree = data.getData();
        // Always request read+write explicitly: some devices return no grant flags in the result.
        int flags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
        try {
            getContext().getContentResolver().takePersistableUriPermission(tree, flags);
        } catch (Exception e) {
            call.reject("The selected folder did not grant persistent access. Please pick a different folder (not the top-level storage root, Downloads or Android).", e);
            return;
        }
        getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(TREE_KEY, tree.toString()).apply();
        JSObject out = new JSObject();
        out.put("cancelled", false);
        out.put("name", folderName(tree));
        call.resolve(out);
    }

    @PluginMethod
    public void hasFolder(PluginCall call) {
        JSObject out = new JSObject();
        Uri tree = savedTree();
        boolean ok = false;
        if (tree != null) {
            for (android.content.UriPermission perm : getContext().getContentResolver().getPersistedUriPermissions()) {
                if (perm.getUri().equals(tree) && perm.isWritePermission()) { ok = true; break; }
            }
        }
        out.put("hasFolder", ok);
        if (ok) out.put("name", folderName(tree));
        call.resolve(out);
    }

    @PluginMethod
    public void readJson(PluginCall call) {
        Uri tree = savedTree();
        JSObject out = new JSObject();
        if (tree == null) { out.put("exists", false); call.resolve(out); return; }
        try {
            Uri file = findBackup(tree);
            if (file == null) { out.put("exists", false); call.resolve(out); return; }
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            try (InputStream in = getContext().getContentResolver().openInputStream(file)) {
                if (in == null) throw new IllegalStateException("Could not open the backup file.");
                byte[] chunk = new byte[8192];
                int n;
                while ((n = in.read(chunk)) > 0) {
                    buf.write(chunk, 0, n);
                    if (buf.size() > 6 * 1024 * 1024) throw new IllegalStateException("The backup file is too large.");
                }
            }
            out.put("exists", true);
            out.put("data", new String(buf.toByteArray(), StandardCharsets.UTF_8));
            call.resolve(out);
        } catch (Exception e) {
            call.reject("Could not read the backup folder: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void writeJson(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("No formula backup data was supplied.");
            return;
        }
        Uri tree = savedTree();
        if (tree == null) {
            call.reject("Choose a folder first.");
            return;
        }
        try {
            Uri file = findOrCreateBackup(tree);
            ContentResolver resolver = getContext().getContentResolver();
            try (OutputStream out = resolver.openOutputStream(file, "wt")) {
                if (out == null) throw new IllegalStateException("Could not open the selected file for writing.");
                out.write(data.getBytes(StandardCharsets.UTF_8));
                out.flush();
            }
            JSObject result = new JSObject();
            result.put("saved", true);
            result.put("name", FILE_NAME);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Could not write the formula backup to the selected folder.", e);
        }
    }

    @PluginMethod
    public void clearFolder(PluginCall call) {
        Uri tree = savedTree();
        try {
            if (tree != null) {
                try { getContext().getContentResolver().releasePersistableUriPermission(tree,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION); }
                catch (Exception ignored) {}
            }
            getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(TREE_KEY).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not clear the saved folder permission.", e);
        }
    }

    @PluginMethod
    public void shareJson(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("No formula data was supplied.");
            return;
        }
        try {
            File dir = new File(getContext().getCacheDir(), "shared");
            if (!dir.exists() && !dir.mkdirs()) throw new IllegalStateException("Could not prepare the share folder.");
            File file = new File(dir, FILE_NAME);
            try (FileOutputStream out = new FileOutputStream(file, false)) {
                out.write(data.getBytes(StandardCharsets.UTF_8));
                out.flush();
            }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("application/json");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_SUBJECT, "FormuLater");
            send.putExtra(Intent.EXTRA_TITLE, FILE_NAME);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            send.setClipData(android.content.ClipData.newRawUri(FILE_NAME, uri));
            Intent chooser = Intent.createChooser(send, "Share FormuLater");
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivityForResult(call, chooser, "sharePicked");
        } catch (Exception e) {
            call.reject("Could not open the share menu: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void shareFile(PluginCall call) {
        String data = call.getString("data");
        String name = call.getString("name", "FormuLater.png");
        String mime = call.getString("mime", "application/octet-stream");
        if (data == null) {
            call.reject("No file data was supplied.");
            return;
        }
        try {
            String safe = name.replaceAll("[^A-Za-z0-9._ -]", "_");
            if (safe.trim().isEmpty()) safe = "FormuLater.bin";
            byte[] bytes = android.util.Base64.decode(data, android.util.Base64.DEFAULT);
            File dir = new File(getContext().getCacheDir(), "shared");
            if (!dir.exists() && !dir.mkdirs()) throw new IllegalStateException("Could not prepare the share folder.");
            File file = new File(dir, safe);
            try (FileOutputStream out = new FileOutputStream(file, false)) {
                out.write(bytes);
                out.flush();
            }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType(mime);
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_SUBJECT, "FormuLater");
            send.putExtra(Intent.EXTRA_TITLE, safe);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            send.setClipData(android.content.ClipData.newRawUri(safe, uri));
            Intent chooser = Intent.createChooser(send, "Share FormuLater");
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivityForResult(call, chooser, "sharePicked");
        } catch (Exception e) {
            call.reject("Could not open the share menu: " + e.getMessage(), e);
        }
    }

    @ActivityCallback
    private void sharePicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject out = new JSObject();
        out.put("shared", true);
        call.resolve(out);
    }

    private Uri savedTree() {
        String value = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(TREE_KEY, null);
        return value == null ? null : Uri.parse(value);
    }

    private String folderName(Uri tree) {
        try {
            String id = DocumentsContract.getTreeDocumentId(tree);
            int colon = id.lastIndexOf(':');
            String tail = colon >= 0 ? id.substring(colon + 1) : id;
            int slash = tail.lastIndexOf('/');
            if (slash >= 0) tail = tail.substring(slash + 1);
            if (tail.trim().length() > 0) return tail;
        } catch (Exception ignored) {}
        return "Selected folder";
    }

    private Uri findBackup(Uri tree) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        String rootId = DocumentsContract.getTreeDocumentId(tree);
        Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, rootId);
        try (Cursor cursor = resolver.query(children,
                new String[]{DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME},
                null, null, null)) {
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    if (FILE_NAME.equals(cursor.getString(1))) {
                        return DocumentsContract.buildDocumentUriUsingTree(tree, cursor.getString(0));
                    }
                }
            }
        }
        return null;
    }

    private Uri findOrCreateBackup(Uri tree) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        String rootId = DocumentsContract.getTreeDocumentId(tree);
        Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, rootId);
        Cursor cursor = null;
        try {
            cursor = resolver.query(children,
                    new String[]{DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME},
                    null, null, null);
            if (cursor != null) {
                int idColumn = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_DOCUMENT_ID);
                int nameColumn = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_DISPLAY_NAME);
                while (cursor.moveToNext()) {
                    String name = nameColumn >= 0 ? cursor.getString(nameColumn) : "";
                    if (FILE_NAME.equals(name)) {
                        String id = cursor.getString(idColumn);
                        return DocumentsContract.buildDocumentUriUsingTree(tree, id);
                    }
                }
            }
        } finally {
            if (cursor != null) cursor.close();
        }
        Uri root = DocumentsContract.buildDocumentUriUsingTree(tree, rootId);
        Uri created = DocumentsContract.createDocument(resolver, root, "application/json", FILE_NAME);
        if (created == null) throw new IllegalStateException("The selected folder could not create a JSON file.");
        return created;
    }
}
