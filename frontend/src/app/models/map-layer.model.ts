import { FeatureLike } from 'ol/Feature';
import BaseLayer from 'ol/layer/Base';
import { Subscription } from 'rxjs'
import VectorTileLayer from 'ol/layer/VectorTile.js';

export class MapLayer {
    constructor() {
        this.selection = new Set(); 
    }

    public layer: VectorTileLayer;
    public selection: Set<FeatureLike>;
    public subscription: Subscription;
}