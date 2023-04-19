import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import { MapLayer } from '../../models/map-layer.model';
import Feature from 'ol/Feature';
import { boundingExtent } from 'ol/extent';
import { Geolocation } from '@capacitor/geolocation';
import { transform } from 'ol/proj';

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

    return f;
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
              padding: [250, 250, 250, 250],
            });
        }
        mLayer.highlightFeature(id);
      }
    });
  }

  public zoomOnXyToFeatureByIdAndLayerKey(extent: number[],id: string, layerKey: string) {
    this.mapService
        .getMap()
        .getView()
        .fit(extent, {duration: 2000, padding: [250, 250, 250, 250]});
    this.zoomToFeatureByIdAndLayerKey(id,layerKey);
  }

  public async zoomOnMe() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.mapService
          .getMap()
          .getView()
          .fit(boundingExtent([transform([coordinates.coords.longitude,coordinates.coords.latitude],'EPSG:4326','EPSG:3857')]), {padding: [250, 250, 250, 50], duration:2000});
  }

  public refreshLayer(layerKey:string){
    this.mapService.getLayer(layerKey)?.layer.changed();
  }
}
