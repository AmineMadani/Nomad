import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';
import { MapLayer } from '../models/map-layer.model';
import MapOpenLayer from 'ol/Map';
import View from 'ol/View';
import BaseLayer from 'ol/layer/Base';
import { MapStyleService } from './map-style.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(private mapStyle: MapStyleService) {}

  private map: MapOpenLayer;
  private layers: Map<string, MapLayer> = new Map();

  createMap(backMapLayer: BaseLayer[]): MapOpenLayer {
    this.map = new MapOpenLayer({
      target: 'map',
      layers: backMapLayer,
      view: new View({
        center: [-167481.03747256377, 6114453.854920737],
        zoom: 16,
        maxZoom: 21,
      }),
    });
    return this.map;
  }

  hasEventLayer(layerKey: string): boolean {
    return this.layers.has(layerKey);
  }

  addEventLayer(layerKey: string): void {
    if (!this.hasEventLayer(layerKey)) {
      const mLayer: MapLayer = new MapLayer(
        layerKey,
        this.mapStyle.getStyle(layerKey),
        this.mapStyle.getSelStyle(layerKey)
      );

      mLayer.subscription = fromEvent(this.map, 'pointermove').subscribe(
        (event: any) => {
          mLayer.layer.getFeatures(event.pixel).then((features) => {
            if (!features.length) {
              mLayer.selection.clear();
              mLayer.layer.changed();
              return;
            }
            let feature = features[0];
            if (!feature) {
              return;
            }
            mLayer.selection.add(feature);
            mLayer.layer.changed();
          });
        }
      );

      this.layers.set(layerKey, mLayer);
      this.map.addLayer(mLayer.layer);
    }
  }

  removeEventLayer(layerKey: string): void {
    if (this.hasEventLayer(layerKey)) {
      const mLayer = this.layers.get(layerKey)!;
      this.map.removeLayer(mLayer.layer);
      this.layers.delete(layerKey);
    }
  }

  getCurrentLayersKey(): string[] {
    return [...this.layers.keys()];
  }
}
