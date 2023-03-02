import { Injectable } from '@angular/core';
import { MapLayer } from '../models/map-layer.model';
import MapOpenLayer from 'ol/Map';
import View from 'ol/View';
import { MapStyleService } from './map-style.service';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { boundingExtent } from 'ol/extent';
import { Control, defaults as defaultControls } from 'ol/control.js';
import { DrawerService } from '../pages/home/drawers/drawer.service';
import { DrawerRouteEnum } from '../pages/home/drawers/drawer.enum';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(
    private mapStyle: MapStyleService,
    private drawerService: DrawerService
  ) {}

  private map: MapOpenLayer;
  private layers: Map<string, MapLayer> = new Map();

  createMap(controls: Control[]): MapOpenLayer {
    this.map = new MapOpenLayer({
      controls: defaultControls().extend(controls),
      target: 'map',
      view: new View({
        center: [-187717.995347, 6132337.474246],
        zoom: 17,
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

      mLayer.subscription = fromEvent(this.map, 'click').subscribe(
        (event: any) => {
          mLayer.layer.getFeatures(event.pixel).then((features) => {
            if (features.length > 0) {
              let ctFeature = features[0].get('features');
              if (ctFeature.length > 1) {
                const extent = boundingExtent(
                  ctFeature.map((r: any) => r.getGeometry()!.getCoordinates())
                );
                this.map
                  .getView()
                  .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
              } else {
                console.log('ctFeature', ctFeature[0]);
                this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [
                  ctFeature[0].get('id'),
                ]);
              }
            }
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
