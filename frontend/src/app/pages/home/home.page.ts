import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from './components/map/map.component';
import { BackLayer } from './components/map/map.dataset';
import { Subject,takeUntil } from 'rxjs';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { IonModal, createAnimation } from '@ionic/angular';
import { DrawerRouteEnum, DrawerTypeEnum } from 'src/app/core/models/drawer.model';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { MapService } from 'src/app/core/services/map/map.service';

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
    private mapService : MapService
  ) {}

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

  public backLayers: BackLayer[];

  private drawerUnsubscribe: Subject<void> = new Subject();

  ngOnInit() {
    this.mapService.getBaseMaps().subscribe(backLayerArray => {
      this.backLayers = backLayerArray.filter(bl => bl.mapDisplay)
    });
    this.initDrawer();
  }

  ngOnDestroy(): void {
    this.destroyDrawer();
  }

  private initDrawer() {

    // Init drawer listener
    this.drawerService.initDrawerListener();
    // Subscribe to drawer route changes
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
        if(drawerType == DrawerTypeEnum.BOTTOM_SHEET){
          setTimeout(() => {
            const sContents = document.getElementsByClassName('synthesis-content');
            for(let content of Array.from(sContents)){
              (content as any).ontouchmove = function (e) {
                e.stopPropagation();
              };
            }
          }, 1000);
        }
      });

          // Subscribe to drawer open changes
    // this.drawerService
    // .onCloseModal()
    // .pipe(takeUntil(this.drawerUnsubscribe))
    // .subscribe(() => {
    //   //this.drawerModal.dismiss();
    //   //this.drawerModal.dismiss({ rerouting: true });
    // });
  }

  private destroyDrawer() {
    // Unsubscribe drawer
    this.drawerUnsubscribe.next();
    this.drawerUnsubscribe.complete();
    // Destroy drawer listener
    this.drawerService.destroyDrawerListener();
  }

  onMapChange(keyMap: string) {
    this.interactiveMap.displayLayer(keyMap);
  }

  onBottomSheetDismiss(e: Event) {
    // if (e && (e as any)?.detail?.data?.rerouting) {
    //   return;
    // }
    this.drawerService.closeDrawer();
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

  isDataLoading(): boolean  {
    return this.layerDataServie.isDataLoading()
  }

  listDataLoading(): string[] {
    return this.layerDataServie.getListLoadingData();
  }

  openModal() {
    this.modal.present();
  }
}
