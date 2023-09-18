import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from '../../models/api-response.model';
import { AssetForSigUpdateDto } from '../../models/assetForSig.model';

@Injectable({
  providedIn: 'root',
})
export class AssetForSigDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {
  }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**
   * Create the asset for sig
   * A toast is automatically showed to the user when the api call is done.
   * @param assetForSig: asset for sig
   * @returns A response message if successfull, else return an error.
   */
  public createAssetForSig(assetForSig: AssetForSigUpdateDto):Observable<any> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}asset-for-sig/create`, assetForSig);
  }
}