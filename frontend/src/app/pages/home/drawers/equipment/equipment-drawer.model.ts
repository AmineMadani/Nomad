export interface ActionButton {
  icon: string;
  label: string;
  onClick: Function;
}

// TODO: Change all of this interface in adequacy with the database
export interface Element {
  field: string;
  key: string;
}

export interface Section {
  title: string;
  elements: Element[];
}

// TODO: Improve the record utilisation to be more restrictive in adequacy with the database
export interface Equipment extends Record<string, any> {
  id: number;
}
