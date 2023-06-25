import { Subscription } from 'rxjs';
import { Layer, LayerStyle } from './layer.model';
import * as Maplibregl from 'maplibre-gl';

export class MaplibreLayer {
  constructor(
    layerConfiguration : Layer,
    map : Maplibregl.Map
  ) {
    this.configurations = layerConfiguration ;
    this.source = this.buildSource();
    this.style = this.buildStyle(map, layerConfiguration.listStyle);
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

  private buildStyle(map : Maplibregl.Map, lLayerStyle: LayerStyle[]): any[] {
    let style:any[] = [];
    for(let layerStyle of lLayerStyle){
      style = style.concat(JSON.parse(layerStyle.definition));
      for(let img of layerStyle.listImage){
        if(!map.hasImage(img.code)) {
          map.loadImage(img.source, (error, image) => {
            if (!error) {
              map.addImage(img.code, image);
            }
          });
        }
      }
    }

    return style;
  }

}
