import { Component, Input, OnInit } from '@angular/core';
import { Column, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})
export class GenericTableComponent implements OnInit {

  @Input() columns: Column[] = [];
  @Input() toolbar?: TableToolbar;

  @Input() data: any[] = [];
  @Input() selectedData: any[] = [];

  public TypeColumn = TypeColumn;

  constructor() { }

  ngOnInit() { }

  onSelectAll() {
    if (this.selectedData.length === this.data.length) {
      this.selectedData.splice(0, this.selectedData.length);
    } else {
      this.data.forEach((d) => {
        if (!this.selectedData.some((s) => s == d)) {
          this.selectedData.push(d);
        }
      })
    }
  }

  isAllRowsSelected(): boolean {
    let isSelected: boolean = true;
    if (this.data.length === 0 || this.selectedData.length !== this.data.length) {
      isSelected = false;
    }
    return isSelected;
  }

  onRowSelect(row: any) {
    const index = this.selectedData.findIndex(data => data == row);
    if (index === -1) {
      this.selectedData.push(row);
    } else {
      this.selectedData.splice(index, 1);
    }
  }

  isRowSelected(row: any) {
    return this.selectedData.find((data) => data == row);
  }
}
