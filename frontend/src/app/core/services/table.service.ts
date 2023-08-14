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
        controls[key] = new TableCell(object[key]);
      }
      return new TableRow(controls);
    });
  }


  private subscribedRows: Set<number> = new Set();
  /**
   * Add a listener to a specific field in every row.
   * @param column The column to watch.
   * @param callback The function to call when the field changes.
   */
  listenToColumnChanges(table: TableRowArray<any>, column: string, callback: (value: any, row: TableRow<any>, index: number) => void) {
    // Watch for changes to the table itself
    table.valueChanges.subscribe(() => {
      table.controls.forEach((row: TableRow<any>, index: number) => {
        // Check if we've already subscribed to this row
        if (!this.subscribedRows.has(index)) {
          // Mark this row as subscribed
          this.subscribedRows.add(index);

          // Watch for changes to the specific field
          row.get(column as string).valueChanges.subscribe(value => {
            callback(value, row, index);
          });
        }
      });
    });
  }
}
