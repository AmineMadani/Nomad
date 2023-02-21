import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss'],
})
export class MainToolbarComponent implements OnInit, OnDestroy {
  @Input('title') title: string;
  public cacheLoaded: boolean = false;

  private ngUnsubscribe: Subject<void> = new Subject();

  constructor(
    private keycloakService: KeycloakService,
    private cacheService: CacheService
  ) {}

  ngOnInit() {
    this.cacheService
      .onCacheLoaded()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((loaded: boolean) => {
        this.cacheLoaded = loaded;
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  logout() {
    if (environment.keycloak.active) {
      this.keycloakService.logout();
    }
  }

  public reloadStorage(): void {
    this.cacheService.setCacheLoaded(false);
    this.cacheService.loadZips().subscribe(() => {
      this.cacheService.setCacheLoaded(true);
    });
  }
}
