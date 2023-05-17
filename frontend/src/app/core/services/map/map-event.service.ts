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

  private onMapResize$: Subject<void> = new Subject();
  private onFeatureHovered$: Subject<string | undefined> = new Subject();
  private onFeatureSelected$: Subject<string | undefined> = new Subject();

  constructor() {}

  public onMapResize(): Observable<void> {
    return this.onMapResize$.asObservable();
  }
  public setMapResize(): void {
    this.onMapResize$.next();
  }

  public onFeatureHovered(): Observable<string | undefined> {
    return this.onFeatureHovered$.asObservable();
  }

  public onFeatureSelected(): Observable<string | undefined> {
    return this.onFeatureSelected$.asObservable();
  }

  public highlightSelectedFeature(
    mapLibre: Maplibregl.Map,
    layerKey: string,
    featureId: string | undefined
  ): void {
    if (this.selectedFeatureId && this.selectedFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: this.selectedLayer, id: this.selectedFeatureId },
        { selected: false }
      );
      this.selectedFeatureId = undefined;
      this.selectedLayer = undefined;
    }

    if (featureId && this.selectedFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: layerKey, id: featureId },
        { selected: true }
      );
      this.selectedFeatureId = featureId;
      this.selectedLayer = layerKey;

    } else if (!featureId && this.selectedFeatureId) {
      mapLibre.setFeatureState(
        { source: this.selectedLayer, id: this.selectedFeatureId },
        { selected: false }
      );
      this.selectedFeatureId = undefined;
      this.selectedLayer = undefined;
    }
  }

  public highlightHoveredFeature(
    mapLibre: Maplibregl.Map,
    layerKey: string,
    featureId: string | undefined
  ): void {
    if (this.hoveredFeatureId && this.hoveredFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: this.hoveredLayer, id: this.hoveredFeatureId },
        { hover: false }
      );
      this.hoveredFeatureId = undefined;
      this.hoveredLayer = undefined;
    }

    if (featureId && this.hoveredFeatureId !== featureId) {
      mapLibre.setFeatureState(
        { source: layerKey, id: featureId },
        { hover: true }
      );
      this.hoveredFeatureId = featureId;
      this.hoveredLayer = layerKey;

    } else if (!featureId && this.hoveredFeatureId) {
      mapLibre.setFeatureState(
        { source: this.hoveredLayer, id: this.hoveredFeatureId },
        { hover: false }
      );
      this.hoveredFeatureId = undefined;
      this.hoveredLayer = undefined;
    }
  }
}
