export interface Layer {
  id: number;
  lyrNumOrder: number;
  domId: number;
  domLLabel: string;
  domCode: string;
  astId: number;
  astCode: string;
  lyrTableName: string;
  lyrGeomColumnName: string;
  lyrUuidColumnName: string;
  lyrGeomSrid: string;
  lyrStyle: string;
  lyrSlabel: string;
  lyrLlabel: string;
  lyrValid: boolean;
  lyrDisplay: boolean;
}

export interface LayerWithStyles extends Layer {
  listStyle: LayerStyleDetail[];
}

export function getLayerLabel(layer: LayerWithStyles) {
  return layer.lyrSlabel + ' - ' + layer.domLLabel;
}

export interface VLayerWtr {
  astCode: string;
  astSlabel: string;
  astLlabel: string;
  lyrTableName: string;
  wtrSlabel: string;
  wtrLlabel: string;
  wtrCode: string;
  wtrId: number;
  astId: number;
  aswValid: boolean;
  aswUcreId: number;
  aswUmodId: number;
  aswDcre: string; // Date
  aswDmod: string; // Date
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
