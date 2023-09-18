import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UtilsService } from './utils.service';
import { ConfigurationService } from './configuration.service';
import { AssetForSigDataService } from './dataservices/assetForSig.dataservice';
import { AssetForSigUpdateDto } from '../models/assetForSig.model';

@Injectable({
  providedIn: 'root'
})
export class AssetForSigService {

  constructor(
    private assetForSigDataService: AssetForSigDataService,
    private utilsService: UtilsService,
    private configurationService: ConfigurationService
  ) {
  }

  /**
   * Create a new asset for sig
   * @param assetForSig the asset
   * @returns the asset
   */
  public createAssetForSig(assetForSig: AssetForSigUpdateDto): Observable<any> {
    return this.assetForSigDataService.createAssetForSig(assetForSig);
  }
}