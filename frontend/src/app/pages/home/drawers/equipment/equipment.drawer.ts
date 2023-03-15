import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subject, switchMap, takeUntil } from 'rxjs';
import { Equipment, EquipmentActionButton, EquipmentSection } from '../../../../core/models/equipment.model';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { EquipmentDataService } from 'src/app/core/services/dataservices/equipment.dataservice';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';

@Component({
  selector: 'app-equipment-drawer',
  templateUrl: './equipment.drawer.html',
  styleUrls: ['./equipment.drawer.scss'],
})
export class EquipmentDrawer implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private route: ActivatedRoute,
    private equipmentService: EquipmentDataService
  ) {}

  public drawerRouteEnum = DrawerRouteEnum;
  public previousRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;
  public equipment: any;

  private drawerUnsubscribe: Subject<void> = new Subject();

  sections: EquipmentSection[] = [];
  actionButtons: EquipmentActionButton[] = [];

  ngOnInit() {
    // Subscribe to drawer open changes
    this.drawerService
      .onPreviousRouteChanged()
      .pipe(takeUntil(this.drawerUnsubscribe))
      .subscribe((route: DrawerRouteEnum) => {
        this.previousRoute = route;
      });

    // Get all equipment sections and actions buttons
    this.sections = this.equipmentService.getSections();
    this.actionButtons = this.equipmentService.getActionButtons();

    // Get the equipment data from the query params or the database
    this.route.queryParams
      .pipe(
        switchMap((params: any) => {
          return this.equipmentService.getById(params.id).pipe(
            catchError((error) => {
              return of(params);
            })
          );
        })
      )
      .subscribe((equipment: any) => {
        this.equipment = equipment;
        // Remove sections that have no equipment data
        this.sections =
          this.sections.filter((section: EquipmentSection) => section.elements.some((element: any) => equipment[element.key]));
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe drawer
    this.drawerUnsubscribe.next();
    this.drawerUnsubscribe.complete();
  }

  onDrawerBack() {
    this.drawerService.goBack();
  }

  onDrawerClose() {
    this.drawerService.closeDrawer();
  }

  isMobile() {
    return this.utilsService.isMobilePlateform();
  }
}
