import { Injectable } from '@angular/core';
import { MapLayer } from '../models/map-layer.model';
import MapOpenLayer from 'ol/Map';
import View from 'ol/View';
import { MapStyleService } from './map-style.service';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { boundingExtent } from 'ol/extent';
import { Control, defaults as defaultControls } from 'ol/control.js';
import { DrawerService } from './drawer.service';
import Feature, { FeatureLike } from 'ol/Feature';
import { DrawerRouteEnum } from '../models/drawer.model';
import { Equipment } from '../models/equipment.model';

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

  public createMap(controls: Control[]): MapOpenLayer {
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

  public hasEventLayer(layerKey: string): boolean {
    return this.layers.has(layerKey);
  }

  public addEventLayer(layerKey: string): void {
    if (layerKey && layerKey != '' && !this.hasEventLayer(layerKey)) {
      const mLayer: MapLayer = new MapLayer(
        layerKey,
        this.mapStyle.getStyle(layerKey),
        this.mapStyle.getSelStyle(layerKey)
      );

      mLayer.subscription = fromEvent(this.map, 'pointermove').subscribe(
        (event: any) => {
          mLayer.layer.getFeatures(event.pixel).then((features) => {
            if (!features.length) {
              mLayer.hoverFeature.clear();
              mLayer.layer.changed();
              return;
            }
            let feature = features[0];
            if (!feature) {
              return;
            }
            mLayer.hoverFeature.add(feature);
            mLayer.layer.changed();
          });
        }
      );

      mLayer.subscription = fromEvent(this.map, 'click').subscribe(
        (event: any) => {
          mLayer.layer
            .getFeatures(event.pixel)
            .then((features: FeatureLike[]) => {
              this.onFeaturesClick(features, layerKey);
            });
        }
      );

      this.layers.set(layerKey, mLayer);
      this.map.addLayer(mLayer.layer);
    }
  }

  public removeEventLayer(layerKey: string): void {
    if (this.hasEventLayer(layerKey)) {
      const mLayer = this.layers.get(layerKey)!;
      this.map.removeLayer(mLayer.layer);
      this.layers.delete(layerKey);
    }
  }

  public resetLayers(): void {
    [...this.layers.keys()].forEach((layerKey: string) => {
      this.removeEventLayer(layerKey);
    });
  }

  public getCurrentLayersKey(): string[] {
    return [...this.layers.keys()];
  }

  // Permit to select the equipment feature on the layer (for the highlight style)
  selectEquipmentLayer(equipment: Equipment) {
    if (equipment.layerKey && this.hasEventLayer(equipment.layerKey)) {
      const mLayer = this.layers.get(equipment.layerKey)!;
      mLayer.equipmentSelected = equipment;
      mLayer.layer.changed();
    }
  }

  // Permit to unselect the equipment feature on the layer (for the highlight style)
  unselectEquipmentLayer(equipment: Equipment) {
    if (equipment.layerKey && this.hasEventLayer(equipment.layerKey)) {
      const mLayer = this.layers.get(equipment.layerKey)!;
      if (
        mLayer.equipmentSelected &&
        mLayer.equipmentSelected.id == equipment.id
      ) {
        mLayer.equipmentSelected = undefined;
        mLayer.layer.changed();
      }
    }
  }

  private onFeaturesClick(features: FeatureLike[], layerKey: string) {
    if (features.length > 0) {
      const ctFeature: Feature[] = features[0].get('features') || [features[0]];

      if (ctFeature.length > 1) {
        const extent = boundingExtent(
          ctFeature.map((r: any) => r.getGeometry()!.getCoordinates())
        );
        this.map.getView().fit(extent, {
          duration: 1000,
          padding: [50, 50, 50, 50],
        });
      }

      const properties = ctFeature[0].getProperties();
      if (properties['geometry']) delete properties['geometry'];
      // We pass the layerKey to the drawer to be able to select the equipment on the layer
      properties['layerKey'] = layerKey;

      this.drawerService.navigateTo(
        DrawerRouteEnum.EQUIPMENT,
        [ctFeature[0].get('id')],
        properties
      );
    }
  }
}
