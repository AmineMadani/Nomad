import { Injectable } from '@angular/core';
import { UserDataService } from './dataservices/user.dataservice';
import { PreferenceService } from './preference.service';
import { UserContext } from '../models/user-context.model';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
/**
 * Enum of cache items in local storage
 */
export enum LocalStorageKey {
  USER = 'user',
  USER_CONTEXT = 'userContext'
  }

@Injectable({
  providedIn: 'root'
})

/**
 * Service of Local Storage
 */
export class LocalStorageService {

  constructor(
    private preferenceService: PreferenceService,
    private userDataService : UserDataService
    
  ) { }

/**
   * Get the current user from local storage.
   * If the user is not found in local storage, get the user from the server and store it in local storage.
   * @returns A Promise that resolves to the current user, or undefined if the user is not found.
   */
async getUser(): Promise<User | undefined> {
  const user: User | undefined = await this.preferenceService.getPreference(LocalStorageKey.USER);
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
  this.preferenceService.setPreference(LocalStorageKey.USER,user);
}

/**
 * Remove the current user from local storage.
 */
resetUser(){
  this.preferenceService.deletePreference(LocalStorageKey.USER);
}

    /**
     * 
     * @param key : the key in localstorage
     * @returns value
     */
  public async getLocalStorageValue(key : LocalStorageKey) : Promise<any>{
    return await this.preferenceService.getPreference(key);
  }

  /**
   * Add value in local storage
   * @param key 
   * @param value 
   */
  public setLocalStorage(key : LocalStorageKey, value : any){
    this.preferenceService.setPreference(key, value);
  }

  /**
   * Delete value in local storage
   * @param key 
   */
  public resetLocalStorage(key : LocalStorageKey)
  {
    this.preferenceService.deletePreference(key);
  }

  /**
   * Get the user context in local storage
   * @returns UserContext
   */
  public async getUserContext() : Promise<UserContext>
  {
    return await this.preferenceService.getPreference(LocalStorageKey.USER_CONTEXT);
  }

  /**
   * Set the user context in local storage
   * @param value 
   */
  public setUserContext(value : UserContext)
  {
    this.preferenceService.setPreference(LocalStorageKey.USER_CONTEXT, value);
  }

  /**
   * Delete the user context in local storage
   * @param route 
   */
  public resetUserContext(route : string)
  {
    this.preferenceService.deletePreference(LocalStorageKey.USER_CONTEXT);
  }

}
