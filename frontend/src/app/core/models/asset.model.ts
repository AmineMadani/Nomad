export interface BaseAsset {
  id: string;
  x: number;
  y: number;
  ctrId?: number;
  ctyId?: number;
  [key: string]: any;
}

// We don't know in advance what an aset look like
// So to avoid using any everywhere, we use the type asset
// Which is just a flexible key => value type, we should use each time we get an asset
export interface Asset extends BaseAsset {
  geom?: any;
  lyrTableName: string;
}

export function isAssetTemp(asset: BaseAsset): boolean {
  return asset.id.startsWith('TMP-');
}

export function getAssetTempIdFromNumeric(id: number): string {
  return 'TMP-' + id;
}

export function getAssetNumericIdFromTemp(id: string): number {
  return Number.parseInt(id.split('TMP-')[1]);
}

// The interface which permit to transfer assets between component and application layers
// Group the asset ids by their lyrTableName
// allColumn is a param passed in the api call to get the assets detail. It permit to get all column or if false, only the synthetic ones.
export interface SearchAssets {
  lyrTableName: string,
  assetIds: string[],
  allColumn?: boolean
}

export function searchAssetsToListAssetId(assets: SearchAssets[]): string[] {
  return assets.flatMap((asset) => { return asset.assetIds });
}

