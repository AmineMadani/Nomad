import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import { MapEventService } from './map-event.service';
import * as Maplibregl from 'maplibre-gl';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  constructor(private mapService: MapService, private mapEvent: MapEventService) {}

  /**
   * Get a feature by its ID on a given layer
   * @param layerKey The key of the layer to get the feature from
   * @param featureId The ID of the feature to get
   * @returns The feature with the given ID, or null if there is no such feature
   */
  public getFeatureById(layerKey: string, featureId: number): any | null {
    const r = this.mapService.getMap().querySourceFeatures(layerKey, {
      sourceLayer: '',
      filter: ['==', 'id', featureId],
    });
    return r[0];
  }

  public getFeaturesInView(layerKey: string): any[] {
    let f: any[] = [];
    if (this.mapService.hasEventLayer(layerKey)) {
      f = this.mapService
        .getMap()
        .queryRenderedFeatures(null, { source: [layerKey] });
    }
    return f;
  }

  /**
   * Zoom the map view to an area before to zoom to a feature on a given layer by its ID
   * @param extent The area location
   * @param id The ID of the feature to zoom to
   * @param layerKey The key of the layer
   */
  public zoomOnXyToFeatureByIdAndLayerKey(layerKey: string, id: number): void {
    this.mapService.addEventLayer(layerKey).then(() => {
      const r = this.getFeatureById(layerKey, id);

      if (!r || r?.id === undefined) {
        return;
      }

      const coordinates = r.geometry.coordinates;

      let bounds: any;
      if (r.geometry.type === 'Point') {
        bounds = new Maplibregl.LngLatBounds(coordinates, coordinates).toArray();
      } else {
        bounds = coordinates.reduce((bounds: any, coord: any) => {
          return bounds.extend(coord);
        }, new Maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
      }

      this.mapService.getMap().fitBounds(bounds, {
        padding: 20,
        maxZoom: 17,
      });
      this.mapEvent.highlightSelectedFeature(this.mapService.getMap(), layerKey, r.id.toString());
    });
  }

  /**
   * Zoom on my location by GPS location
   */
  // public async zoomOnMe() {
  //   const coordinates = await Geolocation.getCurrentPosition();
  //   this.mapService
  //     .getMap()
  //     .getView()
  //     .fit(
  //       boundingExtent([
  //         transform(
  //           [coordinates.coords.longitude, coordinates.coords.latitude],
  //           'EPSG:4326',
  //           'EPSG:3857'
  //         ),
  //       ]),
  //       { padding: [250, 250, 250, 50], duration: 2000 }
  //     );
  // }
}
