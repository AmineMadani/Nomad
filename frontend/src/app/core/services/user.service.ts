import { Injectable } from '@angular/core';
import { Context, Permission, Profile, User, PermissionCodeEnum, UserStatus } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { Router } from '@angular/router';
import { PreferenceService } from './preference.service';
import { ApiSuccessResponse } from '../models/api-response.model';
import { UtilsService } from './utils.service';
import { ConfigurationService } from './configuration.service';
import { CacheService, ReferentialCacheKey } from './cache.service';
import { Subject } from 'rxjs';
import { MapService } from './map/map.service';

/**
 * Enum of cache items in local storage
 */
export enum LocalStorageUserKey {
  USER = 'user',
  USER_CONTEXT = 'userContext',
  STORAGE_OAUTH = 'storage_oauth'
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private userDataService: UserDataService,
    private router: Router,
    private preferenceService: PreferenceService,
    private utilsService: UtilsService,
    private configurationService: ConfigurationService,
    private cacheService: CacheService,
    private mapService: MapService
  ) {}

  private currentUser: User;
  private permissions: Permission[];
  private contextEvent$: Subject<void> = new Subject();

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
    let res = null;
    try {
      res = await this.utilsService.fetchPromiseWithTimeout({
        fetchPromise: this.userDataService.getCurrentUserInformation(),
        timeout: this.configurationService.offlineTimeoutReferential
      })
    } catch(error) {
      const forms = await this.preferenceService.getPreference(
        LocalStorageUserKey.USER
      );
      if (forms) {
        res=forms;
      }
    }

    this.preferenceService.setPreference(LocalStorageUserKey.USER, res);

    return res;
  }

  /**
   * Store the given user in local storage.
   * @param user The user to store in local storage.
   */
  public setUser(user: User): void {
    this.currentUser = user;
    this.updateCurrentUser();
  }

  /**
   * Remove the current user from local storage.
   */
  public resetUser(): void {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER);
  }

  /**
   * Remove the local user session from local storage.
   */
  public resetLocalSession(): void {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER);
    this.preferenceService.deletePreference(LocalStorageUserKey.STORAGE_OAUTH);
  }

  /**
   * Create an user
   * @param user the user to create
   */
  public createUser(user: User): Promise<ApiSuccessResponse> {
    return this.userDataService.createUser(user);
  }

  /**
   * Update an user
   * @param user the user to update
   */
  public updateUser(user: User): Promise<ApiSuccessResponse> {
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
  public updateCurrentUser(): void {
    const usr: any = JSON.parse(JSON.stringify(this.currentUser));
    usr.usrConfiguration = JSON.stringify(this.currentUser.usrConfiguration);
    this.preferenceService.setPreference(LocalStorageUserKey.USER, this.currentUser);
    this.userDataService.updateUser(usr).catch((error) => console.log(error));
  }

  /**
   * Delete a user.
   */
  public async deleteUsers(usersIds: number[]): Promise<ApiSuccessResponse> {
    const response = await this.userDataService.deleteUsers(usersIds)

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Method to get all the users from server
   * @returns Users
   */
  getAllUserAccount(): Promise<User[]> {
    return this.userDataService.getAllUserAccount();
  }

  /**
   * Delete the user context in local storage
   */
  public resetUserContext() {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER_CONTEXT);
  }

  /**
    * Method to get all the profiles from server
    * @returns Profiles
    */
  getAllProfiles(): Promise<Profile[]> {
    return this.userDataService.getAllProfiles();
  }

  /**
    * Method to get the user detail from server
    * If a bad id is provided it returns null
    * @returns UserDetail
    */
  public async getUserDetailById(userId: number): Promise<User> {
    // We check undefined and null because if id is 0 it will not passed in the condition
    return userId !== undefined && userId !== null ?
      await this.userDataService.getUserDetailById(userId) :
      null;
  }

  /**
    * Method to get all the permissions from server or cache
    * @returns Permissions
    */
  public async getAllPermissions(
    forceGetFromDb: boolean = false,
    isDownloadMode: boolean = false
  ): Promise<Permission[]> {
    if (!this.permissions || forceGetFromDb) {
      this.permissions = await this.cacheService.fetchReferentialsData<Permission[]>(
        ReferentialCacheKey.PERMISSIONS,
        () => this.userDataService.getAllPermissions(),
        isDownloadMode
      );
    }

    return this.permissions;
  }

  /**
   * Check if the current user has a specific permission
   * @param perCode The permission code to check
   */
  public async currentUserHasPermission(perCode: PermissionCodeEnum): Promise<boolean> {
    let hasPermission: boolean = false;

    const currentUser: User = await this.getCurrentUser();

    if (currentUser) {
      const permissions: Permission[] = await this.getAllPermissions();
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
  public async currentUserHasAnyPermission(perCodes: PermissionCodeEnum[]): Promise<boolean> {
    const currentUser: User = await this.getCurrentUser();
    if (!currentUser) return false;

    const permissions: Permission[] = await this.getAllPermissions();

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
  public getUserStatusByEmail(email: string): Promise<UserStatus> {
    return this.userDataService.getUserStatusByEmail(email);
  }

/**
 * Update the last viewed asset drawer
 * @param drawerLabel the last viewed asset drawer
 */
  public async setLastSelectedDrawer(drawerLabel: string): Promise<void>{
    if (this.currentUser.usrConfiguration?.context) {
      this.currentUser.usrConfiguration.context.lastDrawerSegment = drawerLabel;
    } else {
      this.currentUser.usrConfiguration.context = {
        lastDrawerSegment: drawerLabel,
      };
    }
  }

  /**
   * Save user context
   */
  public async saveUserContext(){
    this.contextEvent$.next();
  }

  /**
   * Get the user event context observable
   * @returns user context observable
   */
  public onInitUserContextEvent() {
    return this.contextEvent$.asObservable();
  }

  /**
   * Get the user context
   * @returns return the context
   */
  public onUserContextEvent() {
    let context: Context = null;
    if(this.currentUser.usrConfiguration?.context) {
      context = this.currentUser.usrConfiguration.context;
    } else {
      context = {};
    }

    if(this.mapService.getMap()) {

      const mapLibre = this.mapService.getMap();
      context.zoom = mapLibre.getZoom();
      context.lng = mapLibre.getCenter().lng;
      context.lat = mapLibre.getCenter().lat;
      context.url = this.router.url;
      context.basemap = mapLibre.getLayer('basemap').source

      const mapLayerLoaded: string[][] = Object.values(this.mapService.getMap().style._layers)
        .filter((value) => !value['source'].startsWith('mapbox') && value['visibility'] != "none")
        .map((value) => [value['source'], value['id']]);
      mapLayerLoaded.shift();
      context.layers = mapLayerLoaded;
    }

    if(this.currentUser){
      this.currentUser.usrConfiguration.context = context;
      this.updateCurrentUser();
    }
  }
 
}
