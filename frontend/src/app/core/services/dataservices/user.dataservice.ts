import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {

  constructor(private http: HttpClient) {}

  getUserInformation(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}user/information`);
  }
}
