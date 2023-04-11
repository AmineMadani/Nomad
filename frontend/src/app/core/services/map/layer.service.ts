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

  public getHighlightedFeatureId(layerKey: string): string | undefined {
    const mapLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
    if (mapLayer) {
      return mapLayer.featureHighlighted;
    }
    return undefined;
  }

  public getFeatureById(layerKey: string, featureId: string): Feature | null {
    const mLayer = this.mapService.getLayer(layerKey);
    if (mLayer) {
      return mLayer.source!.getFeatureById(featureId);
    }
    return null;
  }

  public getFeaturesFilteredInView(layerKey: string, filters: Map<string, string[]> | undefined): Feature[] {
    let f: Feature[] = [];
    const mapLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
    if (mapLayer && mapLayer.layer.getMinZoom() <= this.mapService.getView()?.getZoom()!) {
      mapLayer.source!.forEachFeatureIntersectingExtent(
        this.mapService.getView().calculateExtent(),
        function (feature) {
          f.push(feature);
        }
      );
    }

    //Add filter if exist on it
    if(filters && filters.size > 0) {
      f = f.filter(feature => this.mapService.getLayer(layerKey)?.onFilterFeature(feature,filters));
    }

    return f;
  }

  public passFilterToLayer(layerKey: string, filters: Map<string, string[]> | undefined) {
    const mapLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
    if (mapLayer) {
      mapLayer.filteredFeatured = filters;
    }
    mapLayer?.source?.changed();
  }

  public zoomToFeatureByIdAndLayerKey(id: string, layerKey: string) {
    this.mapService.addEventLayer(layerKey).then(() => {
      const mLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
      if (mLayer) {
        const feature: Feature | null = this.getFeatureById(mLayer.key, id);
        if (feature) {
          this.mapService
            .getMap()
            .getView()
            .fit(feature.getGeometry()!.getExtent(), {
              duration: 2000,
              padding: [250, 250, 250, 50],
            });
        }
        mLayer.highlightFeature(id);
      }
    });
  }

  public refreshLayer(layerKey:string){
    this.mapService.getLayer(layerKey)?.layer.changed();
  }
}
