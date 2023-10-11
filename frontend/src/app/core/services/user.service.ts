import { Injectable } from '@angular/core';
import { Context, Permission, Profile, User, PermissionCodeEnum, UserStatus } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { MapService } from './map/map.service';
import { Router } from '@angular/router';
import { PreferenceService } from './preference.service';
import { Observable, catchError, firstValueFrom, lastValueFrom, of, tap, timeout } from 'rxjs';
import { ApiSuccessResponse } from '../models/api-response.model';
import { UtilsService } from './utils.service';
import { ConfigurationService } from './configuration.service';
import { CacheService, ReferentialCacheKey } from './cache.service';
import { LayerService } from './layer.service';

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
    private preferenceService: PreferenceService,
    private utilsService: UtilsService,
    private configurationService: ConfigurationService,
    private cacheService: CacheService,
  ) { }

  private currentUser: User;
  private permissions: Permission[];

  /**
   * Create UserContext on Home page
   * @returns
   */
  public async getCurrentUserContext(): Promise<User> {
    const mapLibre: maplibregl.Map = this.mapService.getMap();
    const user: User = await this.getCurrentUser();
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
  public async getCurrentUser(): Promise<User | undefined> {
    // If the current user is not already set
    if (!this.currentUser) {
      // It gets the user info from the server
      const usr: User = await this.getCurrentUserInformation();
      if (usr.usrConfiguration) {
        usr.usrConfiguration = JSON.parse(usr.usrConfiguration.toString());
        if (!usr.usrConfiguration.favorites) {
          usr.usrConfiguration.favorites = []
        }
      } else {
        usr.usrConfiguration = {
          favorites: []
        }
      }

      // Set the current user
      this.currentUser = usr;
    }

    return this.currentUser;
  }

  /**
   * Method to get all the user informations from server
   * @returns User information
   */
  private async getCurrentUserInformation(): Promise<User> {
    const res = await lastValueFrom(
      this.userDataService.getCurrentUserInformation()
        .pipe(
          timeout(this.configurationService.offlineTimeoutReferential),
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
   * Store the given user in local storage.
   * @param user The user to store in local storage.
   */
  public setUser(user: User): void {
    this.preferenceService.setPreference(LocalStorageUserKey.USER, user);
    this.updateCurrentUser(user);
  }

  /**
   * Remove the current user from local storage.
   */
  public resetUser(): void {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER);
  }

  /**
   * Create an user
   * @param user the user to create
   */
  public createUser(user: User): Observable<ApiSuccessResponse> {
    return this.userDataService.createUser(user);
  }

  /**
   * Update an user
   * @param user the user to update
   */
  public updateUser(user: User): Observable<ApiSuccessResponse> {
    if (this.currentUser && user.id === this.currentUser.id) {
      // Reset the current user to get updated information next time
      this.currentUser = undefined;
    }

    return this.userDataService.updateUser(user);
  }

  /**
   * Update the current user data
   * @param user New user data
   */
  public updateCurrentUser(user: User): void {
    const usr: any = JSON.parse(JSON.stringify(user));
    usr.usrConfiguration = JSON.stringify(user.usrConfiguration);
    this.preferenceService.setPreference(LocalStorageUserKey.USER, user);
    this.updateUser(usr).subscribe({
      error: (err) => console.error(err),
    });
  }

  /**
   * Delete a user.
   */
  public deleteUsers(usersIds: number[]): Observable<ApiSuccessResponse> {
    return this.userDataService.deleteUsers(usersIds).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
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
    const usr: User = await this.getCurrentUser();
    this.restoreFilter(usr.usrConfiguration.context);
  }

  /**
   * Restore te user context from local storage
   * On le met ici sinon ca fait une dependance circulaire
   */
  public async restoreUserContextFromLocalStorage(): Promise<void> {
    const user: User = await this.getCurrentUser();
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

  /**
    * Method to get the user detail from server
    * If a bad id is provided it returns null
    * @returns UserDetail
    */
  getUserDetailById(userId: number): Observable<User> {
    // We check undefined and null because if id is 0 it will not passed in the condition
    return userId !== undefined && userId !== null ?
      this.userDataService.getUserDetailById(userId) :
      of(null);
  }

  /**
    * Method to get all the permissions from server or cache
    * @returns Permissions
    */
  getAllPermissions(): Observable<Permission[]> {
    if (this.permissions && this.permissions.length > 0) {
      return of(this.permissions);
    }

    return this.cacheService.fetchReferentialsData<Permission[]>(
      ReferentialCacheKey.PERMISSIONS,
      () => this.userDataService.getAllPermissions()
    ).pipe(
      tap((results) => this.permissions = results)
    );
  }

  /**
   * Check if the current user has a specific permission
   * @param perCode The permission code to check
   */
  async currentUserHasPermission(perCode: PermissionCodeEnum): Promise<boolean> {
    let hasPermission: boolean = false;

    const currentUser: User = await this.getCurrentUser();

    if (currentUser) {
      const permissions: Permission[] = await firstValueFrom(this.getAllPermissions());
      const permissionProfilesIds = permissions.find((prm) => prm.perCode === perCode).profilesIds;
      if (currentUser.perimeters.some((per) => permissionProfilesIds.includes(per.profileId))) {
        hasPermission = true;
      }
    }

    return hasPermission;
  }

  /**
   * Check if the current user has any permission
   * @param listPerCode The list of permissions code to check
   */
  async currentUserHasAnyPermission(perCodes: PermissionCodeEnum[]): Promise<boolean> {
    const currentUser: User = await this.getCurrentUser();
    if (!currentUser) return false;

    const permissions: Permission[] = await firstValueFrom(this.getAllPermissions());

    return permissions.some(permission => {
      if (perCodes.includes(permission.perCode)) {
        return currentUser.perimeters.some(per => permission.profilesIds.includes(per.profileId));
      }
      return false;
    });
  }

  /**
    * Method to get the user status from server
    * @returns UserStatusDto
    */
  getUserStatusByEmail(email: string): Observable<UserStatus> {
    return this.userDataService.getUserStatusByEmail(email);
  }

/**
 * Update the last viewed asset drawer
 * @param drawerLabel the last viewed asset drawer
 */
  async setLastSelectedDrawer(drawerLabel: string): Promise<void>{
    const currentUser: User = await this.getCurrentUser();
    if (currentUser.usrConfiguration.context) {
      currentUser.usrConfiguration.context.lastDrawerSegment = drawerLabel;
    } else {
      currentUser.usrConfiguration.context = {
        lastDrawerSegment: drawerLabel,
      };
    }
    this.setUser(currentUser);
  }
}
