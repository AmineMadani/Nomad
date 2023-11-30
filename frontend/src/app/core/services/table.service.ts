import { Injectable } from '@angular/core';
import { TableCell, TableRow } from '../models/table/column.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor() {}

  public createReadOnlyRowsFromObjects<T>(objects: T[]): TableRow<T>[] {
    return objects.map(object => {
      const controls = {};
      for (const key of Object.keys(object)) {
        controls[key] = new TableCell(object[key]);
      }
      const row = new TableRow<T>(controls);
      row.disable();
      return row;
    });
  }
}
