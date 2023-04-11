import { LocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { BehaviorSubject, filter, Observable, tap } from 'rxjs';
import { Subscription } from 'rxjs';
import { DrawerRouteEnum, DrawerTypeEnum, drawerRoutes } from '../models/drawer.model';
import { UtilsService } from 'src/app/core/services/utils.service';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  constructor(
    private router: Router,
    private location: LocationStrategy,
    private utilsService: UtilsService,
    private nav: NavController
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
  private currentDrawerType$: BehaviorSubject<DrawerTypeEnum> =
    new BehaviorSubject<DrawerTypeEnum>(DrawerTypeEnum.DRAWER);

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

  initDrawerListener() {
    this.routerEventsSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        tap((event: any) => {
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
        })
      )
      .subscribe((currentRoute: any) => {
        const currentRouteName: DrawerRouteEnum = currentRoute.name;
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
          // If the current route is EQUIPMENT/INTERVENTION and the device is mobile, we set the drawer type to BOTTOM_SHEET
          if (
            [DrawerRouteEnum.EQUIPMENT, DrawerRouteEnum.INTERVENTION].includes(currentRouteName) &&
            this.utilsService.isMobilePlateform()
          ) {
            this.currentDrawerType$.next(DrawerTypeEnum.BOTTOM_SHEET);
            this.drawerHasBeenOpened$.next(false);
          } else {
            this.currentDrawerType$.next(DrawerTypeEnum.DRAWER);
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
    queryParams?: any
  ) {
    let url: string = this.getUrlFromDrawerName(route);

    pathVariables.forEach((pathVariable) => {
      url = url.replace(/:[^\/]+/, pathVariable);
    });
    this.router.navigate([url], { queryParams: queryParams });
  }

  closeDrawer() {
    const url: string = this.getUrlFromDrawerName(DrawerRouteEnum.HOME);
    //this.router.navigate([url]);
    this.nav.navigateBack(url);
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

  goBack() {
    this.location.back();
  }
}
