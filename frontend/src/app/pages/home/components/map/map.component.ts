import { Component, OnInit } from '@angular/core';
import MapOpenLayer from 'ol/Map';
import { OSM, WMTS } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { getWidth } from 'ol/extent.js';
import BaseLayer from 'ol/layer/Base';
import { MapService } from 'src/app/services/map.service';
import { BackLayer, MAP_DATASET } from './map.dataset';
import { GeolocationControl } from './controls/geolocation.control';
import { Accordeon } from '../../drawers/patrimony/patrimony-dataset';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  constructor(private mapService: MapService) {}

  public projection = getProjection('EPSG:3857');
  public resolutions: number[] = new Array(21);
  public matrixIds: string[] = new Array(21);

  public map!: MapOpenLayer;
  public mapLayers: Map<string, BaseLayer> = new Map();
  public patrimonyLayers: Set<Accordeon> = new Set();

  ngOnInit() {
    this.projection = getProjection('EPSG:3857');
    if (this.projection != null) {
      this.map = this.mapService.createMap([new GeolocationControl()]);
      this.generateMap();
    }
  }

  addEventLayer(layerKey: string) {
    if (!this.mapService.hasEventLayer(layerKey)) {
      this.mapService.addEventLayer(layerKey);
    } else {
      this.mapService.removeEventLayer(layerKey);
    }
  }

  generateMap() {
    if (this.projection != null) {
      const projectionExtent = this.projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      for (let z = 0; z < 21; ++z) {
        this.resolutions[z] = size / Math.pow(2, z);
        this.matrixIds[z] = z.toString();
      }
      const defaultBackLayer: BackLayer | undefined = MAP_DATASET.find(
        (bl) => bl.default
      );
      if (defaultBackLayer) {
        this.createLayers(defaultBackLayer.key, defaultBackLayer);
      }
    }
  }

  createLayers(backLayerKey: string, layer?: BackLayer): void {
    if (!layer) {
      layer = MAP_DATASET.find((bl) => bl.key === backLayerKey);
    }
    if (layer) {
      switch (layer.type) {
        case 'WMTS':
          const wmtsLayer = new TileLayer({
            preload: Infinity,
            source: this.buildWMTS(layer),
            visible: layer.visible,
            zIndex: 0,
          });
          this.mapLayers.set(layer.key, wmtsLayer);
          this.map.addLayer(wmtsLayer);
          break;
        case 'OSM':
          const osmLayer = new TileLayer({
            preload: Infinity,
            source: this.buildOSM(),
            visible: layer.visible,
            zIndex: 0,
          });
          this.mapLayers.set(layer.key, osmLayer);
          this.map.addLayer(osmLayer);
          break;
      }
    }
  }

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

  private buildWMTS(layer: BackLayer): WMTS {
    return new WMTS({
      attributions: layer.attributions!,
      url: layer.url!,
      layer: layer.layer!,
      matrixSet: layer.matrixSet!,
      format: layer.format!,
      projection: this.projection!,
      tileGrid: new WMTSTileGrid({
        origin: layer.origin!,
        resolutions: this.resolutions,
        matrixIds: this.matrixIds,
      }),
      style: 'normal',
      wrapX: true,
    });
  }

  private buildOSM(): OSM {
    return new OSM();
  }
}
