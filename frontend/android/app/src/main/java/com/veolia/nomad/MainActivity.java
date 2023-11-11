package com.veolia.nomad;

import com.getcapacitor.BridgeActivity;
import com.veolia.nomad.VersionChecker;

public class MainActivity extends BridgeActivity {


   @Override
   public void onStart() {
    super.onStart();
    // VersionChecker.check(this, BuildConfig.VERSION_CODE, BuildConfig.VERSION_CHECK_URL);
    VersionChecker.check(this, BuildConfig.versionCode, BuildConfig.VERSION_CHECK_URL);
  }




}
