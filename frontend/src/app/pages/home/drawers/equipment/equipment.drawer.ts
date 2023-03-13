import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subject, switchMap, takeUntil } from 'rxjs';
import { UtilsService } from 'src/app/services/utils.service';
import { DrawerRouteEnum } from '../drawer.enum';
import { DrawerService } from '../../../../services/drawer.service';
import { ActionButton, Section } from './equipment-drawer.model';
import { ActivatedRoute } from '@angular/router';
import { EquipmentDataService } from 'src/app/services/dataservices/equipment.dataservice';

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
  public actionButtons: ActionButton[] = [
    {
      icon: 'person-circle-outline',
      label: 'Déclencher une intervention',
      onClick: () => {
        // TODO: Trigger an intervention
      },
    },
    {
      icon: 'pencil-outline',
      label: 'Compte-rendu',
      onClick: () => {
        // TODO: Generate a report
      },
    },
    {
      icon: 'alert-circle',
      label: "Demande d'intervention",
      onClick: () => {
        // TODO: Request an intervention
      },
    },
    {
      icon: 'add',
      label: 'Ajouter un programme',
      onClick: () => {
        // TODO: Add a program
      },
    },
    {
      icon: 'reload',
      label: 'Mettre à jour',
      onClick: () => {
        // TODO: Launch an update
      },
    },
  ];

  private drawerUnsubscribe: Subject<void> = new Subject();

  // TODO: Add the recuperation of all sections and their alias in the database instead of use static data
  sections: Section[] = [];

  ngOnInit() {
    // Subscribe to drawer open changes
    this.drawerService
      .onPreviousRouteChanged()
      .pipe(takeUntil(this.drawerUnsubscribe))
      .subscribe((route: DrawerRouteEnum) => {
        this.previousRoute = route;
      });

    // Get all equipment sections
    this.sections = this.equipmentService.getSections();

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
