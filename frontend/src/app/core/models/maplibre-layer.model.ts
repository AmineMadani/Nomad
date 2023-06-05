import { Subscription } from 'rxjs';
import { Layer } from './layer.model';

export class MaplibreLayer {
  constructor(layerConfiguration : Layer
    ) {
    this.configurations = layerConfiguration ;
    this.source = this.buildSource();
    this.style = JSON.parse(layerConfiguration.lyrStyle);

    this.subscriptions = new Subscription();
  }

  public source: any;
  public style: any[];
  public configurations: Layer;
  public subscriptions: Subscription;

  private buildSource(): any {
    return {
      type: 'geojson',
      promoteId: 'id',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    };
  }

}
