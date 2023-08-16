import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})
export class GenericTableComponent implements OnInit {

  @Input() columns: Column[] = [];
  @Input() toolbar?: TableToolbar;

  @Input() rows: TableRow<any>[] = [];
  @Input() selectedRows: TableRow<any>[] = [];

  // List of column sort to sort the table with - Optional
  @Input() listColumnSort: ColumnSort[] = [];

  // Called when the sort change, return the list of column sort
  @Output() onSortChange: EventEmitter<ColumnSort[]> = new EventEmitter();

  public TypeColumn = TypeColumn;

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    // When the list of column sorted changes
    if (changes['listColumnSort'] != null) {
      // Sort
      this.sortData();
    }

    // When the data changes
    if (changes['rows'] != null) {
      // Sort
      this.sortData();
    }
  }

  onSelectAll() {
    if (this.selectedRows.length === this.rows.length) {
      this.selectedRows.splice(0, this.selectedRows.length);
    } else {
      this.rows.forEach((f) => {
        if (!this.selectedRows.some((s) => s == f)) {
          this.selectedRows.push(f);
        }
      });
    }
  }

  isAllRowsSelected(): boolean {
    let isSelected: boolean = true;
    if (this.rows.length === 0 || this.selectedRows.length !== this.rows.length) {
      isSelected = false;
    }
    return isSelected;
  }

  onRowSelect(row: TableRow<any>) {
    const index = this.selectedRows.findIndex(data => data == row);
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
  }

  isRowSelected(row: TableRow<any>) {
    return this.selectedRows.find((data) => data == row);
  }

  // ### SORT ### //
  getSortDirection(key: string): string {
    return this.listColumnSort.find((columnSort) => columnSort.key === key)?.direction;
  }

  getSortNumber(key: string) : number {
    return this.listColumnSort.findIndex((columnSort) => columnSort.key === key) + 1;
  }

  onSort(key: string) {
    let columnSort = this.listColumnSort.find((columnSort) => columnSort.key === key);
    if (columnSort) {
      // Change from asc to desc
      // Or from desc to none
      if (columnSort.direction === 'asc') columnSort.direction = 'desc';
      else this.listColumnSort = this.listColumnSort.filter((columnSort) => columnSort.key !== key);
    } else {
      this.listColumnSort.push({key: key, direction: 'asc'});
    }

    this.sortData();

    this.onSortChange.emit(this.listColumnSort);
  }

  sortData() {
    if (this.listColumnSort.length > 0) {
      this.rows = this.rows.sort((a, b) => {
        let returnValue = 0;

        const objectA = a.getRawValue();
        const objectB = b.getRawValue();

        this.listColumnSort.forEach((columnSort) => {
          if (returnValue === 0) {
            let aValue = objectA[columnSort.key];
            let bValue = objectB[columnSort.key];

            if (typeof aValue === "string") aValue = aValue.toLowerCase();
            if (typeof bValue === "string") bValue = bValue.toLowerCase();

            let column = this.columns.find((column) => column.key === columnSort.key);
            if (column && column.sortOptions?.getSortItem) {
              aValue = column.sortOptions?.getSortItem(a[columnSort.key]);
              bValue = column.sortOptions?.getSortItem(b[columnSort.key]);
            }

            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';

            if (aValue > bValue) returnValue = 1;
            else if (aValue < bValue) returnValue = -1;

            if (columnSort.direction === 'desc') returnValue = returnValue * -1;
          }
        });

        return returnValue;
      });
    }
  }

  // ####### //
}
