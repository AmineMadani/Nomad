import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { DrawerRouteEnum } from './drawer.enum';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  constructor(private router: Router) {}

  private routerEventsSubscription: Subscription;

  // We use a BehaviorSubject to store the current route
  private currentRoute$: BehaviorSubject<DrawerRouteEnum> =
    new BehaviorSubject<DrawerRouteEnum>(DrawerRouteEnum.HOME);
  // We use a BehaviorSubject to store the state of the drawer
  private drawerHasBeenOpened$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  onRouteChanged(): Observable<DrawerRouteEnum> {
    return this.currentRoute$.asObservable();
  }

  onDrawerHasBeenOpened(): Observable<boolean> {
    return this.drawerHasBeenOpened$.asObservable();
  }

  initDrawerListener() {
    this.routerEventsSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // If the current url is in the DrawerUrlEnum
        const currentRoute = event.urlAfterRedirects;
        if (Object.values(DrawerRouteEnum).includes(currentRoute)) {
          // We set the current url to the new url
          this.currentRoute$.next(currentRoute);

          // If the current url is not the home page, we open the drawer
          if (currentRoute !== DrawerRouteEnum.HOME) {
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

  navigateTo(route: DrawerRouteEnum) {
    this.router.navigate([route]);
  }

  closeDrawer() {
    this.router.navigate([DrawerRouteEnum.HOME]);
  }
}
