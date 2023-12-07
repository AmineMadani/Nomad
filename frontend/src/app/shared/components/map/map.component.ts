import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { IonModal, LoadingController, ModalController } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import {
  Box,
  LocateStatus,
  MapService,
} from 'src/app/core/services/map/map.service';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { first, switchMap } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Basemap } from 'src/app/core/models/basemap.model';
import * as Maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { PraxedoService } from 'src/app/core/services/praxedo.service';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { BasemapOfflineService } from 'src/app/core/services/basemapOffline.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { Workorder } from 'src/app/core/models/workorder.model';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { StreetViewModalComponent } from '../street-view-modal/street-view-modal.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private mapService: MapService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private elem: ElementRef,
    private activatedRoute: ActivatedRoute,
    private praxedoService: PraxedoService,
    private userService: UserService,
    private drawingService: DrawingService,
    private basemapOfflineService: BasemapOfflineService,
    private layerService: LayerService,
    private workorderService: WorkorderService,
  ) {
    this.drawerService
      .onCurrentRouteChanged()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((route: DrawerRouteEnum) => {
        this.currentRoute = route;
      });
  }

  @ViewChild('ionModalMeasure', { static: false }) ionModalMeasure: IonModal;
  @ViewChild('ionModalStreetView', { static: false })
  ionModalStreetView: IonModal;


  /**
   * Method to hide the nomad context menu if the user click outside of the context menu
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapePressed() {
    if (this.drawingService.getIsMeasuring()) {
      this.drawingService.endMesure(true);
      this.measure = undefined;
    }
  }

  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;

  @Input() public hideMap?: boolean;
  @Input() public mapKey: string;
  @Output() public onHideMap: EventEmitter<void> = new EventEmitter();

  public map: Maplibregl.Map;
  public basemaps: Basemap[];
  public displayMap: boolean;
  public mapBasemaps: Map<string, any> = new Map();

  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;

  public zoom: number;
  public scale: string;
  public isMobile: boolean;

  // Pmrissions
  public userHasPermissionCreateXYWorkorder: boolean = false;
  public userHasPermissionModifyReport: boolean = false;
  public userHasPermissionRequestUpdateAsset: boolean = false;
  public measure: string;

  public colorLocateIcon: string;
  public sourceLocateIcon: string;
  public mapFeatures: Maplibregl.MapGeoJSONFeature[] = [];

  private selectedFeature: Maplibregl.MapGeoJSONFeature & any;
  private isInsideContextMenu: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();
  private clicklatitude: number;
  private clicklongitute: number;
  public streetViewMarker: Maplibregl.Marker;
  public clickEvent: Maplibregl.MapMouseEvent;
  public contextMenuX: number;
  public contextMenuY: number;

  async ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
    this.drawingService.isMobile = this.isMobile;
    this.measure = undefined;

    // Init permissions
    this.userHasPermissionCreateXYWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.CREATE_X_Y_WORKORDER
      );
    this.userHasPermissionModifyReport =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.MODIFY_REPORT_MY_AREA
      );
    this.userHasPermissionRequestUpdateAsset =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.REQUEST_UPDATE_ASSET
      );

    const loading = await this.loadingCtrl.create({
      message: 'Chargement de la carte',
    });
    loading.present();

    this.activatedRoute.queryParams
      .pipe(
        switchMap((p: Params) => {
          const { lat, lng, zoom } = p;
          this.map = this.mapService.createMap(this.mapKey, lat, lng, zoom);
          return fromEvent(this.map, 'load');
        }),
        first()
      )
      .subscribe(() => {
        loading.dismiss();
        this.generateMap();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.mapService.destroyLayers(this.mapKey);

    if (this.streetViewMarker) {
      this.streetViewMarker.remove();
      this.ionModalStreetView.isOpen = false;
    }
  }

  // --------------------------- //
  // ---- MAP CONFIGURATION ---- //
  // --------------------------- //

  /**
   * This function generates a map with a navigation control and adds a default basemap layer.
   */
  public generateMap(): void {
    this.scale = this.utilsService.calculateMapScale(this.map.getZoom(), this.map.getCenter().lat);
    if(!this.basemaps) {
      this.loadBaseMap();
    }

    fromEvent(this.map, 'zoom')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.scale = this.utilsService.calculateMapScale(this.map.getZoom(), this.map.getCenter().lat);
      });
  }

  /**
   * Sets the displayMap property to true and fire the map loaded event.
   */
  public setMapLoaded(): void {
    this.map.resize();
    this.displayMap = true;
    this.mapService.setMapLoaded(this.mapKey);
  }

  public onClickHideMap(): void {
    this.onHideMap.emit();
  }

  /**
   * Creates layers for a map based on the type of layer specified in the input parameter.
   * @param {string} backLayerKey - A string representing the key of the back layer to be created.
   * @param {Basemap} [layer] - Optional parameter of type Basemap, which contains information about
   * the layer to be created.
   */
  public createLayers(alias: string, layer?: Basemap): void {
    if (!layer) {
      layer = this.basemaps.find(
        (bl: Basemap) => bl.map_slabel.replace(/\s/g, '') === alias
      );
    }
    if (!layer) {
      return;
    }

    let mapLayer: any;
    switch (layer.map_type) {
      case 'WMS':
        let var_style = '';
        if (layer.map_style) {
          var_style = '&style=' + layer.map_style;
        }
        mapLayer = {
          tiles: [
            `${layer.map_url}layer=${
              layer.map_layer
            }${var_style}&tilematrixset=${
              layer.map_matrixset
            }&Service=WMTS&Request=GetTile&Version=1.0.0&Format=${encodeURI(
              layer.map_format
            )}&TileMatrix={z}&TileCol={x}&TileRow={y}`,
          ],
          type: 'raster',
          tileSize: 128,
          attribution: layer?.map_attributions?.[0] ?? '',
          maxzoom: 19,
        };
        break;
      case 'OSM':
        mapLayer = {
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          type: 'raster',
          tileSize: 128,
          maxzoom: 19,
        };
        break;
      default:
        return;
    }

    this.mapBasemaps.set(alias, mapLayer);
    this.map.addSource(alias, mapLayer);
  }

  /**
   * The function displays a specific layer on a map by changing the source of the basemap layer.
   * @param {string} keyLayer - a string representing the key of a layer in a mapLayers Map object
   */
  public onBasemapChange(keyLayer: string): void {
    keyLayer = this.getMapAlias(keyLayer);
    if (!this.mapBasemaps.has(keyLayer)) {
      this.createLayers(keyLayer);
    }
    if (keyLayer != 'PlanOffline') {
      this.removeOfflineLayer();
      this.changeBasemapSource(keyLayer);
    } else {
      this.addOfflineLayer();
    }
    this.map.zoomTo(this.map.getZoom() + 0.001);
    this.userService.saveUserContext();
  }

  private async removeOfflineLayer() {
    if (this.map.getSource('offlineBaseMap')) {
      let styleLayers = await this.basemapOfflineService.getOfflineStyleLayer();
      for (let layer of styleLayers) {
        if (this.map.getLayer(layer.id)) {
          this.map.removeLayer(layer.id);
        }
      }
      this.map.removeSource('offlineBaseMap');
    }
  }

  // Temp while basemaps do not have keys
  public getMapAlias(alias: string): string {
    return alias.replace(/\s/g, '');
  }

  /**
   * Check if there is an report in progress to finish
   * @returns True if there is a external report in progress
   */
  public hasResumeReport(): boolean {
    return this.praxedoService.externalReport ? true : false;
  }

  /**
   * Navigate to the current report
   */
  public resumeReport() {
    this.router.navigate(
      ['/home/workorder/' + this.praxedoService.externalReport + '/cr'],
      { queryParams: { state: 'resume' } }
    );
  }

  /**
   * Resets the rotation of the map to north.
   */
  public onResetRotation(): void {
    this.map.rotateTo(0);
  }

  // --------------------- //
  // ---- MAP ACTIONS ---- //
  // --------------------- //

// /**
//    * Opens a context menu on the map and updates its content based on the selected feature.
//    * @param e - MapMouseEvent from Maplibre
//    */
  public async openNomadContextMenu(
    e: Maplibregl.MapMouseEvent,
    features: Maplibregl.MapGeoJSONFeature[]
  ): Promise<void> {
    this.drawingService.deleteDrawing();
    this.measure = undefined;
    this.clickEvent = e;
    this.mapFeatures = features;
    this.clicklatitude = e.lngLat.lat;
    this.clicklongitute = e.lngLat.lng;

    this.contextMenuX = e.point.x;
    this.contextMenuY = e.point.y;
  }

  /**
   * Use the geolocate feature of Maplibre, with their input hidden
   */
  public geolocate(): void {
    this.updateLocateButtonStatus();
    const el = this.elem.nativeElement.querySelectorAll(
      '.maplibregl-ctrl-geolocate'
    )[0];
    el.click();
  }

  //Manage Icon of locate button
  public manageLocateIcon(): string {
    //Default Value
    this.colorLocateIcon = 'Primary';
    this.sourceLocateIcon = '';
    let iconName: string = '';
    switch (this.mapService.getLocateStatus()) {
      case LocateStatus.LOCALIZATE: {
        iconName = 'locate-outline';
        break;
      }
      case LocateStatus.TRACKING: {
        this.sourceLocateIcon = 'assets/icon/locate-tracking.svg';
        break;
      }
      case LocateStatus.NONE:
      default: {
        this.colorLocateIcon = 'medium';
        iconName = 'locate-outline';
        break;
      }
    }
    return iconName;
  }


  /**
   * Sets the zoom level of the map to the value e.
   * @param {number} e - e is a number representing the new zoom level that the map should be set to
   */
  public onZoomChange(e: number): void {
    this.zoom = e;
    this.map.zoomTo(this.zoom);
  }

  /**
   * event on the change of the scale by the user
   * @param event the value of the user input
   */
  public onScaleChange(event: string): void {
    const newValue = event;
    const pattern = /^1:\s?(\d+)$/; //1:232500
    const matchResult = newValue.match(pattern);
    matchResult?.[1]
      ? this.calculateZoomByScale(matchResult[1])
      : (this.scale = this.utilsService.calculateMapScale(this.map.getZoom(), this.map.getCenter().lat));
  }

  public getMeasuringCondition(): boolean {
    return this.drawingService.getIsMeasuring();
  }

  public getShouldOpenMobileMeasure(): boolean {
    return this.drawingService.getIsMeasuring() && this.isMobile;
  }

  /**
   * Stop the measure where the measure modal closed
   * @param data event
   */
  public measureModalDismissed(data: any): void {
    this.drawingService.endMesure(true);
  }

  public setMeasure(measure: string): void {
    this.measure = measure;
  }

  public setLocateStatus(status: LocateStatus) {
    this.mapService.setLocateStatus(status);
  }

  /**
   * Update the status of locate button
   */
  public updateLocateButtonStatus(): void {
    switch (this.mapService.getLocateStatus()) {
      case LocateStatus.NONE:
      case LocateStatus.LOCALIZATE: {
        this.setLocateStatus(LocateStatus.TRACKING);
        break;
      }
      case LocateStatus.TRACKING: {
        this.setLocateStatus(LocateStatus.NONE);
        break;
      }
      default:
        break;
    }
  }

  private addControls(): void {
    this.map.addControl(
      new Maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
    this.map.addControl(
      new Maplibregl.ScaleControl({
        unit: 'metric',
      }),
      'bottom-right'
    );
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      modes: {
        ...MapboxDraw.modes,
        draw_rectangle: DrawRectangle,
      },
    });
    this.map.addControl(draw as any, 'top-left');
    this.drawingService.setDraw(draw);
  }

  private changeBasemapSource(keyLayer: string) {
    if (!this.map.getLayer('basemap')) {
      const firstLayerId = this.map.getStyle().layers[0]?.id;
      this.map.addLayer(
        {
          id: 'basemap',
          type: 'raster',
          source: keyLayer,
          paint: {},
        },
        firstLayerId
      );
    } else {
      this.map.getLayer('basemap').source = keyLayer;
    }
  }

  private async addOfflineLayer() {
    this.mapService.getMap('home').removeLayer('basemap');
    this.mapService.getMap('home').addSource('offlineBaseMap', {
      type: 'vector',
      tiles: [
        'offline://{z}/{x}/{y}.vector.pbf',
        //"https://nomad-basemaps.hp.m-ve.com/maps/{z}/{x}/{y}.pbf"
      ],
    });

    const firstLayerId = this.map.getStyle().layers[0]?.id;
    let styleLayers = await this.basemapOfflineService.getOfflineStyleLayer();
    for (let layer of styleLayers) {
      this.mapService.getMap('home').addLayer(layer, firstLayerId);
    }
  }

  /**
   * Calculate and set the zoomlevel corresponding to a scale
   * inverse of calculateScale
   * @param scale right part of the scale with the format 1: xxxx with xxxx as number
   */
  private calculateZoomByScale(scale: string): void {
    const resolutionAtZeroZoom: number = 78271.516964020480767923472190235;
    const resolutionAtLatitudeAndZoom = (Number(scale) * 0.0254) / 90;
    this.map.setZoom(
      Math.log(
        (resolutionAtZeroZoom *
          Math.cos(this.map.getCenter().lat * (Math.PI / 180))) /
          resolutionAtLatitudeAndZoom
      ) / Math.log(2)
    );
  }

  /**
   * The function loads new tiles for layers based on their maximum zoom level and checks if they have
   * already been loaded.
   */
  public onMoveEnd(): void {
    this.userService.saveUserContext();
    for (let layer of this.mapService.getCurrentLayers()) {
      if (
        this.map.getZoom() >=
          Math.min(...layer[1].style.map((style) => style.minzoom)) &&
        this.customTileFilter(layer[0])
      ) {
        this.getOverlapTileFromIndex(layer[0]).then(async (res) => {
          for (let str of res.listTile) {
            if (
              !this.mapService.loadedGeoJson.get(res.layer) ||
              !this.mapService.loadedGeoJson.get(res.layer)!.includes(str)
            ) {
              if (this.mapService.loadedGeoJson.get(res.layer)) {
                this.mapService.loadedGeoJson.get(res.layer)!.push(str);
              } else {
                this.mapService.loadedGeoJson.set(res.layer, [str]);
              }
              await this.loadNewTile(res.layer, str);
            }
          }
        });
      }
    }
  }


  /**
   * Method to add custom filter on layer tile loading
   * Example : If layer task has not the active task switch enable so we don't load geojson but the layer stay available
   * @param layer The layer name
   * @returns The custom filter for the specific layer
   */
  private customTileFilter(layer: string): boolean {
    return (
      layer != 'task' ||
      (layer == 'task' && this.workorderService.activeWorkorderSwitch)
    );
  }

  /**
   * Retrieves a list of tiles that overlap with the current map view based on their
   * coordinates and a given layer index.
   * @param {string} key - Layer index key
   * @returns a Promise that resolves to an array of strings.
   */
  private async getOverlapTileFromIndex(key: string): Promise<any> {
    const listTile: string[] = [];
    const val: Maplibregl.LngLatBounds = this.map!.getBounds();
    const box1: Box = {
      x1: Math.min(val._sw.lat, val._ne.lat),
      x2: Math.max(val._sw.lat, val._ne.lat),
      y1: Math.min(val._sw.lng, val._ne.lng),
      y2: Math.max(val._sw.lng, val._ne.lng),
    };

    const layerIndexes = await this.layerService.getLayerIndexes();

    const index: any[] = (layerIndexes as any)['features'];

    if (index && index.length > 0) {
      for (const coordRaw of index) {
        const coords: string[] = (coordRaw['properties']['bbox'] as string)
          .replace('POLYGON((', '')
          .replace(')', '')
          .split(',');

        const box2: Box = {
          y1: Math.max(
            ...coords.map((coord) => parseFloat(coord.split(' ')[0]))
          ),
          y2: Math.min(
            ...coords.map((coord) => parseFloat(coord.split(' ')[0]))
          ),
          x1: Math.max(
            ...coords.map((coord) => parseFloat(coord.split(' ')[1]))
          ),
          x2: Math.min(
            ...coords.map((coord) => parseFloat(coord.split(' ')[1]))
          ),
        };

        if (this.checkIfBoxesOverlap(box2, box1)) {
          listTile.push(coordRaw['properties']['file']);
        }
      }
    }
    let result: any = {
      layer: key,
      listTile: listTile,
    };

    return result;
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
   * Load a new tile for a given layer and updates the layer's data on the map.
   * @param {string} layerKey -Key of the layer being loaded or updated.
   * @param {string} file - Path of the file that contains the data to be loaded.
   */
  private async loadNewTile(layerKey: string, file: string): Promise<void> {
    const source = this.map.getSource(layerKey) as Maplibregl.GeoJSONSource;
    if (source) {
      const newLayer = await this.layerService.getLayerFile(
        layerKey,
        file,
        this.customDateSearch(layerKey)
      );

      // Filtering the new features with stored form
      switch (layerKey) {
        case 'task':
          newLayer.features = this.workorderService.filterGeojsonFeatures(
            newLayer.features
          );
          break;
        default:
          break;
      }

      const addData: Maplibregl.GeoJSONSourceDiff = {
        add: newLayer.features,
      };
      setTimeout(() => {
        source.updateData(addData);
        if (layerKey == 'task') {
          this.loadLocalTask();
        }
      });
    }
  }

  private loadLocalTask() {
    this.workorderService.getLocalWorkorders().then((workorders) => {
      for (let workorder of workorders) {
        if (workorder.id < 0 && !workorder.isDraft) {
          this.mapService.addGeojsonToLayer(this.mapKey, workorder, 'task');
        }
      }
    });
  }

  private customDateSearch(layerkey: string): Date {
    if (layerkey == 'task') {
      return this.workorderService.dateWorkorderSwitch;
    }
    return null;
  }

  public async loadBaseMap() {
    await this.mapService.getBasemaps().then((basemaps: Basemap[]) => {
      this.basemaps = basemaps.filter((bl) => bl.map_display);
      if (this.basemapOfflineService.db) {
        this.basemaps.push({
          map_type: 'OFFLINE',
          map_default: false,
          map_display: true,
          map_slabel: 'Plan Offline',
        });
      }
      const defaultBackLayer: Basemap | undefined = this.basemaps.find(
        (bl) => bl.map_default
      );
      if (defaultBackLayer) {
        this.zoom = this.map.getZoom();
        this.createLayers(
          defaultBackLayer.map_slabel.replace(/\s/g, ''),
          defaultBackLayer
        );
        setTimeout(() => {
          if(!this.map.getLayer('basemap')) {
            this.map.addLayer({
              id: 'basemap',
              type: 'raster',
              source: defaultBackLayer.map_slabel.replace(/\s/g, ''),
              paint: {},
            });
            // Because of the Drawing control, controls need to be added after the basemaps
            this.addControls();
          }
        });
      }
      this.setMapLoaded();
    });
  }
}
