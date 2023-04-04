import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import { MapLayer } from '../../models/map-layer.model';
import Feature from 'ol/Feature';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  constructor(
    private mapService: MapService
  ) {}

  public highlightFeature(layerKey: string, idFeature: string): void {
    const mapLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
    if (mapLayer) {
      mapLayer.highlightFeature(idFeature);
    }
  }

  public zoomToFeatureByIdAndLayerKey(id: string, layerKey: string) {
    this.mapService.addEventLayer(layerKey).then(() => {
      const mLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
      if (mLayer) {
        const feature: Feature | null = mLayer.source.getFeatureById(id);
        if (feature) {
          this.mapService.getMap().getView().fit(feature.getGeometry()!.getExtent(), {
            duration: 2000,
            padding: [250, 250, 250, 50],
          });
        }
        mLayer.highlightFeature(id);
      }
    })
  }
}
