import { Injectable } from '@angular/core';
import { Context, Profile, User } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { MapService } from './map/map.service';
import { Router } from '@angular/router';
import { PreferenceService } from './preference.service';
import { Observable, catchError, lastValueFrom, of, timeout } from 'rxjs';

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
   * Method to get all the user informations from server
   * @returns User information
   */
  async getUserInformation(): Promise<Observable<User>> {
    const res = await lastValueFrom(
      this.userDataService.getUserInformation()
        .pipe(
          timeout(2000),
          catchError(async () => {
            const forms = await this.preferenceService.getPreference(
              LocalStorageUserKey.USER
            );
            if (forms) {
              return forms.data;
            }
            return of(null);
          })
        )
    );

    if (!res) {
      this.router.navigate(['/error']);
    }

    this.preferenceService.setPreference(LocalStorageUserKey.USER, res);

    return res;
  }

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
  public async getUser(): Promise<User | undefined> {
    const usr: any = await this.getUserInformation();
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
  public setUser(user: User): void {
    this.preferenceService.setPreference(LocalStorageUserKey.USER, user);
    this.updateUser(user);
  }

  /**
   * Remove the current user from local storage.
   */
  public resetUser(): void {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER);
  }

  /**
   * Update the user data
   * @param user  the user
   */
  public updateUser(user: User): void {
    const usr: any = JSON.parse(JSON.stringify(user));
    usr.usrConfiguration = JSON.stringify(user.usrConfiguration);
    this.preferenceService.setPreference(LocalStorageUserKey.USER, user);
    this.userDataService.updateUser(usr).subscribe({
      error: (err) => console.error(err),
    });
  }

  /**
 * Create an user
 * @param user the user to create
 */
  public createUser(user: User): Observable<any> {
    return this.userDataService.createUser(user);
  }

  /**
   * Method to get all the users from server
   * @returns Users
   */
  getAllUserAccount(): Observable<User[]> {
    return this.userDataService.getAllUserAccount();
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
   * Delete the user context in local storage
   */
  public resetUserContext() {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER_CONTEXT);
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
    * Method to get all the profiles from server
    * @returns Profiles
    */
  getAllProfiles(): Observable<Profile[]> {
    return this.userDataService.getAllProfiles();
  }

}
