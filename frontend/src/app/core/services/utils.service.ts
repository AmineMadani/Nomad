import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Stroke, Style } from 'ol/style.js';

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
}
