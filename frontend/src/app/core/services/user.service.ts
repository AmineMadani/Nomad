import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { PreferenceService } from './preference.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private preferenceService: PreferenceService,
    private userDataService: UserDataService
  ) { }

  /**
   * Get the current user from local storage.
   * If the user is not found in local storage, get the user from the server and store it in local storage.
   * @returns A Promise that resolves to the current user, or undefined if the user is not found.
   */
  async getUser(): Promise<User | undefined> {
    const user: User | undefined = await this.preferenceService.getPreference('user');
    if(!user) {
      const refreshUser:User = await firstValueFrom(this.userDataService.getUserInformation());
      this.setUser(refreshUser);
      return refreshUser;
    }
    return user;
  }

  /**
   * Store the given user in local storage.
   * @param user The user to store in local storage.
   */
  setUser(user:User){
    this.preferenceService.setPreference('user',user);
  }

  /**
   * Remove the current user from local storage.
   */
  resetUser(){
    this.preferenceService.deletePreference('user');
  }
}
