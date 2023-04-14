import { Injectable } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import Feature from 'ol/Feature';
import { finalize } from 'rxjs';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { MapLayer } from 'src/app/core/models/map-layer.model';
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

  /**
   * Map with cards feature for a specific layer 
   */
  private data: Map<string, MapFeature[]> = new Map();

  /** 
   * Map with all the search properties to filter data 
   */
  private searchFilterList: Map<string, Map<string, string[]>> = new Map<string, Map<string, string[]>>();

  /** 
   * Map with all the removed features of a layer
   */
  private mapRemovedFeaturedByLayers:  Map<string, Feature[]|undefined> =  new Map<string, Feature[]|undefined>();

  /**
   * Method to get all data
   * @param layerkey layer exploitation data
   * @returns list of data
   */
  public getData(layerkey: string): any | undefined {
    const features = this.data.get(layerkey);
    if (features && features.length > 0) {
      return this.data.get(layerkey);
    } else {
      return this.layerService.getFeaturesFilteredInView(layerkey,this.searchFilterList.get(layerkey));
    }
  }

  /**
   * Method to switch source of data from map layer or backend DB with pagination system for the last one
   * @param layerkey layer exploitation data
   * @param toogle boolean true: map - false: DB
   */
  public setToggleData(layerkey: string, toogle: boolean): void {
    this.data.delete(layerkey);
    if (!toogle) {
      this.mapService.removeEventLayer(layerkey);
      this.expDataservice
        .getFeaturePagination(layerkey, 20, 0, this.searchFilterList.get(layerkey))
        .subscribe((features: MapFeature[]) => {
          this.data.set(layerkey, features);
        });
    } else {
      this.mapService.addEventLayer(layerkey).then(() => {
        this.applyFilterOnMap(layerkey,this.searchFilterList.get(layerkey));
      })
    }
  }

  /**
   * Method to update data from pagination for the infinity scroll system
   * @param layerkey layer exploitation data
   * @param ev infinity scroll event
   */
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

  /**
   * Method to set the new property filter to add and execute it on the target layer 
   * @param layerkey layer exploitation data
   * @param key property key
   * @param listValue  list of values to filter
   */
  public setSearchFilter(layerkey: string, key: string, listValue: string[]) {
    if(this.searchFilterList.get(layerkey)) {
      if(listValue.length > 0) {
        this.searchFilterList.get(layerkey)?.set(key,listValue);
      } else {
        this.searchFilterList.get(layerkey)?.delete(key);
      }
    } else {
      let newType: Map<string, string[]> = new Map<string, string[]>();
      newType.set(key,listValue);
      this.searchFilterList.set(layerkey, newType);
    }

    //Applied the filter on the map
    this.applyFilterOnMap(layerkey,this.searchFilterList.get(layerkey));

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
    return this.searchFilterList.get(layerkey)?.get(key);
  }

  /**
   * Method to expose if exist a layer data
   * @param layerkey layer exploitation data
   * @returns true if layer data exist
   */
  public isExistLayerData(layerkey: string): boolean {
    return this.data.has(layerkey) 
  }

  /**
   * Method to apply the filter on the map for a specific layer
   * @param layerKey layer exploitation data
   * @param filters list of property filter
   */
  private applyFilterOnMap(layerKey: string,  filters: Map<string, string[]> | undefined) {
    const mapLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
    if(this.mapRemovedFeaturedByLayers.get(layerKey) && this.mapRemovedFeaturedByLayers.get(layerKey)!.length > 0){
      mapLayer?.source?.addFeatures(this.mapRemovedFeaturedByLayers.get(layerKey)!);
      this.mapRemovedFeaturedByLayers.delete(layerKey);
    }
    if(filters && filters.size > 0) {
      if (mapLayer) {
        this.mapRemovedFeaturedByLayers.set(layerKey, mapLayer.source?.getFeatures().filter(feature => {
          return !this.filterFeature(feature, filters);
        }));
        if(this.mapRemovedFeaturedByLayers.get(layerKey) && this.mapRemovedFeaturedByLayers.get(layerKey)!.length > 0){
          for(let feature of this.mapRemovedFeaturedByLayers.get(layerKey)!){
            mapLayer.source?.removeFeature(feature);
          }
        }
      }
    }
  }

  /**
   * Method to check if the feature should be filter
   * @param feature feature from openLayer
   * @param filters List of filters
   * @returns true if feature filtered
   */
  private filterFeature(feature: Feature, filters: Map<string, string[]>): boolean{
    let isInFilter = true;
    let oneDateOk: 'nc' | 'true' | 'false' = 'nc';
    for(let item of filters) {
      if(item[0].includes('date')){
        if(oneDateOk == 'nc'){
          oneDateOk='false';
        }
        if(oneDateOk == 'false' && feature.getProperties()[item[0]]) {
          if(item[1][0] != 'none' && item[1][1] != 'none') {
            const startDate = new Date(item[1][0]);
            const endDate = new Date(item[1][1]);
            const dateFeature = new Date(feature.getProperties()[item[0]]);
            if((dateFeature.getTime() < startDate.getTime())
              || (dateFeature.getTime() > endDate.getTime())) {
                oneDateOk='false';
            } else {
              oneDateOk='true';
            }
          }
        }
      } else {
        if(!item[1].includes(feature.getProperties()[item[0]])){
          isInFilter=false;
        }
      }
    }
    if(oneDateOk == 'nc'){
      oneDateOk = 'true'
    }
    return isInFilter && (oneDateOk == 'true');
  }
}
