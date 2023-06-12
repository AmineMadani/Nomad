import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppDB } from 'src/app/core/models/app-db.model';
import { UserContext } from 'src/app/core/models/user-context.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { ConfigurationService } from 'src/app/core/services/configuration.service';
import { UserDataService } from 'src/app/core/services/dataservices/user.dataservice';
import { KeycloakService } from 'src/app/core/services/keycloak.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
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
    private userDataService : UserDataService,
    private localStorageService : LocalStorageService ) {}

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
      this.localStorageService.getUser().then(usr => {
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
      this.keycloakService.logout().then(() => {
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
    const userContext : UserContext = await this.userService.getCurrentUserContext();
    this.userDataService.saveUsercontext(userContext);
  }

  /**
   * Restoring users view preferences
   */
  public restoreContext(): void {
    this.userService.restoreUserContextFromBase();
  }
}
