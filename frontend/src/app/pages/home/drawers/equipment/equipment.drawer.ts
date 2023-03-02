import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UtilsService } from 'src/app/services/utils.service';
import { DrawerRouteEnum } from '../drawer.enum';
import { DrawerService } from '../drawer.service';
import { sections } from './equipment-drawer.dataset';
import { ActionButton, Equipment, Section } from './equipment-drawer.model';

@Component({
  selector: 'app-equipment-drawer',
  templateUrl: './equipment.drawer.html',
  styleUrls: ['./equipment.drawer.scss'],
})
export class EquipmentDrawer implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService
  ) {}

  @Input() equipmentId: number = 1111111;

  public drawerRouteEnum = DrawerRouteEnum;
  public previousRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;
  public equipment: Equipment;
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
  sections: Section[] = sections;

  ngOnInit() {
    // Subscribe to drawer open changes
    this.drawerService
      .onPreviousRouteChanged()
      .pipe(takeUntil(this.drawerUnsubscribe))
      .subscribe((route: DrawerRouteEnum) => {
        this.previousRoute = route;
      });
    // TODO: Use an API call to get the equipment details
    this.equipment = {
      id: this.equipmentId,
    };
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
