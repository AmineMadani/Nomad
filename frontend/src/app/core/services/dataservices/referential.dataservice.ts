import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
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
    return this.http.get<any[]>(`${this.configurationService.apiUrl}referential/`+referential);
  }
}