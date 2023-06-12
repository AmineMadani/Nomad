import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from './components/map/map.component';
import { Subject,Subscription,filter,map,takeUntil } from 'rxjs';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { IonModal, ModalController, createAnimation } from '@ionic/angular';
import { DrawerRouteEnum, DrawerTypeEnum } from 'src/app/core/models/drawer.model';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { MobileHomeActionsComponent } from './components/mobile-home-actions/mobile-home-actions.component';
import { UserService } from 'src/app/core/services/user.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    public drawerService: DrawerService,
    private layerDataServie: LayerDataService,
    private modalCtrl: ModalController,
    private userService : UserService,
    private router : Router,
    private mapService : MapService
  ) {
    this.drawerService.initDrawerListener();
  }

  animationBuilder = (baseEl: any, opts?: any) => {
    const enteringAnimation = createAnimation()
      .addElement(opts.enteringEl)
      .fromTo('opacity', 0, 1)
      .duration(250);

    const leavingAnimation = createAnimation()
      .addElement(opts.leavingEl)
      .fromTo('opacity', 1, 0)
      .duration(250);

    const animation = createAnimation()
      .addAnimation(enteringAnimation)
      .addAnimation(leavingAnimation);

    return animation;
  };

  @ViewChild('interactiveMap') interactiveMap: MapComponent;
  @ViewChild('modalDataLoading') modal: IonModal;
  @ViewChild('modal') drawerModal: IonModal;

  public drawerRouteEnum = DrawerRouteEnum;
  public drawerTypeEnum = DrawerTypeEnum;
  public drawerHasBeenOpened: boolean = false;
  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;
  public drawerType: DrawerTypeEnum = DrawerTypeEnum.DRAWER;

  public isMobile: boolean;

  private drawerUnsubscribe: Subject<void> = new Subject();

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
    this.initDrawer();
    this.initRestoreUserContext();
  }

  ngOnDestroy(): void {
    this.destroyDrawer();
  }

  private initDrawer() {
    this.drawerService
      .onCurrentRouteChanged()
      .pipe(takeUntil(this.drawerUnsubscribe))
      .subscribe((route: DrawerRouteEnum) => {
        this.currentRoute = route;
      });
    // Subscribe to drawer open changes
    this.drawerService
      .onDrawerHasBeenOpened()
      .pipe(takeUntil(this.drawerUnsubscribe))
      .subscribe((opened: boolean) => {
        this.drawerHasBeenOpened = opened;
      });
    // Subscribe to drawer type changes
    this.drawerService
      .onDrawerTypeChanged()
      .pipe(takeUntil(this.drawerUnsubscribe))
      .subscribe((drawerType: DrawerTypeEnum) => {
        this.drawerType = drawerType;
        //Fix for mobile version to stop bottom sheet scroll on scrollable content
        if (drawerType == DrawerTypeEnum.BOTTOM_SHEET) {
          setTimeout(() => {
            const sContents =
              document.getElementsByClassName('synthesis-content');
            for (let content of Array.from(sContents)) {
              (content as any).ontouchmove = function (e) {
                e.stopPropagation();
              };
            }
          }, 1000);
        }
      });
  }

  private destroyDrawer() {
    // Unsubscribe drawer
    this.drawerUnsubscribe.next();
    this.drawerUnsubscribe.complete();
    // Destroy drawer listener
    this.drawerService.destroyDrawerListener();
  }

  onBottomSheetDismiss(e: Event) {
    this.drawerService.closeDrawer();
  }

  isDataLoading(): boolean {
    return this.layerDataServie.isDataLoading();
  }

  listDataLoading(): string[] {
    return this.layerDataServie.getListLoadingData();
  }

  openModal() {
    this.modal.present();
  }

  async openActionSheet(type: string) {
    const modal = await this.modalCtrl.create({
      component: MobileHomeActionsComponent,
      componentProps: {
        type
      },
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.25,
      cssClass: 'mobile-home-actions'
    });
    modal.present();
  }

  private initRestoreUserContext() : void {
    //Lorsque la navigation vers la page est finie 
    this.router.events.pipe(filter( (event) => event instanceof NavigationEnd))
    .subscribe( (route : any ) => {
      if (route.url == this.utilsService.getPagePath(DrawerRouteEnum.HOME)){
        this.mapService.onMapLoaded().subscribe( () => {
          if (this.interactiveMap.displayMap)
          this.userService.restoreUserContextFromLocalStorage();
        })
        
      }
    });
}

}

