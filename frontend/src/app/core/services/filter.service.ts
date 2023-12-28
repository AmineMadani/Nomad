import { Injectable } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { finalize } from 'rxjs';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { FilterDataService } from 'src/app/core/services/dataservices/filter.dataservice';
import { MapService } from 'src/app/core/services/map/map.service';
import { WorkorderService } from './workorder.service';
import { MapLayerService } from './map/map-layer.service';
import { TaskPaginated } from '../models/workorder.model';
import { DateTime } from 'luxon';
import { ItvPaginated } from '../models/itv.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(
    private mapService: MapService,
    private mapLayerService: MapLayerService,
    private filterDataService: FilterDataService
  ) { }

  public isLoading = false;

  private filterForm: any;

  private filterITV: any;

  public getFilterForm(): any {
    return this.filterForm;
  }

  public setFilterForm(filter: any): void {
    this.filterForm = filter;
  }

  public getFilterITV(): any {
    return this.filterITV;
  }

  public setFilterITV(filter: any): void {
    this.filterITV = filter;
  }

  public transformFilterForm(): TaskPaginated {
    return {
      wkoEmergency: this.filterForm?.wkoEmergency ? true : null,
      wkoAppointment: this.filterForm?.wkoAppointment ? true : null,
      wkoPlanningStartDate: this.filterForm?.wkoPlanningStartDate
        ? DateTime.fromFormat(
            this.filterForm?.wkoPlanningStartDate,
            'dd/MM/yyyy'
          ).toISO()
        : DateTime.now().minus({ months: 3 }).toISO(),
      wkoPlanningEndDate:
        this.filterForm?.wkoPlanningEndDate ||
        this.filterForm?.wkoPlanningEndDate?.length > 0
          ? DateTime.fromFormat(
              this.filterForm?.wkoPlanningEndDate,
              'dd/MM/yyyy'
            ).toISO()
          : null,
      wtrIds: this.filterForm?.wtrIds,
      wtsIds: this.filterForm?.wtsIds,
      assObjTables: this.filterForm?.assObjTables,
    };
  }

  public transformFilterItv(): ItvPaginated {
    return {
      contractIds: this.filterITV?.contractIds ?? [],
      cityIds: this.filterITV?.cityIds ?? [],
      status: this.filterITV?.status ?? [],
      defects: this.filterITV?.defects ?? [],
      startDate: this.filterITV?.startDate ? DateTime.fromFormat(this.filterITV?.startDate, 'dd/MM/yyyy').toISO()
                                            : null,
      endDate: this.filterITV?.endDate ? DateTime.fromFormat(this.filterITV?.endDate, 'dd/MM/yyyy').plus({hours: 24}).toISO()
                                        : null,
    };
  }

  /**
   * Method to get all data
   * @param layerkey layer exploitation data
   * @returns list of data
   */
  public getData(mapKey:string, layerkey: string): any | undefined {
    const features = this.filterDataService.getFilterData().get(layerkey);
    if (features && features.length > 0) {
      return features;
    } else {
      return this.mapLayerService.getFeaturesInView(mapKey, layerkey);
    }
  }

  // /**
  //  * Method to apply the filter on the map for a specific layer
  //  * @param layerKey layer exploitation data
  //  * @param filters list of property filter
  //  */
  public applyFilterOnMap(mapKey:string, layerKey: string) {
    this.mapService.applyFilterOnMap(mapKey, layerKey);
  }

  /**
   * Method to define a new property filter to add and run on target layers
   * @param tablekey  target layers
   * @param key property key
   * @param value value to filter
   * @param toogle toogle
   */
  public setToggleFilter(mapKey:string, tablekey: string[], key: string, value: string, toogle: boolean): void {
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
        this.applyFilterOnMap(mapKey, layerkey);
      }
    }
  }

  /**
   * Method to set the new property filter to add and execute it on the target layer
   * @param layerkey layer exploitation data
   * @param key property key
   * @param listValue  list of values to filter
   */
  public setSearchFilter(mapKey: string, layerkey: string, key: string, listValue: string[]) {
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
    this.applyFilterOnMap(mapKey, layerkey);
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

}
