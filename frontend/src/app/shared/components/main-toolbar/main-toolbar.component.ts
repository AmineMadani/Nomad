import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CacheService } from 'src/app/core/services/cache.service';
import { KeycloakService } from 'src/app/core/services/keycloak.service';
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
    private utilsService: UtilsService
  ) {}

  @Input('title') title: string;

  @Input('minimalist') minimalist: boolean = false;

  public cacheLoaded: boolean = false;

  private ngUnsubscribe: Subject<void> = new Subject();

  isMobile : boolean = false;

  ngOnInit() {
    this.cacheService
      .onCacheLoaded()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((loaded: boolean) => {
        this.cacheLoaded = loaded;
      });
    
    this.isMobile = this.utilsService.isMobilePlateform();
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

  public reloadStorage(): void {
    this.cacheService.setCacheLoaded(false);
    this.cacheService.loadZips().subscribe(() => {
      this.cacheService.setCacheLoaded(true);
    });
  }
}
