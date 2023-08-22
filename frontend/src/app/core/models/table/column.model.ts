import { AsyncValidatorFn, FormArray, FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { ValueLabel } from "../util.model";

export interface Column<T = any> {
  type: TypeColumn;
  key?: keyof T & string;
  label?: string;
  size?: string;
  onClick?: Function;
  // Options for sorting
  sortOptions?: SortOptions;
  // Contains the filter used on the column
  filter?: Filter;
  // For select type
  selectProperties?: SelectProperties;
}

export interface SelectProperties {
  // The attribute of the object contains in the original list which will be used for value in the form (eg: id)
  key: string;
  // The list of elements which will be used in select proposition.
  elements: any[];
  // Function which permit to print the element with the properties we want. Take one param which corresponds to an element of the original list.
  elementLabelFunction: Function;
  // Use mono or multiselection
  isMultiSelection?: boolean;
  // Function which permit to filter the list of elements in the select. Take one param which corresponds to the tableRow concerned.
  elementFilterFunction?: Function;
}

export interface SortOptions {
  // When we want to use another attribute than the displayed one to sort the column with
  getSortItem: Function;
  // To indicate that this column can't be sort
  noSort: boolean;
}

export enum TypeColumn {
  TEXT,
  CHECKBOX,
  ACTION,
  SELECT
}

export class TableRowArray<T> extends FormArray {
  constructor(controls: TableRow<T>[] = [], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn) {
    super(controls, validator, asyncValidator);
  }

  getControls() {
    return this.controls as TableRow<T>[];
  }
}

export class TableRow<T> extends FormGroup {
  constructor(controlsConfig: { [key in keyof T]?: TableCell }) {
    super(controlsConfig);
  }

  override get<K extends keyof T>(key: K): TableCell | null {
    return super.get(key as string) as TableCell;
  }

  override getRawValue(): T {
    return super.getRawValue() as T;
  }
}

export class TableCell extends FormControl {
}

export interface ColumnSort {
  key: string;
  direction: 'asc' | 'desc';
}

// ### FILTER ### //
export interface Filter {
  type: 'none' | 'text' | 'select'; // | 'number' | 'date'
  // Condition of the filer, null for select
  condition?: FILTER_CONDITION;
  value?: string | FilterValueNumber | FilterValueDate | ValueLabel[];
  // ## For select type ## //
  // The list of value for the user to select from, if no list is set, then, by default, its calculate from the list of displayed rows
  listSelectValue?: ValueLabel[];
  // If no list of select value is set, instead of the list of displayed row, it is the list of all rows
  isSelectAllRow?: boolean;
}

export enum FILTER_TYPE {
  NONE = 'none',
  TEXT = 'text',
  SELECT = 'select',
  /*NUMBER = 'number',
  DATE = 'date',*/
}

export interface FilterValueNumber {
  start: number;
  end: number;
}

export interface FilterValueDate {
  start: Date;
  end: Date;
}

export enum FILTER_CONDITION {
  IN = 'in',
  NOT_IN = 'notIn',
  START = 'start',
  NOT_START = 'notStart',
  END = 'end',
  NOT_END = 'notEnd',
  EQUAL = 'equal',
  NOT_EQUAL = 'notEqual',
  EMPTY = 'empty',
  NOT_EMPTY = 'notEmpty',
  GREATER = 'greater',
  GREATER_OR_EQUAL = 'greaterOrEqual',
  LOWER = 'lower',
  LOWER_OR_EQUAL = 'lowerOrEqual',
  BETWEEN = 'between'
}

export const FILTER_TEXT_CONDITION: ValueLabel[] = [
  {
    value: FILTER_CONDITION.IN,
    label: 'contient'
  },
  {
    value: FILTER_CONDITION.NOT_IN,
    label: 'ne contient pas'
  },
  {
    value: FILTER_CONDITION.START,
    label: 'commence par'
  },
  {
    value: FILTER_CONDITION.NOT_START,
    label: 'ne commence pas par'
  },
  {
    value: FILTER_CONDITION.END,
    label: 'finit par'
  },
  {
    value: FILTER_CONDITION.NOT_END,
    label: 'ne finit pas par'
  },
  {
    value: FILTER_CONDITION.EQUAL,
    label: 'égal à'
  },
  {
    value: FILTER_CONDITION.NOT_EQUAL,
    label: 'différent de'
  },
  {
    value: FILTER_CONDITION.EMPTY,
    label: 'est vide'
  },
  {
    value: FILTER_CONDITION.NOT_EMPTY,
    label: 'n\'est pas vide'
  }
];

export const FILTER_NUMBER_CONDITION: ValueLabel[] = [
  {
    value: FILTER_CONDITION.EQUAL,
    label: 'Est égal à'
  },
  {
    value: FILTER_CONDITION.NOT_EQUAL,
    label: 'Est différent de'
  },
  {
    value: FILTER_CONDITION.GREATER,
    label: 'Supérieur à'
  },
  {
    value: FILTER_CONDITION.GREATER_OR_EQUAL,
    label: 'Supérieur ou égal à'
  },
  {
    value: FILTER_CONDITION.LOWER,
    label: 'Inférieur à'
  },
  {
    value: FILTER_CONDITION.LOWER_OR_EQUAL,
    label: 'Inférieur ou égal à'
  },
  {
    value: FILTER_CONDITION.BETWEEN,
    label: 'Entre'
  },
  {
    value: FILTER_CONDITION.EMPTY,
    label: 'est vide'
  },
  {
    value: FILTER_CONDITION.NOT_EMPTY,
    label: 'n\'est pas vide'
  }
];

export const FILTER_DATE_CONDITION: ValueLabel[] = [
  {
    value: FILTER_CONDITION.BETWEEN,
    label: 'entre'
  },
  {
    value: FILTER_CONDITION.LOWER,
    label: 'est antérieure à'
  },
  {
    value: FILTER_CONDITION.GREATER,
    label: 'est supérieure à'
  },
  {
    value: FILTER_CONDITION.EMPTY,
    label: 'est vide'
  },
  {
    value: FILTER_CONDITION.NOT_EMPTY,
    label: 'n\'est pas vide'
  }
];
