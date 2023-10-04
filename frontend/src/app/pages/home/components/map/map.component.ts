import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { Box, MapService } from 'src/app/core/services/map/map.service';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { debounceTime, first, forkJoin, switchMap, filter, Observable, map } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Basemap } from 'src/app/core/models/basemap.model';
import { CustomZoomControl } from './zoom.control';
import * as Maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { PraxedoService } from 'src/app/core/services/praxedo.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { CityService } from 'src/app/core/services/city.service';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { BasemapOfflineService } from 'src/app/core/services/basemapOffline.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';

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
    private contractService: ContractService,
    private cityService: CityService,
    private mapEvent: MapEventService,
    private activatedRoute: ActivatedRoute,
    private praxedoService: PraxedoService,
    private userService: UserService,
    private drawingService: DrawingService,
    private basemapOfflineService: BasemapOfflineService,
    private layerService: LayerService,
    private workorderService: WorkorderService
  ) {
    this.drawerService
      .onCurrentRouteChanged()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((route: DrawerRouteEnum) => {
        this.currentRoute = route;
      });
  }

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

  private preventTouchMoveClicked: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();
  private clicklatitude: number;
  private clicklongitute: number;

  async ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();

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
    this.mapService.getBasemaps().subscribe((basemaps: Basemap[]) => {
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
      this.addEvents();
    });
    this.scale = this.calculateScale();
  }

  /**
   * Sets the displayMap property to true and fire the map loaded event.
   */
  public setMapLoaded(): void {
    this.map.resize();
    this.displayMap = true;
    this.mapService.setMapLoaded();
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
        mapLayer = {
          tiles: [
            `${layer.map_url}?layer=${
              layer.map_layer
            }&style=normal&tilematrixset=${
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
    this.router.navigate([
      '/home/workorder/' + this.praxedoService.externalReport + '/cr',
    ]);
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

    menu.className = 'show';
    menu.style.top = e.originalEvent.clientY - 56 + 'px';
    menu.style.left = e.originalEvent.clientX + 'px';
    this.clicklatitude = e.lngLat.lat;
    this.clicklongitute = e.lngLat.lng;

    if (!feature) {
      forkJoin({
        contractIds: this.contractService.getContractIdsByLatitudeLongitude(
          e.lngLat.lat,
          e.lngLat.lng
        ),
        cityIds: this.cityService.getCityIdsByLatitudeLongitude(
          e.lngLat.lat,
          e.lngLat.lng
        ),
      }).subscribe(({ contractIds, cityIds }) => {
        const params: any = {};
        params.x = e.lngLat.lng;
        params.y = e.lngLat.lat;
        params.lyrTableName = 'aep_xy';
        if (contractIds && contractIds.length > 0)
          params.ctrId = contractIds.join(',');
        if (cityIds && cityIds.length > 0) params.ctyId = cityIds.join(',');
        this.selectedFeature = {
          properties: params,
        };
        contextMenuCreateWorkOrder.innerHTML = 'Générer une intervention XY';
      });
    } else {
      contextMenuCreateWorkOrder.innerHTML = `Générer une intervention sur ${feature.id}`;
      this.selectedFeature = {
        ...feature,
        properties: {
          ...feature.properties,
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
    const el = this.elem.nativeElement.querySelectorAll(
      '.maplibregl-ctrl-geolocate'
    )[0];
    el.click();
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

  private addEvents(): void {
    fromEvent(this.map, 'mousemove')
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(() => !this.isMobile)
      )
      .subscribe((e) => {
        const canvasElement =
          document.getElementsByClassName('maplibregl-canvas')[0];
        if (this.drawingService.getIsMeasuring()) {
          canvasElement.classList.add('cursor-mesure');
          //for the area calculation box move
          const resumeBox = document.getElementById('calculation-box');
          if (resumeBox) {
            const x = e.originalEvent.offsetX;
            const y = e.originalEvent.offsetY;
            resumeBox.style.transform = `translate(${x}px, ${y}px)`;
          }
        } else if (this.drawingService.getDrawActive()) {
          canvasElement.classList.add('cursor-pointer');
        } else {
          canvasElement.classList.remove('cursor-mesure');
          canvasElement.classList.remove('cursor-pointer');
        }
      });

    // Loading tiles event
    fromEvent(this.map, 'moveend')
      .pipe(takeUntil(this.ngUnsubscribe$), debounceTime(1500))
      .subscribe(() => {
        this.onMoveEnd();
      });

    // Hovering feature event
    fromEvent(this.map, 'mousemove')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.queryNearestFeature(e);
        this.onFeatureHovered(nearestFeature);
      });

    // Click on feature event
    fromEvent(this.map, 'click')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.queryNearestFeature(e);
        this.onFeatureSelected(nearestFeature, e);
      });

    fromEvent(this.map, 'touchend')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        if (!this.preventTouchMoveClicked) {
          const nearestFeature = this.queryNearestFeature(e);
          this.onFeatureSelected(nearestFeature, e);
        } else {
          setTimeout(() => {
            this.preventTouchMoveClicked = false;
          }, 500);
        }
      });

    fromEvent(this.map, 'touchmove')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.preventTouchMoveClicked = true;
      });

    // Right click, as context menu, event
    fromEvent(this.map, 'contextmenu')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.queryNearestFeature(e);
        this.openNomadContextMenu(e, nearestFeature);
      });

    // Ending zoom event
    fromEvent(this.map, 'zoom')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.preventTouchMoveClicked = true;
        this.scale = this.calculateScale();
      });

    // Drawing event
    fromEvent(this.map, 'draw.create')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: any) => {
        if (!this.drawingService.getIsMeasuring()) {
          this.drawingService.setDrawActive(false);
          this.drawingService.deleteDrawing();
          const fireEvent = this.mapEvent.isFeatureFiredEvent;

          const features = this.drawingService.getFeaturesFromDraw(
            e,
            this.map,
            this.mapService.getCurrentLayersIds()
          );

          if (fireEvent) {
            this.mapEvent.setMultiFeaturesSelected(features);
          }

          if (!fireEvent) {
            if (features.length > 0) {
              this.drawerService.navigateWithEquipments(
                DrawerRouteEnum.SELECTION,
                features
              );
            }
          }
        } else {
          this.measure = this.drawingService.calculateMeasure();
          const canvasElement =
            document.getElementsByClassName('maplibregl-canvas')[0];
          if (canvasElement.classList.contains('cursor-mesure')) {
            canvasElement.classList.remove('cursor-mesure');
          }
        }
      });

    // updating draw
    fromEvent(this.map, 'draw.render')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: any) => {
        if (this.drawingService.getIsMeasuring()) {
          this.measure = this.drawingService.calculateMeasure();
        }
      });

    // updating draw
    fromEvent(this.map, 'draw.update')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: any) => {
        this.measure = this.drawingService.calculateMeasure();
      });
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
    if (this.isMobile) {
      this.map.addControl(new CustomZoomControl(), 'bottom-right');
    }
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
   * Queries the nearest rendered feature from a mouse event on the map.
   * @param e - Mouse event on the map
   * @returns The nearest features (if there are) from the map.
   */
  private queryNearestFeature(
    e: Maplibregl.MapMouseEvent
  ): Maplibregl.MapGeoJSONFeature {
    var mouseCoords = this.map.unproject(e.point);
    const selectedFeatures = this.map.queryRenderedFeatures(
      [
        [e.point.x - 10, e.point.y - 10],
        [e.point.x + 10, e.point.y + 10],
      ],
      {
        layers: this.mapService.getCurrentLayersIds(),
      }
    );
    return this.findNearestFeature(mouseCoords, selectedFeatures);
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

  /**
   * This function changes the cursor style and highlights a hovered feature on a map.
   * @param feature - Closest feature hovered on the map
   */
  private onFeatureHovered(feature: Maplibregl.MapGeoJSONFeature): void {
    if (!feature) {
      this.map.getCanvas().style.cursor = '';
      this.mapEvent.highlightHoveredFeatures(this.map, undefined, true);
      return;
    }

    this.map.getCanvas().style.cursor = 'pointer';
    this.mapEvent.highlightHoveredFeatures(
      this.map,
      [{ source: feature.source, id: feature.id.toString() }],
      true
    );
  }

  /**
   * This function highlights a selected feature on a map.
   * @param feature - Closest feature selected on the map
   * @returns It navigates to a specific route in the application's drawer with some additional
   * properties.
   */
  private onFeatureSelected(
    feature: Maplibregl.MapGeoJSONFeature,
    e: Maplibregl.MapMouseEvent
  ): void {
    if (!feature) {
      return;
    }

    // In certain functions like multi-eq, putting isFeatureFiredEvent to false come faster than the rest of this function
    // With firedEvent, the value stays to the original isFeatureFiredEvent, avoiding asynchronous weird things
    const firedEvent = this.mapEvent.isFeatureFiredEvent;

    this.mapEvent.highlighSelectedFeatures(
      this.map,
      [{ source: feature.source, id: feature.id.toString() }],
      firedEvent,
      e
    );

    if (!firedEvent) {
      const properties = feature.properties;
      if (properties['geometry']) delete properties['geometry'];
      // We pass the layerKey to the drawer to be able to select the equipment on the layer
      properties['lyrTableName'] = feature.source;
      let route: DrawerRouteEnum;
      let params = {};
      let pathVariables = [];
      switch (feature.source) {
        case 'task':
          route = DrawerRouteEnum.TASK_VIEW;
          pathVariables = [properties['wkoId'], properties['id']];
          break;
        default:
          route = DrawerRouteEnum.EQUIPMENT;
          params = {
            lyrTableName: properties['lyrTableName'],
          };
          pathVariables = [properties['id']];
          break;
      }
      this.drawerService.navigateTo(route, pathVariables, params);
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
    for (let layer of this.mapService.getCurrentLayers()) {
      if (
        this.map.getZoom() >=
        Math.min(...layer[1].style.map((style) => style.minzoom))
        &&
        this.customTileFilter(layer[0])
      ) {
        this.getOverlapTileFromIndex(layer[0]).subscribe(async (res) => {
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
    return layer != 'task' || (layer == 'task' && this.mapService.activeTaskSwitch)
  }

  /**
   * Retrieves a list of tiles that overlap with the current map view based on their
   * coordinates and a given layer index.
   * @param {string} key - Layer index key
   * @returns a Promise that resolves to an array of strings.
   */
  private getOverlapTileFromIndex(key: string): Observable<any> {
    const listTile: string[] = [];
    const val: Maplibregl.LngLatBounds = this.map!.getBounds();
    const box1: Box = {
      x1: Math.min(val._sw.lat, val._ne.lat),
      x2: Math.max(val._sw.lat, val._ne.lat),
      y1: Math.min(val._sw.lng, val._ne.lng),
      y2: Math.max(val._sw.lng, val._ne.lng),
    };

    return this.layerService.getLayerIndexes().pipe(
      map((res) => {
        const index: any[] = (res as any)['features'];

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
      })
    );
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
      const newLayer = await this.layerService.getLayerFile(layerKey, file);
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
}
