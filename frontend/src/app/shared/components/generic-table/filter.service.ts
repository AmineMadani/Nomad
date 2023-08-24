import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { Column, FILTER_CONDITION, FilterValueDate, FilterValueNumber } from "src/app/core/models/table/column.model";
import { ValueLabel } from "src/app/core/models/util.model";

@Injectable({
  providedIn: "root"
})
export class FilterService {
  constructor() {}

  filterText(list: any[], column: Column) {
    return list.filter(data => {
      const value = data.getRawValue()[column.key];

      switch (column.filter.condition) {
        case FILTER_CONDITION.EMPTY:
          return value == null || value === '';
        case FILTER_CONDITION.NOT_EMPTY:
          return value != null && value !== '';
        case FILTER_CONDITION.IN:
          return value != null
            && this.convertCaseSensitive(value).indexOf(this.convertCaseSensitive(column.filter.value)) !== -1;
        case FILTER_CONDITION.NOT_IN:
          return value != null
            && this.convertCaseSensitive(value).indexOf(this.convertCaseSensitive(column.filter.value)) === -1;
        case FILTER_CONDITION.START:
          return value != null
            && this.convertCaseSensitive(value).startsWith(this.convertCaseSensitive(column.filter.value));
        case FILTER_CONDITION.NOT_START:
          return value != null
            && !this.convertCaseSensitive(value).startsWith(this.convertCaseSensitive(column.filter.value));
        case FILTER_CONDITION.END:
          return value != null
            && this.convertCaseSensitive(value).endsWith(this.convertCaseSensitive(column.filter.value));
        case FILTER_CONDITION.NOT_END:
          return value != null
            && !this.convertCaseSensitive(value).endsWith(this.convertCaseSensitive(column.filter.value));
        case FILTER_CONDITION.EQUAL:
          return value != null
            && this.convertCaseSensitive(value) == this.convertCaseSensitive(column.filter.value);
        case FILTER_CONDITION.NOT_EQUAL:
          return value != null
            && this.convertCaseSensitive(value) != this.convertCaseSensitive(column.filter.value);
        default:
          return false; 
      }
    });
  }

  filterSelect(list: any[], column: Column) {
    let listFilterValue = column.filter.value as ValueLabel[];
    if (listFilterValue.length > 0) {
      return list.filter((data) => {
        const value = data.getRawValue()[column.key];

        if (value == null || value === '') {
          return listFilterValue.some(e => e.value == null || e.value === '');
        } else {
          return listFilterValue.some(e => e.value === value);
        }
      });
    }
    return list;
  }

  filterNumber(list: any[], column: Column) {
    const searchValue = column.filter.value as FilterValueNumber;

    return list.filter(data => {
      const value = data.getRawValue()[column.key];

      switch (column.filter.condition) {
        case FILTER_CONDITION.EMPTY:
          return value == null || value === '';
        case FILTER_CONDITION.NOT_EMPTY:
          return value != null && value !== '';
        case FILTER_CONDITION.EQUAL:
          return value != null && Number(value) === searchValue.start;
        case FILTER_CONDITION.NOT_EQUAL:
          return value != null && Number(value) !== searchValue.start;
        case FILTER_CONDITION.GREATER:
          return value != null && Number(value) > searchValue.start;
        case FILTER_CONDITION.GREATER_OR_EQUAL:
          return value != null && Number(value) >= searchValue.start;
        case FILTER_CONDITION.LOWER:
          return value != null && Number(value) < searchValue.end;
        case FILTER_CONDITION.LOWER_OR_EQUAL:
          return value != null && Number(value) <= searchValue.end;
        case FILTER_CONDITION.BETWEEN:
          return value != null && Number(value) >= searchValue.start && Number(value) <= searchValue.end;
        default:
          return false; 
      }
    });
  }

  filterDate(list: any[], column: Column) {
    const searchValue = column.filter.value as FilterValueDate;

    return list.filter(data => {
      const value = data.getRawValue()[column.key];

      switch (column.filter.condition) {
        case FILTER_CONDITION.EMPTY:
          return value == null || value === '';
        case FILTER_CONDITION.NOT_EMPTY:
          return value != null && value !== '';
        case FILTER_CONDITION.LOWER:
          return (
            value != null 
            && DateTime.fromISO(value) < DateTime.fromFormat(searchValue.end, 'yyyy-MM-dd').startOf('day').plus({ days: 1 })
          )
          || value == null;
        case FILTER_CONDITION.GREATER:
          return (
            value != null 
            && DateTime.fromISO(value) > DateTime.fromFormat(searchValue.start, 'yyyy-MM-dd').endOf('day').minus({ days: 1 })
          )
          || value == null;
        case FILTER_CONDITION.BETWEEN:
          // If no start end date, same as greater
          if (searchValue.end == null) {
            return (
              value != null 
              && DateTime.fromISO(value) > DateTime.fromFormat(searchValue.start, 'yyyy-MM-dd').endOf('day').minus({ days: 1 })
            )
            || value == null;
          }

          // If no start start date, same as lower
          if (searchValue.start == null) {
            return (
              value != null 
              && DateTime.fromISO(value) < DateTime.fromFormat(searchValue.end, 'yyyy-MM-dd').startOf('day').plus({ days: 1 })
            )
            || value == null;
          }
          
          // Else : between the 2 dates
          return value != null
            && DateTime.fromISO(value) < DateTime.fromFormat(searchValue.end, 'yyyy-MM-dd').startOf('day').plus({ days: 1 })
            && DateTime.fromISO(value) > DateTime.fromFormat(searchValue.start, 'yyyy-MM-dd').endOf('day').minus({ days: 1 })
        default:
          return false; 
      }
    });
  }

  convertCaseSensitive(word) {
    return word.toString().toUpperCase().replace(/,/g, '.');
  }

  /*getDataInfoFromSsColumn(data: any, column: Column) {
    let dataInfo = "";
    column.ssColumns.forEach((ssColumn, index) => {
      if (dataInfo !== "") dataInfo += ' - ';
      let value = data[ssColumn] ? data[ssColumn] : 'null';
      dataInfo += value;
    });
    return dataInfo;
  }*/
}