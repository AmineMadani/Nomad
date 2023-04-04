import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, combineLatest, filter, first, last, of, Subject, switchMap, takeLast, takeUntil } from 'rxjs';
import { Equipment, EquipmentActionButton, EquipmentSection } from '../../../../core/models/equipment.model';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { EquipmentDataService } from 'src/app/core/services/dataservices/equipment.dataservice';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { LayerService } from 'src/app/core/services/map/layer.service';

@Component({
  selector: 'app-equipment-drawer',
  templateUrl: './equipment.drawer.html',
  styleUrls: ['./equipment.drawer.scss'],
})
export class EquipmentDrawer implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private route: ActivatedRoute,
    private equipmentService: EquipmentDataService,
    private layerService: LayerService
  ) {}

  public drawerRouteEnum = DrawerRouteEnum;
  public previousRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;
  public equipment: Equipment;

  private drawerUnsubscribe: Subject<void> = new Subject();

  sections: EquipmentSection[] = [];
  actionButtons: EquipmentActionButton[] = [];

  ngOnInit() {
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
      .subscribe((equipment: Equipment) => {
        this.equipment = equipment;
        if(this.equipment.layerKey) {
          this.layerService.zoomToFeatureByIdAndLayerKey(this.equipment.id+'',this.equipment.layerKey);
        }

        // Remove sections that have no equipment data
        this.sections =
          this.sections.filter((section: EquipmentSection) => section.elements.some((element: any) => equipment[element.key]));
      });
  }

  ionViewWillLeave() {
    if (this.equipment) {
      this.layerService.highlightFeature(this.equipment.layerKey!, this.equipment.id.toString());
    }
    this.drawerUnsubscribe.next();
    this.drawerUnsubscribe.complete();
  }

  onDrawerBack() {
    this.drawerService.goBack();
  }

  onDrawerClose() {
    this.ionViewWillLeave();
    this.drawerService.closeDrawer();
  }

  isMobile() {
    return this.utilsService.isMobilePlateform();
  }
}
