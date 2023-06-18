import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import * as Maplibregl from 'maplibre-gl';

interface MultiSelection { source: string, id: string }

@Injectable({
  providedIn: 'root',
})
export class MapEventService {
  private hoveredFeatureId: string | undefined;
  private selectedFeatureId: string | undefined;

  private hoveredLayer: string;
  private selectedLayer: string;

  private multiSelection: MultiSelection[] = [];

  private onFeatureHovered$: Subject<string | undefined> = new Subject();
  private onFeatureSelected$: Subject<string | undefined> = new Subject();

  constructor() {}

  public onFeatureHovered(): Observable<string | undefined> {
    return this.onFeatureHovered$.asObservable();
  }

  public onFeatureSelected(): Observable<string | undefined> {
    return this.onFeatureSelected$.asObservable();
  }

  public getSelectedFeature() : string {
    return this.selectedFeatureId;
  }

  public setSelectedFeature(idFeature : string){
    this.selectedFeatureId = idFeature;
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
    featureId: string | undefined,
    fireEvent: boolean = true
  ): void {
    if (this.selectedFeatureId && this.selectedFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: this.selectedLayer, id: this.selectedFeatureId },
        { selected: false }
      );
      this.selectedFeatureId = undefined;
      this.selectedLayer = undefined;
      if (fireEvent) {
        this.onFeatureSelected$.next(undefined);
      }
    }

    if (featureId && this.selectedFeatureId !== featureId) {
      if (this.multiSelection.length > 0) {
        this.highlighSelectedFeatures(mapLibre, undefined);
      }
      mapLibre.setFeatureState(
        { source: sourceKey, id: featureId },
        { selected: true }
      );
      this.selectedFeatureId = featureId;
      this.selectedLayer = sourceKey;
      if (fireEvent) {
        this.onFeatureSelected$.next(featureId);
      }

    } else if (!featureId && this.selectedFeatureId) {
      mapLibre.setFeatureState(
        { source: this.selectedLayer, id: this.selectedFeatureId },
        { selected: false }
      );
      this.selectedFeatureId = undefined;
      this.selectedLayer = undefined;
      if (fireEvent) {
        this.onFeatureSelected$.next(undefined);
      }
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
    featureId: string | undefined,
    fireEvent: boolean = true
  ): void {
    if (this.hoveredFeatureId && this.hoveredFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: this.hoveredLayer, id: this.hoveredFeatureId },
        { hover: false }
      );
      this.hoveredFeatureId = undefined;
      this.hoveredLayer = undefined;
      if (fireEvent) {
        this.onFeatureHovered$.next(undefined);
      }
    }

    if (featureId && this.hoveredFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: sourceKey, id: featureId },
        { hover: true }
      );
      this.hoveredFeatureId = featureId;
      this.hoveredLayer = sourceKey;
      if (fireEvent) {
        this.onFeatureHovered$.next(featureId);
      }

    } else if (!featureId && this.hoveredFeatureId) {
      mapLibre.setFeatureState(
        { source: this.hoveredLayer, id: this.hoveredFeatureId },
        { hover: false }
      );
      this.hoveredFeatureId = undefined;
      this.hoveredLayer = undefined;
      if (fireEvent) {
        this.onFeatureHovered$.next(undefined);
      }
    }
  }

  public highlighSelectedFeatures(mapLibre: Maplibregl.Map, features: MultiSelection[]) {
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

    if (features) {
      this.highlighSelectedFeatures(mapLibre, undefined);

      if (this.selectedFeatureId) {
        this.highlightSelectedFeature(mapLibre, undefined, undefined);
      }

      features.forEach((f: MultiSelection) => {
        this.multiSelection.push(f);
        mapLibre.setFeatureState(
          { source: f.source, id: f.id },
          { selected: true }
        );
      });
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
