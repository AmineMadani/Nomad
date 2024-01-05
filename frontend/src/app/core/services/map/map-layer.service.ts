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
  ) { }

  /**
   * Get a feature by its ID on a given layer
   * @param layerKey The key of the layer to get the feature from
   * @param featureId The ID of the feature to get
   * @returns The feature with the given ID, or null if there is no such feature
   */
  public getFeatureById(
    mapKey: string,
    layerKey: string,
    featureId: string
  ): Maplibregl.MapGeoJSONFeature | null {
    const r: Maplibregl.MapGeoJSONFeature[] = this.mapService
      .getMap(mapKey)
      .querySourceFeatures(layerKey, {
        sourceLayer: '',
        filter: ['==', 'id', featureId],
      });
    return r[0] ?? null;
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
    await this.cacheService
      .getFeatureByLayerAndFeatureId(layerKey, featureId)
      .then((r) => (feature = r));
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
    await this.cacheService.updateCacheFeatureGeometry(
      featureId,
      layerKey,
      newGeometry
    );
  }

  /**
   * Retrieves the MapGeoJSONFeatures that are currently in view for a given layer. If a cluster is in view
   * then we check the children of every cluster and resolve when the loop is complete.
   * @param {string} layerKey - Key of a layer in the map.
   * @returns Returns the features currently in view on the map for a given layer key.
   * If the layer key is not found or the map is not initialized, an empty array is returned.
   */
  public getFeaturesInView(
    mapKey: string,
    layerKey: string
  ): Promise<Maplibregl.MapGeoJSONFeature[]> {
    return new Promise((resolve, reject) => {
      const map = this.mapService.getMap(mapKey);
      let f: Maplibregl.MapGeoJSONFeature[] = [];
      if (
        map &&
        map.getLayer(layerKey.toUpperCase())
      ) {
        f = map
          .queryRenderedFeatures(null, { layers: [layerKey.toUpperCase()] });

        const promises: Promise<any>[] = [];

        for (const feature of f) {
          if (feature.properties?.['cluster']) {
            const clusterId = feature.properties['cluster_id'];
            const pointCount = feature.properties['point_count'];

            const promise = new Promise<void>(
              (clusterResolve, clusterReject) => {
                // Get the children of the cluster. The any is important because the Maplibre Source type is done badly
                (
                  map.getSource(layerKey) as any
                ).getClusterLeaves(
                  clusterId,
                  pointCount,
                  0,
                  function (error, features) {
                    if (error) {
                      clusterReject(error);
                    } else {
                      if (features?.length > 0) {
                        f = [...f, ...features];
                      }
                      clusterResolve();
                    }
                  }
                );
              }
            );

            promises.push(promise);
          }
        }

        // Resolve the promises for every cluster
        Promise.all(promises)
          .then(() => {
            resolve(f);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        // If there were no cluster, resolve the first queryRenderedFeatures
        resolve(f);
      }
    });
  }

  /**
   * Finds the nearest feature to a given set of coordinates from a list of features.
   * @param longitude - longitude
   * @param latitude - latitude
   * @param layers - Key of a layer in the map.
   * @returns the closest feature from the coords in the area.
   */
  public async findNearestFeatureFromCoords(
    mapKey: string,
    longitude: number,
    latitude: number,
    layerKey: string
  ): Promise<Maplibregl.MapGeoJSONFeature | null> {
    let features = await this.getFeaturesInView(mapKey, layerKey);

    if (features.length === 0) {
      return null;
    }

    let nearestPoint: any | null = null;
    let shortestDistance = Infinity;

    for (const feature of features) {
      const distance = await this.calculateDistance(
        layerKey,
        longitude,
        latitude,
        feature
      );

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
    let localFeature = await this.getLocalFeatureById(
      layerkey,
      feature.id.toString()
    );
    let nearestPoint = this.nearestPointOnLineString(
      [longitude, latitude],
      localFeature.geometry.coordinates
    );
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
      const currentDistance = this.distanceSquared(
        referencePoint,
        currentPoint
      );

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
  public moveToXY(
    mapKey: string,
    x: number,
    y: number,
    zoomLevel: number = 16
  ): Promise<string> {
    const map = this.mapService.getMap(mapKey);
    if (map.getZoom() > zoomLevel) {
      zoomLevel = map.getZoom();
    }
    return new Promise((resolve) => {
      if (x && y) {
        map.
          easeTo({ center: [x, y], zoom: zoomLevel })
          .once('moveend', () => {
            resolve('done');
          });
      } else {
        resolve('done');
      }
    });
  }

  /**
   * Jump to a specific point
   * @param x longitude
   * @param y latitude
   */
  public jumpToXY(
    mapKey: string,
    x: number,
    y: number,
    zoomLevel: number = 16
  ): Promise<string> {
    const map = this.mapService.getMap(mapKey)
    if (map.getZoom() > zoomLevel) {
      zoomLevel = map.getZoom();
    }
    return new Promise((resolve) => {
      if (x && y) {
        map
          .jumpTo({ center: [x, y], zoom: zoomLevel })
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
    mapKey: string,
    layerKey: string,
    id: string,
    minZoom: number = 17
  ): Promise<void> {
    await this.mapService.addEventLayer(mapKey, layerKey);
    const r: Maplibregl.MapGeoJSONFeature = this.getFeatureById(mapKey, layerKey, id);
    if (!r || r?.id === undefined) {
      return;
    }

    const coordinates = (r.geometry as any).coordinates;
    let bounds: any;
    if (r.geometry.type === 'Point') {
      bounds = new Maplibregl.LngLatBounds(coordinates, coordinates).toArray();
    } else if (r.geometry.type === 'Polygon') {
      bounds = new Maplibregl.LngLatBounds(
        coordinates[0][0],
        coordinates[0][0]
      ).toArray();
    } else {
      bounds = coordinates.reduce((bounds: any, coord: any) => {
        return bounds.extend(coord);
      }, new Maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
    }

    let currentZoom = this.mapService.getMap(mapKey).getZoom();
    if (currentZoom < minZoom) {
      currentZoom = minZoom;
    } +

      this.mapService.getMap(mapKey).fitBounds(bounds, {
        padding: 20,
        maxZoom: currentZoom,
      });
    this.mapEvent.highlighSelectedFeatures(this.mapService.getMap(mapKey), [
      {
        source: layerKey,
        id: r.id.toString(),
      },
    ]);
  }

  /**
   * Generate a marker on the map
   * @param x longitute
   * @param y latitude
   * @returns the marker
   */
  public addMarker(
    mapKey: string,
    x: number,
    y: number,
    geometry: Array<number[]> | number[],
    isXY?: boolean,
    color?: string
  ): Maplibregl.Marker {
    let marker: Maplibregl.Marker = new Maplibregl.Marker({
      draggable: geometry[0] instanceof Array ? true : isXY,
      color: color ? color : '',
    })
      .setLngLat([x, y])
      .addTo(this.mapService.getMap(mapKey));
    if (geometry[0] instanceof Array) {
      this.limitDragMarker(geometry as any, marker);
      marker.on('drag', () => this.limitDragMarker(geometry as any, marker));
    } else {
      marker.setLngLat([geometry[0] as any, geometry[1] as any]);
    }
    return marker;
  }

  public fitBounds(mapKey: string, e: any, maxZoomLevel: number = 17): void {
    const bounds = e.reduce((bounds: any, coord: any) => {
      return bounds.extend(coord);
    }, new Maplibregl.LngLatBounds(e[0], e[0]));

    this.mapService.getMap(mapKey).fitBounds(bounds, {
      padding: 20,
      maxZoom: maxZoomLevel,
    });
  }

  public hideFeature(mapKey: string, layerKey: string, featureId: string): void {
    const layer = this.mapService.getLayer(layerKey);
    for (const style of layer.style) {
      this.mapService.getMap(mapKey).setFilter(style.id, ['!=', 'id', featureId]);
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
    // Check if the segment is degenerated
    if (this.isDegenerateSegment(geometry)) {
      // Return the default geometry in that case
      return point;
    }

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

  /**
 * Checks if any segment in the given geometry is degenerate.
 * A degenerate segment is a segment where the start and end points are the same,
 * essentially making it a point rather than a line segment.
 * Some equipments have this kind of problems. Like the aep_canalisation IDF-0000180570.
 *
 * @param geometry - An array of point pairs, each representing a segment in the form [[x1, y1], [x2, y2], ...].
 * @param point - The reference point (not used in this function, but kept for signature consistency with findNearestPoint).
 * @returns true if a degenerate segment is found, false otherwise.
 */
  public isDegenerateSegment(geometry: number[][]): boolean {
    // Check if there are enough points to form at least one segment.
    if (geometry.length < 2) {
      return false; // Not enough points for a segment
    }

    // Iterate through each segment in the geometry
    for (let i = 0; i < geometry.length - 1; i++) {
      const start = geometry[i]; // Start point of the segment
      const end = geometry[i + 1]; // End point of the segment

      // Check if the start and end points of the segment are the same
      if (start[0] === end[0] && start[1] === end[1]) {
        return true; // Degenerate segment found
      }
    }

    return false; // No degenerate segments found
  }


  /**
   * Queries the nearest rendered feature from a mouse event on the map.
   * @param e - Mouse event on the map
   * @returns The nearest features (if there are) from the map.
   */
  public queryNearestFeature(
    mapKey: string,
    e: Maplibregl.MapMouseEvent
  ): Maplibregl.MapGeoJSONFeature {
    var mouseCoords = this.mapService.getMap(mapKey).unproject(e.point);
    const selectedFeatures = this.queryNearestFeatureList(mapKey, e);
    return this.findNearestFeature(mouseCoords, selectedFeatures);
  }

  /**
   * Finds the nearest feature to a given set of coordinates from a list of features.
   * @param mouseCoords - Coordinates of a mouse event on the map.
   * @param {Maplibregl.MapGeoJSONFeature[]} features - Array of the features in a selected area.
   * @returns the closest feature from the mouse in the area.
   */
  public findNearestFeature(
    mouseCoords: Maplibregl.LngLat,
    features: Maplibregl.MapGeoJSONFeature[]
  ): Maplibregl.MapGeoJSONFeature | null {
    if (features.length === 0) {
      return null;
    }

    let nearestPoint: any | null = null;
    let shortestDistance = Infinity;

    for (const feature of features) {
      const distance = this.calculateDistanceFeatureMouse(mouseCoords, feature);

      if (!Number.isNaN(distance)) {
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestPoint = feature;
        }
      } else {
        nearestPoint = feature;
      }
    }

    return nearestPoint;
  }

  /**
   * Calculates the distance between two points on a map using their longitude and latitude.
   * @param mousePoint - A Maplibregl.LngLat object representing the longitude and latitude.
   * @param feature - A MapGeoJSONFeature from the map.
   * @returns Returns the calculated distance the coordinates.
   */
  public calculateDistanceFeatureMouse(
    mousePoint: Maplibregl.LngLat,
    feature: Maplibregl.MapGeoJSONFeature
  ): number {
    const dx = feature.properties['x'] - mousePoint.lng;
    const dy = feature.properties['y'] - mousePoint.lat;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Queries a list of nearest rendered feature from a mouse event on the map.
   * @param e - Mouse event on the map
   * @returns A list nearest features (if there are) from the map.
   */
  public queryNearestFeatureList(
    mapKey: string,
    e: Maplibregl.MapMouseEvent,
    tolerance?: number
  ): Maplibregl.MapGeoJSONFeature[] {
    tolerance = tolerance || 10;
    var mouseCoords = this.mapService.getMap(mapKey).unproject(e.point);
    const selectedFeatures = this.mapService.getMap(mapKey).queryRenderedFeatures(
      [
        [e.point.x - tolerance, e.point.y - tolerance],
        [e.point.x + tolerance, e.point.y + tolerance],
      ],
      {
        layers: this.mapService.getCurrentLayersIds(),
      }
    );
    return selectedFeatures;
  }
}
