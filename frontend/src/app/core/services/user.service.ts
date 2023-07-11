import { Injectable } from '@angular/core';
import { Context, User } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { MapService } from './map/map.service';
import { UserContext } from '../models/user-context.model';
import { Router } from '@angular/router';
import { UtilsService } from './utils.service';
import { FilterService } from './filter.service';
import { PreferenceService } from './preference.service';

/**
 * Enum of cache items in local storage
 */
export enum LocalStorageUserKey {
  USER = 'user',
  USER_CONTEXT = 'userContext'
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private userDataService: UserDataService,
    private mapService: MapService,
    private router: Router,
    private preferenceService: PreferenceService
  ) { }


  /**
   * Create UserContext on Home page
   * @returns 
   */
  public async getCurrentUserContext(): Promise<User> {
    const mapLibre: maplibregl.Map = this.mapService.getMap();
    const user: User = await this.getUser();
    if (!user) {
      throw new Error('failed to load user informations');
    }

    const context = <Context>{
      zoom: mapLibre.getZoom(),
      lng: mapLibre.getCenter().lng,
      lat: mapLibre.getCenter().lat,
      url: this.router.url,
    }
    
    const mapLayerLoaded: string[][] = Object.values(this.mapService.getMap().style._layers)
                                        .filter((value) => !value['source'].startsWith('mapbox'))
                                        .map((value) => [value['source'], value['id']]);
    mapLayerLoaded.shift();
    context.layers = mapLayerLoaded;

    user.usrConfiguration.context = context;

    return user;
  }

  /**
   * Get the current user from local storage.
   * If the user is not found in local storage, get the user from the server and store it in local storage.
   * @returns A Promise that resolves to the current user, or undefined if the user is not found.
   */
  async getUser(): Promise<User | undefined> {
    const usr: any = await this.userDataService.getUserInformation();
    if (usr.usrConfiguration) {
      usr.usrConfiguration = JSON.parse(usr.usrConfiguration);
      if (!usr.usrConfiguration.favorites) {
        usr.usrConfiguration.favorites = []
      }
    } else {
      usr.usrConfiguration = {
        favorites: []
      }
    }
    return usr;
  }

  /**
   * Store the given user in local storage.
   * @param user The user to store in local storage.
   */
  setUser(user: User) {
    this.preferenceService.setPreference(LocalStorageUserKey.USER, user);
    this.updateUser(user);
  }

  /**
   * Remove the current user from local storage.
   */
  resetUser() {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER);
  }

  /**
   * Update the user data
   * @param user  the user
   */
  updateUser(user: User) {
    this.userDataService.updateUser(user);
  }

  /**
   * Restoring users view preferences
   */
  public async restoreUserContextNavigation(context: Context): Promise<void> {
    if (!context) {
      return;
    }
    if (context.url) {
      this.router.navigateByUrl(context.url).then(() => {
          this.restoreFilter(context);
      });
    }
    else {
      this.restoreFilter(context);
    }
  }

  private restoreFilter(context: Context): void {
    if (context) {
      this.mapService.setZoom(context.zoom);
      this.mapService.setCenter([context.lng, context.lat]);
      if (context.layers && context.layers.length > 0) {
        for (let layer of context.layers) {
            this.mapService.addEventLayer(layer[0], layer[1]);
        }
      }
    }
  }

  /**
   * Restore te user context from base
   */
  public async restoreUserContextFromBase(): Promise<void> {
    const usr: User = await this.getUser();
    this.restoreFilter(usr.usrConfiguration.context);
  }

  /**
   * Restore te user context from local storage
   * On le met ici sinon ca fait une dependance circulaire
   */
  public async restoreUserContextFromLocalStorage(): Promise<void> {
    const user: User = await this.getUser();
    if (user.usrConfiguration.context) {
      await this.restoreUserContextNavigation(user.usrConfiguration.context);
    }
  }

  /**
   * Get the user context in local storage
   * @returns UserContext
   */
  public async getUserContext() : Promise<UserContext>
  {
    return await this.preferenceService.getPreference(LocalStorageUserKey.USER_CONTEXT);
  }

  /**
   * Set the user context in local storage
   * @param value 
   */
  public setUserContext(value : UserContext)
  {
    this.preferenceService.setPreference(LocalStorageUserKey.USER_CONTEXT, value);
  }

  /**
   * Delete the user context in local storage
   */
  public resetUserContext()
  {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER_CONTEXT);
  }
}
