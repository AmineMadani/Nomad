import { Component, OnInit } from '@angular/core';
import { catchError, of, Subject, switchMap } from 'rxjs';
import { EquipmentActionButton } from '../../../../core/models/equipment.model';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { EquipmentDataService } from 'src/app/core/services/dataservices/equipment.dataservice';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { LayerReferencesService } from 'src/app/core/services/layer-reference.service';
import { actionButtons } from 'src/app/core/mocks/equipment/equipment-action-buttons.mock';
import { UserReference } from 'src/app/core/models/layer-references.model';

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
    private layerService: LayerService,
    private layerReferencesService: LayerReferencesService
  ) {}

  public drawerRouteEnum = DrawerRouteEnum;
  public previousRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;

  public equipment: any;
  public userReferences: UserReference[] = [];

  public actionButtons: EquipmentActionButton[] = [];

  private drawerUnsubscribe: Subject<void> = new Subject();

  ngOnInit() {
    // Get equipment actions buttons
    this.actionButtons = actionButtons;

    // Get the equipment data from the query params or the database
    this.route.queryParams
      .pipe(switchMap((params: any) => of(params)))
      .subscribe(async (params: any) => {
        if (params.layerKey && params.id) {

          if(params.extent) {
            // Zoom to the feature
            this.layerService.zoomOnXyToFeatureByIdAndLayerKey(params.extent.split(','),params.id.toString(),params.layerKey)
          }
          
          // Get references
          this.userReferences = await this.layerReferencesService.getUserReferences(params.layerKey);
          // Set equipement
          this.equipmentService.getById(params.id).pipe(
           catchError((error) => {
             return of(params);
           })
          ).subscribe((equipment) => {
            this.equipment = equipment;

            // Remove empty references from the list
            this.userReferences =
              this.userReferences.filter((element: UserReference) => this.equipment[element.referenceKey] || !element.isVisible);
          });
        }
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
