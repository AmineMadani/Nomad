import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetForSigDataService } from './dataservices/assetForSig.dataservice';
import { AssetForSigDto } from '../models/assetForSig.model';
import { AppDB } from '../models/app-db.model';

@Injectable({
  providedIn: 'root'
})
export class AssetForSigService {

  constructor(
    private assetForSigDataService: AssetForSigDataService,
  ) {
    this.db = new AppDB();
  }

  private db: AppDB;

  /**
   * Create a new asset for sig
   * @param assetForSig the asset
   * @returns the asset
   */
  public createAssetForSig(assetForSig: AssetForSigDto): Observable<any> {
    return this.assetForSigDataService.createAssetForSig(assetForSig);
  }

  public async getListCacheAssetForSig(): Promise<AssetForSigDto[]> {
    return (await this.db.assetForSig.toArray()).map(elem => elem.data);
  }

  public async getCacheAssetForSigByAssObjRef(assObjRef: string): Promise<AssetForSigDto> {
    const listAssetForSig = await this.getListCacheAssetForSig();
    return listAssetForSig.find(assetForSig => "TMP-" + assetForSig.id === assObjRef);
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
  public removeCacheUnusedAssetForSigFromUrl(url: string) {
    this.getListCacheAssetForSig().then(listAssetForSig => {
      for (let assetForSig of listAssetForSig) {
        const assObjRef = "TMP-" + assetForSig.id;
        if (!url.includes(assObjRef)) {
          this.deleteCacheAssetForSig(assetForSig.id.toString());
        }
      }
    });
  }
}