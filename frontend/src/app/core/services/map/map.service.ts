import { Injectable } from '@angular/core';
import { MapLayer } from '../../models/map-layer.model';
import MapOpenLayer from 'ol/Map';
import View from 'ol/View';
import { MapStyleService } from './map-style.service';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { boundingExtent } from 'ol/extent';
import { DrawerService } from '../drawer.service';
import Feature, { FeatureLike } from 'ol/Feature';
import { DrawerRouteEnum } from '../../models/drawer.model';
import { LayerDataService } from '../dataservices/layer.dataservice';
import WKT from 'ol/format/WKT.js';
import { stylefunction } from 'ol-mapbox-style';
import { GeoJSONArray } from '../../models/geojson.model';
import { MapEventService } from './map-event.service';
import { FilterDataService } from '../dataservices/filter.dataservice';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(
    private mapStyle: MapStyleService,
    private drawerService: DrawerService,
    private mapEvent: MapEventService,
    private layerDataService: LayerDataService,
    private filterDataService: FilterDataService
  ) {}

  private map: MapOpenLayer;
  private layers: Map<string, MapLayer> = new Map();

  /**
   * Creates the map object.
   * @returns The map.
   */
  public createMap(): MapOpenLayer {
    this.map = new MapOpenLayer({
      target: 'map',
      view: new View({
        center: [300592.047426, 6174953.998827],
        zoom: 18,
        maxZoom: 21,
      }),
    });
    return this.map;
  }

  public getMap(): MapOpenLayer {
    return this.map;
  }

  public getView(): View {
    return this.map.getView();
  }

  public getLayer(layerKey: string): MapLayer | undefined {
    return this.layers.get(layerKey);
  }

  public getCurrentLayersKey(): string[] {
    return [...this.layers.keys()];
  }

  public resetLayers(): void {
    [...this.layers.keys()].forEach((layerKey: string) => {
      this.removeEventLayer(layerKey);
    });
  }

  /**
   * This function returns true if the event layer exists, otherwise it returns false.
   * @param {string} layerKey - string - The key of the layer to check for.
   * @returns A boolean value.
   */
  public hasEventLayer(layerKey: string): boolean {
    return this.layers.has(layerKey);
  }

  public async addEventLayer(layerKey: string): Promise<void> {
    if (layerKey && layerKey != '' && !this.hasEventLayer(layerKey)) {
      const mLayer: MapLayer = new MapLayer(
        layerKey,
        this.mapStyle.getStyle(layerKey),
        this.mapStyle.getSelStyle(layerKey)
      );
      this.setLoader(mLayer);

      mLayer.subscription.add(
        fromEvent(this.map, 'pointermove').subscribe((event: any) => {
          mLayer.layer.getFeatures(event.pixel).then((features) => {
            if (!features.length) {
              this.mapEvent.setFeatureHovered(undefined);
              mLayer.hoverFeature.clear();
              mLayer.layer.changed();
              return;
            }
            let feature = features[0];
            if (!feature) {
              return;
            }
            this.mapEvent.setFeatureHovered(feature as Feature);
            mLayer.hoverFeature.add(feature);
            mLayer.layer.changed();
          });
        })
      );

      mLayer.subscription.add(
        fromEvent(this.map, 'click').subscribe((event: any) => {
          mLayer.layer
            .getFeatures(event.pixel)
            .then((features: FeatureLike[]) => {
              this.onFeaturesClick(features, layerKey);
            });
        })
      );

      this.layers.set(layerKey, mLayer);
      this.map.addLayer(mLayer.layer);

      await new Promise<void>((resolve) => {
        mLayer.layer.on('change', () => {
          if (mLayer.source!.getState() === 'ready' && mLayer.source!.getFeatures().length > 0) {
            resolve();
          }
        });
      });
    }
  }

  /**
   * If the layer exists, remove it from the map and delete it from the layers collection.
   * @param {string} layerKey - string - The key of the layer to remove.
   */
  public removeEventLayer(layerKey: string): void {
    if (this.hasEventLayer(layerKey)) {
      const mLayer = this.layers.get(layerKey)!;
      mLayer.subscription.unsubscribe();
      this.map.removeLayer(mLayer.layer);
      mLayer.source?.clear();
      mLayer.source = undefined;
      this.layers.delete(layerKey);
    }
  }

  /**
   * Creates the loader of the layer. Get index from indexed DB or server
   * then find the current file where the view is, and load the features from
   * indexed DB or server
   * @param {MapLayer} mapLayer - MapLayer
   */
  private async setLoader(mapLayer: MapLayer): Promise<void> {
    const geoJSONAlreadyLoading: string[] = [];
    const wkt = new WKT();
    mapLayer.source!.setLoader(async (extent: number[]) => {
      const index = await this.layerDataService.getLayerIndex(mapLayer.key);
      if(index['features']){
        for(let el of (index['features'] as any[])){
          const file: string = el.properties.file;
          const isIn = wkt
            .readFeature(el.properties.bbox)
            .getGeometry()
            ?.intersectsExtent(extent);
          if (isIn && !geoJSONAlreadyLoading.includes(file)) {
            if(geoJSONAlreadyLoading.length >= 3) {
              mapLayer.source!.clear();
              geoJSONAlreadyLoading.length = 0;
            }
            const tile = await this.layerDataService.getLayerFile(
              mapLayer.key,
              file
            );
            if (tile['features'] && (tile['features'] as GeoJSONArray).length > 0) {
              const features = mapLayer.source!
                .getFormat()!
                .readFeatures(tile) as Feature[];
              mapLayer.source!.addFeatures(features);
              this.applyFilterOnMap(mapLayer.key);
              geoJSONAlreadyLoading.push(file);
            }
          }
        };
      }
    });
    if (mapLayer.key === 'aep_canalisation') {
      this.layerDataService.getLayerStyle(mapLayer.key).subscribe((style) => {
        stylefunction(mapLayer.layer, style, 'cana');
      });
    }
  }

  private onFeaturesClick(features: FeatureLike[], layerKey: string) {
    if (features.length > 0) {
      const ctFeature: Feature[] = features[0].get('features') || [features[0]];

      if (ctFeature.length > 1) {
        const extent = boundingExtent(
          ctFeature.map((r: any) => r.getGeometry()!.getCoordinates())
        );
        this.map.getView().fit(extent, {
          duration: 1000,
          padding: [50, 50, 50, 50],
        });
      } else if (ctFeature.length === 1) {
        const properties = ctFeature[0].getProperties();
        properties['id'] = ctFeature[0].getId();
        properties['extent'] = ctFeature[0].getGeometry().getExtent().join(',');
        if (properties['geometry']) delete properties['geometry'];
        // We pass the layerKey to the drawer to be able to select the equipment on the layer

        properties['layer'] = layerKey;
        let route;
        switch(layerKey) {
          case 'intervention':
            route = DrawerRouteEnum.WORKORDER;
            break;
          default:
            route = DrawerRouteEnum.EQUIPMENT;
            break;
        }
        console.log(route);
        this.drawerService.navigateTo(
          route,
          [properties['id']],
          properties
        );
      }
    }
  }

  /**
   * Method to apply the filter on the map for a specific layer
   * @param layerKey layer exploitation data
   * @param filters list of property filter
   */
  public applyFilterOnMap(layerKey: string) {
    const filters: Map<string, string[]> = this.filterDataService.getSearchFilterListData().get(layerKey);
    const mapLayer: MapLayer | undefined = this.getLayer(layerKey);
    if(this.filterDataService.getMapRemovedFeaturedByLayers().get(layerKey) && this.filterDataService.getMapRemovedFeaturedByLayers().get(layerKey)!.length > 0){
      mapLayer?.source?.addFeatures(this.filterDataService.getMapRemovedFeaturedByLayers().get(layerKey)!);
      this.filterDataService.getMapRemovedFeaturedByLayers().delete(layerKey);
    }
    if(filters && filters.size > 0) {
      if (mapLayer) {
        this.filterDataService.getMapRemovedFeaturedByLayers().set(layerKey, mapLayer.source?.getFeatures().filter(feature => {
          return !this.filterFeature(feature, filters);
        }));
        if(this.filterDataService.getMapRemovedFeaturedByLayers().get(layerKey) && this.filterDataService.getMapRemovedFeaturedByLayers().get(layerKey)!.length > 0){
          for(let feature of this.filterDataService.getMapRemovedFeaturedByLayers().get(layerKey)!){
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
        if(!item[1].includes(feature.getProperties()[item[0]].toString())){
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


