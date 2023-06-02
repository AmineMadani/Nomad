import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import * as Maplibregl from 'maplibre-gl';

@Injectable({
  providedIn: 'root',
})
export class MapEventService {
  private hoveredFeatureId: string | undefined;
  private selectedFeatureId: string | undefined;

  private hoveredLayer: string;
  private selectedLayer: string;

  private onFeatureHovered$: Subject<string | undefined> = new Subject();
  private onFeatureSelected$: Subject<string | undefined> = new Subject();

  constructor() {}

  public onFeatureHovered(): Observable<string | undefined> {
    return this.onFeatureHovered$.asObservable();
  }

  public onFeatureSelected(): Observable<string | undefined> {
    return this.onFeatureSelected$.asObservable();
  }

  /**
   * The function highlights a selected feature on the Maplibre map.
   * @param mapLibre - a Maplibre GL map object that represents the map being used
   * @param {string} sourceKey - The key of the source where the feature is located in the Maplibre map.
   * @param {string | undefined} featureId - The ID of the feature that is being selected over.
   */
  public highlightSelectedFeature(
    mapLibre: Maplibregl.Map,
    sourceKey: string,
    featureId: string | undefined
  ): void {
    if (this.selectedFeatureId && this.selectedFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: this.selectedLayer, id: this.selectedFeatureId },
        { selected: false }
      );
      this.selectedFeatureId = undefined;
      this.selectedLayer = undefined;
      this.onFeatureSelected$.next(undefined);
    }

    if (featureId && this.selectedFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: sourceKey, id: featureId },
        { selected: true }
      );
      this.selectedFeatureId = featureId;
      this.selectedLayer = sourceKey;
      this.onFeatureSelected$.next(featureId);

    } else if (!featureId && this.selectedFeatureId) {
      mapLibre.setFeatureState(
        { source: this.selectedLayer, id: this.selectedFeatureId },
        { selected: false }
      );
      this.selectedFeatureId = undefined;
      this.selectedLayer = undefined;
      this.onFeatureSelected$.next(undefined);
    }
  }

  /**
   * The function highlights a hovered feature on a Maplibre map.
   * @param mapLibre - a Maplibre GL map object that represents the map being used
   * @param {string} sourceKey - The key of the source where the feature is located in the Maplibre map.
   * @param {string | undefined} featureId - The ID of the feature that is being hovered over.
   */
  public highlightHoveredFeature(
    mapLibre: Maplibregl.Map,
    sourceKey: string,
    featureId: string | undefined
  ): void {
    if (this.hoveredFeatureId && this.hoveredFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: this.hoveredLayer, id: this.hoveredFeatureId },
        { hover: false }
      );
      this.hoveredFeatureId = undefined;
      this.hoveredLayer = undefined;
      this.onFeatureHovered$.next(undefined);
    }

    if (featureId && this.hoveredFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: sourceKey, id: featureId },
        { hover: true }
      );
      this.hoveredFeatureId = featureId;
      this.hoveredLayer = sourceKey;
      this.onFeatureHovered$.next(featureId);

    } else if (!featureId && this.hoveredFeatureId) {
      mapLibre.setFeatureState(
        { source: this.hoveredLayer, id: this.hoveredFeatureId },
        { hover: false }
      );
      this.hoveredFeatureId = undefined;
      this.hoveredLayer = undefined;
      this.onFeatureHovered$.next(undefined);
    }
  }
}
