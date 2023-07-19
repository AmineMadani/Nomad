import { Component, Input, OnInit } from '@angular/core';
import { Column, TypeColumn } from 'src/app/core/models/column.model';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})
export class GenericTableComponent implements OnInit {

  @Input() columns: Column[] = [];

  @Input() data: any[] = [];
  @Input() selectedData: any[] = [];

  public TypeColumn = TypeColumn;

  constructor() { }

  ngOnInit() { }

  onSelectAll() {
    if (this.selectedData.length === this.data.length) {
      this.selectedData = [];
    } else {
      this.selectedData = [...this.data];
    }
  }

  isAllRowsSelected() {
    return this.selectedData.length === this.data.length;
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
