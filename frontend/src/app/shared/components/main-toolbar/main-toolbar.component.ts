import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppDB } from 'src/app/core/models/app-db.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { KeycloakService } from 'src/app/core/services/keycloak.service';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { environment } from 'src/environments/environment';

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
    private userService: UserService
  ) {}

  @Input('title') title: string;

  @Input('minimalist') minimalist: boolean = false;

  public cacheLoaded: boolean = false;

  private ngUnsubscribe: Subject<void> = new Subject();

  imgUrl: string|undefined;

  isMobile : boolean = false;

  ngOnInit() {
    this.cacheService
      .onCacheLoaded()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((loaded: boolean) => {
        this.cacheLoaded = loaded;
      });
    
    this.isMobile = this.utilsService.isMobilePlateform();
    this.userService.getUser().then(usr => {
      this.imgUrl = usr?.imgUrl;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  logout() {
    if (environment.keycloak.active) {
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
}
