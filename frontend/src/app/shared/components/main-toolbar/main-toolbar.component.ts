import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfo } from 'angular-oauth2-oidc';
import { Subject, takeUntil } from 'rxjs';
import { AppDB } from 'src/app/core/models/app-db.model';
import { AccordeonFilter } from 'src/app/core/models/filter/filter-component-models/AccordeonFilter.model';
import { FavoriteFilter } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import { SearchFilter } from 'src/app/core/models/filter/filter-component-models/SearchFilter.model';
import { ToggleFilter } from 'src/app/core/models/filter/filter-component-models/ToggleFilter.model';
import { TreeFilter } from 'src/app/core/models/filter/filter-component-models/TreeFilter.model';
import { WorkOrderFilter } from 'src/app/core/models/filter/filter-component-models/WorkOrderFilter.model';
import { UserContext } from 'src/app/core/models/user-context.model';
import { User } from 'src/app/core/models/user.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { ConfigurationService } from 'src/app/core/services/configuration.service';
import { UserDataService } from 'src/app/core/services/dataservices/user.dataservice';
import { FavoriteService } from 'src/app/core/services/favorite.service';
import { KeycloakService } from 'src/app/core/services/keycloak.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { PreferenceService } from 'src/app/core/services/preference.service';
import { LocalStorageKey, UserContextService } from 'src/app/core/services/user-context.service';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss'],
})
export class MainToolbarComponent implements OnInit, OnDestroy {

  constructor(
    private keycloakService: KeycloakService,
    private cacheService: CacheService,
    private utilsService: UtilsService,
    private userService: UserService,
    private configurationService: ConfigurationService,
    private mapService : MapService,
    private userDataService : UserDataService,
    private preferenceService : PreferenceService,
    private favoriteService: FavoriteService,
    private router: Router,
    private userContextService : UserContextService
  ) {}

  @Input('title') title: string;

  @Input('minimalist') minimalist: boolean = false;

  public cacheLoaded: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();

  imgUrl: string|undefined;

  isMobile : boolean = false;

  ngOnInit() {
    this.cacheService
      .onCacheLoaded()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((loaded: boolean) => {
        this.cacheLoaded = loaded;
      });

    this.isMobile = this.utilsService.isMobilePlateform();

    if(!this.minimalist) {
      this.userService.getUser().then(usr => {
        this.imgUrl = usr?.imgUrl;
      });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  logout() {
    if (this.configurationService.keycloak.active) {
      this.keycloakService.logout().then(res => {
        window.location.reload();
      });
    }
  }

  public resetStorage(): void {
    const db = new AppDB();
    db.delete().then(
      () => console.log('Cache réinitialisé')
    ).catch((err) => {
      console.log(`Erreur lors de la réinitialisation : ${err}`)
    })
  }

  public reloadStorage(): void {
    this.cacheService.setCacheLoaded(false);
    this.cacheService.loadZips().subscribe(() => {
      this.cacheService.setCacheLoaded(true);
    });
  }

  /**
   * Sauvegarde des préférences d'affichages
   */
  public async saveContext (): Promise<void>  {
    const userContext : UserContext = await this.getCurrentContext();
    this.userDataService.saveUsercontext(userContext);
  }

  async getCurrentContext() : Promise<UserContext>{
    const mapLibre : maplibregl.Map =  this.mapService.getMap();
    const userId : User = await this.preferenceService.getPreference(LocalStorageKey.USER);
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
      userPreferences: filterJson
    }
    return userContext;
  }
  
  /**
   * Restoring users view preferences
   */
  public restoreContext(): void {
    this.userContextService.restoreUserContextFromBase();
  }
}
