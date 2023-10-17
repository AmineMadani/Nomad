import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Permission, Profile, User, UserStatus } from '../../models/user.model';
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
  public getCurrentUserInformation(): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${this.configurationService.apiUrl}users/current`)
    );
  }

  /**
   * Create a user
   * @param user
   * @returns
   */
  public createUser(user: User): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}users/create`, user)
    );
  }

  /**
   * Update the user data
   * @param userContext : user's preferences
   */
  public updateUser(user: User): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}users/${user.id}/update`, user)
    );
  }

  /**
   * Delete a list of users.
   */
  public deleteUsers(userIds: number[]): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.delete<ApiSuccessResponse>(`${this.configurationService.apiUrl}users/delete?userIds=${userIds}`)
    );
  }

  /**
   * Method to get all the users from server
   * @returns Users
   */
  public getAllUserAccount(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<User[]>(`${this.configurationService.apiUrl}users`)
    );
  }

  /**
    * Method to get all the profiles from server
    * @returns Profiles
    */
  public getAllProfiles(): Promise<Profile[]> {
    return firstValueFrom(
      this.http.get<Profile[]>(`${this.configurationService.apiUrl}users/profiles`)
    );
  }

  /**
    * Method to get all the profiles from server
    * @returns Profiles
    */
  public getUserDetailById(userId: number): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${this.configurationService.apiUrl}users/${userId}`)
    );
  }

  /**
    * Method to get all the permissions from server
    * @returns Permissions
    */
  public getAllPermissions(): Promise<Permission[]> {
    return firstValueFrom(
      this.http.get<Permission[]>(`${this.configurationService.apiUrl}users/permissions`)
    );
  }

  /**
    * Method to get the user status from server
    * @returns User status
    */
  public getUserStatusByEmail(email: string): Promise<UserStatus> {
    return firstValueFrom(
      this.http.get<UserStatus>(`${this.configurationService.apiUrl}users/status?email=${email}`)
    );
  }
}


