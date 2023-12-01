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
import { Box, LocateStatus, MapService } from 'src/app/core/services/map/map.service';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { debounceTime, first, switchMap, filter, take } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
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
    private mapLayerService: MapLayerService
  ) {
    this.drawerService
      .onCurrentRouteChanged()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((route: DrawerRouteEnum) => {
        this.currentRoute = route;
      });
  }

  @ViewChild('ionModalMeasure', { static: false }) ionModalMeasure: IonModal;
  /**
   * Method to hide the nomad context menu if the user click outside of the context menu
   */
  @HostListener('document:click')
  clickout() {
    if (!this.isInsideContextMenu) {
      document.getElementById('map-nomad-context-menu').className = 'hide';
    }
  }

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

  private selectedFeature: Maplibregl.MapGeoJSONFeature & any;
  private isInsideContextMenu: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();
  private clicklatitude: number;
  private clicklongitute: number;

    public colorLocateIcon : string ;
    public sourceLocateIcon : string;

    /**
    * control of locatation without tracking
    */
    private  geoLocateControl =  new Maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: false,//
    });  
  
    /**
     * control of locatation with tracking
     */
    private  geoLocateControlTracking =  new Maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,//
    });  


  async ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
    this.drawingService.isMobile = this.isMobile;
    this.measure = undefined;
    this.loadUserContext();

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
          this.map = this.mapService.createMap(lat, lng, zoom);
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
    this.mapService.destroyLayers();
  }

  // --------------------------- //
  // ---- MAP CONFIGURATION ---- //
  // --------------------------- //

  /**
   * This function generates a map with a navigation control and adds a default basemap layer.
   */
  public generateMap(): void {
    this.mapService.getBasemaps().then((basemaps: Basemap[]) => {
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
          this.map.addLayer({
            id: 'basemap',
            type: 'raster',
            source: defaultBackLayer.map_slabel.replace(/\s/g, ''),
            paint: {},
          });
          // Because of the Drawing control, controls need to be added after the basemaps
          this.addControls();
        });
      }
      this.setMapLoaded();
    });
    this.scale = this.calculateScale();

    fromEvent(this.mapService.getMap(), 'zoom')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.scale = this.calculateScale();
      });
  }

  /**
   * Sets the displayMap property to true and fire the map loaded event.
   */
  public setMapLoaded(): void {
    this.map.resize();
    this.displayMap = true;
    this.mapService.setMapLoaded();
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

  /**
   * Opens a context menu on the map and updates its content based on the selected feature.
   * @param e - MapMouseEvent from Maplibre
   */
  public async openNomadContextMenu(
    e: Maplibregl.MapMouseEvent,
    feature: Maplibregl.MapGeoJSONFeature
  ): Promise<void> {
    this.drawingService.deleteDrawing();
    //this.drawingService.endMesure(true);
    this.measure = undefined;

    const menu: HTMLElement = document.getElementById('map-nomad-context-menu');
    const contextMenuCreateWorkOrder: HTMLElement = document.getElementById(
      'map-nomad-context-menu-create-workorder'
    );
    const contextMenuCreateReport: HTMLElement = document.getElementById(
      'map-nomad-context-menu-create-report'
    );

    menu.className = 'show';
    menu.style.top = e.originalEvent.clientY - 56 + 'px';
    menu.style.left = e.originalEvent.clientX + 'px';
    this.clicklatitude = e.lngLat.lat;
    this.clicklongitute = e.lngLat.lng;

    if (feature && feature.source !== 'task') {
      contextMenuCreateWorkOrder.innerHTML = `Générer une intervention sur ${feature.id}`;
      contextMenuCreateReport.innerHTML = `Saisir un compte-rendu sur ${feature.id}`;
      this.selectedFeature = {
        ...feature,
        properties: {
          ...feature.properties,
          x: e.lngLat.lng,
          y: e.lngLat.lat,
        },
      };
    } else {
      contextMenuCreateWorkOrder.innerHTML = 'Générer une intervention XY';
      contextMenuCreateReport.innerHTML = 'Saisir un compte-rendu XY';
      this.selectedFeature = {
        properties: {
          x: e.lngLat.lng,
          y: e.lngLat.lat,
        },
      };
    }
  }

  /**
   * Navigates to a work order page with selected feature properties as query parameters.
   */
  public onGenerateWorkOrder(): void {
    if (this.selectedFeature['id']) {
      this.router.navigate(['/home/workorder'], {
        queryParams: {
          [this.selectedFeature['source']]: this.selectedFeature['id'],
        },
      });
      document.getElementById('map-nomad-context-menu').className = 'hide';
    } else {
      if (!this.selectedFeature['properties']['lyrTableName']) {
        this.selectedFeature['properties']['lyrTableName'] =
          this.selectedFeature['source'];
      }
      document.getElementById('map-nomad-context-menu').className = 'hide';
      this.drawerService.navigateTo(
        DrawerRouteEnum.WORKORDER_WATER_TYPE,
        undefined,
        this.selectedFeature['properties']
      );
    }
  }

  /**
   * Navigates to a report page with selected feature properties as query parameters.
   */
  public async onGenerateReport(): Promise<void> {
    let lStatus = await this.workorderService.getAllWorkorderTaskStatus();
    let ctrId = this.selectedFeature['properties']['ctrId']
      ? this.selectedFeature['properties']['ctrId'].toString().split(',')[0]
      : null;
    if (this.selectedFeature['id']) {
      let equipment = await this.layerService.getEquipmentByLayerAndId(
        this.selectedFeature['source'],
        this.selectedFeature['id']
      );
      let recalculateCoords: number[];
      //Equipments have fixed coordinates
      if (equipment.geom.type == 'Point') {
        recalculateCoords = [
          this.selectedFeature['properties']['x'],
          this.selectedFeature['properties']['y'],
        ];
      } else {
        recalculateCoords = this.mapLayerService.findNearestPoint(
          equipment.geom.coordinates,
          [
            this.selectedFeature['properties']['x'],
            this.selectedFeature['properties']['y'],
          ]
        );
      }
      let workorder: Workorder = {
        latitude: recalculateCoords[1],
        longitude: recalculateCoords[0],
        wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
        ctyId: this.selectedFeature['properties']['ctyId'],
        id: this.utilsService.createCacheId(),
        isDraft: true,
        tasks: [
          {
            id: this.utilsService.createCacheId(),
            latitude: recalculateCoords[1],
            longitude: recalculateCoords[0],
            assObjTable: this.selectedFeature['source']
              ? this.selectedFeature['source']
              : 'aep_xy',
            assObjRef: this.selectedFeature['id']
              ? this.selectedFeature['id']
              : null,
            wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
            ctrId: ctrId,
          },
        ],
      };
      this.workorderService.saveCacheWorkorder(workorder);
      document.getElementById('map-nomad-context-menu').className = 'hide';
      this.router.navigate([
        '/home/workorder/' + workorder.id.toString() + '/cr',
      ]);
    } else {
      document.getElementById('map-nomad-context-menu').className = 'hide';
      this.selectedFeature['properties']['ctrId'] = ctrId;
      this.selectedFeature['properties']['target'] = 'report';
      this.selectedFeature['properties']['wtsId'] = lStatus.find(
        (status) => status.wtsCode == 'CREE'
      )?.id;
      this.drawerService.navigateTo(
        DrawerRouteEnum.WORKORDER_WATER_TYPE,
        undefined,
        this.selectedFeature['properties']
      );
    }
  }

  /**
   * Change the param isInsideContextMenu if hte user is on/out of the context menu
   * @param hover True if context menu hover
   */
  public onHoverContextMenu(hover: boolean) {
    this.isInsideContextMenu = hover;
  }

  /**
   * Use the polygon drawing tool of MapboxDraw, with their input hidden
   */
  public onPolygonalSelection(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    document.getElementById('map-nomad-context-menu').className = 'hide';
    this.drawingService.setDrawMode('draw_polygon');
  }

  /**
   * Use the polygon drawing tool of MapboxDraw, with their input hidden
   */
  public onRectangleSelection(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.drawingService.setDrawMode('draw_rectangle');
    document.getElementById('map-nomad-context-menu').className = 'hide';
  }

  /**
   * Remove the pin representing the initial localisation
   */
  public async onRemoveMarker() {
    document.getElementById('map-nomad-context-menu').className = 'hide';
    await this.mapService.removeLocalisationMarker();
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
  public manageLocateIcon() : string{
    //Default Value
    this.colorLocateIcon = 'Primary';
    this.sourceLocateIcon = '';
    let iconName : string = '';
    switch(this.mapService.getLocateStatus()){
      case LocateStatus.LOCALIZATE:{
        iconName = 'locate-outline';
        break;
      }
      case LocateStatus.TRACKING:{
        this.sourceLocateIcon = 'assets/icon/locate-tracking.svg';
        break;
      } 
      case LocateStatus.NONE: 
      default:
      {
        this.colorLocateIcon = 'medium';
        iconName = 'locate-outline';
        break;
      }
    }
    return iconName;
  }

  /**
   * Asks the user how they want to share their location then
   * copies the appropriate information to the clipboard.
   */
  public async onShareLocalisation(): Promise<void> {
    document.getElementById('map-nomad-context-menu').className = 'hide';
    await this.mapService.sharePosition(
      this.clicklatitude,
      this.clicklongitute
    );
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
      : (this.scale = this.calculateScale());
  }

  public getMeasuringCondition(): boolean {
    return this.drawingService.getIsMeasuring();
  }

  public endMeasuring(): void {
    this.drawingService.endMesure(true);
  }

  public getShouldOpenMobileMeasure(): boolean {
    return this.drawingService.getIsMeasuring() && this.isMobile;
  }

  /**
   * Stop the measure where the measure modal closed
   * @param data event
   */
  public measureModalDismissed(data: any): void {
    this.endMeasuring();
  }

  public setMeasure(measure: string): void {
    this.measure = measure;
  }

  public setLocateStatus(status : LocateStatus){
    this.mapService.setLocateStatus(status);
  }

  /**
   * Init the user context save on home
   */
  private initUserEventContext() {
    this.userService
      .onInitUserContextEvent()
      .pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.userService.onUserContextEvent();
      });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        filter((val) => val.url.includes('/home')),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(() => {
        this.userService.onUserContextEvent();
      });
  }

  private loadUserContext() {
    this.mapService
      .onMapLoaded()
      .pipe(take(1))
      .subscribe(() => {
        this.userService.getCurrentUser().then((user) => {
          setTimeout(() => {
            if (user.usrConfiguration.context?.layers) {
              for (let layer of user.usrConfiguration.context?.layers) {
                this.mapService.addEventLayer(layer[0], layer[1]);
              }
            }
            if (user.usrConfiguration.context?.zoom) {
              if (!this.praxedoService.externalReport) {
                this.mapService.setZoom(user.usrConfiguration.context?.zoom);
              }
            }
            if (user.usrConfiguration.context?.lat) {
              if (!this.praxedoService.externalReport) {
                this.mapService
                  .getMap()
                  .jumpTo({
                    center: [
                      user.usrConfiguration.context?.lng,
                      user.usrConfiguration.context?.lat,
                    ],
                  });
              }
            }
            if (user.usrConfiguration.context?.basemap) {
              if (
                this.basemaps.find(
                  (bm) =>
                    bm.map_slabel.replace(/\s/g, '') ==
                    user.usrConfiguration.context?.basemap
                )
              ) {
                this.onBasemapChange(user.usrConfiguration.context?.basemap);
              }
            }
            if (
              user.usrConfiguration.context?.url &&
              this.router.url == '/home' &&
              user.usrConfiguration.context?.url != '/home/asset' &&
              user.usrConfiguration.context?.url != '/home/exploitation' &&
              !this.praxedoService.externalReport
            ) {
              this.router.navigateByUrl(user.usrConfiguration.context?.url);
            }
            this.initUserEventContext();
          }, 100);
        });
      });
  }

  /**
  * Update the status of locate button
  */
  private updateLocateButtonStatus() : void{
    switch(this.mapService.getLocateStatus()){
      case LocateStatus.NONE: 
      {
        this.setLocateStatus(LocateStatus.TRACKING);
        this.addGeoLocateTrackingControl();
        break;
      }
      case LocateStatus.TRACKING:{
        this.setLocateStatus(LocateStatus.LOCALIZATE);
        this.addGeoLocateControl();
        break;
      }
      case LocateStatus.LOCALIZATE:{
        this.setLocateStatus(LocateStatus.NONE);
        this.removeLocateControls();
        break;
      }
      default:
      break;
    }
  }

  /**
   * Add locate control with tracking
   */
  private addGeoLocateTrackingControl() : void{
    this.removeLocateControls();
    this.map.addControl(this.geoLocateControlTracking);
  }

  /**
   * Add locate control without tracking
   */
  private addGeoLocateControl() : void{
    this.removeLocateControls();
    this.map.addControl(this.geoLocateControl);
  }

  /**
   * Remove LocateControls
   * There are 2 locates controls , with and without tracking
   */
  private removeLocateControls(){
    if (this.map.hasControl(this.geoLocateControl)){
      this.map.removeControl(this.geoLocateControl);
    }
    if (this.map.hasControl(this.geoLocateControlTracking)){
      this.map.removeControl(this.geoLocateControlTracking);
    }
  }

  private addControls(): void {
    this.addGeoLocateTrackingControl();
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
    this.mapService.getMap().removeLayer('basemap');
    this.mapService.getMap().addSource('offlineBaseMap', {
      type: 'vector',
      tiles: [
        'offline://{z}/{x}/{y}.vector.pbf',
        //"https://nomad-basemaps.hp.m-ve.com/maps/{z}/{x}/{y}.pbf"
      ],
    });

    const firstLayerId = this.map.getStyle().layers[0]?.id;
    let styleLayers = await this.basemapOfflineService.getOfflineStyleLayer();
    for (let layer of styleLayers) {
      this.mapService.getMap().addLayer(layer, firstLayerId);
    }
  }

  /**
   * calculation of the resolution at level zero for 1 tile of 512
   * circumference of the earth (6,378,137 m)
   * resolution at zero zoom on the equator
   * 40075.016686 * 1000 / 512 ≈ 6378137 * 2 * ft / 512 = 78271.516964020480767923472190235
   *
   * resolution depending on zoom level
   * resolution = 156543.03 meters/pixel * cos(latitude) / (2^zoomlevel)
   * scale = 1: (screen_dpi * 1/0.0254 in/m * resolution)
   * we take a standard resolution of 90 dpi
   * from https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
   */
  private calculateScale(): string {
    const resolutionAtZeroZoom: number = 78271.516964020480767923472190235;
    const resolutionAtLatitudeAndZoom: number =
      (resolutionAtZeroZoom *
        Math.cos(this.map.getCenter().lat * (Math.PI / 180))) /
      2 ** this.map.getZoom();
    return (
      '1: ' + Math.ceil((90 / 0.0254) * resolutionAtLatitudeAndZoom).toString()
    );
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
          this.mapService.addGeojsonToLayer(workorder, 'task');
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
}
