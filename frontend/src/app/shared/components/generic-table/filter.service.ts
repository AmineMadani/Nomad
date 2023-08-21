import { Injectable } from "@angular/core";
import { Column, FILTER_CONDITION } from "src/app/core/models/table/column.model";
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

  /*filterNumber(list: any[], column: Column) {
    if (column.filterType) {
      let searchData = column.searchData as FilterValueNumber;
      switch (column.filterType) {
        case 'isBlank':
          return list.filter(
            data => typeof data[column.key] === 'undefined' || data[column.key] === '' || data[column.key] === null
          );

        case 'isNotBlank':
          return list.filter(
            data => typeof data[column.key] !== 'undefined' && data[column.key] !== '' && data[column.key] !== null
          );

        case 'isEqual':
          return list.filter(data => typeof data[column.key] !== 'undefined' && data[column.key] !== null && Number(data[column.key]) === searchData.start);

        case 'isNotEqual':
          return list.filter(data => typeof data[column.key] !== 'undefined' && data[column.key] !== null && Number(data[column.key]) !== searchData.start);

        case 'isUp':
          return list.filter(
            data => typeof data[column.key] !== 'undefined' && data[column.key] !== null && Number(data[column.key]) > searchData.start
          );

        case 'isUpOrEqual':
          return list.filter(
            data => typeof data[column.key] !== 'undefined' && data[column.key] !== null && Number(data[column.key]) >= searchData.start
          );

        case 'isDown':
          return list.filter(
            data => typeof data[column.key] !== 'undefined' && data[column.key] !== null && Number(data[column.key]) < searchData.end
          );

        case 'isDownOrEqual':
          return list.filter(
            data => typeof data[column.key] !== 'undefined' && data[column.key] !== null && Number(data[column.key]) <= searchData.end
          );

        case 'isBetween':
          return list.filter(
              data => typeof data[column.key] !== 'undefined' &&
                  data[column.key] !== null &&
                  Number(data[column.key]) >= searchData.start &&
                  Number(data[column.key]) <= searchData.end
          );
      }
    }
    return list;
  }

  filterDate(list: any[], column: Column) {
    if (column.filterType) {
      let searchData = column.searchData as FilterValueDate;
      switch (column.filterType) {
        case 'isBlank':
          return list.filter(
            data => typeof data[column.key] === 'undefined' || data[column.key] === '' || data[column.key] === null
          );

        case 'isNotBlank':
          return list.filter(
            data => typeof data[column.key] !== 'undefined' && data[column.key] !== '' && data[column.key] !== null
          );

        case 'isDown':
          return list.filter(
            data => (data[column.key] && moment(data[column.key]).isBefore(moment(searchData.end).startOf('day').add(1, 'day'))) || !data[column.key]
          );

        case 'isUp':
          return list.filter(
            data => (data[column.key] && moment(data[column.key]).isAfter(moment(searchData.start).endOf('day').add(-1, 'day'))) || !data[column.key]
          );

        case 'isBetween':
          // no end date
          if (!searchData.end) {
            return list.filter(
              data => (data[column.key] && moment(data[column.key]).isAfter(moment(searchData.start).endOf('day').add(-1, 'day'))) || !data[column.key]
            );
          }

          // no start date
          if (!searchData.start) {
            return list.filter(
              data => (data[column.key] && moment(data[column.key]).isBefore(moment(searchData.end).startOf('day').add(1, 'day'))) || !data[column.key]
            );
          }

          // between
          return list.filter(
            data =>
                  data[column.key] &&
                  moment(data[column.key]).isBefore(moment(searchData.end).startOf('day').add(1, 'day')) &&
                  moment(data[column.key]).isAfter(moment(searchData.start).endOf('day').add(-1, 'day'))
          );
      }
    }
    return list;
  }*/

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