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
  listStyle: LayerStyle[];
}

export function getLayerLabel(layer: Layer) {
  return layer.lyrSlabel;
}

export interface LayerStyle {
  code: string;
  definition: string;
  listImage: StyleImage[];
}

export interface StyleImage {
  code: string;
  source: string;
}

export enum  localisationExportMode  {
  nomadLink = 'NOMADLINK',
  gpsCoordinates = 'GPS',
}
