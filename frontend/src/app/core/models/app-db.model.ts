// db.ts
import Dexie from 'dexie';
import { GeoJSONObject } from './geojson.model';

export interface IIndexes {
  key: string;
  data: GeoJSONObject;
}

export interface ITiles {
  key: string;
  data: GeoJSONObject;
}

export class AppDB extends Dexie {
  constructor() {
    super('nextcanope');
    this.version(1).stores({
        tiles: 'key',
        indexes: 'key'
    });
  }

  tiles: Dexie.Table<ITiles, string>;
  indexes: Dexie.Table<IIndexes, string>;
}

export const db = new AppDB();