import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import { MapEventService } from './map-event.service';
import * as Maplibregl from 'maplibre-gl';
import { CacheService } from '../cache.service';

@Injectable({
  providedIn: 'root',
})
export class MapLayerService {

  constructor(
    private mapService: MapService,
    private mapEvent: MapEventService,
    private cacheService: CacheService
  ) {
  }

  /**
   * Get a feature by its ID on a given layer
   * @param layerKey The key of the layer to get the feature from
   * @param featureId The ID of the feature to get
   * @returns The feature with the given ID, or null if there is no such feature
   */
  public getFeatureById(
    layerKey: string,
    featureId: string
  ): Maplibregl.MapGeoJSONFeature | null {
    const r: Maplibregl.MapGeoJSONFeature[] = this.mapService
      .getMap()
      .querySourceFeatures(layerKey, {
        sourceLayer: '',
        filter: ['==', 'id', featureId],
      });
    return r[0] ?? null;
  }

  /**
     * Get feature coordinates by its ID on a given layer
     * @param layerKey The key of the layer to get the feature from
     * @param featureId The ID of the feature to get
     * @returns The feature with the given ID, or null if there is no such feature
     */
  public async getCoordinateFeaturesById(
    layerKey: string,
    featureId: string
  ): Promise<any | null> {
    if (layerKey.includes('asset.')) {
      layerKey = layerKey.split('asset.')[1];
    }
    return await this.cacheService.getGeometryByLayerAndId(featureId, layerKey);
  }

  /**
     * Get feature by its ID on a given layer
     * @param layerKey The key of the layer to get the feature from
     * @param featureId The ID of the feature to get
     * @returns The feature with the given ID, or null if there is no such feature
     */
  public async getLocalFeatureById(
    layerKey: string,
    featureId: string
  ): Promise<any | null> {
    let feature;
    await this.cacheService.getFeatureByLayerAndFeatureId(layerKey, featureId).then(r => feature = r);
    return feature;
  }

  /**
     * Update feature geometry by id and layer
     * @param layerKey The key of the layer to get the feature from
     * @param featureId The ID of the feature to get
     */
  public async updateLocalGeometryFeatureById(
    layerKey: string,
    featureId: string,
    newGeometry: number[]
  ) {
    await this.cacheService.updateCacheFeatureGeometry(featureId, layerKey, newGeometry);
  }

  /**
   * Retrieves the MapGeoJSONFeatures that are currently in view for a given layer.
   * @param {string} layerKey - Key of a layer in the map.
   * @returns Returns the features currently in view on the map for a given layer key.
   * If the layer key is not found or the map is not initialized, an empty array is returned.
   */
  public getFeaturesInView(layerKey: string): Maplibregl.MapGeoJSONFeature[] {
    let f: Maplibregl.MapGeoJSONFeature[] = [];
    if (
      this.mapService.getMap() &&
      this.mapService.getMap().getLayer(layerKey.toUpperCase())
    ) {
      f = this.mapService
        .getMap()
        .queryRenderedFeatures(null, { layers: [layerKey.toUpperCase()] });
    }
    return f;
  }

  /**
   * Finds the nearest feature to a given set of coordinates from a list of features.
   * @param longitude - longitude
   * @param latitude - latitude
   * @param layers - Key of a layer in the map.
   * @returns the closest feature from the coords in the area.
   */
  public async findNearestFeatureFromCoords(
    longitude: number,
    latitude: number,
    layerKey: string
  ): Promise<Maplibregl.MapGeoJSONFeature | null> {

    let features = this.getFeaturesInView(layerKey);
    
    if (features.length === 0) {
      return null;
    }

    let nearestPoint: any | null = null;
    let shortestDistance = Infinity;

    for (const feature of features) {
      const distance = await this.calculateDistance(layerKey,longitude, latitude, feature);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestPoint = feature;
      }
    }

    return nearestPoint;
  }

  /**
   * Calculates the distance between two points on a map using their longitude and latitude.
   * @param longitude - longitude
   * @param latitude - latitude
   * @param feature - A MapGeoJSONFeature from the map.
   * @returns Returns the calculated distance the coordinates.
   */
  private async calculateDistance(
    layerkey: string,
    longitude: number,
    latitude: number,
    feature: Maplibregl.MapGeoJSONFeature
  ): Promise<number> {
    let localFeature = await this.getLocalFeatureById(layerkey,feature.id.toString());
    let nearestPoint = this.nearestPointOnLineString([longitude,latitude],localFeature.geometry.coordinates);
    const dx = nearestPoint[0] - longitude;
    const dy = nearestPoint[1] - latitude;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private distanceSquared(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
  }
  
  private nearestPointOnLineString(referencePoint, lineString) {
    if (lineString.length === 0) {
      return null;
    }
  
    let nearestPoint = lineString[0];
    let minDistance = this.distanceSquared(referencePoint, nearestPoint);
  
    for (let i = 1; i < lineString.length; i++) {
      const currentPoint = lineString[i];
      const currentDistance = this.distanceSquared(referencePoint, currentPoint);
  
      if (currentDistance < minDistance) {
        nearestPoint = currentPoint;
        minDistance = currentDistance;
      }
    }
  
    return nearestPoint;
  }

  /**
   * Jump to a specific point
   * @param x longitude
   * @param y latitude
   */
  public moveToXY(x: number, y: number, zoomLevel: number = 16): Promise<string> {
    if (this.mapService.getMap().getZoom() > zoomLevel) {
      zoomLevel = this.mapService.getMap().getZoom();
    }
    return new Promise((resolve) => {
      if (x && y) {
        this.mapService
          .getMap()
          .easeTo({ center: [x, y], zoom: zoomLevel })
          .once('moveend', () => {
            resolve('done');
          });
      } else {
        resolve('done');
      }
    });
  }

  /**
   * Zoom the map view to an area before to zoom to a feature on a given layer by its ID
   * @param extent The area location
   * @param id The ID of the feature to zoom to
   * @param layerKey The key of the layer
   */
  public async zoomOnXyToFeatureByIdAndLayerKey(
    layerKey: string,
    id: string,
    minZoom:number=17
  ): Promise<void> {
    await this.mapService.addEventLayer(layerKey);
    const r: Maplibregl.MapGeoJSONFeature = this.getFeatureById(layerKey, id);
    if (!r || r?.id === undefined) {
      return;
    }

    const coordinates = (r.geometry as any).coordinates;
    let bounds: any;
    if (r.geometry.type === 'Point') {
      bounds = new Maplibregl.LngLatBounds(coordinates, coordinates).toArray();
    } else {
      bounds = coordinates.reduce((bounds: any, coord: any) => {
        return bounds.extend(coord);
      }, new Maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
    }

    let currentZoom = this.mapService.getMap().getZoom();
    if (currentZoom < minZoom) {
      currentZoom = minZoom;
    }

    this.mapService.getMap().fitBounds(bounds, {
      padding: 20,
      maxZoom: currentZoom,
    });
    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      [{
        source: layerKey,
        id: r.id.toString()
      }]
    );
  }

  /**
   * Generate a marker on the map
   * @param x longitute
   * @param y latitude
   * @returns the marker
   */
  public addMarker(
    x: number,
    y: number,
    geometry: Array<number[]>,
    isXY?: boolean
  ): Maplibregl.Marker {
    let marker: Maplibregl.Marker = new Maplibregl.Marker({
      draggable: geometry[0] instanceof Array ? true : isXY,
    })
      .setLngLat([x, y])
      .addTo(this.mapService.getMap());
    if (geometry[0] instanceof Array) {
      this.limitDragMarker(geometry, marker);
      marker.on('drag', () => this.limitDragMarker(geometry, marker));
    } else {
      marker.setLngLat([geometry[0] as any, geometry[1] as any]);
    }
    return marker;
  }

  public fitBounds(e: any, maxZoomLevel: number = 17): void {
    const bounds = e.reduce((bounds: any, coord: any) => {
      return bounds.extend(coord);
    }, new Maplibregl.LngLatBounds(e[0], e[0]));

    this.mapService.getMap().fitBounds(bounds, {
      padding: 20,
      maxZoom: maxZoomLevel,
    });
  }

  public hideFeature(layerKey: string, featureId: string): void {
    const layer = this.mapService.getLayer(layerKey);
    for (const style of layer.style) {
      this.mapService.getMap().setFilter(style.id, ['!=', 'id', featureId]);
    }
  }

  /**
   * Limit the marker drag on the geomatry
   * @param geometry The asset geometry
   * @param marker the marker
   */
  private limitDragMarker(
    geometry: Array<number[]>,
    marker: Maplibregl.Marker
  ): void {
    const lngLat = marker.getLngLat();
    const res = this.findNearestPoint(geometry, [lngLat.lng, lngLat.lat]);
    marker.setLngLat([res[0], res[1]]);
  }

  /**
   * Calcul the nearest position of a point to a polygon line
   * @param geometry the asset geometry
   * @param point the point
   * @returns the nearest point
   */
  public findNearestPoint(
    geometry: Array<number[]>,
    point: number[]
  ): number[] {
    // Calculate the squared Euclidean distance between two points
    const distanceSquared = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return dx * dx + dy * dy;
    };

    let nearestPoint: number[] | null = null;
    let nearestDistance: number = Infinity;

    const [px, py]: number[] = point;

    for (let i = 0; i < geometry.length - 1; i++) {
      const [x1, y1]: number[] = geometry[i];
      const [x2, y2]: number[] = geometry[i + 1];

      // Calculate the squared distance from the point to the line segment
      const lineLengthSquared: number = distanceSquared(x1, y1, x2, y2);
      const t: number = Math.max(
        0,
        Math.min(
          1,
          ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLengthSquared
        )
      );

      const x: number = x1 + t * (x2 - x1);
      const y: number = y1 + t * (y2 - y1);
      const distance: number = distanceSquared(px, py, x, y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = [x, y];
      }
    }
    return nearestPoint;
  }
}
