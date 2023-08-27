import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';

@Injectable({
  providedIn: 'root',
})
export class ReferentialDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {}

  /**
   * Method to get all the referential data
   * @returns List referential data
   */
  getReferential(referential:string): Observable<any[]> {
    return this.http.get<any[]>(`${this.configurationService.apiUrl}referentials/`+referential);
  }

  /**
   * Method to get list of id referential which intersect coordinate point
   * @returns List referential data
   */
  getReferentialIdByLongitudeLatitude(referential:string,longitude:string,latitude:string): Observable<any[]> {
    return this.http.get<any[]>(`${this.configurationService.apiUrl}referentials/${referential}/${longitude}/${latitude}`);
  }
}
