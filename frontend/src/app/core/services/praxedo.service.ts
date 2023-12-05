import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IntentAction } from 'plugins/intent-action/src';
import { WorkorderService } from './workorder.service';
import { LayerService } from './layer.service';
import { Workorder } from '../models/workorder.model';
import { Geolocation } from '@capacitor/geolocation';
import { UtilsService } from './utils.service';
import { TemplateService } from './template.service';

@Injectable({
  providedIn: 'root'
})
export class PraxedoService {

  constructor(
    private router: Router,
    private workorderService: WorkorderService,
    private layerService: LayerService,
    private utilsService: UtilsService,
    private templateService: TemplateService
  ) {}

  public externalReport: string | undefined;

  public gps

  public praxedoListener() {
    IntentAction.addListener('appActionIntent', async res => {
      
      let layers = [];
      if(res.extras.REFEXTINT) {
        this.externalReport = res.extras.REFEXTINT;
      } else {

        let lStatus = await this.workorderService.getAllWorkorderTaskStatus();
        let lLayerWtr = await this.layerService.getAllVLayerWtr();

        let longitude;
        let latitude;
        let layer;
        let reasonId;

        if(res.extras.TYPE) {
          const typeCode = res.extras.TYPE.toString().split('-')[0];
          if(typeCode == '29' || typeCode == '39'){
            let forms = await this.templateService.getFormsTemplate();
            const assetFilterTree = JSON.parse(forms.find((form) => form.formCode === 'ASSET_FILTER').definition);
            let layerKeys = [];
            JSON.parse(JSON.stringify(assetFilterTree), function(key, value) {
              if (key == 'layerKey') {
                if(!layerKeys.includes(value)){
                  layerKeys.push(value)
                }
              }
            });
            if(typeCode == '29') {
              layers = layerKeys.filter(layerKey => layerKey.includes('aep_'));
            } else {
              layers = layerKeys.filter(layerKey => layerKey.includes('ass_'));
            }
          } else {
            layers = [...new Set(lLayerWtr.filter(layerWtr => layerWtr.astCode == typeCode)?.map(layer => layer.lyrTableName) || [])];
            
            // If AEP : display canalisations too
            if (layers.some((layer) => layer.includes('aep_'))) {
              if (!layers.includes('aep_canalisation')) layers.push('aep_canalisation');
              if (!layers.includes('aep_canalisation_abandonnee')) layers.push('aep_canalisation_abandonnee');
            // If ASS : display collecteurs too
            } else if (layers.some((layer) => layer.includes('ass_'))) {
              if (!layers.includes('ass_collecteur')) layers.push('ass_collecteur');
            }
          }
        }
        if(res.extras.MOTIF) {
          const reasonCode = res.extras.MOTIF.toString().split('-')[0];
          reasonId = lLayerWtr.find(layerWtr => layerWtr.wtrCode == reasonCode)?.wtrId; 
        }
        if(res.extras.GPS_RI) {
          try {
            let coords = res.extras.GPS_RI.toString().split(';');
            latitude = Number(coords[0]);
            longitude = Number(coords[1]);
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
        if(layers.length > 0) {
          this.router.navigate(["/home/workorder/"+this.externalReport+"/cr"], { queryParams: { layers: layers.toString() }});
        } else {
          this.router.navigate(["/home/workorder/"+this.externalReport+"/cr"]);
        }
      }
    });
  }
}
