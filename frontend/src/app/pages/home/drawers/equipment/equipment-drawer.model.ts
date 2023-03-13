export interface ActionButton {
  icon: string;
  label: string;
  onClick: Function;
}

export interface Item {
  key: string;
  label: string;
  position: number;
}
// TODO: Change all of this interface in adequacy with the database
export interface Element extends Item {
  display: DisplayType;
}

export interface Section extends Item {
  elements: Element[];
}

export enum DisplayType {
  SYNTHETIC,
  DESKTOP,
}

// TODO: Improve the record utilisation to be more restrictive in adequacy with the database
export interface Equipment extends Record<string, any> {
  id: number;
}
