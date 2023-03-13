import { Style } from 'ol/style.js';
import { FeatureLike } from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { AppDB, ITiles } from './app-db.model';
import { Projection } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT.js';
import * as olLoadingstrategy from 'ol/loadingstrategy';
import Cluster from 'ol/source/Cluster';
import { Subscription } from 'rxjs/internal/Subscription';
import { Layer, layers, LayerTypeEnum } from './layer.model';

export class MapLayer {
  constructor(layerKey: string, style: Style, selectedStyle: Style) {
    const layer: Layer = layers.find((l) => l.key === layerKey)!;

    this.selection = new Set();
    this.layer = new VectorLayer({
      source: this.buildSource(layer),
      minZoom: layer.minZoom,
      zIndex: layer.zindex,
      declutter: true,
        style: (feature: any) => {
        if (this.selection.has(feature)) {
          return selectedStyle;
        }
        if (style.getText() != null) {
          style.getText().setText(feature.get('features').length.toString());
        }
        return style;
      },
    });
  }

  public layer: VectorLayer<any>;
  public selection: Set<FeatureLike>;
  public subscription: Subscription;

  private buildSource(layer: Layer): Vector | Cluster {
    let source = this.createLoader(layer.key);
    switch (layer.type) {
      case LayerTypeEnum.VECTOR:
        break;
      case LayerTypeEnum.CLUSTER:
        source = new Cluster({
          distance: layer.distance,
          minDistance: layer.minDistance,
          source: source,
        });
        break;
    }
    return source;
  }

  private createLoader(
    layerKey: string
  ): Vector | Cluster {
    const db: AppDB = new AppDB();
    const geoJsonAlreadyLoading: string[] = [];
    const source = new Vector({
      format: new GeoJSON(),
      strategy: olLoadingstrategy.bbox,
      loader: async (extent: number[], r: number, p: Projection, success) => {
        const indexTile: ITiles | undefined = await db.tiles.get(
          `index_3857/opt_3857_${layerKey}_index.geojson`
        );
        if (indexTile) {
          JSON.parse(indexTile.data).features.forEach(async (el: any) => {
            const wkt = new WKT();
            const url: string = `data_3857/opt_3857_${layerKey}/${el.properties.file}`;
            const isIn = wkt
              .readFeature(el.properties.bbox)
              .getGeometry()
              ?.intersectsExtent(extent);
            if (isIn && !geoJsonAlreadyLoading.includes(url)) {
              const layerTile: ITiles | undefined = await db.tiles.get(url);
              if (layerTile) {
                const features = source
                  .getFormat()!
                  .readFeatures(JSON.parse(layerTile.data), {
                    dataProjection: 'ESPG:2154',
                    featureProjection: 'EPSG:3857',
                  }) as Feature[];
                source.addFeatures(features);
                geoJsonAlreadyLoading.push(url);
                success!(features);
              }
            }
          });
        }
      }
    });
    return source;
  }
}
