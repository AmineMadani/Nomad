import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { Basemap } from './map.dataset';
import { MapService } from 'src/app/core/services/map/map.service';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { LoadingController } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { take } from 'rxjs';
import * as Maplibregl from 'maplibre-gl';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { ReferentialService } from 'src/app/core/services/referential.service';

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
    private elem: ElementRef,
    private referentialService: ReferentialService
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

  public map!: Maplibregl.Map;
  public basemaps: Basemap[];
  public displayMap: boolean;
  public mapBasemaps: Map<string, any> = new Map();

  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;

  public zoom: number;

  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();
  private selectedFeature: any;
  private selectedCoordinate:{x:string,y:string} = {x:'',y:''};
  private isInsideContextMenu = false;

  async ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();

    const loading = await this.loadingCtrl.create({
      message: 'Chargement de la carte',
    });
    loading.present();

    this.map = this.mapService.createMap();

    fromEvent(this.map, 'load')
      .pipe(take(1))
      .subscribe(() => {
        this.map.resize();
        loading.dismiss();
        this.generateMap();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.mapService.destroySubscription();
  }

  /**
   * This function generates a map with a navigation control and adds a default basemap layer.
   */
  generateMap(): void {
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
    this.map.on('contextmenu', (e) => { this.openNomadContextMenu(e) });
  }

  /**
   * Method to redirect to the creation of a workorder on the right click usage
   */
  onGenerateWorkOrder() {
    if (this.selectedFeature) {
      this.selectedFeature['properties']['lyr_table_name'] = this.selectedFeature['source'];
      document.getElementById("map-nomad-context-menu").className = "hide";
      this.router.navigate(
        ['/home/work-order'],
        { queryParams: this.selectedFeature['properties'] }
      );
    } else {
      document.getElementById("map-nomad-context-menu").className = "hide";
      this.referentialService.getReferentialIdByLongitudeLatitude('contract', this.selectedCoordinate.x, this.selectedCoordinate.y).subscribe( l_ctr_id => {
        this.referentialService.getReferentialIdByLongitudeLatitude('city', this.selectedCoordinate.x, this.selectedCoordinate.y).subscribe( l_cty_id => {
          let param:any = {};
          param.x = this.selectedCoordinate.x;
          param.y = this.selectedCoordinate.y;
          param.lyr_table_name = "xy";
          if(l_ctr_id && l_ctr_id.length > 0) param.ctr_id = l_ctr_id.join(',');
          if(l_cty_id && l_cty_id.length > 0) param.cty_id = l_cty_id.join(',');

          this.router.navigate(
            ['/home/work-order'],
            { queryParams: param }
          );
        });
      });
    }

  }

  /**
   * Method to open the context menu on the map if the user right click on it
   * @param e The mouse event from the right click
   */
  openNomadContextMenu(e) {
    var width = 10;
    var height = 10;
    document.getElementById("map-nomad-context-menu").className = "show";
    document.getElementById("map-nomad-context-menu").style.top = (e.originalEvent.clientY - 56) + 'px';
    document.getElementById("map-nomad-context-menu").style.left = e.originalEvent.clientX + 'px';

    var features = this.map.queryRenderedFeatures([[e.originalEvent.x + width / 2, (e.originalEvent.y - 56) + height / 2], [e.originalEvent.x - width / 2, (e.originalEvent.y - 56) - height / 2]]);

    if (features.length > 0) {
      document.getElementById("map-nomad-context-menu-create-workorder").innerHTML = "Générer une intervention sur " + features[0].properties['id'];
      this.selectedFeature = features[0];
      this.selectedFeature['properties']['x'] = e.lngLat.lng;
      this.selectedFeature['properties']['y'] = e.lngLat.lat;
    } else {
      this.selectedFeature = undefined;
      this.selectedCoordinate.x = e.lngLat.lng;
      this.selectedCoordinate.y = e.lngLat.lat;
      document.getElementById("map-nomad-context-menu-create-workorder").innerHTML = "Générer une intervention XY";
    }
  }

  /**
   * Method to hide the nomad context menu if the user click outside of the context menu
   */
  @HostListener('document:click')
  clickout() {
    if (!this.isInsideContextMenu) {
      document.getElementById("map-nomad-context-menu").className = "hide";
    }
  }

  /**
   * CHange the param isInsideContextMenu if hte user is on/out of the context menu
   * @param hover True if context menu hover
   */
  onHoverContextMenu(hover: boolean) {
    this.isInsideContextMenu = hover;
  }

  setMapLoaded(): void {
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
    if (layer) {
      switch (layer.map_type) {
        case 'WMS':
          const wmtsLayer: any = {
            tiles: [
              `${layer.map_url}?layer=${layer.map_layer
              }&style=normal&tilematrixset=${layer.map_matrixset
              }&Service=WMTS&Request=GetTile&Version=1.0.0&Format=${encodeURI(
                layer.map_format
              )}&TileMatrix={z}&TileCol={x}&TileRow={y}`,
            ],
            type: 'raster',
            tileSize: 128,
            attribution: layer?.map_attributions?.[0] ?? '',
          };
          this.mapBasemaps.set(alias, wmtsLayer);
          this.map.addSource(alias, wmtsLayer);
          break;
        case 'OSM':
          const osmLayer: any = {
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            type: 'raster',
            tileSize: 128,
          };
          this.mapBasemaps.set(alias, osmLayer);
          this.map.addSource(alias, osmLayer);
          break;
      }
    }
  }

  /**
   * The function displays a specific layer on a map by changing the source of the basemap layer.
   * @param {string} keyLayer - a string representing the key of a layer in a mapLayers Map object
   */
  public onBasemapChange(keyLayer: string) {
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
