import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable } from 'rxjs';

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
  getBaseMaps(): Observable<any> {
    return this.http.get<Observable<any>>(`${this.configurationService.apiUrl}basemaps/all`);
  }
}
