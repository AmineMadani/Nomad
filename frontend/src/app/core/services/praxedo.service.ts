import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IntentAction } from 'plugins/intent-action/src';
import { WorkorderService } from './workorder.service';
import { firstValueFrom } from 'rxjs';
import { LayerService } from './layer.service';
import { Workorder } from '../models/workorder.model';
import { Geolocation } from '@capacitor/geolocation';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class PraxedoService {

  constructor(
    private router: Router,
    private workorderService: WorkorderService,
    private layerService: LayerService,
    private utilsService: UtilsService
  ) {}

  public externalReport: string | undefined;

  public gps

  public praxedoListener() {
    IntentAction.addListener('appActionIntent', async res => {
      if(res.extras.REFEXTINT) {
        this.externalReport = res.extras.REFEXTINT;
      } else {

        let lStatus  =  await firstValueFrom(this.workorderService.getAllWorkorderTaskStatus());
        let lLayerWtr = await firstValueFrom(this.layerService.getAllVLayerWtr());

        let longitude;
        let latitude;
        let layer;
        let reasonId;

        if(res.extras.TYPE) {
          layer = lLayerWtr.find(layerWtr => layerWtr.astCode == res.extras.TYPE.toString())?.lyrTableName;
        }
        if(res.extras.MOTIF) {
          reasonId = lLayerWtr.find(layerWtr => layerWtr.wtrCode == res.extras.MOTIF.toString())?.wtrId;
        }
        if(res.extras.GPS_RI) {
          try {
            let coords = res.extras.GPS_RI.toString().split(';');
            longitude = Number(coords[0]);
            latitude = Number(coords[1]);
          } catch (e) {
            console.error('Praxedo gps coords failed ', e);
          }
        }

        if (!longitude || !latitude) {
          const location = await Geolocation.getCurrentPosition();
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
        }


        if (!layer) {
          layer = 'aep_xy'
        }

        let workorder: Workorder = {
          latitude: latitude,
          longitude: longitude,
          wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id,
          id: this.utilsService.createCacheId(),
          tasks: [
            {
              id: this.utilsService.createCacheId(),
              latitude: latitude,
              longitude: longitude,
              assObjTable: layer,
              wtrId: reasonId,
              wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id
            }
          ]
        };

        this.workorderService.saveCacheWorkorder(workorder);
        this.externalReport = workorder.id.toString();
      }
      if(this.externalReport){
        this.router.navigate(["/home/workorder/"+this.externalReport+"/cr"]);
      }
    });
  }
}
