import { LocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { BehaviorSubject, filter, map, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { DrawerRouteEnum, DrawerTypeEnum, drawerRoutes } from '../models/drawer.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { WorkorderService } from './workorder.service';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  constructor(
    private router: Router,
    private location: LocationStrategy,
    private utilsService: UtilsService,
    private nav: NavController,
    private workorderService: WorkorderService
  ) {}
  private routerEventsSubscription: Subscription;

  // We use a BehaviorSubject to store the current route
  private currentRoute$: BehaviorSubject<DrawerRouteEnum> =
    new BehaviorSubject<DrawerRouteEnum>(DrawerRouteEnum.HOME);
  // We use a BehaviorSubject to store the previous route
  private previousRoute$: BehaviorSubject<DrawerRouteEnum> =
    new BehaviorSubject<DrawerRouteEnum>(DrawerRouteEnum.HOME);
  // We use a BehaviorSubject to store the state of the drawer
  private drawerHasBeenOpened$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  // We use a BehaviorSubject to store the previous route
  private currentDrawerType$: BehaviorSubject<DrawerTypeEnum> = new BehaviorSubject(DrawerTypeEnum.DRAWER);

  // If needing closing the modal on mobile
  private closeModal$: Subject<void> = new Subject();

  onCurrentRouteChanged(): Observable<DrawerRouteEnum> {
    return this.currentRoute$.asObservable();
  }

  onPreviousRouteChanged(): Observable<DrawerRouteEnum> {
    return this.previousRoute$.asObservable();
  }

  onDrawerHasBeenOpened(): Observable<boolean> {
    return this.drawerHasBeenOpened$.asObservable();
  }

  onDrawerTypeChanged(): Observable<DrawerTypeEnum> {
    return this.currentDrawerType$.asObservable();
  }

  onCloseModal(): Observable<void> {
    return this.closeModal$.asObservable();
  }

  initDrawerListener() {
    this.routerEventsSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: any) => {
          let route: ActivatedRoute = this.router.routerState.root;
          while (route!.firstChild) {
            route = route.firstChild;
          }
          if (
            route.snapshot.data['name'] !== undefined &&
            route.snapshot.data['name'] !== null
          ) {
            event['name'] = route!.snapshot.data['name'];
          }
          return event;
        })
      )
      .subscribe((currentRoute: any) => {
        this.workorderService.removeLocalUnusedWorkorderFromUrl(currentRoute.url);
        const currentRouteName: DrawerRouteEnum = currentRoute.name;
        // If the current route is EQUIPMENT/INTERVENTION and the device is mobile, we set the drawer type to BOTTOM_SHEET
        if (
          [
            DrawerRouteEnum.EQUIPMENT,
            DrawerRouteEnum.REPORT,
            DrawerRouteEnum.WORKORDER,
            DrawerRouteEnum.WORKORDER_CREATION,
            DrawerRouteEnum.WORKORDER_EDITION,
            DrawerRouteEnum.WORKORDER_VIEW,
            DrawerRouteEnum.DEMANDE,
            DrawerRouteEnum.SELECTION,
          ].includes(currentRouteName) &&
          this.utilsService.isMobilePlateform()
        ) {
          this.currentDrawerType$.next(DrawerTypeEnum.BOTTOM_SHEET);
          this.drawerHasBeenOpened$.next(false);

        } else if ([DrawerRouteEnum.EQUIPMENT_DETAILS].includes(currentRouteName)) {
          this.currentDrawerType$.next(DrawerTypeEnum.DRAWER_FULL);

        } else if (currentRouteName === DrawerRouteEnum.HOME) {
          this.currentDrawerType$.next(DrawerTypeEnum.NONE);
        } else {
          this.currentDrawerType$.next(DrawerTypeEnum.DRAWER);
        }
        // If the current route name is in the drawer routes
        if (drawerRoutes.some((route) => route.name === currentRouteName)) {
          // We stock the previous route
          this.previousRoute$.next(this.currentRoute$.getValue());
          // We set the current route to the new route
          this.currentRoute$.next(currentRouteName);

          // If the current route is not the home route we set the drawer to opened
          if (currentRouteName !== DrawerRouteEnum.HOME) {
            this.drawerHasBeenOpened$.next(true);
          }
        }
      });
  }

  destroyDrawerListener() {
    this.currentRoute$.next(DrawerRouteEnum.HOME);
    this.drawerHasBeenOpened$.next(false);
    this.routerEventsSubscription.unsubscribe();
  }

  navigateTo(
    route: DrawerRouteEnum,
    pathVariables: any[] = [],
    queryParams?: any,
    replaceUrl: boolean = false
  ) {
    let url: string = this.getUrlFromDrawerName(route);

    pathVariables?.forEach((pathVariable) => {
      url = url.replace(/:[^\/]+/, pathVariable);
    });

    if (Array.isArray(queryParams)) {
      queryParams = this.generateFeatureParams(queryParams);
    }

    this.router.navigate([url], { queryParams: queryParams, replaceUrl });
  }

  navigateWithEquipments(route: DrawerRouteEnum, equipments: any[], queryParams?: any): void {
    const url = this.getUrlFromDrawerName(route);
    const eqParams = this.utilsService.generateFeatureParams(equipments);

    this.router.navigate([url], { queryParams: { ...eqParams, ...queryParams } });
  }

  navigateWithWko(route: DrawerRouteEnum, pathVariables: any[] = [], tasks: any[], queryParams?: any): void {
    let url = this.getUrlFromDrawerName(route);
    pathVariables?.forEach((pathVariable) => {
      url = url.replace(/:[^\/]+/, pathVariable);
    });
    const eqParams = this.utilsService.generateTaskParams(tasks);
    this.router.navigate([url], { queryParams: { ...eqParams, ...queryParams } });
  }

  closeDrawer() {
    const url: string = this.getUrlFromDrawerName(DrawerRouteEnum.HOME);
    //this.router.navigate([url]);
    this.nav.navigateBack(url);
  }

  closeModal() {
    this.closeModal$.next();
  }

  private getUrlFromDrawerName(route: DrawerRouteEnum): string {
    let url: string | undefined = drawerRoutes.find(
      (drawerRoute) => drawerRoute.name === route
    )?.path;

    if (!url) {
      throw new Error(
        'Invalid route name. Add your missing route name in drawerRoutes'
      );
    }

    return url;
  }

  setLocationBack() {
    this.location.back();
  }

  public generateFeatureParams(features: any[]): any {
    const featureParams: any = {};

    features.forEach(feature => {
      const source = feature.lyrTableName || feature.source;

      if (!featureParams[source]) {
        featureParams[source] = new Set();
      }

      featureParams[source].add(feature.id);
    });

    // Convert the Sets to comma-separated strings
    Object.keys(featureParams).forEach(source => {
      featureParams[source] = Array.from(featureParams[source]).join(',');
    });

    return featureParams;
  }
}
