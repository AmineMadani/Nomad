import { Subscription } from 'rxjs';
import { Layer, LayerStyleDefinition } from './layer.model';
import * as Maplibregl from 'maplibre-gl';

export class MaplibreLayer {
  constructor(
    layerConfiguration : Layer,
    map : Maplibregl.Map
  ) {
    this.configurations = layerConfiguration ;
    this.source = this.buildSource();
    if(layerConfiguration.listStyle) {
      this.style = this.buildStyle(map, layerConfiguration.listStyle);
    }
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

  private buildStyle(map : Maplibregl.Map, lLayerStyle: LayerStyleDefinition[]): any[] {
    let styles:any[] = [];
    for(let layerStyle of lLayerStyle){
      let transformStyle = JSON.parse(layerStyle.definition);
      let nb = 0;
      for(let style of transformStyle) {
        if(nb == 0){
          style.id = layerStyle.code;
        } else {
          style.id = layerStyle.code+'_'+nb;
        }
        nb++;
      }
      styles = styles.concat(transformStyle);
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

    return styles;
  }

}
