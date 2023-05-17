// db.ts
import Dexie from 'dexie';
import { GeoJSONObject, NomadGeoJson } from './geojson.model';
import { LayerReferences } from './layer-references.model';

export interface IIndexes {
  key: string;
  data: GeoJSONObject;
}

export interface ITiles {
  key: string;
  data: NomadGeoJson;
}

export const layerReferencesKey = 'layerReferences';
export interface ILayerReferences {
  key: string;
  data: LayerReferences[];
}

export class AppDB extends Dexie {
  constructor() {
    super('nextcanope');
    this.version(1).stores({
        tiles: 'key',
        indexes: 'key',
        layerReferences: 'key'
    });
  }

  tiles: Dexie.Table<ITiles, string>;
  indexes: Dexie.Table<IIndexes, string>;
  layerReferences: Dexie.Table<ILayerReferences, string>;
}

export const db = new AppDB();
