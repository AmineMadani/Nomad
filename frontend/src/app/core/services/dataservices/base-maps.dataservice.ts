import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable } from 'rxjs';
import { BackLayer } from 'src/app/pages/home/components/map/map.dataset';

@Injectable({
  providedIn: 'root',
})
export class BaseMapsDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService  
  ) {}

  /**
   * Method to get all the user informations from server
   * @returns User information
   */
  getBaseMaps(): Observable<BackLayer[]> {
    return this.http.get<BackLayer[]>(`${this.configurationService.apiUrl}basemaps/`);
  }
}
