
export interface Equipment extends Record<string, any> {
  id: number;
  layerKey?: string;
}


export interface EquipmentItem {
  id: number;
  key: string;
  label: string;
  position: number;
}

export interface EquipmentElement extends EquipmentItem {
  display: EquipmentDisplayType;
}

export enum EquipmentDisplayType {
  SYNTHETIC,
  DESKTOP,
}

export interface EquipmentSection extends EquipmentItem {
  elements: EquipmentElement[];
}

export interface EquipmentActionButton {
  id: number;
  icon: string;
  label: string;
  position: number;
  onClick: Function;
}
