import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import * as Maplibregl from 'maplibre-gl';

export interface MultiSelection { source: string, id: string }

@Injectable({
  providedIn: 'root',
})
export class MapEventService {

  public isFeatureFiredEvent: boolean;

  private selectedFeatureId: string | undefined;

  private multiSelection: MultiSelection[] = [];
  private multiHover: MultiSelection[] = [];

  private onFeatureHovered$: Subject<string | undefined> = new Subject();
  private onFeatureSelected$: Subject<any | undefined> = new Subject();
  private onMultiFeaturesSelected$: Subject<any[] | undefined> = new Subject();
  private onMultiFeaturesHovered$: Subject<any[] | undefined> = new Subject();

  constructor() { }

  public onFeatureHovered(): Observable<string | undefined> {
    return this.onFeatureHovered$.asObservable();
  }

  public onFeatureSelected(): Observable<any | undefined> {
    return this.onFeatureSelected$.asObservable();
  }

  public onMultiFeaturesHovered(): Observable<any | undefined> {
    return this.onMultiFeaturesHovered$.asObservable();
  }

  public onMultiFeaturesSelected(): Observable<any | undefined> {
    return this.onMultiFeaturesSelected$.asObservable();
  }

  public getSelectedFeature(): string {
    return this.selectedFeatureId;
  }

  public setSelectedFeature(idFeature: string) {
    this.selectedFeatureId = idFeature;
  }

  public setMultiFeaturesSelected(features: any[]): void {
    this.onMultiFeaturesSelected$.next(features);
  }

  public setMultiFeaturesHovered(features: any[]): void {
    this.onMultiFeaturesSelected$.next(features);
  }

  /**
   * The function highlights a hovered feature on a Maplibre map.
   * @param mapLibre - a Maplibre GL map object that represents the map being used
   * @param {string} sourceKey - The key of the source where the feature is located in the Maplibre map.
   * @param {string | undefined} featureId - The ID of the feature that is being hovered over.
   */
  public highlightHoveredFeatures(
    mapLibre: Maplibregl.Map,
    features: MultiSelection[],
    fireEvent: boolean = false
  ): void {

    if (!features && this.multiHover.length > 0) {
      this.multiHover.forEach((sel: MultiSelection) => {
        mapLibre.setFeatureState(
          { source: sel.source, id: sel.id },
          { hover: false }
        );
      });
      this.multiHover = [];
      if (fireEvent) {
        this.onFeatureHovered$.next(undefined);
      }
      return;
    }

    if (features) {
      this.highlightHoveredFeatures(mapLibre, undefined);

      if (this.selectedFeatureId) {
        this.highlightHoveredFeatures(mapLibre, undefined);
      }

      if (features.length === 1 && fireEvent) {
        this.onFeatureHovered$.next(features[0].id);
      }

      features.forEach((f: MultiSelection) => {
        this.multiHover.push(f);
        mapLibre.setFeatureState(
          { source: f.source, id: f.id },
          { hover: true }
        );
      });
    }
  }

  public highlighSelectedFeatures(mapLibre: Maplibregl.Map, features: MultiSelection[], fireEvent = false, e?: Maplibregl.MapMouseEvent) {
    if (!features && this.multiSelection.length > 0) {
      this.multiSelection.forEach((sel: MultiSelection) => {
        mapLibre.setFeatureState(
          { source: sel.source, id: sel.id },
          { selected: false }
        );
      });
      this.multiSelection = [];
      return;
    }

    if (features && !this.isFeatureFiredEvent) {
      this.highlighSelectedFeatures(mapLibre, undefined);

      if (this.selectedFeatureId) {
        this.highlighSelectedFeatures(mapLibre, undefined);
      }

      features.forEach((f: MultiSelection) => {
        this.multiSelection.push(f);
        mapLibre.setFeatureState(
          { source: f.source, id: f.id },
          { selected: true }
        );
      });

      if (fireEvent) {
        if(features && features.length == 1) {
          this.onFeatureSelected$.next({ featureId: features[0].id, layerKey: features[0].source, x: e?.lngLat?.lng, y: e?.lngLat?.lat });
        } else {
          this.onMultiFeaturesSelected$.next(features);
        }
      }
    }
  }

  public removeFeatureFromSelected(mapLibre: Maplibregl.Map, featureId: string): void {
    if (!this.multiSelection || this.multiSelection.length === 0) {
      return;
    }

    const selectionToRemove = this.multiSelection.splice(this.multiSelection.findIndex((m) => m.id === featureId), 1);
    mapLibre.setFeatureState(
      { source: selectionToRemove[0].source, id: selectionToRemove[0].id },
      { selected: false }
    );
  }
}
