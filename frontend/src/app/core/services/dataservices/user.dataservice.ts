import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {

  constructor(private http: HttpClient) {}

  getUserInformation(): Observable<User> {
    return this.http.get<User>('/api/nomad/user/information');
  }
}
