import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { MapService } from './map/map.service';
import { FavoriteService } from './favorite.service';
import { UserContext } from '../models/user-context.model';
import { Router } from '@angular/router';
import { UtilsService } from './utils.service';
import { AccordeonFilter } from '../models/filter/filter-component-models/AccordeonFilter.model';
import { FavoriteFilter } from '../models/filter/filter-component-models/FavoriteFilter.model';
import { SearchFilter } from '../models/filter/filter-component-models/SearchFilter.model';
import { ToggleFilter } from '../models/filter/filter-component-models/ToggleFilter.model';
import { TreeFilter } from '../models/filter/filter-component-models/TreeFilter.model';
import { WorkOrderFilter } from '../models/filter/filter-component-models/WorkOrderFilter.model';
import { FilterService } from './filter.service';
import { PreferenceService } from './preference.service';
import { firstValueFrom } from 'rxjs';

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
    private favoriteService: FavoriteService,
    private router: Router,
    private utilsService: UtilsService,
    private filterService: FilterService,
    private preferenceService: PreferenceService
  ) { }


  /**
   * Create UserContext on Home page
   * @returns 
   */
  public async getCurrentUserContext(): Promise<UserContext> {
    const mapLibre: maplibregl.Map = this.mapService.getMap();
    const userId: User = await this.getUser();
    const filterStored = this.favoriteService.getFilter();
    if (!userId) {
      throw new Error('failed to load user informations');
    }
    let filterJson = JSON.stringify(filterStored, (key, value) => {
      if (typeof value?.getType !== "undefined") {
        value.type = value.getType();
      }
      return value;
    });

    const userContext = <UserContext>{
      zoom: mapLibre.getZoom(),
      lng: mapLibre.getCenter().lng,
      lat: mapLibre.getCenter().lat,
      userId: userId.id,
      userPreferences: filterJson,
      url: this.router.url,
    }
    return userContext;
  }

  /**
   * Get the current user from local storage.
   * If the user is not found in local storage, get the user from the server and store it in local storage.
   * @returns A Promise that resolves to the current user, or undefined if the user is not found.
   */
  async getUser(): Promise<User | undefined> {
    const user: User | undefined = await this.preferenceService.getPreference(LocalStorageUserKey.USER);
    if (!user) {
      const refreshUser: User = await firstValueFrom(this.userDataService.getUserInformation());
      this.setUser(refreshUser);
      return refreshUser;
    }
    return user;
  }

  /**
   * Store the given user in local storage.
   * @param user The user to store in local storage.
   */
  setUser(user: User) {
    this.preferenceService.setPreference(LocalStorageUserKey.USER, user);
  }

  /**
   * Remove the current user from local storage.
   */
  resetUser() {
    this.preferenceService.deletePreference(LocalStorageUserKey.USER);
  }

  /**
   * Save User context in data base
   */
  public async saveUserContext(): Promise<void> {
    const userContext = await this.getCurrentUserContext();
    this.userDataService.saveUsercontext(userContext);
  }

  /**
   * Restoring users view preferences
   */
  public async restoreUserContextNavigation(userContext: UserContext): Promise<void> {
    if (!userContext) {
      return;
    }
    if (userContext.url) {
      this.router.navigateByUrl(userContext.url).then(() => {
        this.restoreFilter(userContext);
      });
    }
    else {
      this.restoreFilter(userContext);
    }
  }

  private restoreFilter(userContext: UserContext): void {
    if (!userContext)
      return;
    this.mapService.setZoom(userContext.zoom);
    this.mapService.setCenter([userContext.lng, userContext.lat]);
    let userPrefJson = JSON.parse(userContext.userPreferences, (key, value) => {
      switch (value.type) {
        case 'accordeonFilter':
          return this.utilsService.deserialize(new AccordeonFilter(), value);
        case 'searchFilter':
          return this.utilsService.deserialize(new SearchFilter(), value);
        case 'toggleFilter':
          return this.utilsService.deserialize(new ToggleFilter(), value);
        case 'treeFilter':
          return this.utilsService.deserialize(new TreeFilter(), value);
        case 'workOrderFilter':
          return this.utilsService.deserialize(new WorkOrderFilter(), value);
        case 'favoriteFilter':
          return this.utilsService.deserialize(new FavoriteFilter(), value);
        default:
          return value;
      }
    });
    this.favoriteService.setFilter(userPrefJson);
    this.filterService.applyFilter(userPrefJson);
  }

  /**
   * Restore te user context from base
   */
  public async restoreUserContextFromBase(): Promise<void> {
    this.userDataService.getUserInformation().subscribe((userInfo: User) => {
      this.restoreFilter(userInfo.userContext);
    });
  }

  /**
   * Restore te user context from local storage
   * On le met ici sinon ca fait une dependance circulaire
   */
  public async restoreUserContextFromLocalStorage(): Promise<void> {
    const userContextHome = await this.getUserContext();
    await this.restoreUserContextNavigation(userContextHome);
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
