import { Injectable } from '@angular/core';
import { AssetForSigDataService } from './dataservices/assetForSig.dataservice';

@Injectable({
  providedIn: 'root'
})
export class AssetForSigService {

  constructor(
    private assetForSigDataService: AssetForSigDataService,
  ) {
  }

}
