import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { ConfigurationService } from '../configuration.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService  
  ) {}

  /**
   * Method to get all the user informations from server
   * @returns User information
   */
  getUserInformation(): Observable<User> {
    return this.http.get<User>(`${this.configurationService.apiUrl}user/information`);
  }
}
