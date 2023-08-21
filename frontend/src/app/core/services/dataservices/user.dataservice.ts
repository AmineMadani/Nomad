import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile, User, UserDetail } from '../../models/user.model';
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

  /**
   * Update the user data
   * @param userContext : user's preferences
   */
  public updateUser(user: User): Observable<any> {
    return this.http.put(`${this.configurationService.apiUrl}user/update`, user);
  }

  /**
   * Create a user
   * @param user
   * @returns
   */
  public createUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.configurationService.apiUrl}user`, user);
  }

  /**
   * Method to get all the users from server
   * @returns Users
   */
  getAllUserAccount(): Observable<User[]> {
    return this.http.get<User[]>(`${this.configurationService.apiUrl}user/all-account`);
  }

  /**
    * Method to get all the profiles from server
    * @returns Profiles
    */
  getAllProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.configurationService.apiUrl}profiles`);
  }

  /**
    * Method to get all the profiles from server
    * @returns Profiles
    */
  getUserDetailById(userId: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.configurationService.apiUrl}user/${userId}`);
  }
}


