// db.ts
import Dexie, { Table } from 'dexie';

export interface IIndexes {
  key: string;
  data: string;
}

export interface ITiles {
  key: string;
  data: string;
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