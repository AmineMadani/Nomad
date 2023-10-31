import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, firstValueFrom } from 'rxjs';
import { MaplibreLayer } from '../../models/maplibre-layer.model';
import * as Maplibregl from 'maplibre-gl';
import { BaseMapsDataService } from '../dataservices/base-maps.dataservice';
import { FilterDataService } from '../dataservices/filter.dataservice';
import { Basemap } from '../../models/basemap.model';
import { Layer, localisationExportMode } from '../../models/layer.model';
import { LngLatLike } from 'maplibre-gl';
import { ConfigurationService } from '../configuration.service';
import { MapEventService } from './map-event.service';
import { DrawerRouteEnum } from '../../models/drawer.model';
import { AlertController, ToastController } from '@ionic/angular';
import { Clipboard } from '@capacitor/clipboard';
import { LayerService } from '../layer.service';
import { Workorder } from '../../models/workorder.model';

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
    private layerService: LayerService,
    private basemapsDataservice: BaseMapsDataService,
    private filterDataService: FilterDataService,
    private configurationService: ConfigurationService,
    private mapEventService: MapEventService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  public measureMessage: any[];

  private map: Maplibregl.Map;
  private layers: Map<string, MaplibreLayer> = new Map();
  private layersConfiguration: Layer[];

  public loadedGeoJson: Map<string, string[]> = new Map();

  private onMapLoaded$: ReplaySubject<boolean> = new ReplaySubject(1);

  private loadingLayer: Map<string, Promise<void>> = new Map<
    string,
    Promise<void>
  >();
  private loadingStyle: Map<string, string[]> = new Map<string, string[]>();
  private loadedLayer: Array<string> = new Array<string>();
  private localisationMarker: Maplibregl.Marker = undefined;
  private removeLoadingLayer: Array<string> = new Array<string>();

  /**
   * This function creates a Maplibregl map and subscribes to moveend events to load new tiles based on
   * zoom level and overlapping tiles.
   * if latitude, longitude and zoom are setted the map will be centered, the zoom will be applyed and a pin will be added
   * @returns The function `createMap()` returns an instance of the `Maplibregl.Map` class.
   * @param lat latitude of the center of the map
   * @param lng longitude of the center of the map
   * @param zoom zoom level
   * @returns
   */
  public createMap(lat?: number, lng?: number, zoom?: number): Maplibregl.Map {
    this.mapLibreSpec.sprite =
      this.configurationService.host + 'assets/sprites/@2x';
    this.map = new Maplibregl.Map({
      container: 'map',
      style: this.mapLibreSpec,
      center: [lng ?? 2.699596882916402, lat ?? 48.407854932986936],
      zoom: zoom ?? 14,
      maxZoom: 22,
    });
    if (lng && lat && zoom) {
      this.localisationMarker = new Maplibregl.Marker({
        draggable: false,
      })
        .setLngLat([lng, lat])
        .addTo(this.map);
    }
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

  public getBasemaps(): Promise<Basemap[]> {
    return this.basemapsDataservice.getBasemaps();
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
  public async addEventLayer(
    layerKey: string,
    styleKey?: string
  ): Promise<void> {
    if (!layerKey || layerKey.includes('_xy')) {
      return;
    }

    if (layerKey.includes('asset.')) {
      layerKey = layerKey.split('asset.')[1];
    }

    //Case if the user add the layer after to have remove it before the first loading finished
    const removeIndex = this.removeLoadingLayer.indexOf(
      layerKey + (styleKey ? styleKey : '')
    );
    if (removeIndex >= 0) {
      this.removeLoadingLayer.splice(removeIndex, 1);
    }

    // Get all layers
    const layers = await this.layerService.getAllLayers();

    this.layersConfiguration = layers;

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
          (element) => element.lyrTableName == layerKey
        ),
        this.map
      );
      this.layers.set(layerKey, layer);
      if (!this.map.isZooming()) {
        this.map.zoomTo(this.map.getZoom() + 0.0001);
      }
      this.map.addSource(layerKey, layer.source);

      for (let style of layer.style) {
        setTimeout(() => {
          this.map.addLayer(style);
        });
      }

      const layerPromise = new Promise<void>((resolve) => {
        this.map.once('idle', async (e) => {
          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
          for (let i = 0; i < 6; i++) {
            if (this.map.querySourceFeatures(layerKey).length > 0) {
              break;
            }
            await sleep(500);
          }
          this.displayLayer(layerKey);
          this.loadedLayer.push(layerKey);
          this.loadingLayer.delete(layerKey);
          //Case if user click on remove layer before loaded
          const removeIndex = this.removeLoadingLayer.indexOf(
            layerKey + (styleKey ? styleKey : '')
          );
          if (removeIndex >= 0) {
            this.removeEventLayer(layerKey, styleKey);
          }
          this.reorderMapStyleDisplay();
          resolve();
        });
      });
      this.loadingLayer.set(layerKey, layerPromise);
      return layerPromise;
    }
  }

  /**
   * Method to reorder the layer style position (zindex)
   */
  private reorderMapStyleDisplay() {
    let layerSorted = this.layersConfiguration
      .filter((layer) => this.loadedLayer.includes(layer.lyrTableName))
      .sort((a, b) => a.lyrNumOrder - b.lyrNumOrder);
    for (let lyr of layerSorted) {
      for (let style of lyr.listStyle) {
        for (let mapLayer in this.getMap().style._layers) {
          if (mapLayer.includes(style.lseCode)) {
            this.getMap().moveLayer(mapLayer);
          }
        }
      }
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
          if (
            style.layout?.visibility === 'none' &&
            (style as any).source == layerKey
          ) {
            this.map.setLayoutProperty(style.id, 'visibility', 'visible');
          }
        } else {
          if ((style as any).source == layerKey) {
            if (style.id.includes(styleLayer)) {
              if (
                style.layout?.visibility === 'none' ||
                !style.layout?.visibility
              ) {
                this.map.setLayoutProperty(style.id, 'visibility', 'visible');
              }
            } else {
              if (!style.layout?.visibility) {
                this.map.setLayoutProperty(style.id, 'visibility', 'none');
              }
            }
          }
        }
      }
    }
    this.loadingStyle.set(layerKey, []);
  }

  /**
   * Method to create then apply the filter on the map for a specific layer
   * @param layerKey layer
   * @returns
   */
  public applyFilterOnMap(layerKey: string, filters?: any): void {
    if (!filters)
      filters = this.filterDataService.getSearchFilterListData().get(layerKey);
    const layer = this.getLayer(layerKey);
    if (!layer || !filters) {
      return;
    }

    const mapFilter: Map<string, any[]> = new Map<string, any[]>();
    if (filters && filters.size > 0) {
      for (const [key, values] of filters) {
        if (!key.toLowerCase().includes('date')) {
          mapFilter.set('in' + JSON.stringify(['get', key]), [
            'in',
            ['get', key],
            ['literal', values],
          ]);
        }
      }
    }

    for (const style of layer.style) {
      let mapFilterStyle = new Map([...mapFilter]);

      let styleFilter = this.map.getFilter(style.id) as any[];
      if (styleFilter) {
        if (styleFilter?.length > 2 && styleFilter[0] !== 'all') {
          if (
            !mapFilterStyle.has(styleFilter[0] + JSON.stringify(styleFilter[1]))
          ) {
            mapFilterStyle.set(
              styleFilter[0] + JSON.stringify(styleFilter[1]),
              styleFilter
            );
          }
        } else {
          for (const filter of styleFilter) {
            if (typeof filter !== 'string' && filter?.length > 2) {
              if (!mapFilterStyle.has(filter[0] + JSON.stringify(filter[1]))) {
                mapFilterStyle.set(
                  filter[0] + JSON.stringify(filter[1]),
                  filter
                );
              }
            }
          }
        }
      }

      const newStyleFilter = ['all', ...mapFilterStyle.values()];
      this.map.setFilter(style.id, newStyleFilter as any);
    }

    for (const style of layer.style) {
      this.map.getFilter(style.id);
    }
  }

  /**
   * Method to apply an already created the filter on the map for a specific layer
   * @param layerKey layer
   * @returns
   */
  public applyCreatedFilterOnMap(layerKey: string, filter: any): void {
    const layer = this.getLayer(layerKey);
    if (!layer || !filter) {
      return;
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
    if (!this.loadingLayer.has(layerKey)) {
      const removeIndex = this.removeLoadingLayer.indexOf(
        layerKey + styleLayer ? styleLayer : ''
      );
      if (removeIndex >= 0) {
        this.removeLoadingLayer.splice(removeIndex, 1);
      }

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
          (this.map.getSource(layerKey) as Maplibregl.GeoJSONSource).updateData(
            {
              removeAll: true,
            }
          );
          this.map.removeSource(layerKey);
        }
      }
    } else {
      this.removeLoadingLayer.push(layerKey + (styleLayer ? styleLayer : ''));
      if (styleLayer) {
        if (this.loadingStyle.get(layerKey)) {
          if (!this.loadingStyle.get(layerKey)[styleLayer]) {
            const removeIndex = this.loadingStyle
              .get(layerKey)
              .indexOf(styleLayer);
            if (removeIndex >= 0) {
              this.loadingStyle.get(layerKey).splice(removeIndex, 1);
            }
          }
        }
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
      if (
        style.id.includes(styleLayer) &&
        (style as any).source == layerKey &&
        (!style.layout?.visibility || style.layout?.visibility === 'visible')
      ) {
        this.map.setLayoutProperty(style.id, 'visibility', 'none');
      }
    }
    let removeLayer = true;
    for (let style of this.map.getStyle().layers) {
      if (
        (style as any).source == layerKey &&
        style.layout?.visibility === 'visible'
      ) {
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
   * Remove a point data for a specific layerkey
   * @param layerKey the layer key
   */
  public removePoint(layerKey: string, id: string) {
    const source = this.map.getSource(layerKey) as Maplibregl.GeoJSONSource;
    const addData: Maplibregl.GeoJSONSourceDiff = {
      remove: [id],
    };
    source.updateData(addData);
  }

  /**
   * update geometry of a feature
   * @param layerKey the layer key
   */
  public updateFeatureGeometry(layerKey: string, feature: any) {
    const source = this.map.getSource(layerKey) as Maplibregl.GeoJSONSource;
    const featureDiff: Maplibregl.GeoJSONFeatureDiff = {
      id: feature.id,
      newGeometry: feature.geometry,
    };
    const updateDate: Maplibregl.GeoJSONSourceDiff = {
      update: [featureDiff],
    };
    source.updateData(updateDate);
  }

  /**
   * update a feature
   * @param layerKey the layer key
   */
  public updateFeature(layerKey: string, feature: any) {
    const listProperties = new Array<{
      key: string;
      value: any;
    }>();
    for (let key of Object.keys(feature.properties)) {
      listProperties.push({
        key: key,
        value: feature.properties[key],
      });
    }

    const source = this.map.getSource(layerKey) as Maplibregl.GeoJSONSource;
    const featureDiff: Maplibregl.GeoJSONFeatureDiff = {
      id: feature.id,
      newGeometry: feature.geometry,
      addOrUpdateProperties: listProperties,
    };
    const updateDate: Maplibregl.GeoJSONSourceDiff = {
      update: [featureDiff],
    };
    source.updateData(updateDate);
  }

  /**
   * Add new workorder to the geojson source
   * @param workOrder the workorder
   */
  public addGeojsonToLayer(properties: Workorder, layerKey: string): void {
    this.addEventLayer(layerKey, null).then(() => {
      for (let task of properties.tasks) {
        const taskProperties: any = {...task};
        taskProperties.id = task.id.toString();
        taskProperties.x = task.longitude;
        taskProperties.y = task.latitude;
        taskProperties.wkoName = 'Intervention opportuniste';
        taskProperties.wkoId = properties.id.toString();
        taskProperties.wkoAppointment = properties.wkoAppointment;
        taskProperties.wkoEmergency = properties.wkoEmergency;
        const newPoint: any = {
          geometry: {
            type: 'Point',
            coordinates: [task.longitude, task.latitude],
          },
          properties: taskProperties,
          type: 'Feature',
        };
        this.addNewPoint(layerKey, newPoint);
      }
    });
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

  /**
   * Share a position by GPS coordinates or Uri link to application.
   * the uri link contains the zoom level
   * @param latitude latitude
   * @param longitude longitude
   */
  public async sharePosition(latitude: number, longitude: number) {
    const alert = await this.alertCtrl.create({
      header: 'Sous quelle forme voulez-vous partager votre position ?',
      buttons: [
        {
          text: 'Lien Nomad',
          role: localisationExportMode.nomadLink,
        },
        {
          text: 'Coordonnées GPS',
          role: localisationExportMode.gpsCoordinates,
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    const clipboardText: string =
      role === localisationExportMode.gpsCoordinates
        ? `latitude: ${latitude}, longitude: ${longitude}`
        : `${
            this.configurationService.host
          }${DrawerRouteEnum.HOME.toLocaleLowerCase()}?lat=${latitude}&lng=${longitude}&zoom=${this.map.getZoom()}`;

    await Clipboard.write({ string: clipboardText });

    const toast = await this.toastCtrl.create({
      message: 'Localisation copiée dans le presse-papier',
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
  /**
   * Remove the pin corresponding to localisation
   */
  public async removeLocalisationMarker() {
    this.localisationMarker.remove();
  }
}
