import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KeycloakService } from './core/services/keycloak.service';
import { Location } from '@angular/common';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs/internal/Subscription';
import { DialogService } from './core/services/dialog.service';
import { register } from 'swiper/element/bundle';
import { UtilsService } from './core/services/utils.service';
import { Router } from '@angular/router';
import { DrawerRouteEnum } from './core/models/drawer.model';
import { UserContext } from './core/models/user-context.model';
import { UserContextService } from './core/services/user-context.service';

register();

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
    private platform: Platform,
    private utils: UtilsService,
    private userContextService : UserContextService,
    private router: Router
  ) {
    this.keycloakService.configure()
  }

  public userProfile: any;
  public hasValidAccessToken = false;
  public realmRoles: string[] = [];

  public isMobile: boolean;

  private sub: Subscription = new Subscription();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
    this.keycloakService.initialisation();

    this.sub.add(
      this.platform.backButton.subscribeWithPriority(0, () => {
        if (this.dialog.hasDialog()) {
          this.dialog.close();
        } else {
          this.location.back();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async onClick(url : string){

    const currentRoute = this.userContextService.getMainDrawerNameRoute(this.router.url);
    let userContext = new UserContext();
    //save current context (currently, we only have filter for HOME)
    if (currentRoute == DrawerRouteEnum.HOME){
      userContext = (await this.userContextService.getCurrentUserContextHome());
    }
    // Save the current context Home
    this.userContextService.setUserContextInLocalStorage(currentRoute, userContext);
  } 
}
