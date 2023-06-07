import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private platform: Platform
  ) { }

  /**
   * Check if the current platform is Android.
   * @returns true if the current platform is Android, false otherwise.
   */
  isMobilePlateform():boolean{
    return this.platform.is('android');
  }

  /**
   * Convert a Map object to a JSON string.
   * @param map The Map object to convert to JSON.
   * @returns The JSON string representing the Map object.
   */
  mapToJson(map: Map<string, string[]> | undefined):string{
    let jsonObject: any = undefined;
    if(map) {
      jsonObject = {};
      map.forEach((value, key) => {
            jsonObject[key] = value
      });
    }
    return JSON.stringify(jsonObject);
  }

  /**
   * Derialize a Json to a type
   * @param targetInstance destination objevt
   * @param sourceInstance  source object
   * @returns an full filled object
   */
  deserialize(targetInstance: any,sourceInstance: any):any {
    const keys = Object.keys(targetInstance);
    for (const key of keys) {
      if (sourceInstance.hasOwnProperty(key)) {
          targetInstance[key] = sourceInstance[key];
        }
    }
    return targetInstance;
    }
}
