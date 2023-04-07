import { Injectable } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import Feature from 'ol/Feature';
import { finalize, map } from 'rxjs';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(
    private mapService: MapService,
    private layerService: LayerService,
    private expDataservice: ExploitationDataService
  ) {}

  private data: Map<string, MapFeature[]> = new Map();

  public getData(key: string): any | undefined {
    const features = this.data.get(key);
    if (features && features.length > 0) {
      return this.data.get(key);
    } else {
      return this.layerService.getFeaturesInView(key);
    }
  }

  public setToggleData(key: string, toogle: boolean): void {
    if (!toogle) {
      this.mapService.removeEventLayer(key);
      this.expDataservice
        .getFeaturePagination(key, 20, 0)
        .subscribe((features: MapFeature[]) => {
          this.data.set(key, features);
        });
    } else {
      this.mapService.addEventLayer(key).then(() => {
        this.data.delete(key);
      })
    }
  }

  public updateData(key: string, ev?: InfiniteScrollCustomEvent): void {
    let features = this.data.get(key);
    if (features) {
      this.expDataservice
        .getFeaturePagination(key, 20, features.length)
        .pipe(finalize(() => ev?.target.complete()))
        .subscribe((f: MapFeature[]) => {
          features = [...features!, ...f];
          this.data.set(key, features);
        });
    }
  }
}
