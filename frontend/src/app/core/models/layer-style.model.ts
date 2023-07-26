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
