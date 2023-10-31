import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor() { }

  /**
   * Set the value of a preference with the given key.
   * @param key The key of the preference to set.
   * @param value The value to set the preference to.
   */
  async setPreference(key:string,value:any) {
    await Preferences.set({
      key: key,
      value: JSON.stringify(value),
    });
  }

  /**
   * Get the value of a preference with the given key.
   * @param key The key of the preference to get.
   * @returns A Promise that resolves to the value of the preference.
   */
  async getPreference(key:string):Promise<any> {
    const item = await Preferences.get({ key: key });
    if(item.value) {
      return JSON.parse(item.value);
    }
    return item.value;
  }

  /**
   * Delete the preference with the given key.
   * @param key The key of the preference to delete.
   */
  async deletePreference(key:string){
    await Preferences.remove({ key: key });
  }
}
