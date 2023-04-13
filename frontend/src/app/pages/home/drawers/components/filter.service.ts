import { Injectable } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { finalize } from 'rxjs';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(
    private mapService: MapService,
    private layerService: LayerService,
    private expDataservice: ExploitationDataService
  ) {}

  private data: Map<string, MapFeature[]> = new Map();

  private searchFilterList: Map<string, Map<string, string[]>> = new Map<string, Map<string, string[]>>();

  public getData(key: string): any | undefined {
    const features = this.data.get(key);
    if (features && features.length > 0) {
      return this.data.get(key);
    } else {
      return this.layerService.getFeaturesFilteredInView(key,this.searchFilterList.get(key));
    }
  }

  public setToggleData(key: string, toogle: boolean): void {
    this.data.delete(key);
    if (!toogle) {
      this.mapService.removeEventLayer(key);
      this.expDataservice
        .getFeaturePagination(key, 20, 0, this.searchFilterList.get(key))
        .subscribe((features: MapFeature[]) => {
          this.data.set(key, features);
        });
    } else {
      this.mapService.addEventLayer(key).then(() => {
        this.layerService.passFilterToLayer(key, this.searchFilterList.get(key));
      })
    }
  }

  public updateData(key: string, ev?: InfiniteScrollCustomEvent): void {
    let features = this.data.get(key);
    if (features) {
      this.expDataservice
        .getFeaturePagination(key, 20, features.length, this.searchFilterList.get(key))
        .pipe(finalize(() => ev?.target.complete()))
        .subscribe((f: MapFeature[]) => {
          features = [...features!, ...f];
          this.data.set(key, features);
        });
    }
  }

  public setSearchFilter(layerkey: string, key: string, listValue: string[]) {
    if(this.searchFilterList.get(layerkey)) {
      if(listValue.length > 0) {
        this.searchFilterList.get(layerkey)?.set(key,listValue);
        this.layerService.passFilterToLayer(layerkey, this.searchFilterList.get(layerkey));
      } else {
        this.searchFilterList.get(layerkey)?.delete(key);
      }
    } else {
      let newType: Map<string, string[]> = new Map<string, string[]>();
      newType.set(key,listValue);
      this.searchFilterList.set(layerkey, newType);
      this.layerService.passFilterToLayer(layerkey, newType);
    }
    this.layerService.refreshLayer(layerkey);
    if(!this.mapService.getLayer(layerkey)){
      this.setToggleData(layerkey, false);
    }
  }

  public getSearchFilterByLayerKey(layerKey: string): Map<string, string[]> | undefined {
    return this.searchFilterList.get(layerKey);
  }
}
