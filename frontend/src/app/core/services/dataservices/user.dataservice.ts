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

  getUserInformation(): Observable<User> {
    return this.http.get<User>(`${this.configurationService.apiUrl}user/information`);
  }
}
