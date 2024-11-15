import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Column, ColumnSort, FILTER_CONDITION, FILTER_TEXT_CONDITION, FILTER_TYPE, FilterValueDate, FilterValueNumber, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { FilterResult, FilterTableComponent } from './filter-table/filter-table.component';
import { FilterService } from './filter.service';
import { ValueLabel } from 'src/app/core/models/util.model';
import { DateTime } from 'luxon';

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

  // Show a more info button
  @Input() moreInfoBtn: boolean = false;
  @Output() onMoreInfoBtnPressed: EventEmitter<void> = new EventEmitter();

  // Called when the sort change, return the list of column sort
  @Output() onSortChange: EventEmitter<ColumnSort[]> = new EventEmitter();

  public TypeColumn = TypeColumn;

  constructor(
    private popoverController: PopoverController,
    private filterService: FilterService,
  ) { }

  displayedRows: TableRow<any>[] = [];

  pageSize = 25;
  pageNumber = 1;
  // The paginator needs an unique id, without it all generic table would share the same paginator
  // so if there were a table on a page and one on modal of this page, changing the page on the modal
  // would change the page on the page.
  paginatorId = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    // When the list of column sorted changes
    if (changes['listColumnSort'] != null) {
      // Sort
      this.sortData();
    }

    // When the data changes
    if (changes['rows'] != null) {
      // Filter + Sort
      this.filterData();
    }
  }

  onSelectAll() {
    if (this.selectedRows.length === this.displayedRows.length) {
      this.selectedRows.splice(0, this.selectedRows.length);
    } else {
      this.displayedRows.forEach((f) => {
        if (!this.selectedRows.some((s) => s == f)) {
          this.selectedRows.push(f);
        }
      });
    }
  }

  areAllRowsSelected(): boolean {
    let isSelected: boolean = true;
    if (this.displayedRows.length === 0 || this.selectedRows.length !== this.displayedRows.length) {
      isSelected = false;
    }
    return isSelected;
  }

  areSomeRowsSelected(): boolean {
    return this.selectedRows.length > 0 && !this.areAllRowsSelected();
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

  getColumnStyle(column: Column): string {
    // It set by the width entered
    if (column.width) {
      return 'width:' + column.width + '; min-width: ' + column.width + '; ' + 'max-width: ' + column.width + ';';
    }

    // If no width is enter, it set automatically the width
    if (column.type === TypeColumn.ACTION || column.type === TypeColumn.CHECKBOX) {
      // If action or checkbox, it set to the min-width
      return 'min-width: 60px;';
    } else {
      // Else, it calculates by dividing 100% with the nb of columns
      const nbElements: number = this.columns.filter((col) => col.type !== TypeColumn.ACTION && col.type !== TypeColumn.CHECKBOX).length;
      const width = 100 / nbElements;
      return 'width: ' + width + '%';
    }
  }

  onMoreInfoBtnClicked() {
    this.onMoreInfoBtnPressed.emit();
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
      this.displayedRows = this.displayedRows.sort((a, b) => {
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

  // ### FILTER ### //
  async openFilter(column: Column, event: Event): Promise<void> {
    // If there is no filter set, create it and set its type to 'text' by default
    if (!column.filter) {
      column.filter = {
        type: 'text'
      }
    }

    // For select filter type
    let listSelectItem: ValueLabel[] = [];
    if (column.filter.type === FILTER_TYPE.SELECT) {
      // If no list of values to be displayed has been set
      if (column.filter.listSelectValue == null || column.filter.listSelectValue.length === 0) {
        // Then construct the list
        // Either from the list of elements of the column
        if (column.selectProperties?.elements) {
          listSelectItem = column.selectProperties.elements.map((element) => {
            return {
              value: element[column.selectProperties.key],
              label: column.selectProperties.elementLabelFunction(element),
            }
          })
          .sort((a, b) => {
            return a.label.localeCompare(b.label);
          });
        } else {
          // Or from the list of rows
          // Either only the displayed one or all the rows (if isSelectAllRow = true)
          const listRow = column.filter.isSelectAllRow === true ? this.rows : this.displayedRows;

          listSelectItem = listRow.map((row) => {
            const isEmpty = row.getRawValue()[column.key] == null || row.getRawValue()[column.key] === '';
            return {
              value: row.getRawValue()[column.key],
              label: isEmpty ? '(Vide)' : row.getRawValue()[column.key],
            }
          });

          // Delete duplicates and sort
          let seen = {};
          listSelectItem = listSelectItem.filter((item) => {
            return seen.hasOwnProperty(item.value) ? false : (seen[item.value] = true);
          })
          .sort((a, b) => {
            return a.label.localeCompare(b.label);
          });
        }
      } else {
        listSelectItem = column.filter.listSelectValue;
      }
    }

    const popover = await this.popoverController.create({
      component: FilterTableComponent,
      componentProps: {
        column: column,
        listAllItem: listSelectItem,
      },
      showBackdrop: false,
      event,
      cssClass: 'filter-popover',
    });

    popover.onDidDismiss().then((result) => {
      const filterResult: FilterResult = result['data'];
      if (filterResult != null) {
        column.filter.condition = filterResult.condition;
        column.filter.value = filterResult.value;

        this.filterData();
      }
    });

    await popover.present();
  }

  filterData() {
    let result = this.rows;
    this.columns.forEach((column) => {
      if (column.filter?.value != null) {
        if (column.filter.type === FILTER_TYPE.TEXT) {
          result = this.filterService.filterText(result, column);
        } else if (column.filter.type === FILTER_TYPE.SELECT) {
          result = this.filterService.filterSelect(result, column);
        } else if (column.filter.type === FILTER_TYPE.NUMBER) {
          result = this.filterService.filterNumber(result, column);
        } else if (column.filter.type === FILTER_TYPE.DATE) {
          result = this.filterService.filterDate(result, column);
        }
      }
    });

    this.displayedRows = result;

    // Deselect the rows that are not in the data anymore
    this.selectedRows.forEach((selectedRow, index) => {
      if (!this.displayedRows.some(data => data == selectedRow)) {
        this.selectedRows.splice(index, 1);
      }
    });

    this.sortData();
  }

  getChipValue(column: Column) {
    let chipValue = column.label + ' ';
    // if specific format exist for this colum
    switch (column.filter?.value && column.filter.type) {
      case FILTER_TYPE.SELECT:
        const listFilterValue = column.filter.value as ValueLabel[];
        if (listFilterValue && listFilterValue.length > 0) {
          const textFilterValue = listFilterValue.map((v) => v.label).join(', ');
          chipValue += ': ';
          chipValue += textFilterValue.length > 100 ? textFilterValue.substring(0, 100).concat('...') : textFilterValue;
        }
        break;

      case FILTER_TYPE.TEXT:
        switch (column.filter.condition) {
          case FILTER_CONDITION.EMPTY:
            chipValue += 'est vide';
            break;

          case FILTER_CONDITION.NOT_EMPTY:
            chipValue += "n'est pas vide";
            break;

          default:
            let ftc = FILTER_TEXT_CONDITION.find((ftc) => ftc.value === column.filter.condition);
            if (ftc) {
              chipValue += ftc.label + ": '" + column.filter.value + "'";
            } else {
              chipValue += "'" + column.filter.value + "'";
            }
        }
        break;

      case 'number':
        const start = (column.filter.value as FilterValueNumber).start;
        const end = (column.filter.value as FilterValueNumber).end;

        switch (column.filter.condition) {
          case FILTER_CONDITION.EMPTY:
            chipValue += 'est vide';
            break;

          case FILTER_CONDITION.NOT_EMPTY:
            chipValue += "n'est pas vide";
            break;

          case FILTER_CONDITION.EQUAL:
            chipValue += "est égal à " + start;
            break;

          case FILTER_CONDITION.NOT_EQUAL:
            chipValue += "est différent de " + start;
            break;

          case FILTER_CONDITION.GREATER:
            chipValue += "supérieur à " + start;
            break;

          case FILTER_CONDITION.GREATER_OR_EQUAL:
            chipValue += "inférieur ou égal à " + start;
            break;

          case FILTER_CONDITION.LOWER:
            chipValue += "inférieur à " + end;
            break;

          case FILTER_CONDITION.LOWER_OR_EQUAL:
            chipValue += "inférieur ou égal à " + end;
            break;

          case FILTER_CONDITION.BETWEEN:
            chipValue += "entre " + start + " et " + end;
            break;
        }
        break;

      case 'date':
        const startDate = (column.filter.value as FilterValueDate).start != null ? DateTime.fromFormat((column.filter.value as FilterValueDate).start, 'yyyy-MM-dd').toFormat('dd/MM/yyyy') : null;
        const endDate = (column.filter.value as FilterValueDate).end != null ? DateTime.fromFormat((column.filter.value as FilterValueDate).end, 'yyyy-MM-dd').toFormat('dd/MM/yyyy') : null;

        switch (column.filter.condition) {
          case FILTER_CONDITION.EMPTY:
            chipValue += 'est vide';
            break;

          case FILTER_CONDITION.NOT_EMPTY:
            chipValue += "n'est pas vide";
            break;

          case FILTER_CONDITION.LOWER:
            chipValue += "jusqu'au " + endDate;
            break;

          case FILTER_CONDITION.GREATER:
            chipValue += "à partir du " + startDate;
            break;

          case FILTER_CONDITION.BETWEEN:
            if (startDate == null) {
              chipValue += "jusqu'au " + endDate;
            } else if (endDate == null) {
              chipValue += "à partir du " + startDate;
            } else {
              chipValue += "du " + startDate + " au " + endDate;
            }
            break;
        }

        break;
    }
    return chipValue;
  }

  removeFilter(column: Column) {
    column.filter.value = null;
    column.filter.condition = null;
    this.filterData();
  }

  resetFilters() {
    this.columns.forEach((column) => {
      if (column.filter) {
        column.filter.value = null;
        column.filter.condition = null;
      }
    });

    this.listColumnSort = [];

    this.filterData();
  }

  // ###### //

  // ### PAGINATION ### //
  onPageChange(pageNumber: number) {
    this.pageNumber = pageNumber;
  }
  // ###### //
}
