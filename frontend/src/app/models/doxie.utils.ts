// db.ts
import Dexie, { Table } from 'dexie';

export interface ITiles {
  key: string;
  data: Blob;
}

export class AppDB extends Dexie {
  constructor() {
    super('nextcanope');
    this.version(1).stores({
        tiles: 'key'
    });
  }

  tiles: Dexie.Table<ITiles, string>;
}

export const db = new AppDB();