import { Component, OnInit } from '@angular/core';
import MapOpenLayer from 'ol/Map';
import { OSM, WMTS } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { getWidth, getTopLeft } from 'ol/extent.js';
import BaseLayer from 'ol/layer/Base';
import { BackLayer } from './map.dataset';
import { GeolocationControl } from './controls/geolocation.control';
import { MapService } from 'src/app/core/services/map/map.service';
import { ScalelineControl } from './controls/scaleline.control';
import { ZoomControl } from './controls/zoom.control';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { pipe, tap } from 'rxjs';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  constructor(
    private mapService: MapService,
    private layerService: LayerService
  ) {}

  public projection = getProjection('EPSG:3857');
  public resolutions: number[] = new Array(21);
  public matrixIds: string[] = new Array(21);

  public map!: MapOpenLayer;
  public mapLayers: Map<string, BaseLayer> = new Map();

  ngOnInit() {
    this.projection = getProjection('EPSG:3857');
    if (this.projection != null) {
      this.map = this.mapService.createMap();
      // Controls need to be added the map creation
      this.map.addControl(new GeolocationControl(this.layerService));
      this.map.addControl(new ScalelineControl());
      this.map.addControl(new ZoomControl(this.map));
      this.generateMap();
    }
  }

  /**
   * This function adds or removes an event layer from a map service based on whether it already exists
   * or not.
   * @param {string} layerKey - string parameter representing the unique identifier for the event layer
   * being added or removed.
   */
  addEventLayer(layerKey: string) {
    if (!this.mapService.hasEventLayer(layerKey)) {
      this.mapService.addEventLayer(layerKey);
    } else {
      this.mapService.removeEventLayer(layerKey);
    }
  }

  /**
   * This function generates a map with default layers based on a given projection.
   */
  generateMap() {
    if (this.projection != null) {
      const projectionExtent = this.projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      for (let z = 0; z < 21; ++z) {
        this.resolutions[z] = size / Math.pow(2, z);
        this.matrixIds[z] = z.toString();
      }
      this.mapService.getBaseMaps().subscribe(res => {
        const defaultBackLayer: BackLayer | undefined = res.find(
          (bl) => bl.default
        );
        if (defaultBackLayer) {
          this.createLayers(defaultBackLayer.key, defaultBackLayer);
        }
        });
    }
  }

  /**
   * Creates layers for a map based on the type of layer specified in the input parameter.
   * @param {string} backLayerKey - A string representing the key of the back layer to be created.
   * @param {BackLayer} [layer] - Optional parameter of type BackLayer, which contains information about
   * the layer to be created.
   */
  createLayers(backLayerKey: string, layer?: BackLayer): void {
    if (!layer) {
      this.mapService.getBaseMaps().subscribe(res =>
        {
          layer = res.find(bl => bl.key === backLayerKey);
        });
    }
    if (layer) {
      switch (layer.type) {
        case 'WMTS':
          const wmtsLayer = new TileLayer({
            preload: Infinity,
            source: this.buildWMTS(layer),
            visible: layer.display,
            zIndex: 0,
          });
          this.mapLayers.set(layer.key, wmtsLayer);
          this.map.addLayer(wmtsLayer);
          break;
        case 'OSM':
          const osmLayer = new TileLayer({
            preload: Infinity,
            source: this.buildOSM(),
            visible: layer.display,
            zIndex: 0,
          });
          this.mapLayers.set(layer.key, osmLayer);
          this.map.addLayer(osmLayer);
          break;
      }
    }
  }

  /**
   * The function displays a specific layer on a map while hiding all other layers.
   * @param {string} keyLayer - a string representing the key of a layer in a mapLayers Map object
   */
  displayLayer(keyLayer: string) {
    if (!this.mapLayers.has(keyLayer)) {
      this.createLayers(keyLayer);
    }
    this.map
      .getLayers()
      .getArray()
      .forEach((layer) => {
        if (layer == this.mapLayers.get(keyLayer)) {
          layer.setVisible(true);
        } else {
          if ([...this.mapLayers.values()].find((res) => res == layer)) {
            layer.setVisible(false);
          }
        }
      });
  }

  /**
   * Builds a WMTS layer
   * @param {BackLayer} layer - BackLayer object containing information about the WMTS
   * @returns A WMTS object is being returned.
   */
  private buildWMTS(layer: BackLayer): WMTS {
    return new WMTS({
      attributions: layer.attributions!,
      url: layer.url!,
      layer: layer.layer!,
      matrixSet: layer.matrixSet!,
      format: layer.format!,
      projection: this.projection!,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(this.projection ? this.projection.getExtent() : []),
        resolutions: this.resolutions,
        matrixIds: this.matrixIds,
      }),
      style: 'normal',
      wrapX: true,
    });
  }

  /**
   * Builds a OpenStreetMap layer
   * @returns A OSM object is being returned.
   */
  private buildOSM(): OSM {
    return new OSM();
  }
}
