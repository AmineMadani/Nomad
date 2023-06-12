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
import { LocalStorageService } from './core/services/local-storage.service';
import { UserService } from './core/services/user.service';

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
    private localStorageService : LocalStorageService,
    private router: Router,
    private userService : UserService
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

  /**
   * Click on page navigation
   * @param url : page we are navigating to
   */
  async onClick(url : string){

    const navigatePageFrom = this.utils.getMainPageName(this.router.url);
    let userContext = new UserContext();
    //save user context when we quit the Home Page
    if (navigatePageFrom == DrawerRouteEnum.HOME){
      userContext = await this.userService.getCurrentUserContext();
      this.localStorageService.setUserContext(userContext);
    }
  } 
}
