import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { LocalStorageService } from './local-storage.service';
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
import { DrawerService } from './drawer.service';
import { Subject, takeUntil } from 'rxjs';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private drawerUnsubscribe: Subject<void> = new Subject();
  
  constructor(
    private userDataService: UserDataService,
    private mapService : MapService,
    private favoriteService : FavoriteService,
    private router : Router,
    private utilsService : UtilsService,
    private localStorageService : LocalStorageService,
    private drawerService : DrawerService,
    private filterService : FilterService
  ) { }


  /**
    * Create UserContext on Home page
    * @returns 
    */
  public async getCurrentUserContext() : Promise<UserContext>{
    const mapLibre : maplibregl.Map =  this.mapService.getMap();
    const userId : User = await this.getUser();
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
      url : this.router.url,
    }
        return userContext;
   }

  /**
   * Get the current user from local storage.
   * If the user is not found in local storage, get the user from the server and store it in local storage.
   * @returns A Promise that resolves to the current user, or undefined if the user is not found.
   */
   public async getUser() : Promise<User|undefined>{
      return await this.localStorageService.getUser();
   }

   /**
 * Store the given user in local storage.
 * @param user The user to store in local storage.
 */
   public setUser(user : User) : void {
    this.localStorageService.setUser(user);
   }

   /**
 * Remove the current user from local storage.
 */
   public resetUser(){
    this.localStorageService.resetUser();
   }

/**
 * Save User context in data base
 */
  public async saveUserContext (): Promise<void>  {
    const userContext =  await this.getCurrentUserContext();
    this.userDataService.saveUsercontext(userContext);
  }

  /**
   * Restoring users view preferences
   */
  public async restoreUserContext(userContext : UserContext): Promise<void> {

    if (!userContext)
      return;
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
         this.filterService.applyFilter(userPrefJson);
         if (userContext.url){
          this.router.navigateByUrl(userContext.url);
           }
  }
  
 /**
   * Restore te user context from base
   */
  public async restoreUserContextFromBase() : Promise<void>{
    this.userDataService.getUserInformation().subscribe((userInfo: User) => {
      this.restoreUserContext(userInfo.userContext);
    });
  }

    /**
   * Restore te user context from local storage
   * On le met ici sinon ca fait une dependance circulaire
   */
    public async restoreUserContextFromLocalStorage() : Promise<void>{
      const userContextHome = await this.localStorageService.getUserContext();
      await this.restoreUserContext(userContextHome);
    }
  

}
