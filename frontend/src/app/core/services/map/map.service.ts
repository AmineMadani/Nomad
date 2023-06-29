
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, from } from 'rxjs';
import { LayerDataService } from '../dataservices/layer.dataservice';
import { MaplibreLayer } from '../../models/maplibre-layer.model';
import * as Maplibregl from 'maplibre-gl';
import { BaseMapsDataService } from '../dataservices/base-maps.dataservice';
import { FilterDataService } from '../dataservices/filter.dataservice';
import { Basemap } from '../../models/basemap.model';
import { Layer } from '../../models/layer.model';
import { LngLatLike } from 'maplibre-gl';
import { ConfigurationService } from '../configuration.service';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Clipboard } from '@angular/cdk/clipboard';
import { MapEventService } from './map-event.service';

export interface Box {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(
    private layerDataService: LayerDataService,
    private basemapsDataservice: BaseMapsDataService,
    private filterDataService: FilterDataService,
    private configurationService: ConfigurationService,
    private mapEventService: MapEventService
  ) {
  }

  private map: Maplibregl.Map;
  private layers: Map<string, MaplibreLayer> = new Map();
  private layersConfiguration: Layer[];

  private draw: MapboxDraw;
  private drawActive: boolean;

  private loadedGeoJson: Map<string, string[]> = new Map();

  private basemaps$: Observable<Basemap[]>;
  private onMapLoaded$: ReplaySubject<boolean> = new ReplaySubject(1);

  private loadingLayer: Map<string, Promise<void>> = new Map<string, Promise<void>>();
  private loadingStyle: Map<string, string[]> = new Map<string, string[]>();
  private loadedLayer: Array<string> = new Array<string>();

  /**
   * This function creates a Maplibregl map and subscribes to moveend events to load new tiles based on
   * zoom level and overlapping tiles.
   * @returns The function `createMap()` returns an instance of the `Maplibregl.Map` class.
   */
  public createMap(lat?: number, lng?: number, zoom?: number): Maplibregl.Map {
    this.mapLibreSpec.sprite =
      this.configurationService.host + 'assets/sprites/@2x';
    this.map = new Maplibregl.Map({
      container: 'map',
      style: this.mapLibreSpec,
      center: [lng ?? 2.699596882916402, lat?? 48.407854932986936],
      zoom: zoom ?? 14,
      maxZoom: 22,
    });
    this.map.dragRotate.disable();
    return this.map;
  }

  /**
   * Returns the map object.
   * @returns The map object.
   */
  public getMap(): Maplibregl.Map {
    return this.map;
  }

  /**
   * This function sets the "onMapLoaded$" observable to emit a value.
   */
  public setMapLoaded(): void {
    this.onMapLoaded$.next(true);
  }

  /**
   * This function sets the "onMapLoaded$" observable to emit a value.
   */
  public setMapUnloaded(): void {
    this.onMapLoaded$.next(false);
  }

  /**
   * Observable that emits when the map is loaded.
   * @returns An Observable of type `void` is being returned.
   */
  public onMapLoaded(): Observable<boolean> {
    return this.onMapLoaded$.asObservable();
  }

  public getBasemaps(): Observable<Basemap[]> {
    if (!this.basemaps$) {
      this.basemaps$ = this.basemapsDataservice.getBaseMaps();
    }
    return this.basemaps$;
  }

  /**
   * The function destroys a subscription and resets layers if they exist.
   */
  public destroyLayers(): void {
    if (this.layers.size > 0) {
      this.resetLayers();
    }
  }

  /**
   * Returns the MapLayer object corresponding to the provided layer key.
   * @param layerKey layerKey The key of the MapLayer to return.
   * @returns The MapLayer object corresponding to the provided layer key, or undefined if no such layer exists.
   */
  public getLayer(layerKey: string): MaplibreLayer | undefined {
    return this.layers.get(layerKey);
  }

  public getCurrentLayers(): Map<string, MaplibreLayer> {
    return this.layers;
  }

  public getCurrentLayersIds(): string[] {
    return Array.from(this.layers.values())
      .flatMap((layer) => layer.style)
      .map((s) => s.id);
  }

  public getCurrentLayersKey(): string[] {
    return [...this.layers.keys()];
  }

  /**
   * Removes all layers from the map.
   */
  public resetLayers(): void {
    [...this.layers.keys()].forEach((layerKey: string) => {
      this.removeEventLayer(layerKey);
    });
    this.layers.clear();
    this.mapEventService.setSelectedFeature(undefined);
  }

  /**
   * Returns true if the event layer exists, otherwise it returns false.
   * @param {string} layerKey - string - The key of the layer to check for.
   * @returns A boolean value.
   */
  public hasEventLayer(layerKey: string): boolean {
    return this.layers.has(layerKey);
  }

  /**
   * Bind different events to a layer like click or hovered
   * @param {string} layerKey - string - The key of the layer to bind events
   */
  public async addEventLayer(layerKey: string, styleKey?: string): Promise<void> {
    
    if (!layerKey) {
      return;
    }

    this.layersConfiguration = await this.layerDataService.getLayers();

    //If style loading in queue
    if (this.loadingStyle.get(layerKey)) {
      if (!this.loadingStyle.get(layerKey)[styleKey]) {
        this.loadingStyle.get(layerKey).push(styleKey);
      }
    } else {
      this.loadingStyle.set(layerKey, [styleKey]);
    }

    //If layer is loaded
    if (this.loadedLayer.indexOf(layerKey) >= 0) {
      this.displayLayer(layerKey);
      return new Promise<void>((resolve) => resolve());
    } else {
      //If layer is on loading (has event)
      if (this.loadingLayer.has(layerKey)) {
        return this.loadingLayer.get(layerKey);
      }
      //else create the layer
      const layer: MaplibreLayer = new MaplibreLayer(
        this.layersConfiguration.find(
          (element) => element.lyrTableName == 'asset.' + layerKey
        ),
        this.map
      );
      this.layers.set(layerKey, layer);
      this.map.zoomTo(this.map.getZoom() + 0.0001);
      this.map.addSource(layerKey, layer.source);

      for (let style of layer.style) {
        setTimeout(() => {
          this.map.addLayer(style);
        });
      }

      const layerPromise = new Promise<void>((resolve) => {
        this.map.once('idle', async (e) => {
          this.applyFilterOnMap(layerKey);
          const sleep = (ms) => new Promise(r => setTimeout(r, ms));
          for(let i=0; i < 6; i++){
            if(this.map.querySourceFeatures(layerKey).length > 0){
              break;
            }
            await sleep(500);
          }
          this.displayLayer(layerKey);
          this.loadedLayer.push(layerKey);
          this.loadingLayer.delete(layerKey);
          resolve();
        });
      });
      this.loadingLayer.set(layerKey, layerPromise);
      return layerPromise;
    }
  }

  /**
   * Method to display all or specific style of a layer
   * @param layerKey The layer key
   * @param styleLayer The style id
   */
  private displayLayer(layerKey: string) {
    for (let styleLayer of this.loadingStyle.get(layerKey)) {
      for (let style of this.map.getStyle().layers) {
        if (!styleLayer) {
          if (style.layout?.visibility === 'none' && (style as any).source == layerKey) {
            this.map.setLayoutProperty(style.id, 'visibility', 'visible');
          }
        } else {
          if (style.id.includes(styleLayer)
            && (style as any).source == layerKey
            && style.layout?.visibility === 'none') {
            this.map.setLayoutProperty(style.id, 'visibility', 'visible');
          }
        }
      }
    }
    this.loadingStyle.set(layerKey,[]);
  }

  /**
   * Method to apply the filter on the map for a specific layer
   * @param layerKey  layer exploitation data
   * @returns
   */
  public applyFilterOnMap(layerKey: string): void {
    const filters: Map<string, string[]> = this.filterDataService
      .getSearchFilterListData()
      .get(layerKey);
    const layer = this.getLayer(layerKey);
    if (!layer || !filters) {
      return;
    }

    const filter: any[] = ['all'];

    if (filters && filters.size > 0) {
      for (const [key, values] of filters) {
        filter.push(['in', ['get', key], ['literal', values]]);
      }
    }

    for (const style of layer.style) {
      this.map.setFilter(style.id, filter as any);
    }
  }

  private removeLoadedLayer(layerKey: string): void {
    const index = this.loadedLayer.indexOf(layerKey);
    if (index >= 0) {
      this.loadedLayer.splice(index, 1);
    }
  }

  /**
   * If the layer exists, remove it from the map and delete it from the layers collection.
   * @param {string} layerKey - string - The key of the layer to remove.
   */
  public removeEventLayer(layerKey: string, styleLayer?: string): void {
    if (this.hasEventLayer(layerKey)) {
      if (styleLayer) {
        this.hideLayer(layerKey, styleLayer);
      } else {
        this.removeLoadedLayer(layerKey);
        const mLayer = this.layers.get(layerKey)!;

        // Removing registered events
        mLayer.style.forEach((style) => {
          this.map.removeLayer(style.id);
        });

        // Removing data from Maps
        this.loadedGeoJson.delete(layerKey);
        this.layers.delete(layerKey);

        // Deletion of layers & source, putting an empty array to avoid cloning data later
        (this.map.getSource(layerKey) as Maplibregl.GeoJSONSource).updateData({
          removeAll: true,
        });
        this.map.removeSource(layerKey);
      }
    }
  }

  /**
   * Method to hide a specific style of a layer
   * @param layerKey The layer key
   * @param styleLayer The style id
   */
  private hideLayer(layerKey: string, styleLayer: string) {
    for (let style of this.map.getStyle().layers) {
      if (style.id.includes(styleLayer)
        && (style as any).source == layerKey
        && style.layout?.visibility === 'visible') {
        this.map.setLayoutProperty(style.id, 'visibility', 'none');
      }
    }
    let removeLayer = true;
    for (let style of this.map.getStyle().layers) {
      if ((style as any).source == layerKey
        && style.layout?.visibility === 'visible') {
        removeLayer = false;
      }
    }
    if (removeLayer) {
      this.removeEventLayer(layerKey);
    }
  }

  /**
   * add a point data for a specific layerkey
   * @param layerKey the layer key
   */
  public addNewPoint(layerKey: string, pointData: any) {
    const source = this.map.getSource(layerKey) as Maplibregl.GeoJSONSource;
    const addData: Maplibregl.GeoJSONSourceDiff = {
      add: [pointData],
    };
    source.updateData(addData);
  }

  /**
   * The function loads new tiles for layers based on their maximum zoom level and checks if they have
   * already been loaded.
   */
  public onMoveEnd(): void {
    for (let layer of this.layers) {
      if (
        this.map.getZoom() >=
        Math.min(...layer[1].style.map((style) => style.minzoom))
      ) {
        this.getOverlapTileFromIndex(layer[0]).then(async (res) => {
          for (let str of res) {
            if (
              !this.loadedGeoJson.get(layer[0]) ||
              !this.loadedGeoJson.get(layer[0])!.includes(str)
            ) {
              if (this.loadedGeoJson.get(layer[0])) {
                this.loadedGeoJson.get(layer[0])!.push(str);
              } else {
                this.loadedGeoJson.set(layer[0], [str]);
              }
              await this.loadNewTile(layer[0], str);
            }
          }
        });
      }
    }
  }

  public getDrawActive(): boolean {
    return this.drawActive;
  }

  public deleteDrawing(): void {
    this.draw.deleteAll();
  }

  /**
   * Retrieves a list of tiles that overlap with the current map view based on their
   * coordinates and a given layer index.
   * @param {string} key - Layer index key
   * @returns a Promise that resolves to an array of strings.
   */
  private async getOverlapTileFromIndex(key: string): Promise<string[]> {
    const listTile: string[] = [];
    const val: Maplibregl.LngLatBounds = this.map!.getBounds();
    const box1: Box = {
      x1: Math.min(val._sw.lat, val._ne.lat),
      x2: Math.max(val._sw.lat, val._ne.lat),
      y1: Math.min(val._sw.lng, val._ne.lng),
      y2: Math.max(val._sw.lng, val._ne.lng),
    };

    const res = await this.layerDataService.getLayerIndex(key);
    const index: any[] = (res as any)['features'];

    for (const coordRaw of index) {
      const coords: string[] = (coordRaw['properties']['bbox'] as string)
        .replace('POLYGON((', '')
        .replace(')', '')
        .split(',');

      const box2: Box = {
        y1: Math.max(...coords.map((coord) => parseFloat(coord.split(' ')[0]))),
        y2: Math.min(...coords.map((coord) => parseFloat(coord.split(' ')[0]))),
        x1: Math.max(...coords.map((coord) => parseFloat(coord.split(' ')[1]))),
        x2: Math.min(...coords.map((coord) => parseFloat(coord.split(' ')[1]))),
      };

      if (this.checkIfBoxesOverlap(box2, box1)) {
        listTile.push(coordRaw['properties']['file']);
      }
    }

    return listTile;
  }

  /**
   * Load a new tile for a given layer and updates the layer's data on the map.
   * @param {string} layerKey -Key of the layer being loaded or updated.
   * @param {string} file - Path of the file that contains the data to be loaded.
   */
  private async loadNewTile(layerKey: string, file: string): Promise<void> {
    const source = this.map.getSource(layerKey) as Maplibregl.GeoJSONSource;
    if (source) {
      const newLayer = await this.layerDataService.getLayerFile(layerKey, file);
      const addData: Maplibregl.GeoJSONSourceDiff = {
        add: newLayer.features,
      };
      setTimeout(() => {
        source.updateData(addData);
      });
    }
  }

  /**
   * The function checks if two boxes overlap by comparing their x and y coordinates.
   * @param {Box} box1 - The first box object with properties x1, y1, x2, y2 representing the coordinates
   * of its top-left and bottom-right corners.
   * @param {Box} box2 - The second box object that we want to check for overlap with the first box
   * object (box1).
   * @returns A boolean value indicating whether or not the two boxes overlap.
   */
  private checkIfBoxesOverlap(box1: Box, box2: Box): boolean {
    const xOverlap =
      Math.max(box1.x1, box1.x2) >= Math.min(box2.x1, box2.x2) &&
      Math.max(box2.x1, box2.x2) >= Math.min(box1.x1, box1.x2);
    const yOverlap =
      Math.max(box1.y1, box1.y2) >= Math.min(box2.y1, box2.y2) &&
      Math.max(box2.y1, box2.y2) >= Math.min(box1.y1, box1.y2);
    return xOverlap && yOverlap;
  }

  public setZoom(zoom: number): void {
    this.getMap().setZoom(zoom);
  }

  public setCenter(location: LngLatLike) {
    this.getMap().setCenter(location);
  }

  private mapLibreSpec: Maplibregl.StyleSpecification = {
    version: 8,
    name: 'Réseau AEP',
    metadata: {
      'mapbox:autocomposite': true,
      'mapbox:type': 'template',
      'mapbox:sdk-support': {
        android: '11.0.0',
        ios: '11.0.0',
        js: '3.0.0',
      },
      'mapbox:groups': {},
      'mapbox:uiParadigm': 'layers',
    },
    center: [2.699596882916402, 43.34],
    zoom: 15.070827661050382,
    bearing: 0,
    pitch: 0,
    sources: {},
    layers: [],
    glyphs: '/assets/myFont.pbf?{fontstack}{range}',
    sprite: this.configurationService.host + 'assets/sprites/@2x',
  };
}
