import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import { MapEventService } from './map-event.service';
import * as Maplibregl from 'maplibre-gl';
import { features } from 'process';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  constructor(private mapService: MapService, private mapEvent: MapEventService) { }

  /**
   * Get a feature by its ID on a given layer
   * @param layerKey The key of the layer to get the feature from
   * @param featureId The ID of the feature to get
   * @returns The feature with the given ID, or null if there is no such feature
   */
  public getFeatureById(layerKey: string, featureId: string): any | null {
    const r = this.mapService.getMap().querySourceFeatures(layerKey, {
      sourceLayer: '',
      filter: ['==', 'id', featureId],
    });
    return r[0];
  }

  /**
   * Get feature coordinates by its ID on a given layer
   * @param layerKey The key of the layer to get the feature from
   * @param featureId The ID of the feature to get
   * @returns The feature with the given ID, or null if there is no such feature
   */
  public getCoordinateFeaturesById(layerKey: string, featureId: string): any | null {
    const r = this.mapService.getMap().querySourceFeatures(layerKey, {
      sourceLayer: '',
      filter: ['==', 'id', featureId],
    });
    let val:Array<number[]> = [];
    for(let feature of r) {
      if(((feature as any).geometry.coordinates).some(ele => ele.length > 2)){
        //val = [...val, ...((feature as any).geometry.coordinates).flat()];
      } else {
        val = [...val, ...((feature as any).geometry.coordinates)];
      }
    }
    const setArray = new Set(val.map(x => JSON.stringify(x)));
    const uniqArray = [...setArray].map(x => JSON.parse(x));

    return uniqArray;
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
   * Jump to a specific point
   * @param x longitude
   * @param y latitude
   */
  public moveToXY(x: number, y: number) {
    return new Promise((resolve) => {
      if (x && y) {
        this.mapService.getMap().easeTo({ center: [x, y], zoom: 16 }).once('moveend', () => {
          resolve('done')
        });
      } else {
        resolve('done')
      }

    });
  }

  /**
   * Zoom the map view to an area before to zoom to a feature on a given layer by its ID
   * @param extent The area location
   * @param id The ID of the feature to zoom to
   * @param layerKey The key of the layer
   */
  public zoomOnXyToFeatureByIdAndLayerKey(layerKey: string, id: string): void {
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
   * Generate a marker on the map
   * @param x longitute
   * @param y latitude
   * @returns the marker
   */
  public addMarker(x: number, y: number, geometry: Array<number[]>): any {
    let marker: Maplibregl.Marker = new Maplibregl.Marker({
      draggable: geometry[0] instanceof Array
    }).setLngLat([x, y]).addTo(this.mapService.getMap());
    if (geometry[0] instanceof Array) {
      this.limitDragMarker(geometry, marker);
      marker.on('drag', () => this.limitDragMarker(geometry, marker));
    }
    return marker;
  }

  /**
   * Limit the marker drag on the geomatry
   * @param geometry The asset geometry
   * @param marker the marker
   */
  private limitDragMarker(geometry: Array<number[]>, marker: Maplibregl.Marker) {
    const lngLat = marker.getLngLat();
    var res = this.findNearestPoint(geometry, [lngLat.lng, lngLat.lat]);
    marker.setLngLat([res[0], res[1]]);
  }

  /**
   * Calcul the nearest position of a point to a polygon line
   * @param geometry the asset geometry
   * @param point the point
   * @returns the nearest point
   */
  private findNearestPoint(geometry, point): number[] {
    // Calculate the squared Euclidean distance between two points
    function distanceSquared(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return dx * dx + dy * dy;
    }

    let nearestPoint = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < geometry.length - 1; i++) {
      const [x1, y1] = geometry[i];
      const [x2, y2] = geometry[i + 1];
      const [px, py] = point;

      // Calculate the squared distance from the point to the line segment
      const lineLengthSquared = distanceSquared(x1, y1, x2, y2);
      const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLengthSquared));
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);
      const distance = distanceSquared(px, py, x, y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = [x, y];
      }
    }

    return nearestPoint;
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
