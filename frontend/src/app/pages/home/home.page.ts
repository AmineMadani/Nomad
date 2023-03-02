import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MapComponent } from './components/map/map.component';
import { BackLayer, MAP_DATASET } from './components/map/map.dataset';
import { Subject, takeUntil } from 'rxjs';
import { DrawerRouteEnum, DrawerTypeEnum } from './drawers/drawer.enum';
import { DrawerService } from './drawers/drawer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    public drawerService: DrawerService
  ) {}

  @ViewChild('interactiveMap') interactiveMap: MapComponent;

  public drawerRouteEnum = DrawerRouteEnum;
  public drawerTypeEnum = DrawerTypeEnum;
  public drawerHasBeenOpened: boolean = false;
  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;
  public drawerType: DrawerTypeEnum = DrawerTypeEnum.DRAWER;

  public backLayers: BackLayer[];

  private drawerUnsubscribe: Subject<void> = new Subject();

  ngOnInit() {
    this.backLayers = MAP_DATASET.filter((bl) => bl.visible);

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
      });
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

  onBottomSheetDismiss() {
    this.drawerService.closeDrawer();
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }
}
