export interface TableToolbar {
  title: string;
  buttons: ToolbarButton[];
}

export interface ToolbarButton {
  name: string;
  onClick: Function;
  disableFunction: Function;
}