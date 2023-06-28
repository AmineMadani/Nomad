import { Injectable } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { finalize } from 'rxjs';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { FilterDataService } from 'src/app/core/services/dataservices/filter.dataservice';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { AccordeonFilter } from '../models/filter/filter-component-models/AccordeonFilter.model';
import { ToggleFilter } from '../models/filter/filter-component-models/ToggleFilter.model';
import { Filter } from '../models/filter/filter.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(
    private mapService: MapService,
    private layerService: LayerService,
    private expDataservice: ExploitationDataService,
    private filterDataService: FilterDataService
  ) { }

  public isLoading = false;

  /**
   * Method to get all data
   * @param layerkey layer exploitation data
   * @returns list of data
   */
  public getData(layerkey: string): any | undefined {
    const features = this.filterDataService.getFilterData().get(layerkey);
    if (features && features.length > 0) {
      return features;
    } else {
      return this.layerService.getFeaturesInView(layerkey);
    }
  }

  // /**
  //  * Method to apply the filter on the map for a specific layer
  //  * @param layerKey layer exploitation data
  //  * @param filters list of property filter
  //  */
  public applyFilterOnMap(layerKey: string) {
    this.mapService.applyFilterOnMap(layerKey);
  }

  /**
   * Method to switch source of data from map layer or backend DB with pagination system for the last one
   * @param layerkey layer exploitation data
   * @param toogle boolean true: map - false: DB
   */
  public setToggleLayer(layerkey: string, toogle: boolean): void {
    this.filterDataService.getFilterData().delete(layerkey);
    if (!toogle) {
      this.mapService.removeEventLayer(layerkey);
      this.isLoading = true;
      this.expDataservice
        .getFeaturePagination(layerkey, 20, 0, this.filterDataService.getSearchFilterListData().get(layerkey))
        .subscribe((features: MapFeature[]) => {
          this.filterDataService.getFilterData().set(layerkey, features);
          this.isLoading = false;
        });
    } else {
      this.isLoading = true;
      this.mapService.addEventLayer(layerkey).then(() => {
        this.applyFilterOnMap(layerkey); 
        this.isLoading = false;
      });
    }
  }

  /**
   * Method to define a new property filter to add and run on target layers
   * @param tablekey  target layers
   * @param key property key
   * @param value value to filter
   * @param toogle toogle
   */
  public setToggleFilter(tablekey: string[], key: string, value: string, toogle: boolean): void {
    for (let layerkey of tablekey) {
      if (toogle) {
        if (this.filterDataService.getSearchFilterListData().has(layerkey)) {
          let listValue = this.filterDataService.getSearchFilterListData().get(layerkey).get(key);
          if (listValue && listValue.length > 0) {
            listValue = listValue.filter(f => f !== value).concat([value]);
            this.filterDataService.getSearchFilterListData().get(layerkey).set(key, listValue);
          }
          else {
            this.filterDataService.getSearchFilterListData().get(layerkey).set(key, [value]);
          }
        }
        else {
          let newType: Map<string, string[]> = new Map<string, string[]>();
          newType.set(key, [value]);
          this.filterDataService.getSearchFilterListData().set(layerkey, newType);
        }
      }
      else {
        let listValue = this.filterDataService.getSearchFilterListData().get(layerkey)?.get(key);
        if (listValue && listValue.length > 0) {
          listValue = listValue.filter(f => f !== value);
          this.filterDataService.getSearchFilterListData().get(layerkey).set(key, listValue);
        }
      }
      if (this.mapService.getLayer(layerkey)) {
        //Applied the filter on the map
        this.applyFilterOnMap(layerkey);
      }
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
    if (this.filterDataService.getSearchFilterListData().get(layerkey)) {
      if (listValue && listValue.length > 0) {
        this.filterDataService.getSearchFilterListData().get(layerkey)?.set(key, listValue);
      } else {
        this.filterDataService.getSearchFilterListData().get(layerkey)?.delete(key);
      }
    } else {
      let newType: Map<string, string[]> = new Map<string, string[]>();
      newType.set(key, listValue);
      this.filterDataService.getSearchFilterListData().set(layerkey, newType);
    }

    // //Applied the filter on the map
    this.applyFilterOnMap(layerkey);

    // In the case of the data from DB
    if (!this.mapService.getLayer(layerkey)) {
      this.setToggleLayer(layerkey, false);
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
   * Method to know if exist a search filter on a layer
   * @param layerkey layer exploitation data
   * @returns true if exist search filter
   */
  public hasSearchFilterLayer(layerkey: string) {
    return this.filterDataService.getSearchFilterListData()
            && this.filterDataService.getSearchFilterListData().get(layerkey)
            && this.filterDataService.getSearchFilterListData().get(layerkey).size > 0;
  }

  /**
   * Method to expose if exist a layer data
   * @param layerkey layer exploitation data
   * @returns true if layer data exist
   */
  public isExistLayerData(layerkey: string): boolean {
    return this.filterDataService.getFilterData().has(layerkey)
  }

  /**
   * Apply the filter on the map 
   * @param filter 
   */
  public applyFilter(filter : Filter){
    filter.segments.forEach(segment => {
      segment.components.forEach( basefilter =>{
        if (basefilter instanceof AccordeonFilter){
          (basefilter as AccordeonFilter).data.forEach(async oneData => {
            if (oneData.children?.some( child => child.value)){
              oneData.children.filter(child => child.value)
              .forEach( async item => await this.mapService.addEventLayer( item.key) );
            }
            else if (oneData.value){
              await this.mapService.addEventLayer( oneData.key);
            }
          });
        }
          if (basefilter instanceof ToggleFilter){
            const toggleFilter : ToggleFilter = basefilter as ToggleFilter;
            if(!toggleFilter.tableKey){
              toggleFilter.data.forEach(toggleData =>
                this.setToggleLayer(toggleData.key, toggleData.checked)
                );
            }
            else {
              toggleFilter.data.forEach(toggleData =>
                this.setToggleFilter(toggleFilter.tableKey, toggleData.key,toggleData.value,  toggleData.checked)
                );
              }
          }
      })
    });
}


}
