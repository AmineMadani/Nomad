import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonInput, PopoverController } from '@ionic/angular';
import { Column, FILTER_DATE_CONDITION, FILTER_NUMBER_CONDITION, FILTER_TEXT_CONDITION, FILTER_CONDITION, TypeColumn, FILTER_TYPE, FilterValueNumber, FilterValueDate } from 'src/app/core/models/table/column.model';
import { ValueLabel } from 'src/app/core/models/util.model';

export interface FilterResult {
  condition: FILTER_CONDITION,
  value: string | FilterValueNumber | FilterValueDate | ValueLabel[];
}

@Component({
  selector: 'app-filter-table',
  templateUrl: './filter-table.component.html',
  styleUrls: ['./filter-table.component.scss'],
})
export class FilterTableComponent implements OnInit {

  @Input() column: Column;
  @Input() listAllItem: ValueLabel[] = [];

  @ViewChild("filterTextValueInput") filterTextValueInput: IonInput;
  @ViewChild("filterSelectSearchValueInput") filterSelectSearchValueInput: IonInput;
  @ViewChild("filterNumberStartValueInput") filterNumberStartValueInput: IonInput;
  @ViewChild("filterNumberEndValueInput") filterNumberEndValueInput: IonInput;

  TypeColumn = TypeColumn;

  FILTER_CONDITION = FILTER_CONDITION;
  FILTER_TYPE = FILTER_TYPE;
  
  FILTER_TEXT_CONDITION = FILTER_TEXT_CONDITION;
  FILTER_NUMBER_CONDITION = FILTER_NUMBER_CONDITION;
  FILTER_DATE_CONDITION = FILTER_DATE_CONDITION;

  filterType: string = 'text';

  // ### TEXT ### //
  selectedFilterTextCondition = FILTER_CONDITION.IN;
  filterTextValue = "";
  // ###### //

  // ### FILTER ### //
  listItem: ValueLabel[] = [];
  listSelectedItem: ValueLabel[] = [];
  // ###### //

  // ### NUMBER ### //
  selectedFilterNumberCondition = FILTER_CONDITION.EQUAL;
  filterValueNumber: FilterValueNumber = {
    start: null,
    end: null,
  };
  // ###### //

  // ### DATE ### //
  selectedFilterDateCondition = FILTER_CONDITION.BETWEEN;
  filterValueDate: FilterValueDate = {
    start: null,
    end: null,
  };
  // ###### //

  constructor(
    private popoverController: PopoverController,
  ) { }

  ngOnInit() {
    this.filterType = this.column.filter.type;

    if (this.filterType === FILTER_TYPE.TEXT) {
      this.selectedFilterTextCondition = this.column.filter.condition ?? FILTER_CONDITION.IN;
      this.filterTextValue = this.column.filter.value as string;

      // Timeout to wait for the page to load
      setTimeout(() => {this.filterTextValueInput.setFocus()}, 100);
    } else if (this.filterType === FILTER_TYPE.SELECT) {
      this.listItem = this.listAllItem;
      this.listSelectedItem = (this.column.filter.value as ValueLabel[] ?? []).slice();

      // Timeout to wait for the page to load
      setTimeout(() => {this.filterSelectSearchValueInput.setFocus()}, 100);
    } else if (this.filterType === FILTER_TYPE.NUMBER) {
      this.selectedFilterNumberCondition = this.column.filter.condition ?? FILTER_CONDITION.EQUAL;
      this.filterValueNumber.start = (this.column.filter.value as FilterValueNumber)?.start;
      this.filterValueNumber.end = (this.column.filter.value as FilterValueNumber)?.end;

      // Timeout to wait for the page to load
      setTimeout(() => {this.filterNumberStartValueInput.setFocus()}, 100);
    }    
  }

  // ### SELECT ### //
  onSelectSearchInput(event: any) {
    const value = event.target!.value;

    // Filter the list of items displayed
    this.listItem = this.listAllItem.filter((item) => {
      if (value != null && value !== '') {
        let filterNormalize = String.removeAccents(value).toLowerCase();
        let valueNormalize = String.removeAccents(item.label).toLowerCase();

        if (valueNormalize.includes(filterNormalize)) {
          return true;
        }
        return false;
      } else {
        return true;
      }
    });
  }

  addOrRemoveItem(item: ValueLabel) {
    let index = this.listSelectedItem.findIndex((i) => i.value === item.value);
    if (index === -1) {
      this.listSelectedItem.push(item);
    } else {
      this.listSelectedItem.splice(index, 1);
    }
  }

  isItemSelected(item: ValueLabel) {
    return this.listSelectedItem.some((i) => i.value === item.value);
  }

  selectNone() {
    this.listSelectedItem = [];
  }

  selectAll() {
    this.listSelectedItem = this.listItem.slice();
  }

  // ###### //

  ok() {
    if (this.filterType === FILTER_TYPE.TEXT) {
      this.popoverController.dismiss({
        condition: this.selectedFilterTextCondition,
        value: this.filterTextValue === '' ? null : this.filterTextValue,
      });
    } else if (this.filterType === FILTER_TYPE.SELECT) {
      this.popoverController.dismiss({
        condition: null,
        value: this.listSelectedItem.length > 0 ? this.listSelectedItem : null,
      });
    } else if (this.filterType === FILTER_TYPE.NUMBER) {
      // Check if, with the data set by the user, it is a correct filter
      let isFiltering = false;
      if (this.selectedFilterNumberCondition === FILTER_CONDITION.BETWEEN ) {
        isFiltering = this.filterValueNumber.start != null && this.filterValueNumber.end != null;
      } else if (
        this.selectedFilterNumberCondition === FILTER_CONDITION.LOWER
        || this.selectedFilterNumberCondition === FILTER_CONDITION.LOWER_OR_EQUAL
      ) {
        isFiltering = this.filterValueNumber.end != null;
      } else {
        isFiltering = this.filterValueNumber.start != null;
      }
      

      this.popoverController.dismiss({
        condition: this.selectedFilterNumberCondition,
        value: !isFiltering ? null : this.filterValueNumber,
      });
    }
  }

  cancel() {
    this.popoverController.dismiss();
  }
}
