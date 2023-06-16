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
import { MapService } from 'src/app/core/services/map/map.service';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { debounceTime, first, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ReferentialService } from 'src/app/core/services/referential.service';
import * as Maplibregl from 'maplibre-gl';
import { Basemap } from 'src/app/core/models/basemap.model';
import { CustomZoomControl } from './zoom.control';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

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
    private referentialService: ReferentialService,
    private mapEvent: MapEventService
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

  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;

  public map!: Maplibregl.Map;
  public basemaps: Basemap[];
  public displayMap: boolean;
  public mapBasemaps: Map<string, any> = new Map();

  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;

  public zoom: number;
  public scale: string;
  public isMobile: boolean;

  private draw: MapboxDraw;
  private selectedFeature: Maplibregl.MapGeoJSONFeature & any;
  private isInsideContextMenu: boolean = false;
  private isOnSelection: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();

    const loading = await this.loadingCtrl.create({
      message: 'Chargement de la carte',
    });
    loading.present();

    this.map = this.mapService.createMap();

    // Load event
    fromEvent(this.map, 'load')
      .pipe(first())
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
        };
        break;
      case 'OSM':
        mapLayer = {
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          type: 'raster',
          tileSize: 128,
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
    this.map.getLayer('basemap').source = keyLayer;
    this.map.zoomTo(this.map.getZoom() + 0.001);
  }

  // Temp while basemaps do not have keys
  public getMapAlias(alias: string): string {
    return alias.replace(/\s/g, '');
  }

  /**
   * Resets the rotation of the map to north.
   */
  public onResetRotation(): void {
    this.map.rotateTo(0);
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
  public calculateScale(): string {
    const resolutionAtZeroZoom: number = 78271.516964020480767923472190235;
    const resolutionAtLatitudeAndZoom: number =
      (resolutionAtZeroZoom *
        Math.cos(this.map.getCenter().lat * (Math.PI / 180))) /
      2 ** this.map.getZoom();
    return (
      '1: ' + Math.ceil((90 / 0.0254) * resolutionAtLatitudeAndZoom).toString()
    );
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
    if (this.mapService.getDrawActive()) {
      this.mapService.deleteDrawing();
      this.mapService.setDrawingControl(false);
    }

    const menu: HTMLElement = document.getElementById('map-nomad-context-menu');
    const contextMenuCreateWorkOrder: HTMLElement = document.getElementById(
      'map-nomad-context-menu-create-workorder'
    );

    menu.className = 'show';
    menu.style.top = e.originalEvent.clientY - 56 + 'px';
    menu.style.left = e.originalEvent.clientX + 'px';

    if (!feature) {
      let l_ctr_id = await firstValueFrom(
        this.referentialService.getReferentialIdByLongitudeLatitude(
          'contract',
          e.lngLat.lng.toString(),
          e.lngLat.lat.toString()
        )
      );
      let l_cty_id = await firstValueFrom(
        this.referentialService.getReferentialIdByLongitudeLatitude(
          'city',
          e.lngLat.lng.toString(),
          e.lngLat.lat.toString()
        )
      );
      const params: any = {};
      params.x = e.lngLat.lng;
      params.y = e.lngLat.lat;
      params.lyr_table_name = 'xy';
      if (l_ctr_id && l_ctr_id.length > 0) params.ctr_id = l_ctr_id.join(',');
      if (l_cty_id && l_cty_id.length > 0) params.cty_id = l_cty_id.join(',');
      this.selectedFeature = {
        properties: params,
      };
      contextMenuCreateWorkOrder.innerHTML = 'Générer une intervention XY';
      return;
    }

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

  /**
   * The function navigates to a work order page with selected feature properties as query parameters.
   */
  public onGenerateWorkOrder(): void {
    if (!this.selectedFeature['properties']['lyr_table_name']) {
      this.selectedFeature['properties']['lyr_table_name'] =
        this.selectedFeature['source'];
    }
    document.getElementById('map-nomad-context-menu').className = 'hide';
    this.router.navigate(['/home/work-order'], {
      queryParams: this.selectedFeature['properties'],
    });
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
    if (this.mapService.getDrawActive()) {
      (
        document.getElementsByClassName(
          'mapbox-gl-draw_ctrl-draw-btn'
        )[0] as HTMLButtonElement
      ).click();
      this.mapService.setDrawingControl(false);
    } else {
      this.mapService.setDrawingControl(true);
      (
        document.getElementsByClassName(
          'mapbox-gl-draw_ctrl-draw-btn'
        )[0] as HTMLButtonElement
      ).click();
    }

    document.getElementById('map-nomad-context-menu').className = 'hide';
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
      })
    );
    if (this.isMobile) {
      this.map.addControl(new CustomZoomControl(), 'bottom-right');
    }
  }

  private addEvents(): void {
    fromEvent(this.map, 'mousemove')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        const mapElement = document.getElementById('map');
        const canvasElement =
          document.getElementsByClassName('maplibregl-canvas')[0];

        if (mapElement.classList.contains('mode-draw_polygon')) {
          canvasElement.classList.add('cursor-pointer');
        } else if (canvasElement.classList.contains('cursor-pointer')) {
          canvasElement.classList.remove('cursor-pointer');
        }
      });

    // Loading tiles event
    fromEvent(this.map, 'moveend')
      .pipe(takeUntil(this.ngUnsubscribe$), debounceTime(1500))
      .subscribe(() => {
        this.mapService.onMoveEnd();
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
        this.onFeatureSelected(nearestFeature);
      });

    // Right click, as context menu, event
    fromEvent(this.map, 'contextmenu')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.queryNearestFeature(e);
        this.openNomadContextMenu(e, nearestFeature);
      });

    // Ending zoom event
    fromEvent(this.map, 'zoomend')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        this.scale = this.calculateScale();
      });

    // Ending zoom event
    fromEvent(this.map, 'draw.create')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: any) => {
        this.mapService.deleteDrawing();
        
        const [minX, minY, maxX, maxY] = turf.bbox(e.features[0]);

        const features = this.map.queryRenderedFeatures(
          [this.map.project([maxX, maxY]), this.map.project([minX, minY])],
          { layers: this.mapService.getCurrentLayersIds() }
        );

        if (features.length > 0) {
          const featuresMap = [...new Set(features.map((item) => item.id))].map(
            (id) => {
              const item = features.find((feature) => feature.id === id);
              return {
                id: item.id,
                x: item.properties['x'],
                y: item.properties['y'],
                lyr_table_name: item.source,
              };
            }
          );

          this.drawerService.navigateTo(
            DrawerRouteEnum.SELECTION,
            null,
            featuresMap
          );
        }
      });
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
  private onFeatureSelected(feature: Maplibregl.MapGeoJSONFeature): void {
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
}
