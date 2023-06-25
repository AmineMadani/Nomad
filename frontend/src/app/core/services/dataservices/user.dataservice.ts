import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, lastValueFrom, of, timeout } from 'rxjs';
import { LocalStorageUserKey, User } from '../../models/user.model';
import { ConfigurationService } from '../configuration.service';
import { UserContext } from '../../models/user-context.model';
import { PreferenceService } from '../preference.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
    private preferenceService: PreferenceService
  ) {}

  /**
   * Method to get all the user informations from server
   * @returns User information
   */
  async getUserInformation(): Promise<Observable<User>> {
    const res = await lastValueFrom(
      this.http.get<User[]>(`${this.configurationService.apiUrl}user/information`).pipe(
        timeout(2000),
        catchError(async () => {
          const forms = await this.preferenceService.getPreference(LocalStorageUserKey.USER);
          if (forms) {
            return forms.data;
          }
          return of(null);
        })
      )
    );

    if (!res) {
      throw new Error(`Failed to fetch user information`);
    }

    this.preferenceService.setPreference(LocalStorageUserKey.USER, res);

    return res;
  }

  /**
   * Update the user data
   * @param userContext : user's preferences
   */
  public updateUser(user : User) : void {
    const usr: any = JSON.parse(JSON.stringify(user));
    usr.usrConfiguration = JSON.stringify(user.usrConfiguration);
    this.http.put(`${this.configurationService.apiUrl}user/update`, usr).subscribe({
      error : (err) => console.error(err)
    })
  }

  /**
   * Save in database the user's preferences
   * @param userContext : user's preferences
   */
  public saveUsercontext(userContext : UserContext) : void {
    this.http.put(`${this.configurationService.apiUrl}user/user-context`, userContext).subscribe({
    //next : () => ,
    error : (err) => console.error(err)
    })
  }
  /**
   * Method to get all the users from server
   * @returns Users
   */
  getAllUserAccount(): Observable<User[]> {
    return this.http.get<User[]>(`${this.configurationService.apiUrl}user/all-account`);
  }
}


