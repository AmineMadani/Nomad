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
import { BaseMapsDataService } from '../dataservices/base-maps.dataservice';
import { Layer } from '../../models/layer.model';
import { Basemap } from '../../models/basemap.model';
import { FilterDataService } from '../dataservices/filter.dataservice';

export interface Box {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

@Injectable({
  providedIn: 'root',
})
export class MapService  {
  constructor(
    private drawerService: DrawerService,
    private mapEvent: MapEventService,
    private layerDataService: LayerDataService,
    private basemapsDataservice: BaseMapsDataService,
    private filterDataService: FilterDataService
  ) {
    this.layerDataService.getLayers()
    .pipe(
      takeUntil(this.ngUnsubscribe$)
      )
    .subscribe((elements ) => {this.layersConfiguration = elements ; });
  }

  private map: Maplibregl.Map;
  private layers: Map<string, MaplibreLayer> = new Map();
  private layersConfiguration : Layer[];

  private loadedGeoJson: Map<string, string[]> = new Map();

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
      style: this.mapLibreSpec,
      center: [2.699596882916402, 48.407854932986936],
      zoom: 14,
      maxZoom: 22,
    });
    this.map.dragRotate.disable();
    this.onMapLoaded().subscribe(() => {
      this.map.resize();
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
      const layer: MaplibreLayer = new MaplibreLayer(this.layersConfiguration.find( element => element.lyrTableName == 'asset.'+ layerKey));
      this.layers.set(layerKey, layer);
      this.map.zoomTo(this.map.getZoom() + 0.0001);
      this.map.addSource(layerKey, layer.source);

      for (let oneStyle of layer.style) {
        setTimeout(() => this.map.addLayer(oneStyle));
      }

      return new Promise<void>((resolve) => {
        this.map.once('idle', e => {
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
        resolve()
      });
    }
  }

 /**
  * Method to apply the filter on the map for a specific layer
  * @param layerKey  layer exploitation data
  * @returns
  */
  public applyFilterOnMap(layerKey: string) : void{
    const filters: Map<string, string[]> = this.filterDataService.getSearchFilterListData().get(layerKey);
    const layer = this.getLayer(layerKey);
    if (!layer || !filters) {
      return;
    }

    const filter: any[] = ['all'];

    if (filters && filters.size > 0) {
      for (const [key, values] of filters) {
        filter.push(['in', ['get', key], ['literal',values]]);
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
        removeAll: true
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
    const addData:Maplibregl.GeoJSONSourceDiff = {
      add : [pointData]
    }
    source.updateData(addData);
  }

  /**
   * The function loads new tiles for layers based on their maximum zoom level and checks if they have
   * already been loaded.
   */
  public onMoveEnd(): void {
    for (let layer of this.layers) {
      if (this.map.getZoom() >= Math.min(...layer[1].style.map(style => style.minzoom))) {
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

  /**
   * Queries the nearest rendered feature from a mouse event on the map.
   * @param e - Mouse event on the map
   * @returns The nearest features (if there are) from the map.
   */
  public queryNearestFeature(
    e: Maplibregl.MapMouseEvent
  ): Maplibregl.MapGeoJSONFeature {
    var mouseCoords = this.map.unproject(e.point);
    const selectedFeatures = this.map.queryRenderedFeatures(
      [
        [e.point.x - 10, e.point.y - 10],
        [e.point.x + 10, e.point.y + 10],
      ],
      {
        layers: [...this.layers.values()]
          .flatMap((layer) => layer.style)
          .map((s) => s.id),
      }
    );
    return this.findNearestFeature(mouseCoords, selectedFeatures);
  }

  /**
   * This function changes the cursor style and highlights a hovered feature on a map.
   * @param feature - Closest feature hovered on the map
   */
  public onFeatureHovered(feature: Maplibregl.MapGeoJSONFeature): void {
    if (!feature) {
      this.map.getCanvas().style.cursor = '';
      this.mapEvent.highlightHoveredFeature(this.map, undefined, undefined);
      return;
    }

    this.map.getCanvas().style.cursor = 'pointer';
    this.mapEvent.highlightHoveredFeature(
      this.map,
      feature.source,
      feature.id.toString()
    );
  }

  /**
   * This function highlights a selected feature on a map.
   * @param feature - Closest feature selected on the map
   * @returns It navigates to a specific route in the application's drawer with some additional
   * properties.
   */
  public onFeatureSelected(feature: Maplibregl.MapGeoJSONFeature): void {
    if (!feature) {
      return;
    }

    this.mapEvent.highlightSelectedFeature(
      this.map,
      feature.source,
      feature.id.toString()
    );

    const properties = feature.properties;
    if (properties['geometry']) delete properties['geometry'];
    // We pass the layerKey to the drawer to be able to select the equipment on the layer
    properties['lyr_table_name'] = feature.source;
    let route: DrawerRouteEnum;
    switch (feature.source) {
      case 'workorder':
        route = DrawerRouteEnum.WORKORDER;
        break;
      default:
        route = DrawerRouteEnum.EQUIPMENT;
        break;
    }
    this.drawerService.navigateTo(route, [properties['id']], properties);
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
    if(source){
      const newLayer = await this.layerDataService.getLayerFile(layerKey, file);
      const addData:Maplibregl.GeoJSONSourceDiff = {
        add : newLayer.features
      }
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

  /**
   * Finds the nearest feature to a given set of coordinates from a list of features.
   * @param mouseCoords - Coordinates of a mouse event on the map.
   * @param {Maplibregl.MapGeoJSONFeature[]} features - Array of the features in a selected area.
   * @returns the closest feature from the mouse in the area.
   */
  private findNearestFeature(
    mouseCoords: Maplibregl.LngLat,
    features: Maplibregl.MapGeoJSONFeature[]
  ): Maplibregl.MapGeoJSONFeature | null {
    if (features.length === 0) {
      return null;
    }

    let nearestPoint: any | null = null;
    let shortestDistance = Infinity;

    for (const feature of features) {
      const distance = this.calculateDistance(mouseCoords, feature);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestPoint = feature;
      }
    }

    return nearestPoint;
  }

  /**
   * Calculates the distance between two points on a map using their longitude and latitude.
   * @param mousePoint - A Maplibregl.LngLat object representing the longitude and latitude.
   * @param feature - A MapGeoJSONFeature from the map.
   * @returns Returns the calculated distance the coordinates.
   */
  private calculateDistance(
    mousePoint: Maplibregl.LngLat,
    feature: Maplibregl.MapGeoJSONFeature
  ): number {
    const dx = feature.properties['x'] - mousePoint.lng;
    const dy = feature.properties['y'] - mousePoint.lat;
    return Math.sqrt(dx * dx + dy * dy);
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
    sprite: 'http://localhost:8100/assets/sprites/@2x',
  };
}
