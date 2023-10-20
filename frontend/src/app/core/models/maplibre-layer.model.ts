import { Subscription } from 'rxjs';
import { Layer, LayerStyleDetail } from './layer.model';
import * as Maplibregl from 'maplibre-gl';

export class MaplibreLayer {
  constructor(layerConfiguration: Layer, map: Maplibregl.Map) {
    this.configurations = layerConfiguration;
    this.source = this.buildSource();
    if (layerConfiguration.listStyle) {
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

  private buildStyle(
    map: Maplibregl.Map,
    lLayerStyle: LayerStyleDetail[]
  ): any[] {
    let styles: any[] = [];
    for (let layerStyle of lLayerStyle) {
      let transformStyle = JSON.parse(layerStyle.sydDefinition);
      let cluster = transformStyle.find((element) =>
        element.id?.includes('-cluster')
      );
      if (cluster) {
        transformStyle = transformStyle.filter(
          (element) => !element.id?.includes('-cluster')
        );
        this.source = { ...this.source, ...cluster.params };
      }
      let nb = 0;
      for (let style of transformStyle) {
        if (nb == 0) {
          style.id = layerStyle.lseCode;
          style.metadata = cluster ? 'cluster' : null;
        } else {
          style.id = layerStyle.lseCode + '_' + nb;
        }
        nb++;
      }
      styles = styles.concat(transformStyle);
      for (let img of layerStyle.listImage) {
        if (!map.hasImage(img.code)) {
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
