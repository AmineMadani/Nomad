import { Style } from 'ol/style.js';
import { FeatureLike } from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as olLoadingstrategy from 'ol/loadingstrategy';
import Cluster from 'ol/source/Cluster';
import { Subscription } from 'rxjs/internal/Subscription';
import { Layer, layers, LayerTypeEnum } from './layer.model';

export class MapLayer {
  constructor(layerKey: string, style: Style, selectedStyle: Style) {
    const layer: Layer = layers.find((l) => l.key === layerKey)!;
    this.key = layerKey;
    this.hoverFeature = new Set();
    this.equipmentSelected = undefined;
    this.hoverId = undefined;
    this.subscription = new Subscription();

    this.layer = new VectorLayer({
      source: this.buildSource(layer),
      minZoom: layer.minZoom,
      zIndex: layer.zindex,
      declutter: true,
      style: (feature: FeatureLike) => {
        if (
          this.hoverFeature.has(feature) ||
          feature.getId() === this.featureHighlighted
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

  public key: string;
  public layer: VectorLayer<any>;
  public hoverFeature: Set<FeatureLike>;
  public equipmentSelected: any | undefined;
  public featureHighlighted: string | undefined;
  public subscription: Subscription;
  public source: Cluster | Vector;
  public hoverId: string | undefined;

  public highlightFeature(featureId: string): void {
    //console.log(`before ${this.featureHighlighted}, ${featureId}`);
    if (!this.featureHighlighted || this.featureHighlighted !== featureId) {
      this.featureHighlighted = featureId;
    } else {
      this.featureHighlighted = undefined;
    }
    //console.log(`after ${this.featureHighlighted}, ${featureId}`);
    this.layer.changed();
  }

  private buildSource(layer: Layer): Vector | Cluster {
    let source = new Vector({
      format: new GeoJSON(),
      strategy: olLoadingstrategy.bbox
    });
    this.source = source;
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
}
