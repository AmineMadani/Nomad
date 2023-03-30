import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor() { }

  async setPreference(key:string,value:any) {
    await Preferences.set({
      key: key,
      value: JSON.stringify(value),
    });
  }

  async getPreference(key:string):Promise<any> {
    const item = await Preferences.get({ key: key });
    if(item.value) {
      return JSON.parse(item.value);
    }
    return item.value;
  }

  async deletePreference(key:string){
    await Preferences.remove({ key: key });
  }
}
