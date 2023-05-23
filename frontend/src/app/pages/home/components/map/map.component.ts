import { Component, OnInit, OnDestroy, ElementRef, HostListener} from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { first } from 'rxjs';
import { Router } from '@angular/router';
import * as Maplibregl from 'maplibre-gl';
import { Basemap } from 'src/app/core/models/basemap.model';

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
    private mapEvent: MapEventService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private elem: ElementRef
  ) {
    this.drawerService
      .onCurrentRouteChanged()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((route: DrawerRouteEnum) => {
        this.currentRoute = route;
      });

    this.mapEvent
      .onMapResize()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        if (this.map) {
          setTimeout(() => this.map.resize());
        }
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

  public map!: Maplibregl.Map;
  public basemaps: Basemap[];
  public displayMap: boolean;
  public mapBasemaps: Map<string, any> = new Map();

  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;

  public zoom: number;

  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();
  private selectedFeature: Maplibregl.MapGeoJSONFeature & any;
  private isInsideContextMenu = false;

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
        this.map.resize();
        loading.dismiss();
        this.generateMap();
      });

    // Loading tiles event
    fromEvent(this.map, 'moveend')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.mapService.onMoveEnd();
      });

    // Hovering feature event
    fromEvent(this.map, 'mousemove')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.mapService.queryNearestFeature(e);
        this.mapService.onFeatureHovered(nearestFeature);
      });

    // Click on feature event
    fromEvent(this.map, 'click')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.mapService.queryNearestFeature(e);
        this.mapService.onFeatureSelected(nearestFeature);
      });

    // Right click, as context menu, event
    fromEvent(this.map, 'contextmenu')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.mapService.queryNearestFeature(e);
        this.openNomadContextMenu(e, nearestFeature);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.mapService.destroyLayers();
  }

  /**
   * This function generates a map with a navigation control and adds a default basemap layer.
   */
  public generateMap(): void {
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
        });
      }
      this.setMapLoaded();
    });
  }

  /**
   * Sets the displayMap property to true and fire the map loaded event.
   */
  public setMapLoaded(): void {
    this.displayMap = true;
    this.mapService.setMapLoaded();
  }

  /**
   * The function navigates to a work order page with selected feature properties as query parameters.
   */
  public onGenerateWorkOrder(): void {
    this.selectedFeature['properties']['lyr_table_name'] =
      this.selectedFeature['source'];
    document.getElementById('map-nomad-context-menu').className = 'hide';
    this.router.navigate(['/home/work-order'], {
      queryParams: this.selectedFeature['properties'],
    });
  }

  /**
   * Opens a context menu on the map and updates its content based on the selected feature.
   * @param e - MapMouseEvent from Maplibre
   */
  public openNomadContextMenu(
    e: Maplibregl.MapMouseEvent,
    feature: Maplibregl.MapGeoJSONFeature
  ): void {
    const menu: HTMLElement = document.getElementById('map-nomad-context-menu');
    const contextMenuCreateWorkOrder: HTMLElement = document.getElementById(
      'map-nomad-context-menu-create-workorder'
    );

    menu.className = 'show';
    menu.style.top = e.originalEvent.clientY - 56 + 'px';
    menu.style.left = e.originalEvent.clientX + 'px';

    if (!feature) {
      this.selectedFeature = undefined;
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
   * Change the param isInsideContextMenu if hte user is on/out of the context menu
   * @param hover True if context menu hover
   */
  public onHoverContextMenu(hover: boolean) {
    this.isInsideContextMenu = hover;
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
    this.map.zoomTo(e);
    this.zoom = this.map.getZoom();
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
}
