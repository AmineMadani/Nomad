import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { DrawerService } from '../drawer.service';
import { LayerDataService } from '../dataservices/layer.dataservice';
import { MapEventService } from './map-event.service';
import { MaplibreLayer } from '../../models/maplibre-layer.model';
import { Observable, Subject, takeUntil } from 'rxjs';
import { NomadGeoJson } from '../../models/geojson.model';
import { DrawerRouteEnum } from '../../models/drawer.model';
import * as Maplibregl from 'maplibre-gl';
import { Basemap } from 'src/app/pages/home/components/map/map.dataset';
import { BaseMapsDataService } from '../dataservices/base-maps.dataservice';

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
    private drawerService: DrawerService,
    private mapEvent: MapEventService,
    private layerDataService: LayerDataService,
    private basemapsDataservice: BaseMapsDataService
  ) {}

  private map: Maplibregl.Map;
  private layers: Map<string, MaplibreLayer> = new Map();

  private loadedGeoJson: Map<string, string[]> = new Map();
  private loadedData: Map<string, NomadGeoJson> = new Map();

  private basemaps$: Observable<Basemap[]>;
  private onMapLoaded$: Subject<void> = new Subject();
  private ngUnsubscribe$: Subject<void> = new Subject();

  /**
   * This function creates a Maplibregl map and subscribes to moveend events to load new tiles based on
   * zoom level and overlapping tiles.
   * @returns The function `createMap()` returns an instance of the `Maplibregl.Map` class.
   */
  public createMap(): Maplibregl.Map {
    this.map = new Maplibregl.Map({
      container: 'map',
      style: this.test,
      center: [2.699596882916402, 48.407854932986936],
      zoom: 14,
      maxZoom: 22,
    });
    fromEvent(this.map, 'moveend')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        for (let layer of this.layers) {
          if (this.map.getZoom() <= layer[1].conf.maxZoom) {
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

  /**
   * Resizes the map (used when drawer closing)
   */
  public resizeMap(): void {
    this.map.resize();
  }

  public getBasemaps(): Observable<Basemap[]> {
    if (!this.basemaps$) {
      this.basemaps$ = this.basemapsDataservice.getBaseMaps();
    }
    return this.basemaps$;
  }

  public destroySubscription(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
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

  /**
   * Returns an array of strings representing the keys of all current layers added to the map.
   * @returns An array of strings representing the keys of all current layers added to the map.
   */
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
      const layer: MaplibreLayer = new MaplibreLayer(layerKey);
      this.layers.set(layerKey, layer);
      this.map.zoomTo(this.map.getZoom() + 0.0001);
      this.map.addSource(layerKey, layer.source);

      for (let style of layer.style) {
        setTimeout(() => this.map.addLayer(style));

        this.map.on('click', style.id, (e) => {
          this.onFeaturesClick(layerKey, e.features);
        });

        this.map.on('mousemove', style.id, (e) => {
          this.onMouseMove(layerKey, e);
        });

        this.map.on('mouseleave', style.id, () => {
          this.onMouseLeave(layerKey);
        });
      }

      await new Promise<void>((resolve) => {
        this.map.once('idle', () => {
          const isValid = (): boolean =>
            layer.style.every((style) => this.map.getLayer(style.id));
          if (isValid()) {
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

      // Removing registered events
      mLayer.style.forEach((style) => {
        this.map.off('click', style.id, (e) => {
          this.onFeaturesClick(layerKey, e.features);
        });

        this.map.off('mousemove', style.id, (e) => {
          this.onMouseMove(layerKey, e);
        });

        this.map.off('mouseleave', style.id, () => {
          this.onMouseLeave(layerKey);
        });
        this.map.removeLayer(style.id);
      });

      // Removing data from Maps
      this.loadedGeoJson.delete(layerKey);
      this.loadedData.delete(layerKey);
      this.layers.delete(layerKey);

      // Deletion of layers & source, putting an empty array to avoid cloning data later
      (this.map.getSource(layerKey) as Maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [],
      });
      this.map.removeSource(layerKey);
    }
  }

  private onFeaturesClick(layerKey: string, features: any[]): void {
    if (features.length > 0) {
      const ctFeature: any = features[0];
      this.selectFeature(layerKey, ctFeature);
    }
  }

  // Mouse hover event
  private onMouseMove(layerKey: string, e: any): void {
    if (e?.features?.length > 0) {
      this.map.getCanvas().style.cursor = 'pointer';
      this.mapEvent.highlightHoveredFeature(
        this.map,
        layerKey,
        e.features[0].id.toString()
      );
    }
  }

  // Mouse leave hover event
  private onMouseLeave(layerKey: string): void {
    this.map.getCanvas().style.cursor = '';
    this.mapEvent.highlightHoveredFeature(this.map, layerKey, undefined);
  }

  private selectFeature(layerKey: string, feature: any): void {
    if (!feature) {
      return;
    }

    this.mapEvent.highlightSelectedFeature(
      this.map,
      layerKey,
      feature.id.toString()
    );

    const properties = feature.properties;
    if (properties['geometry']) delete properties['geometry'];
    // We pass the layerKey to the drawer to be able to select the equipment on the layer
    properties['layer'] = layerKey;
    let route;
    switch (layerKey) {
      case 'intervention':
        route = DrawerRouteEnum.WORKORDER;
        break;
      default:
        route = DrawerRouteEnum.EQUIPMENT;
        break;
    }
    this.drawerService.navigateTo(route, [properties['id']], properties);
  }

  private getNearestFeatures(e: any, layer: string): any[] {
    const width = 20;
    const height = 20;
    return this.map.queryRenderedFeatures(
      [
        [e.originalEvent.x + width / 2, e.originalEvent.y + height / 2],
        [e.originalEvent.x - width / 2, e.originalEvent.y - height / 2],
      ],
      { layers: [layer] }
    );
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
    let layer = this.loadedData.get(layerKey);
    if (!layer) {
      layer = {
        type: 'FeatureCollection',
        features: [],
      };
      this.loadedData.set(layerKey, layer);
    }

    const newLayer = await this.layerDataService.getLayerFile(layerKey, file);
    layer.features.push(...newLayer.features);

    const source = this.map.getSource(layerKey) as Maplibregl.GeoJSONSource;
    source.setData(layer as any);
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

  private test: Maplibregl.StyleSpecification = {
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
    center: [2.699596882916402, 48.407854932986936],
    zoom: 15.070827661050382,
    bearing: 0,
    pitch: 0,
    sources: {},
    layers: [],
    glyphs: '/assets/myFont.pbf?{fontstack}{range}',
    sprite: 'http://localhost:8100/assets/sprites/@2x',
  };
}
