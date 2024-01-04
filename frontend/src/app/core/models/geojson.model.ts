import { BaseAsset } from "./asset.model";

export type GeoJSONValue =
  | string
  | number
  | boolean
  | { [x: string]: GeoJSONValue }
  | Array<GeoJSONValue>;

export interface GeoJSONObject {
  [key: string]: GeoJSONValue;
}

export interface NomadGeoJson {
  name: string;
  type: string;
  features: any[];
}

export interface NomadFeature {
  geometry: any[];
  id: string;
  properties: BaseAsset;
  type: string;
  source?: string;
}

export interface GeoJSONArray extends Array<GeoJSONValue> {}
