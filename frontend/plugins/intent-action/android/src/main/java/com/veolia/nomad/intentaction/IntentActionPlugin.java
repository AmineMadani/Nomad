package com.veolia.nomad.intentaction;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "IntentAction")
public class IntentActionPlugin extends Plugin {

    private IntentAction implementation = new IntentAction();

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", implementation.echo(value));
        call.resolve(ret);
    }

    /**
     * Handle CUSTOM ACTION intents
     * @param intent
     */
    @Override
    protected void handleOnNewIntent(Intent intent) {

        super.handleOnNewIntent(intent);

        // read intent
        String action = intent.getAction();

        if ("com.veolia.nomad.action".equals(action)) {

            // Get the extras from the intent
            Bundle bundle = intent.getExtras();

            JSObject extras = new JSObject();
            if(bundle != null) {
                for (String key : bundle.keySet()) {
                    Object value = bundle.get(key);
                    extras.put(key, value);
                }
            }

            JSObject ret = new JSObject();
            ret.put("extras", extras);

            notifyListeners("appActionIntent", ret, true);
        }
    }

}
