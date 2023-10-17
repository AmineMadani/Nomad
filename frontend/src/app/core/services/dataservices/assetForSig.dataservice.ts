import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiSuccessResponse } from '../../models/api-response.model';
import { AssetForSigDto } from '../../models/assetForSig.model';

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

}
