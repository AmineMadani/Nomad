import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MapComponent } from './components/map/map.component';
import { BackLayer, MAP_DATASET } from './components/map/map.dataset';
import { Subject, takeUntil } from 'rxjs';
import { DrawerRouteEnum } from './drawers/drawer.enum';
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

  public drawerHasBeenOpened: boolean = false;
  public drawerRouteEnum = DrawerRouteEnum;
  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;

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
      .onRouteChanged()
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

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }
}
