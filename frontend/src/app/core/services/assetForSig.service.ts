import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetForSigDataService } from './dataservices/assetForSig.dataservice';
import { AssetForSigDto } from '../models/assetForSig.model';

@Injectable({
  providedIn: 'root'
})
export class AssetForSigService {

  constructor(
    private assetForSigDataService: AssetForSigDataService,
  ) {
  }

  /**
   * Create a new asset for sig
   * @param assetForSig the asset
   * @returns the asset
   */
  public createAssetForSig(assetForSig: AssetForSigDto): Observable<any> {
    return this.assetForSigDataService.createAssetForSig(assetForSig);
  }
}