// db.ts
import Dexie from 'dexie';
import { GeoJSONObject, NomadGeoJson } from './geojson.model';
import { LayerReferences } from './layer.model';
import { Observable, from, of, switchMap, tap } from 'rxjs';

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

export interface IDraftWko {
  key: string,
  data: any;
}

export class AppDB extends Dexie {
  constructor() {
    super('nomad');
    this.version(3).stores({
        tiles: 'key',
        indexes: 'key',
        layerReferences: 'key',
        referentials: 'key',
        workorders: 'key',
        draftwko: 'key'
    });
  }

  tiles: Dexie.Table<ITiles, string>;
  indexes: Dexie.Table<IIndexes, string>;
  layerReferences: Dexie.Table<ILayerReferences, string>;
  referentials: Dexie.Table<any, string>;
  workorders: Dexie.Table<any, string>;
  draftwko: Dexie.Table<IDraftWko, string>;
}

export const db = new AppDB();
