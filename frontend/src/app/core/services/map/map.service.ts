
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, from } from 'rxjs';
import { LayerDataService } from '../dataservices/layer.dataservice';
import { MaplibreLayer } from '../../models/maplibre-layer.model';
import { BaseMapsDataService } from '../dataservices/base-maps.dataservice';
import { FilterDataService } from '../dataservices/filter.dataservice';
import { Basemap } from '../../models/basemap.model';
import { Layer } from '../../models/layer.model';
import { ConfigurationService } from '../configuration.service';
import * as Maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

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
    private configurationService: ConfigurationService
  ) {
    from(this.layerDataService.getLayers()).subscribe((layers: Layer[]) => {
      this.layersConfiguration = layers;
    });
  }

  private map: Maplibregl.Map;
  private layers: Map<string, MaplibreLayer> = new Map();
  private layersConfiguration: Layer[];

  private draw: MapboxDraw;
  private drawActive: boolean;

  private loadedGeoJson: Map<string, string[]> = new Map();

  private basemaps$: Observable<Basemap[]>;
  private onMapLoaded$: ReplaySubject<void> = new ReplaySubject();

  /**
   * This function creates a Maplibregl map and subscribes to moveend events to load new tiles based on
   * zoom level and overlapping tiles.
   * @returns The function `createMap()` returns an instance of the `Maplibregl.Map` class.
   */
  public createMap(): Maplibregl.Map {
    this.map = new Maplibregl.Map({
      container: 'map',
      style: this.mapLibreSpec,
      center: [2.699596882916402, 48.407854932986936],
      zoom: 14,
      maxZoom: 22,
    });
    this.map.dragRotate.disable();
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });
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
    this.onMapLoaded$.next();
  }

  /**
   * Observable that emits when the map is loaded.
   * @returns An Observable of type `void` is being returned.
   */
  public onMapLoaded(): Observable<void> {
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
  public async addEventLayer(layerKey: string): Promise<void> {
    if (layerKey && layerKey.length > 0 && !this.hasEventLayer(layerKey)) {
      const layer: MaplibreLayer = new MaplibreLayer(
        this.layersConfiguration.find(
          (element) => element.lyrTableName == 'asset.' + layerKey
        )
      );
      this.layers.set(layerKey, layer);
      this.map.zoomTo(this.map.getZoom() + 0.0001);
      this.map.addSource(layerKey, layer.source);

      for (let oneStyle of layer.style) {
        setTimeout(() => this.map.addLayer(oneStyle));
      }

      return new Promise<void>((resolve) => {
        this.map.once('idle', (e) => {
          this.applyFilterOnMap(layerKey);
          const isValid = (): boolean =>
            layer.style.every((style) => this.map.getLayer(style.id));
          if (isValid() && this.map.querySourceFeatures(layerKey).length > 0) {
            resolve();
          } else {
            setTimeout(() => {
              resolve();
            }, 3000);
          }
        });
      });
    } else {
      new Promise<void>((resolve) => {
        resolve();
      });
    }
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
  /**
   * If the layer exists, remove it from the map and delete it from the layers collection.
   * @param {string} layerKey - string - The key of the layer to remove.
   */
  public removeEventLayer(layerKey: string): void {
    if (this.hasEventLayer(layerKey)) {
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

  public setDrawingControl(status: boolean): void {
    if (status) {
      this.map.addControl(this.draw as any, 'top-left');
      this.drawActive = true;
    } else {
      this.map.removeControl(this.draw as any);
      this.drawActive = false;
      document.getElementById('map-container').classList.remove('cursor-pointer');
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
    sprite: this.configurationService.host+'assets/sprites/@2x',
  };
}
