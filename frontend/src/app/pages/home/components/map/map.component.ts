import { Component, OnInit } from '@angular/core';
import MapOpenLayer from 'ol/Map';
import View from 'ol/View';
import { OSM, WMTS } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { getWidth } from 'ol/extent.js';
import { getUid } from 'ol/util';
import { useGeographic } from 'ol/proj.js';
import { Fill, Stroke, Style } from 'ol/style.js';
import Feature from 'ol/Feature';
import BaseLayer from 'ol/layer/Base';
import Text from 'ol/style/Text';
import { fromEvent } from 'rxjs';
import { MapService } from 'src/app/services/map.service';
import { BackLayer, MAP_DATASET } from './map.dataset';
import { ProjectionLike } from 'ol/proj';

useGeographic();

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

  selections: Set<any> = new Set();

  test: boolean = false;

  public map!: MapOpenLayer;

  ngOnInit() {
    this.projection = getProjection('EPSG:3857');
    if (this.projection != null) {
      this.generateMap();
      this.map = this.mapService.createMap();
      this.map.setLayers([...this.mapLayers.values()]);
      this.map.setTarget('map');
    }
  }


  addEvent(layerKey: string) {
    if (!this.mapService.hasEventLayer(layerKey)) {
      this.mapService.addEventLayer(layerKey);
    }
    else {
      this.mapService.removeEventLayer(layerKey);
    }
    this.test = !this.test;
  }

  addLocalEvent(layerKey: string) {
    if (!this.mapService.hasEventLayer(layerKey)) {
      this.mapService.addLocalEventLayer(layerKey);
    }
    else {
      this.mapService.removeEventLayer(layerKey);
    }
    this.test = !this.test;
  }

  generateMap() {
    if (this.projection != null) {
      let projectionExtent = this.projection.getExtent();
      let resolutions = new Array(21);
      let matrixIds = new Array(21);
      let size = getWidth(projectionExtent) / 256;
      for (let z = 0; z < 21; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z.toString();
      }
      this.createLayers(this.projection, resolutions, matrixIds);
    }
  }

  createLayers(projection: ProjectionLike, resolution: number[], matrixIds: string[]): void {
    this.DATASET.forEach((mapLayer: BackLayer) => {
      switch (mapLayer.type) {
        case 'WMTS':
          const wmtsLayer = new TileLayer({
            source: this.buildWMTS(mapLayer, projection, resolution, matrixIds),
            visible: mapLayer.visible,
          });
          this.mapLayers.set(mapLayer.key, wmtsLayer);
          break;
        case 'OSM':
          const osmLayer = new TileLayer({
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
    resolution: number[], matrixIds: string[]
  ): WMTS {
    return new WMTS({
        attributions: layer.attributions!,
        url: layer.url!,
        layer: layer.layer!,
        matrixSet: layer.matrixSet!,
        format: layer.format!,
        projection: projection,
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