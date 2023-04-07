export interface LayerReferences {
  layerKey: string;
  references: UserReference[];
}

export interface UserReference {
  referenceId: number;
  referenceKey: string;
  alias: string;
  displayType: ReferenceDisplayType,
  position: number;
}

export enum ReferenceDisplayType {
  SYNTHETIC = 'SYNTHETIC',
  DETAILED = 'DETAILED',
}
