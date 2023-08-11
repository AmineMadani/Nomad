import { AbstractControl, FormControl, FormGroup } from "@angular/forms";

export interface Column<T = any> {
  format: ColumnFormat;
  key?: keyof T & string;
  label?: string;
  size?: string;
  onClick?: Function;
  elementLabelFunction?: Function;
  listDataSource?: any[];
  selectKey?: string;
}

export interface ColumnFormat {
  type: TypeColumn;
  // For select type - The list of object used for all possible elements to select
  elements?: any[];
  // For select type - The attribute of the object contains in the original list which will be used for value in the form (eg: id)
  selectKey?: string;
  // For select type - Function which permit to print the element with the properties we want. Take one param which corresponds to an element of the original list.
  elementLabelFunction?: Function;
  // For select type - Use mono or multiselection
  isMultiSelection?: boolean;
}

export enum TypeColumn {
  TEXT,
  CHECKBOX,
  ACTION,
  SELECT
}

export class Row<T> extends FormGroup {
  constructor(controlsConfig: { [key in keyof T]?: AbstractControl }) {
    super(controlsConfig);
  }

  // Remplacez "get" par "getControl" pour éviter la confusion avec la méthode "get" existante de FormGroup
  override get<K extends keyof T>(key: K): AbstractControl | null {
    return super.get(key as string);
  }
}

export class Cell extends FormControl {

}
