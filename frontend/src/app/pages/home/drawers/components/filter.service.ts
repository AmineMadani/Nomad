import { Injectable } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { finalize } from 'rxjs';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { FilterDataService } from 'src/app/core/services/dataservices/filter.dataservice';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(
    private mapService: MapService,
    private layerService: LayerService,
    private expDataservice: ExploitationDataService,
    private filterDataService: FilterDataService
  ) {}

  /**
   * Method to get all data
   * @param layerkey layer exploitation data
   * @returns list of data
   */
  public getData(layerkey: string): any | undefined {
    const features = this.filterDataService.getFilterData().get(layerkey);
    if (features && features.length > 0) {
      return this.filterDataService.getFilterData().get(layerkey);
    } else {
      return this.layerService.getFeaturesFilteredInView(layerkey,this.filterDataService.getSearchFilterListData().get(layerkey));
    }
  }

  /**
   * Method to switch source of data from map layer or backend DB with pagination system for the last one
   * @param layerkey layer exploitation data
   * @param toogle boolean true: map - false: DB
   */
  public setToggleData(layerkey: string, toogle: boolean): void {
    this.filterDataService.getFilterData().delete(layerkey);
    if (!toogle) {
      this.mapService.removeEventLayer(layerkey);
      this.expDataservice
        .getFeaturePagination(layerkey, 20, 0, this.filterDataService.getSearchFilterListData().get(layerkey))
        .subscribe((features: MapFeature[]) => {
          this.filterDataService.getFilterData().set(layerkey, features);
        });
    } else {
      this.mapService.addEventLayer(layerkey).then(() => {
        this.mapService.applyFilterOnMap(layerkey);
      });
    }
  }

  /**
   * Method to update data from pagination for the infinity scroll system
   * @param layerkey layer exploitation data
   * @param ev infinity scroll event
   */
  public updateData(key: string, ev?: InfiniteScrollCustomEvent): void {
    let features = this.filterDataService.getFilterData().get(key);
    if (features) {
      this.expDataservice
        .getFeaturePagination(key, 20, features.length, this.filterDataService.getSearchFilterListData().get(key))
        .pipe(finalize(() => ev?.target.complete()))
        .subscribe((f: MapFeature[]) => {
          features = [...features!, ...f];
          this.filterDataService.getFilterData().set(key, features);
        });
    }
  }

  /**
   * Method to set the new property filter to add and execute it on the target layer 
   * @param layerkey layer exploitation data
   * @param key property key
   * @param listValue  list of values to filter
   */
  public setSearchFilter(layerkey: string, key: string, listValue: string[]) {
    if(this.filterDataService.getSearchFilterListData().get(layerkey)) {
      if(listValue && listValue.length > 0) {
        this.filterDataService.getSearchFilterListData().get(layerkey)?.set(key,listValue);
      } else {
        this.filterDataService.getSearchFilterListData().get(layerkey)?.delete(key);
      }
    } else {
      let newType: Map<string, string[]> = new Map<string, string[]>();
      newType.set(key,listValue);
      this.filterDataService.getSearchFilterListData().set(layerkey, newType);
    }

    //Applied the filter on the map
    this.mapService.applyFilterOnMap(layerkey);

    //Refresh manually de layer
    this.layerService.refreshLayer(layerkey);

    //In the case of the data from DB
    if(!this.mapService.getLayer(layerkey)){
      this.setToggleData(layerkey, false);
    }
  }

  /**
   * Method to get values by the layer and the property key
   * @param layerkey layer exploitation data
   * @param key property key
   * @return list of values
   */
  public getSearchFilterValuesByLayerKeyAndProperty(layerkey: string, key: string): string[] | undefined {
    return this.filterDataService.getSearchFilterListData().get(layerkey)?.get(key);
  }

  /**
   * Method to expose if exist a layer data
   * @param layerkey layer exploitation data
   * @returns true if layer data exist
   */
  public isExistLayerData(layerkey: string): boolean {
    return this.filterDataService.getFilterData().has(layerkey) 
  }
}