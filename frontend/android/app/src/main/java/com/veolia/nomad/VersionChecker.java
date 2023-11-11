package com.veolia.nomad;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.AsyncTask;
import android.telephony.TelephonyManager;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.ref.WeakReference;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import javax.net.ssl.HttpsURLConnection;


public class VersionChecker {

  private static final String TAG = "VersionChecker";

  /*
   * Start version checking.
   */
  public static void check(Activity activity, Integer currentApkVersion, String checkVersionUri) {
    Log.i(TAG, "Start checking");
    if (isConnectionFast(activity)) {
      new VersionCheckerTask(activity).execute(currentApkVersion, checkVersionUri);
    } else {
      Log.i(TAG, "Slow network : checking aborted");
    }
  }

  /**
   * Get Json version config and check compatibility with current Apk.
   * Asynchronous task needed for http request.
   */
  public static class VersionCheckerTask extends AsyncTask<Object, Void, String> {

    // If activity is killed while async task is executing, the context is leaked.
    // Therefore, the use of WeakReference avoids this.
    private WeakReference<Activity> activityReference;
    private Integer currentApkVersion;

    VersionCheckerTask(Activity activity) {
      this.activityReference = new WeakReference<>(activity);
    }

    @Override
    protected String doInBackground(Object... params) {
      try {
        Log.i(TAG, "Start calling version check API");

        this.currentApkVersion = (Integer) params[0];
        String checkVersionUri = (String) params[1];

        URL url = new URL(checkVersionUri);
        HttpsURLConnection urlConnection = (HttpsURLConnection) url.openConnection();
        try {
          StringBuilder result = new StringBuilder();
          InputStream in = new BufferedInputStream(urlConnection.getInputStream());
          BufferedReader reader = new BufferedReader(new InputStreamReader(in));
          String line;
          while ((line = reader.readLine()) != null) {
            result.append(line);
          }
          Log.i(TAG, "End calling version check API");
          return result.toString();
        } catch (Exception e) {
          Log.e(TAG, "Exception from Request");
          e.printStackTrace();
          return null;
        } finally {
          urlConnection.disconnect();
        }
      } catch (Exception e) {
        Log.e(TAG, "Exception From HttpsURLConnection");
        e.printStackTrace();
        return null;
      }
    }

    @Override
    protected void onPostExecute(String result) {
      if (result != null) {
        try {
          JSONObject response = new JSONObject(result);

          // Is update to do ?
          if (response.getString("warningToUpdate").equals("true")) {
            // Check current VS expected versions
            if (currentApkVersion < response.getInt("targetVersionCode")) {
              // Check limit date for update
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.FRANCE);
              // Today
              Date today = sdf.parse(sdf.format(new Date()));
              // Deploiement date
              String deploiementDateStr = response.getString("deploimentDate");
              Date deploiementDate = sdf.parse(deploiementDateStr);
              long diff = today.getTime() - deploiementDate.getTime();
              long diffInDays = (diff / (1000 * 60 * 60 * 24));
              // Then...
              if (diffInDays > Long.parseLong(response.getString("extentionTimebyDays"))) {
                // Immediate redirection to PlayStore
                startPlayStore();
              } else {
                // Let user choose
                new AlertDialog.Builder(activityReference.get())
                  .setTitle("Mise à jour disponible")
                  .setMessage("Vous n'utilisez pas la dernière version de l'application.")
                  .setPositiveButton("Mettre à jour", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                      startPlayStore();
                    }
                  })
                  .setNegativeButton("Continuer", null)
                  .setIcon(android.R.drawable.ic_dialog_info)
                  .setCancelable(false)
                  .show();
              }
            }
          }
        } catch (Exception e) {
          Log.e(TAG, "Exception when analysing json response");
          e.printStackTrace();
        }
      }
    }

    /*
     * Start the PlayStore with an intent.
     */
    private void startPlayStore() {
      Activity activity = activityReference.get();
      try {
        activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + activity.getPackageName())));
      } catch (android.content.ActivityNotFoundException anfe) {
        activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + activity.getPackageName())));
      }
      // Kill app
      //activity.finishAndRemoveTask();
      activity.finish();
      System.exit(0);

    }
  }

  /**
   * Determines if connection is fast.
   *
   * @param activity calling activity
   * @return true when wifi or 4G
   */
  public static boolean isConnectionFast(Activity activity) {
    boolean result = false;
    ConnectivityManager cm = (ConnectivityManager) activity.getSystemService(Context.CONNECTIVITY_SERVICE);
    assert cm != null;
    NetworkInfo info = cm.getActiveNetworkInfo();

    if (info != null && info.isConnected()) {
      if (info.getType() == ConnectivityManager.TYPE_WIFI) {
        result = true;
      } else if (info.getType() == ConnectivityManager.TYPE_MOBILE) {
        // All cases are listed for comprehension and for eventual evolution
        switch (info.getSubtype()) {
          case TelephonyManager.NETWORK_TYPE_GPRS:
          case TelephonyManager.NETWORK_TYPE_GSM:
          case TelephonyManager.NETWORK_TYPE_EDGE:
          case TelephonyManager.NETWORK_TYPE_CDMA:
          case TelephonyManager.NETWORK_TYPE_1xRTT:
          case TelephonyManager.NETWORK_TYPE_IDEN:
            // 2G
            break;
          case TelephonyManager.NETWORK_TYPE_UMTS:
          case TelephonyManager.NETWORK_TYPE_EVDO_0:
          case TelephonyManager.NETWORK_TYPE_EVDO_A:
          case TelephonyManager.NETWORK_TYPE_HSDPA:
          case TelephonyManager.NETWORK_TYPE_HSUPA:
          case TelephonyManager.NETWORK_TYPE_HSPA:
          case TelephonyManager.NETWORK_TYPE_EVDO_B:
          case TelephonyManager.NETWORK_TYPE_EHRPD:
          case TelephonyManager.NETWORK_TYPE_HSPAP:
          case TelephonyManager.NETWORK_TYPE_TD_SCDMA:
            // 3G
            break;
          case TelephonyManager.NETWORK_TYPE_LTE:
          case TelephonyManager.NETWORK_TYPE_IWLAN:
            // 4G
            result = true;
            break;
          default:
            break;
        }
      }
    }
    return result;
  }

}
