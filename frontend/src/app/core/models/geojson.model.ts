export type GeoJSONValue =
  | string
  | number
  | boolean
  | { [x: string]: GeoJSONValue }
  | Array<GeoJSONValue>;

export interface GeoJSONObject {
  [key: string]: GeoJSONValue;
}

export interface GeoJSONArray extends Array<GeoJSONValue> {}
