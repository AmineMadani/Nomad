// db.ts
import Dexie from 'dexie';
import { NomadGeoJson } from './geojson.model';

export interface ITiles {
  key: string;
  data: NomadGeoJson;
}

export class AppDB extends Dexie {
  constructor() {
    super('nomad');
    this.version(3).stores({
        tiles: 'key',
        referentials: 'key',
        workorders: 'key'
    });
  }

  tiles: Dexie.Table<ITiles, string>;
  referentials: Dexie.Table<any, string>;
  workorders: Dexie.Table<any, string>;
}

export const db = new AppDB();
