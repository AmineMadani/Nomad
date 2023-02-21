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
import { ProjectionLike } from 'ol/proj';
import { Accordeon } from '../interactive-content/patrimony/patrimony-dataset';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  constructor(private mapService: MapService) {}

  DATASET: BackLayer[] = MAP_DATASET;

  projection = getProjection('EPSG:3857');

  mapLayers: Map<string, BaseLayer> = new Map();

  public map!: MapOpenLayer;

  public patrimonyLayers: Set<Accordeon> = new Set();

  ngOnInit() {
    this.projection = getProjection('EPSG:3857');
    if (this.projection != null) {
      this.generateMap();
      this.map = this.mapService.createMap([...this.mapLayers.values()]);
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
      const resolutions = new Array(21);
      const matrixIds = new Array(21);
      const size = getWidth(projectionExtent) / 256;
      for (let z = 0; z < 21; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z.toString();
      }
      this.createLayers(this.projection, resolutions, matrixIds);
    }
  }

  createLayers(
    projection: ProjectionLike,
    resolution: number[],
    matrixIds: string[]
  ): void {
    this.DATASET.forEach((mapLayer: BackLayer) => {
      switch (mapLayer.type) {
        case 'WMTS':
          const wmtsLayer = new TileLayer({
            preload: Infinity,
            source: this.buildWMTS(mapLayer, projection, resolution, matrixIds),
            visible: mapLayer.visible,
          });
          this.mapLayers.set(mapLayer.key, wmtsLayer);
          break;
        case 'OSM':
          const osmLayer = new TileLayer({
            preload: Infinity,
            source: this.buildOSM(),
            visible: mapLayer.visible,
          });
          this.mapLayers.set(mapLayer.key, osmLayer);
          break;
      }
    });
  }

  displayLayer(keyLayer: string) {
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

  private buildWMTS(
    layer: BackLayer,
    projection: ProjectionLike,
    resolution: number[],
    matrixIds: string[]
  ): WMTS {
    return new WMTS({
      attributions: layer.attributions!,
      url: layer.url!,
      layer: layer.layer!,
      matrixSet: layer.matrixSet!,
      format: layer.format!,
      projection: this.projection!,
      tileGrid: new WMTSTileGrid({
        origin: layer.origin!,
        resolutions: resolution,
        matrixIds: matrixIds,
      }),
      style: 'normal',
      wrapX: true,
    });
  }

  private buildOSM(): OSM {
    return new OSM();
  }
}