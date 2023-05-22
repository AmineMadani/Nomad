import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  constructor(
    private mapService: MapService,
    private mapEvent: MapEventService,
    private loadingCtrl: LoadingController,
    private router: Router,
  ) {
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
  public displayMap: boolean;
  public mapBasemaps: Map<string, any> = new Map();

  private basemaps: Basemap[];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private selectedFeature: any;
  private isInsideContextMenu = false;

  async ngOnInit() {
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
      new Maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      })
    );
    this.mapService.getBasemaps().subscribe((basemaps: Basemap[]) => {
      this.basemaps = basemaps;
      const defaultBackLayer: Basemap | undefined = this.basemaps.find(
        (bl) => bl.map_default
      );
      if (defaultBackLayer) {
        this.createLayers(defaultBackLayer.map_layer.replace(/\s/g, ''), defaultBackLayer);
        setTimeout(() => {
          this.map.addLayer({
            id: 'basemap',
            type: 'raster',
            source: defaultBackLayer.map_layer.replace(/\s/g, ''),
            paint: {},
          });
        });
      }
      this.setMapLoaded();
    });
   this.map.on('contextmenu', (e) => {this.openNomadContextMenu(e)});
  }

  onGenerateWorkOrder(){
    this.selectedFeature['properties']['lyr_table_name'] = this.selectedFeature['source'];
    document.getElementById("map-nomad-context-menu").className = "hide";
    this.router.navigate(
      ['/home/work-order'],
      { queryParams: this.selectedFeature['properties'] }
    );
  }

  /**
   * Method to open the context menu on the map if the user right click on it
   * @param e The mouse event from the right click
   */
  openNomadContextMenu(e){
    var width = 10;
    var height = 10;
    document.getElementById("map-nomad-context-menu").className = "show";
    document.getElementById("map-nomad-context-menu").style.top = (e.originalEvent.clientY-56) + 'px';
    document.getElementById("map-nomad-context-menu").style.left = e.originalEvent.clientX + 'px';

    var features = this.map.queryRenderedFeatures([[e.originalEvent.x + width / 2, (e.originalEvent.y-56) + height / 2],[e.originalEvent.x - width / 2, (e.originalEvent.y - 56) - height / 2]]);

    if(features.length > 0 ){
      document.getElementById("map-nomad-context-menu-create-workorder").innerHTML = "Générer une intervention sur " + features[0].properties['id'];
      this.selectedFeature = features[0];
      this.selectedFeature['properties']['x']=e.lngLat.lng;
      this.selectedFeature['properties']['y']=e.lngLat.lat;
    } else {
      this.selectedFeature=undefined;
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
  onHoverContextMenu(hover:boolean) {
    this.isInsideContextMenu=hover;
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
  createLayers(alias: string, layer?: Basemap): void {
    if (!layer) {
      layer = this.basemaps.find((bl: Basemap) => bl.map_layer.replace(/\s/g, '') === alias);
    }
    if (layer) {
      switch (layer.map_type) {
        case 'WMS':
          const wmtsLayer: any = {
            tiles: [
              `${layer.map_url}?layer=${layer.map_layer}&style=normal&tilematrixset=${
                layer.map_matrixset
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
  displayLayer(keyLayer: string) {
    if (!this.mapBasemaps.has(keyLayer)) {
      this.createLayers(keyLayer);
    }
    this.map.getLayer('basemap').source = keyLayer;
    this.map.zoomTo(this.map.getZoom() + 0.001);
  }
}
