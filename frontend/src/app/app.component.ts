import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KeycloakService } from './core/services/keycloak.service';
import { Location } from '@angular/common';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs/internal/Subscription';
import { DialogService } from './core/services/dialog.service';
import { register } from 'swiper/element/bundle';
import { UtilsService } from './core/services/utils.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { WorkorderService } from './core/services/workorder.service';
import { DateTime } from 'luxon';
import packageInfo from '../../package.json';
import { PermissionCodeEnum } from './core/models/user.model';
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
    {
      title: 'Accueil',
      url: '/home',
      icon: 'home',
      displayed: () => true,
    },
    {
      title: 'Programmes',
      url: '/programs',
      icon: 'business',
      displayed: () => !this.isMobile,
    },
    {
      title: 'Paramètres',
      url: '/settings',
      icon: 'settings',
      displayed: () => !this.isMobile,
    },
    {
      title: 'Données hors connexion',
      url: '/offline-download',
      icon: 'cloud-offline',
      displayed: () => this.isMobile,
    },
  ];
  constructor(
    private keycloakService: KeycloakService,
    private dialog: DialogService,
    private location: Location,
    private platform: Platform,
    private utils: UtilsService,
    private workorderService: WorkorderService
  ) {
    this.keycloakService.configure();
    defineCustomElements(window);
  }

  public userProfile: any;
  public realmRoles: string[] = [];

  public isMobile: boolean;

  public version: string = packageInfo.version;

  private sub: Subscription = new Subscription();

  async ngOnInit(): Promise<void> {

    this.isMobile = this.utils.isMobilePlateform();
    // Don't show the settings page if mobile plateform
    if (this.isMobile) {
      this.appPages = this.appPages.filter(
        (page) => !['/settings', '/programs'].includes(page.url)
      );
    } else {
      this.appPages = this.appPages.filter(
        (page) => page.url !== '/offline-download'
      );
    }

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

    // Synchronize workorders all 15 minutes to send and refresh cached values to the server
    this.workorderService.startPeriodicSyncWorkorders();
    this.workorderService.dateWorkorderSwitch = DateTime.now()
      .minus({ months: 3 })
      .toJSDate();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
