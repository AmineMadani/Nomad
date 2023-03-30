import { Style } from 'ol/style.js';
import { FeatureLike } from 'ol/Feature';
import { AppDB } from './app-db.model';
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
import { Equipment } from './equipment.model';
import { environment } from 'src/environments/environment';

export class MapLayer {
  constructor(layerKey: string, style: Style, selectedStyle: Style) {
    this.db = new AppDB();

    const layer: Layer = layers.find((l) => l.key === layerKey)!;

    this.hoverFeature = new Set();
    this.equipmentSelected = undefined;
    this.layer = new VectorLayer({
      source: this.buildSource(layer),
      minZoom: layer.minZoom,
      zIndex: layer.zindex,
      declutter: true,
      style: (feature: any) => {
        const properties = feature.getProperties();
        if (
          this.hoverFeature.has(feature) ||
          (properties &&
            this.equipmentSelected &&
            properties['id'] == this.equipmentSelected.id)
        ) {
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
  public hoverFeature: Set<FeatureLike>;
  public equipmentSelected: Equipment | undefined;
  public subscription: Subscription;

  private db: AppDB;

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

  private createLoader(layerKey: string): Vector | Cluster {
    const geoJsonAlreadyLoading: string[] = [];
    const wkt = new WKT();
    const source = new Vector({
      format: new GeoJSON(),
      strategy: olLoadingstrategy.bbox,
      loader: async (extent: number[], r: number, p: Projection, success) => {
        let fileToLoad: string;
        const index = await this.getIndex(layerKey);
        index.features.forEach(async (el: any) => {
          const file: string = el.properties.file;
          const isIn = wkt
            .readFeature(el.properties.bbox)
            .getGeometry()
            ?.intersectsExtent(extent);
          if (isIn && !geoJsonAlreadyLoading.includes(file)) {
            fileToLoad = file;
            const tile = await this.getTile(layerKey, file);
            if(tile.features?.length > 0) {
              const features = source
              .getFormat()!
              .readFeatures(tile) as Feature[];
            source.addFeatures(features);
            geoJsonAlreadyLoading.push(fileToLoad);
            success!(features);
            } else {
              console.log(`Aucune donnée pour ${layerKey} sur cette zone`);
            }
          }
        });
      },
    });
    return source;
  }

  private async getIndex(layerKey: string): Promise<any> {
    const index = await this.db.indexes.get(layerKey);
    if (index) {
      return index.data;
    }
    const req = await this.fetchFile(`${environment.apiUrl}patrimony/${layerKey}`);
    if (!req.ok) {
      throw new Error(`Failed to fetch index for ${layerKey}`);
    }
    const res = await req.json();
    await this.db.indexes.put({ data: res, key: layerKey }, layerKey);
    return res;
  }

  private async getTile(layerKey: string, file: string): Promise<any> {
    const tile = await this.db.tiles.get(file);
    if (tile) {
      return tile.data;
    }
    const featureNumber: number = +file.match(new RegExp(`${layerKey}_(\\d+)\\.geojson`))![1];
    const req = await this.fetchFile(`${environment.apiUrl}patrimony/${layerKey}/${featureNumber}`);
    if (!req.ok) {
      throw new Error(`Failed to fetch index for ${layerKey}`);
    }
    const res = await req.json();
    await this.db.tiles.put({ data: res, key: file }, file);
    return res;
  }

  private async fetchFile(url: string): Promise<Response> {
    return await fetch(url, {
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      },
    });
  }
}
