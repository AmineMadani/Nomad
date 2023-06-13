import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';

@Injectable({
  providedIn: 'root',
})
export class EquipmentDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) { }

  getEquipmentByLayerAndId(layer:string, id: number): Observable<any> {
    return this.http.get<any>(`${this.configurationService.apiUrl}layer/`+layer+`/`+id);
  }
}
