export interface Layer {
  id: number;
  lyrNumOrder: number;
  domId: number;
  domLLabel: string;
  domCode: string;
  astId: number;
  lyrTableName: string;
  lyrGeomColumnName: string;
  lyrUuidColumnName: string;
  lyrGeomSrid: string;
  lyrStyle: string;
  lyrSlabel: string;
  lyrLlabel: string;
  lyrValid: Boolean;
  lyrDisplay: Boolean;
  listStyle: LayerStyleDetail[];
}

export function getLayerLabel(layer: Layer) {
  return layer.lyrSlabel + ' - ' + layer.domLLabel;
}

export enum  localisationExportMode  {
  nomadLink = 'NOMADLINK',
  gpsCoordinates = 'GPS',
}

export interface LayerStyleSummary {
  lseId: number;
  lseCode: string;
  lyrId: number;
}

export interface LayerStyleDetail {
  lyrId: number;
  lyrTableName: string;
  lseId: number;
  lseCode: string;
  sydId: number;
  sydDefinition: string; // Json
  listImage: StyleImage[];
}

export interface StyleImage {
  code: string;
  source: string;
}

export interface SaveLayerStylePayload {
  lseCode: string;
  sydDefinition: string; // Json
  listImage: StyleImage[];
}

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
  section: string;
  isVisible: boolean;
}

export enum ReferenceDisplayType {
  SYNTHETIC = 'SYNTHETIC',
  DETAILED = 'DETAILED',
}
