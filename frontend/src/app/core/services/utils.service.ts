import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  
  constructor(
    private platform: Platform
  ) { }

  isMobilePlateform():boolean{
    return this.platform.is('android');
  }

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

}
