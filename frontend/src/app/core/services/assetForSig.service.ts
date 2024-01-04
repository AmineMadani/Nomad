import { Injectable } from '@angular/core';
import { AssetForSigDataService } from './dataservices/assetForSig.dataservice';
import { AssetForSigDto } from '../models/assetForSig.model';
import { AppDB } from '../models/app-db.model';
import { LocationStrategy } from '@angular/common';
import { SearchAssets, getAssetTempIdFromNumeric, searchAssetsToListAssetId } from '../models/asset.model';

@Injectable({
  providedIn: 'root'
})
export class AssetForSigService {

  constructor(
    private assetForSigDataService: AssetForSigDataService,
    private location: LocationStrategy,
  ) {
    this.db = new AppDB();
  }

  private db: AppDB;

  /**
   * Create a new asset for sig
   * @param assetForSig the asset
   * @returns the asset
   */
  public createAssetForSig(assetForSig: AssetForSigDto): Promise<any> {
    return this.assetForSigDataService.createAssetForSig(assetForSig);
  }

  public async getListCacheAssetForSig(): Promise<AssetForSigDto[]> {
    return (await this.db.assetForSig.toArray()).map(elem => elem.data);
  }

  public async getCacheAssetForSigByAssObjRef(id: string): Promise<AssetForSigDto> {
    const listAssetForSig = await this.getListCacheAssetForSig();
    return listAssetForSig.find(assetForSig => getAssetTempIdFromNumeric(assetForSig.id) === id);
  }

  public async saveCacheAssetForSig(assetForSig: AssetForSigDto) {
    await this.db.assetForSig.put(
      { data: assetForSig, key: assetForSig.id.toString() },
      assetForSig.id.toString()
    );
  }

  /**
   * Delete a asset for sig in the cache
   * @param id the id of the asset for sig
   */
  public async deleteCacheAssetForSig(id: string) {
    await this.db.assetForSig.delete(id);
  }

  /**
   * This method remove the temporary asset for sig from the cache if not present in the url
   * @param url url
   */
  public async removeCacheUnusedAssetForSigFromState() {
    const listAssetForSig: AssetForSigDto[] = await this.getListCacheAssetForSig();

    const state = this.location.getState();
    const tmpAssets: SearchAssets[] = state ? state['tmpAssets'] : [];

    for (const assetForSig of listAssetForSig) {
      if (!tmpAssets || !searchAssetsToListAssetId(tmpAssets).some((assetId: string) => assetId === getAssetTempIdFromNumeric(assetForSig.id))) {
        this.deleteCacheAssetForSig(assetForSig.id.toString());
      }
    }
  }
}
