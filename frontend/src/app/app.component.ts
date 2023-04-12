import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KeycloakService } from './core/services/keycloak.service';
import { Location } from '@angular/common';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs/internal/Subscription';
import { DialogService } from './core/services/dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet: IonRouterOutlet;

  public appPages = [
    { title: 'Accueil', url: '/home', icon: 'home' },
    { title: 'Analyse et reporting', url: '/report', icon: 'globe' },
    { title: 'Paramètres', url: '/settings', icon: 'settings' },
  ];
  constructor(
    private keycloakService: KeycloakService,
    private dialog: DialogService,
    private location: Location,
    private platform: Platform
  ) {}

  private sub: Subscription = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.platform.backButton.subscribeWithPriority(0, () => {
        if (this.dialog.hasDialog()) {
          this.dialog.close();
        } else {
          this.location.back();
        }
      })
    );

    if (this.keycloakService.hasValidToken()) {
      // from(this.cacheService.cacheIsAlreadySet())
      //   .pipe(
      //     switchMap((cacheSet: boolean) => {
      //       return cacheSet ? of(cacheSet) : this.cacheService.loadZips();
      //     })
      //   )
      //   .subscribe(() => {
      //     this.cacheService.setCacheLoaded(true);
      //   });
    } else {
      this.keycloakService.initialisation();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
