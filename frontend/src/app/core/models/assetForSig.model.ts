export interface AssetForSigDto {
  id: number;
  lyrId: number;
  afsGeom: string;
  afsInformations: string;
  coords: number[][];

  // Only used when saving in the cache
  assObjTable?: string;
}