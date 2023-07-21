export interface Column {
  type: TypeColumn;
  key?: string;
  label?: string;
  size?: string;
  onClick?: Function;
}

export enum TypeColumn {
  TEXT,
  CHECKBOX,
  ACTION
}
