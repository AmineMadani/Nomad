import { LayerStyleDetail } from "./layer-style.model";

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
