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

  public setFeatureHovered(feature: Feature | undefined): void {
    this.featureHovered$.next(feature);
  }

  public getFeatureHoverd(): Observable<Feature | undefined> {
    return this.featureHovered$.asObservable();
  }
}
