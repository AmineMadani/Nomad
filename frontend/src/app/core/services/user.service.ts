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
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 
  constructor(
    private userDataService: UserDataService,
    private mapService : MapService,
    private favoriteService : FavoriteService,
    private router : Router,
    private utilsService : UtilsService,
    private localStorageService : LocalStorageService,
    private filterService : FilterService
  ) { }


  /**
    * Create UserContext on Home page
    * @returns 
    */
  public async getCurrentUserContext() : Promise<UserContext>{
    const mapLibre : maplibregl.Map =  this.mapService.getMap();
    const userId : User = await this.localStorageService.getUser();
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
 * Save User context in data base
 */
  public async saveUserContext (): Promise<void>  {
    const userContext =  await this.getCurrentUserContext();
    this.userDataService.saveUsercontext(userContext);
  }

  /**
   * Restoring users view preferences
   */
  public async restoreUserContextNavigation(userContext : UserContext): Promise<void> {
    if (!userContext){
      return;
    }
    if (userContext.url){
      this.router.navigateByUrl(userContext.url).then( (res) => {
           this.restoreFilter(userContext);
      });
      }
      else{
        this.restoreFilter(userContext);
      }
  }

  private restoreFilter(userContext : UserContext): void {
    if (!userContext)
      return;
    this.mapService.setZoom(userContext.zoom);
    this.mapService.setCenter([userContext.lng,userContext.lat]);
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
  public async restoreUserContextFromBase() : Promise<void>{
    this.userDataService.getUserInformation().subscribe((userInfo: User) => {
      this.restoreFilter(userInfo.userContext);
    });
  }

    /**
   * Restore te user context from local storage
   * On le met ici sinon ca fait une dependance circulaire
   */
    public async restoreUserContextFromLocalStorage() : Promise<void>{
      const userContextHome = await this.localStorageService.getUserContext();
      await this.restoreUserContextNavigation(userContextHome);
    }
  

}
