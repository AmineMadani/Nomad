import { Injectable } from '@angular/core';
import { MapFeature } from '../../models/map-feature.model';
import { Feature } from 'ol';

@Injectable({
  providedIn: 'root',
})
export class FilterDataService {

  constructor(
  ) {}

  /**
   * Map with cards feature for a specific layer
   */
  private filterData: Map<string, MapFeature[]> = new Map();

  /**
   * Map with all the search properties to filter data
   */
  private searchFilterListData: Map<string, Map<string, string[]>> = new Map<string, Map<string, string[]>>();

  /**
   * Map with all the removed features of a layer
   */
  private mapRemovedFeaturedByLayers:  Map<string, Feature[]|undefined> =  new Map<string, Feature[]|undefined>();

  public getFilterData(): Map<string, MapFeature[]>{
    return this.filterData;
  }

  public getSearchFilterListData(): Map<string, Map<string, string[]>> {
    return this.searchFilterListData;
  }

  public getMapRemovedFeaturedByLayers(): Map<string, Feature[]|undefined> {
    return this.mapRemovedFeaturedByLayers;
  }
}
