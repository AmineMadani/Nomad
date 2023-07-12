import { PluginListenerHandle } from "@capacitor/core";

export interface IntentActionPlugin {
  
  echo(options: { value: string }): Promise<{ value: string }>;

  /**
  * Listen for send action intent events (Android only). The extras will be passed as a key value pair
  * directly from the Android intent.
  */
  addListener(eventName: 'appActionIntent', listenerFunc: (data: AppSendActionIntentResult) => void): PluginListenerHandle;
}

export interface AppSendActionIntentResult {
  extras: any;
};
