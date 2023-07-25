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
  listStyle: LayerStyleDefinition[];
}

export function getLayerLabel(layer: Layer) {
  return layer.lyrSlabel + ' - ' + layer.domLLabel;
}

export interface LayerStyleDefinition {
  code: string;
  definition: string;
  listImage: StyleImage[];
}

export interface StyleImage {
  code: string;
  source: string;
}

export interface LayerStyle {
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

export enum  localisationExportMode  {
  nomadLink = 'NOMADLINK',
  gpsCoordinates = 'GPS',
}
