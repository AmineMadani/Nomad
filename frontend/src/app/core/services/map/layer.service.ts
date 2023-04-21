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

  /**
   * Highlight a feature on a given layer
   * @param layerKey The key of the layer to highlight the feature on
   * @param idFeature The ID of the feature to highlight
   */
  public highlightFeature(layerKey: string, idFeature: string): void {
    const mapLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
    if (mapLayer) {
      mapLayer.highlightFeature(idFeature);
    }
  }

  /**
   * Get the ID of the highlighted feature on a given layer
   * @param layerKey The key of the layer to get the highlighted feature from
   * @returns The ID of the highlighted feature, or undefined if there is no highlighted feature
   */
  public getHighlightedFeatureId(layerKey: string): string | undefined {
    const mapLayer: MapLayer | undefined = this.mapService.getLayer(layerKey);
    if (mapLayer) {
      return mapLayer.featureHighlighted;
    }
    return undefined;
  }

  /**
   * Get a feature by its ID on a given layer
   * @param layerKey The key of the layer to get the feature from
   * @param featureId The ID of the feature to get
   * @returns The feature with the given ID, or null if there is no such feature
   */
  public getFeatureById(layerKey: string, featureId: string): Feature | null {
    const mLayer = this.mapService.getLayer(layerKey);
    if (mLayer) {
      return mLayer.source!.getFeatureById(featureId);
    }
    return null;
  }

  /**
   * Get features from a given layer that are currently in view, filtered by some attributes
   * @param layerKey The key of the layer to get the features from
   * @param filters A map of attributes to filter by, where the keys are attribute names and the values are arrays of allowed attribute values
   * @returns An array of features in the layer that are currently in view and pass the attribute filters
   */
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

  /**
   * Zoom the map view to a feature on a given layer by its ID
   * @param id The ID of the feature to zoom to
   * @param layerKey The key of the layer
   */
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

  /**
   * Zoom the map view to an area before to zoom to a feature on a given layer by its ID
   * @param extent The area location
   * @param id The ID of the feature to zoom to
   * @param layerKey The key of the layer
   */
  public zoomOnXyToFeatureByIdAndLayerKey(extent: number[],id: string, layerKey: string) {
    this.mapService
        .getMap()
        .getView()
        .fit(extent, {duration: 2000, padding: [250, 250, 250, 250]});
    this.zoomToFeatureByIdAndLayerKey(id,layerKey);
  }

  /**
   * Zoom on my location by GPS location
   */
  public async zoomOnMe() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.mapService
          .getMap()
          .getView()
          .fit(boundingExtent([transform([coordinates.coords.longitude,coordinates.coords.latitude],'EPSG:4326','EPSG:3857')]), {padding: [250, 250, 250, 50], duration:2000});
  }

  /**
   * Method to forece the refresh the layer
   * @param layerKey The key of the layer
   */
  public refreshLayer(layerKey:string){
    this.mapService.getLayer(layerKey)?.layer.changed();
  }
}
