import { Injectable } from '@angular/core';
import { TableCell, TableRow, TableRowArray } from '../models/table/column.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor() {}

  public createReadOnlyRowsFromObjects<T>(objects: T[]): TableRow<T>[] {
    return objects.map(object => {
      const controls = {};
      for (const key of Object.keys(object)) {
        controls[key] = new TableCell({
          value: object[key],
        });
      }
      return new TableRow(controls);
    });
  }
}
