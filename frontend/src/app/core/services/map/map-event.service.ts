import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import Feature from 'ol/Feature';

@Injectable({
  providedIn: 'root',
})
export class MapEventService {
  private featureHovered$: Subject<Feature | undefined> = new Subject();

  constructor() {}

  /**
   * Sets the Feature that is currently being hovered over on the map.
   * @param {Feature | undefined} feature The Feature that is currently being hovered over on the map.
   */
  public setFeatureHovered(feature: Feature | undefined): void {
    this.featureHovered$.next(feature);
  }

  /**
   * Returns an Observable of the Feature that is currently being hovered over on the map.
   * @returns {Observable<Feature | undefined>} An Observable of the Feature that is currently being hovered over on the map.
   */
  public getFeatureHoverd(): Observable<Feature | undefined> {
    return this.featureHovered$.asObservable();
  }
}
