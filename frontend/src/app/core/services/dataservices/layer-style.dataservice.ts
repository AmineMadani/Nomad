import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable } from 'rxjs';
import { LayerStyle } from '../../models/layer.model';

@Injectable({
  providedIn: 'root',
})
export class LayerStyleDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
  ) { }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Observable<LayerStyle[]> {
    return this.http.get<LayerStyle[]>(`${this.configurationService.apiUrl}layer/styles`)
  }
}
