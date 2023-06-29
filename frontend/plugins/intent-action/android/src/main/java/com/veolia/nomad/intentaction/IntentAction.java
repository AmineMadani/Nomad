package com.veolia.nomad.intentaction;

import android.util.Log;

public class IntentAction {

    public String echo(String value) {
        Log.i("Echo", value);
        return value;
    }
}
