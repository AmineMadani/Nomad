import { Injectable } from '@angular/core';
import { Cell, Row } from '../models/table/column.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor() {}

  public createReadOnlyRowsFromObjects<T>(objects: T[]): Row<T>[] {
    return objects.map(object => {
      const controls = {};
      for (const key of Object.keys(object)) {
        controls[key] = new Cell(object[key]);
      }
      return new Row(controls);
    });
  }
}
