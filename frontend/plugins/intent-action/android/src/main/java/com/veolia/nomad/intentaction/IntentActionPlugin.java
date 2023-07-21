package com.veolia.nomad.intentaction;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Iterator;

@CapacitorPlugin(name = "IntentAction")
public class IntentActionPlugin extends Plugin {

    @PluginMethod
    public void closeIntent(PluginCall call) {
        JSObject value = call.getObject("value");
        JSObject ret = new JSObject();
        Intent returnIntent = new Intent();

        for (Iterator<String> it = value.keys(); it.hasNext(); ) {
            String key = it.next();
            String val = value.getString(key);
            ret.put(key, val);
            returnIntent.putExtra(key,val);
        }

        getActivity().setResult(getActivity().RESULT_OK, returnIntent);
        getActivity().finish();

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
