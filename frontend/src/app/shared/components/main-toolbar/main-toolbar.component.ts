import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { AppDB } from 'src/app/core/models/app-db.model';
import { User } from 'src/app/core/models/user.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { ConfigurationService } from 'src/app/core/services/configuration.service';
import { KeycloakService } from 'src/app/core/services/keycloak.service';
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
    private configurationService: ConfigurationService ) {}

  @ViewChild('popover', { static: true }) popover: IonPopover;

  @Input('title') title: string;
  @Input('minimalist') minimalist: boolean = false;

  public cacheLoaded: boolean = false;
  public isPopoverOpen: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();

  imgUrl: string | undefined;

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
      this.userService.getCurrentUser().then(usr => {
        this.imgUrl = usr?.imgUrl;
      });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public openPopover(e: Event): void {
    if (!this.minimalist) {
      this.popover.event = e;
      this.isPopoverOpen = true;
    }
  }

  public logout(): void {
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
    });
    window.location.reload();
  }

  public reloadStorage(): void {
    this.cacheService.setCacheLoaded(false);
  }

  /**
   * Sauvegarde des préférences d'affichages
   */
  public async saveContext (): Promise<void>  {
    const user : User = await this.userService.getCurrentUserContext();
    this.userService.updateCurrentUser(user);
  }

  /**
   * Restoring users view preferences
   */
  public restoreContext(): void {
    this.userService.restoreUserContextFromBase();
  }
}
