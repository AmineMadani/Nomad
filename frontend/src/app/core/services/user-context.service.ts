import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { PreferenceService } from './preference.service';
import { DrawerRouteEnum, drawerRoutes } from '../models/drawer.model';
import { Router } from '@angular/router';
import { UtilsService } from './utils.service';
import { MapService } from './map/map.service';
import { AccordeonFilter } from '../models/filter/filter-component-models/AccordeonFilter.model';
import { FavoriteFilter } from '../models/filter/filter-component-models/FavoriteFilter.model';
import { SearchFilter } from '../models/filter/filter-component-models/SearchFilter.model';
import { ToggleFilter } from '../models/filter/filter-component-models/ToggleFilter.model';
import { TreeFilter } from '../models/filter/filter-component-models/TreeFilter.model';
import { WorkOrderFilter } from '../models/filter/filter-component-models/WorkOrderFilter.model';
import { FavoriteService } from './favorite.service';
import { UserContext } from '../models/user-context.model';
import { UserService } from './user.service';
import { DrawerService } from './drawer.service';
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

export class UserContextService {

  constructor(
    private userService : UserService,
    private preferenceService: PreferenceService,
    private userDataService: UserDataService,
    private router : Router,
    private utilsService : UtilsService,
    private mapService: MapService,
    private favoriteService : FavoriteService,
    private drawerService : DrawerService
    
  ) { }

  /**
   * Get the navigation context in local storage
   * @param route : the key in localstorage is a concat of LocalStorageKey.USER_CONTEXT + the route page
   * Exemple : UserContextHOME, UserContextREPORT, UserContextSETTINGS
   * @returns 
   */
  public async getUserContextInLocalStorage(route : string) : Promise<UserContext>
  {
    const localStorageKey = LocalStorageKey.USER_CONTEXT  + this.getMainDrawerNameRoute(route);
    return await this.preferenceService.getPreference(localStorageKey);
  }

  /**
   * Save the user context in local storage
   * @param route : the key in localstorage is a concat of LocalStorageKey.USER_CONTEXT + the route page
   * @param value 
   */
  public setUserContextInLocalStorage(route : string, value : UserContext) : void{
    const localStorageKey = LocalStorageKey.USER_CONTEXT  + this.getMainDrawerNameRoute(route);
    this.preferenceService.setPreference(localStorageKey, value);
  }

  /**
   * Delete the user context in local storage
   * @param route 
   */
  public resetUserContextFromLocalStorage(route : string)
  {
    const localStorageKey = LocalStorageKey.USER_CONTEXT  + this.getMainDrawerNameRoute(route);
    this.preferenceService.deletePreference(localStorageKey);
  }

  //Get the DrawerRouteEnum from the url
  public getMainDrawerNameRoute(url: string): string {
    let temp = url.split('/');
    let route : string;
    if (url.startsWith('/')){
       route = temp[1];
     }
     else{
       route = temp[0];
     }
    let routeEnumResult: string | undefined = drawerRoutes.find(
    (drawerRoute) => drawerRoute.name.toUpperCase() === route.toUpperCase()
    )?.name;
    if (!routeEnumResult) {
     return route.toUpperCase();
    }
   return routeEnumResult.toUpperCase();
   }

   public async getCurrentUserContextHome() : Promise<UserContext>{
    const mapLibre : maplibregl.Map =  this.mapService.getMap();
    const userId : User = await this.userService.getUser();
    const filterStored = this.favoriteService.getFilter();
    if (!userId){
      throw new Error('failed to load user informations');
    }
    let filterJson=JSON.stringify(filterStored, (key, value) => {
      if (typeof value?.getType !== "undefined") {
      value.type=value.getType();
      }
      return value;
    });

    const  userContext = <UserContext>{
      zoom : mapLibre.getZoom(),
      lng :mapLibre.getCenter().lng,
      lat:mapLibre.getCenter().lat,
      userId: userId.id,
      userPreferences: filterJson,
      url : this.router.url, //TODO
    }
    
    return userContext;
   }

//#region UserContext in Local Storage

  /**
   * Sauvegarde des préférences d'affichages
   */
  public async saveUserContextInLocalStorage (): Promise<void>  {
    const userContext =  await this.getCurrentUserContextHome();
    this.setUserContextInLocalStorage(this.router.url,userContext);
  }

//#endregion

//#region UserContext in Database

  /**
   * Sauvegarde des préférences d'affichages
   */
  public async saveUserContextInBase (): Promise<void>  {
    const userContext =  await this.getCurrentUserContextHome();
    this.userDataService.saveUsercontext(userContext);
  }

  public restoreUserContextFromBase() : void{
    this.userDataService.getUserInformation().subscribe((userInfo: User) => {
      //showing drawer panel if needed
    if (!this.router.url.includes('asset')) {
      this.router.navigate(['/home/asset']);
    }
      this.restoreUserContext(userInfo.userContext);
    });
  }

//#endregion

  /**
   * Restoring users view preferences
   */
  public async restoreUserContext(userContext : UserContext): Promise<void> {
    if (!userContext)
    return;
    if (userContext.url){
      this.router.navigate([userContext.url]);
      }
    this.mapService.getMap().setZoom(userContext.zoom);
    this.mapService.getMap().setCenter([userContext.lng,userContext.lat]);
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
  }

  public async restoreUserContextHome() : Promise<void>{
    const userContextHome = await this.getUserContextInLocalStorage(DrawerRouteEnum.HOME);
    await this.restoreUserContext(userContextHome);
  }

}
