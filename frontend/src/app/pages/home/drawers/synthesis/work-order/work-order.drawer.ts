import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute, Params } from '@angular/router';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { Form } from 'src/app/shared/form-editor/models/form.model';
import { FormControl, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { ReferentialDataService } from 'src/app/core/services/dataservices/referential.dataservice';
import { MapService } from 'src/app/core/services/map/map.service';
import { FormEditorComponent } from 'src/app/shared/form-editor/form-editor.component';
import { filter, first, take } from 'rxjs';
import { TemplateDataService } from 'src/app/core/services/dataservices/template.dataservice';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.drawer.html',
  styleUrls: ['./work-order.drawer.scss'],
})
export class WorkOrderDrawer implements OnInit, OnDestroy {
  constructor(
    private router: ActivatedRoute,
    private alertCtrl: AlertController,
    private location: Location,
    private exploitationDateService: ExploitationDataService,
    private drawer: DrawerService,
    private layerService: LayerService,
    private referentialService: ReferentialDataService,
    private mapService: MapService,
    private templateDataService: TemplateDataService
  ) {
    this.router.queryParams
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((params) => {
        this.workOrder = MapFeature.from(params);
        this.workOrder.id = this.router.snapshot.paramMap.get('id');
        this.asset = params;
        if (!this.workOrder?.id) {
          this.buttons = [];
          this.editMode = true;
          this.createForm();
        }
      });
  }

  public buttons: SynthesisButton[] = [
    { key: 'note', label: 'Compte-rendu', icon: 'reader' },
    { key: 'add', label: 'Ajouter à un programme', icon: 'link' },
    { key: 'update', label: 'Mettre à jour', icon: 'pencil' },
  ];
  public editMode: boolean = false;
  public workOrder: any;
  public workOrderForm: FormGroup;
  public creationDisabled: boolean;

  private asset: Params;
  private markerCreation: any;
  private ngUnsubscribe$: Subject<void> = new Subject();

  @ViewChild('formEditor') formEditor: FormEditorComponent;

  ngOnInit(): void {
    if (this.editMode) {
      if (this.mapService.getMap()) {
        this.generateMarker();
      } else {
        this.mapService
          .onMapLoaded()
          .pipe(
            filter((isMapLoaded) => isMapLoaded),
            first()
          )
          .subscribe(() => {
            this.generateMarker();
          });
      }
    } else {
      if (this.workOrder['wts_id']) {
        this.referentialService
          .getReferential('workorder_task_status')
          .subscribe((lstatus) => {
            this.workOrder.labelStatus = lstatus.find(
              (status) => status.id.toString() === this.workOrder['wts_id']
            )['wts_llabel'];
          });
      }
    }
  }

  /**
   * Select the target form
   */
  public createForm(): void {
    this.workOrderForm = new FormGroup({
      ctrId: new FormControl(''),
      ctyId: new FormControl(''),
      wtrId: new FormControl(''),
      wkoName: new FormControl(''),
      wkoAddress: new FormControl(''),
      wkoAgentNb: new FormControl('1'),
      wkoPlanningStartDate: new FormControl(false),
      wkoPlanningEndDate: new FormControl(false),
      wkoEmergency: new FormControl(''),
      wkoAppointment: new FormControl(''),
      wkoCreationComment: new FormControl(''),
    });
  }

  /**
   * Action based on the button clicked
   * @param ev the buttons event
   */
  public onTabButtonClicked(ev: SynthesisButton): void {
    switch (ev.key) {
      case 'update':
        this.editMode = !this.editMode;
        break;
      case 'note':
        this.drawer.navigateTo(DrawerRouteEnum.REPORT, [this.workOrder.id]);
        break;
      default:
        break;
    }
  }

  /**
   * Generate title for workorder drawer
   * @returns Title of the workorder drawer
   */
  public getTitle(): string {
    return this.workOrder?.id
      ? 'I' + this.workOrder.id
      : 'Générer une intervention';
  }

  public onSubmit(): void {
    const { wtrId, ...form } = this.workOrderForm.value;

    const asset = {
      assObjRef: this.asset['id'],
      assObjTable: this.asset['lyr_table_name'],
      wtrId: wtrId,
      latitude: this.asset['y'],
      longitude: this.asset['x'],
    };

    form.tasks = [asset];
    form.latitude = form.tasks[0].latitude;
    form.longitude = form.tasks[0].longitude;

    this.exploitationDateService.createWorkOrder(form).subscribe((res) => {
      const mapFeature = MapFeature.from(res);
      this.markerCreation.remove();
      this.layerService.addGeojsonToLayer(res, 'workorder');
      this.drawer.navigateTo(DrawerRouteEnum.WORKORDER, [mapFeature.id], {
        lyr_table_name: this.asset['lyr_table_name'],
        ...res,
      });
    });
  }

  /**
   * Ask the user to cancel the workorder creation
   */
  public async onCancel() {
    const alert = await this.alertCtrl.create({
      header: `Souhaitez-vous vraiment annuler cette génération d’intervention ?`,
      buttons: [
        {
          text: 'Oui',
          role: 'confirm',
        },
        {
          text: 'Non',
          role: 'cancel',
        },
      ],
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.location.back();
    }
  }

  /**
   * Generate a marker on the map.
   * Case 1 : Marker on the equipment and only draggable on it
   * Case 2 : Marker on the map and draggable on all the map. Update the params if the position change (city&contract)
   */
  private generateMarker() {
    this.layerService.moveToXY(this.workOrder.x, this.workOrder.y).then(() => {
      if (this.workOrder.equipmentId && this.workOrder.lyr_table_name) {
        this.layerService
          .zoomOnXyToFeatureByIdAndLayerKey(
            this.workOrder.lyr_table_name,
            this.workOrder.equipmentId
          )
          .then(() => {
            this.layerService
              .getCoordinateFeaturesById(
                this.workOrder.lyr_table_name,
                this.workOrder.equipmentId
              )
              .then((result) => {
                this.markerCreation = this.layerService.addMarker(
                  this.workOrder.x,
                  this.workOrder.y,
                  result
                );
              });
          });
      } else {
        this.markerCreation = this.layerService.addMarker(
          this.workOrder.x,
          this.workOrder.y,
          [this.workOrder.x, this.workOrder.y],
          true
        );

        this.markerCreation.on('dragend', (e) => {
          this.referentialService
            .getReferentialIdByLongitudeLatitude(
              'contract',
              this.markerCreation.getLngLat().lng,
              this.markerCreation.getLngLat().lat
            )
            .subscribe((l_ctr_id) => {
              this.formEditor.paramMap.set('ctr_id', l_ctr_id.join(','));
            });
          this.referentialService
            .getReferentialIdByLongitudeLatitude(
              'city',
              this.markerCreation.getLngLat().lng,
              this.markerCreation.getLngLat().lat
            )
            .subscribe((l_cty_id) => {
              this.formEditor.paramMap.set('cty_id', l_cty_id.join(','));
            });
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.markerCreation) {
      this.markerCreation.remove();
    }
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
