export interface Column {
  type: TypeColumn;
  key?: string;
  label?: string;
  size?: string;
}

export enum TypeColumn {
  TEXT,
  ACTION
}
