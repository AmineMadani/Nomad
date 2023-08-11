import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Column, Row, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})
export class GenericTableComponent implements OnInit {

  @Input() columns: Column[] = [];
  @Input() toolbar?: TableToolbar;

  @Input() rows: Row<any>[] = [];
  @Input() selectedRows: Row<any>[] = [];

  public TypeColumn = TypeColumn;

  constructor() { }

  ngOnInit() { }

  onSelectAll() {
    if (this.selectedRows.length === this.rows.length) {
      this.selectedRows.splice(0, this.selectedRows.length);
    } else {
      this.rows.forEach((f) => {
        if (!this.selectedRows.some((s) => s == f)) {
          this.selectedRows.push(f);
        }
      })
    }
  }

  isAllRowsSelected(): boolean {
    let isSelected: boolean = true;
    if (this.rows.length === 0 || this.selectedRows.length !== this.rows.length) {
      isSelected = false;
    }
    return isSelected;
  }

  onRowSelect(row: Row<any>) {
    const index = this.selectedRows.findIndex(data => data == row);
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
  }

  isRowSelected(row: FormGroup) {
    return this.selectedRows.find((data) => data == row);
  }
}
