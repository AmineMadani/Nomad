import { Style } from 'ol/style.js';
import Feature, { FeatureLike } from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as olLoadingstrategy from 'ol/loadingstrategy';
import Cluster from 'ol/source/Cluster';
import { Subscription } from 'rxjs/internal/Subscription';
import { Layer, layers, LayerTypeEnum } from './layer.model';
import { Equipment } from './equipment.model';

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
        if(this.isFilteredFeature(feature)) {
          return undefined;
        }
        if (
          this.hoverFeature.has(feature) ||
          feature.getId()?.toString() === this.featureHighlighted
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
  public equipmentSelected: Equipment | undefined;
  public featureHighlighted: string | undefined;
  public subscription: Subscription;
  public source: Cluster | Vector | undefined;
  public hoverId: string | undefined;
  public filteredFeatured: Map<string, string[]> | undefined;

  public highlightFeature(featureId: string): void {
    if (!this.featureHighlighted || this.featureHighlighted !== featureId) {
      this.featureHighlighted = featureId;
    } else {
      this.featureHighlighted = undefined;
    }
    this.layer.changed();
  }

  private buildSource(layer: Layer): Vector | Cluster {
    this.source = new Vector({
      format: new GeoJSON(),
      strategy: olLoadingstrategy.bbox
    });
    switch (layer.type) {
      case LayerTypeEnum.VECTOR:
        break;
      case LayerTypeEnum.CLUSTER:
        this.source = new Cluster({
          distance: layer.distance,
          minDistance: layer.minDistance,
          source: this.source,
        });
        break;
    }
    return this.source;
  }

  private isFilteredFeature(feature: FeatureLike): boolean {
    let isHide = false;
    if(this.filteredFeatured && this.filteredFeatured?.size > 0) {
      isHide = !this.onFilterFeature(feature, this.filteredFeatured);
    }
    return isHide;
  }

  public onFilterFeature(feature: Feature | FeatureLike, filters: Map<string, string[]>): boolean{
    let isInFilter = true;
    let oneDateOk: 'nc' | 'true' | 'false' = 'nc';
    for(let item of filters) {
      if(item[0].includes('date')){
        if(oneDateOk == 'nc'){
          oneDateOk='false';
        }
        if(oneDateOk == 'false' && feature.getProperties()[item[0]]) {
          if(item[1][0] != 'none' && item[1][1] != 'none') {
            const startDate = new Date(item[1][0]);
            const endDate = new Date(item[1][1]);
            const dateFeature = new Date(feature.getProperties()[item[0]]);
            if((dateFeature.getTime() < startDate.getTime())
              || (dateFeature.getTime() > endDate.getTime())) {
                oneDateOk='false';
            } else {
              oneDateOk='true';
            }
          }
        }
      } else {
        if(!item[1].includes(feature.getProperties()[item[0]])){
          isInFilter=false;
        }
      }
    }
    if(oneDateOk == 'nc'){
      oneDateOk = 'true'
    }
    return isInFilter && (oneDateOk == 'true');
  }
}
