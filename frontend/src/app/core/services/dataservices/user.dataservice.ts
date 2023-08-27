import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Permission, Profile, User } from '../../models/user.model';
import { ConfigurationService } from '../configuration.service';
import { ApiSuccessResponse } from '../../models/api-response.model';

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
  getCurrentUserInformation(): Observable<User> {
    return this.http.get<User>(`${this.configurationService.apiUrl}users/current`);
  }

  /**
   * Create a user
   * @param user
   * @returns
   */
  public createUser(user: User): Observable<ApiSuccessResponse> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}users`, user);
  }

  /**
   * Update the user data
   * @param userContext : user's preferences
   */
  public updateUser(user: User): Observable<ApiSuccessResponse> {
    return this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}users/${user.id}/update`, user);
  }

  /**
   * Delete a list of users.
   */
  public deleteUsers(userIds: number[]): Observable<ApiSuccessResponse> {
    return this.http.delete<ApiSuccessResponse>(`${this.configurationService.apiUrl}users/delete?userIds=${userIds}`);
  }

  /**
   * Method to get all the users from server
   * @returns Users
   */
  getAllUserAccount(): Observable<User[]> {
    return this.http.get<User[]>(`${this.configurationService.apiUrl}users`);
  }

  /**
    * Method to get all the profiles from server
    * @returns Profiles
    */
  getAllProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.configurationService.apiUrl}users/profiles`);
  }

  /**
    * Method to get all the profiles from server
    * @returns Profiles
    */
  getUserDetailById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.configurationService.apiUrl}users/${userId}`);
  }

  /**
    * Method to get all the permissions from server
    * @returns Permissions
    */
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.configurationService.apiUrl}users/permissions`);
  }
}


