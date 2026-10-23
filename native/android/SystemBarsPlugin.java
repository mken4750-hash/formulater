package com.formulater.app;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Colors Android's status/navigation bar surfaces to match the app's active
 * theme, switches their icons to the matching contrast, and reports inset
 * sizes so the web UI can keep controls clear of system indicators.
 */
@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {

    @PluginMethod
    public void setAppearance(PluginCall call) {
        Boolean requested = call.getBoolean("darkIcons");
        final boolean darkIcons = requested == null || requested;
        String requestedColor = call.getString("backgroundColor");
        int barColor = Color.parseColor("#f2e8d5");
        // Only accept a plain six-digit CSS hex color supplied by the app theme.
        if (requestedColor != null && requestedColor.matches("#[0-9a-fA-F]{6}")) {
            barColor = Color.parseColor(requestedColor);
        }
        final int systemBarColor = barColor;
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("System bars are not available right now.");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                Window window = activity.getWindow();
                WindowCompat.setDecorFitsSystemWindows(window, false);
                // Use an opaque theme-matched color. Some Android skins (including
                // recent-apps previews) render transparent bars as black/white.
                window.setStatusBarColor(systemBarColor);
                window.setNavigationBarColor(systemBarColor);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    window.setStatusBarContrastEnforced(false);
                    window.setNavigationBarContrastEnforced(false);
                }

                View decor = window.getDecorView();
                WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decor);
                controller.setAppearanceLightStatusBars(darkIcons);
                controller.setAppearanceLightNavigationBars(darkIcons);

                JSObject result = new JSObject();
                WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(decor);
                float density = Math.max(activity.getResources().getDisplayMetrics().density, 1f);
                int topInset = 0;
                int bottomInset = 0;
                int leftInset = 0;
                int rightInset = 0;
                if (insets != null) {
                    // System bars + display cutout on ALL four sides, so the web UI stays clear of
                    // the camera notch and the (side-mounted) navigation bar in landscape too.
                    Insets all = insets.getInsets(
                        WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
                    topInset = all.top;
                    bottomInset = all.bottom;
                    leftInset = all.left;
                    rightInset = all.right;
                }
                result.put("topInset", Math.round(topInset / density));
                result.put("bottomInset", Math.round(bottomInset / density));
                result.put("leftInset", Math.round(leftInset / density));
                result.put("rightInset", Math.round(rightInset / density));
                call.resolve(result);
            } catch (Exception e) {
                call.reject("Unable to configure theme-matched system bars.", e);
            }
        });
    }
}
