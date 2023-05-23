import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute } from '@angular/router';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { HttpClient } from '@angular/common/http';
import { Form } from 'src/app/shared/form-editor/models/form.model';
import { FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { ReferentialDataService } from 'src/app/core/services/dataservices/referential.dataservice';
import { MapService } from 'src/app/core/services/map/map.service';
import { FormEditorComponent } from 'src/app/shared/form-editor/form-editor.component';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.drawer.html',
  styleUrls: ['./work-order.drawer.scss'],
})
export class WorkOrderDrawer implements OnInit, OnDestroy {

  constructor(
    private router: ActivatedRoute,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private location: Location,
    private exploitationDateService: ExploitationDataService,
    private drawer: DrawerService,
    private layerService: LayerService,
    private referentialService: ReferentialDataService,
    private mapService: MapService
  ) {
    this.router.queryParams
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((params) => {
        this.workOrder = MapFeature.from(params);
        this.workOrder.id = this.router.snapshot.paramMap.get('id');
        this.asset.set('ass_obj_ref', params['id']?.toString());
        this.asset.set('ass_obj_table', params['lyr_table_name']?.toString());
        if (!this.workOrder?.id) {
          this.buttons = [];
        }
        this.createForm();
      });
  }

  public buttons: SynthesisButton[] = [
    { key: 'share', label: 'Partager', icon: 'share-social' },
    { key: 'print', label: 'Imprimer', icon: 'print' },
    //{ key: 'update', label: 'Mettre à jour', icon: 'pencil' },
  ];
  public workOrder: any;
  public workOrderForm: Form;
  public creationDisabled: boolean;
  public editMode: boolean = false;

  private asset: Map<String, string> = new Map<string, string>;
  private ngUnsubscribe$: Subject<void> = new Subject();
  private markerCreation: any;

  @ViewChild('formEditor') formEditor: FormEditorComponent;

  ngOnInit(): void {
    if (this.editMode) {
      if (this.mapService.getMap()) {
        this.generateMarker();
      } else {
        this.mapService.onMapLoaded().subscribe(() => {
          this.generateMarker();
        });
      }
    } else {
      this.referentialService.getReferential('workorder_task_status').subscribe(lstatus => {
        this.workOrder.labelStatus = (lstatus.find(status => status.id.toString() === this.workOrder['wts_id']))['wts_llabel'];
      });
    }
  }

  private generateMarker() {
    this.layerService.moveToXY(this.workOrder.x, this.workOrder.y).then(() => {
      if (this.workOrder.equipmentId && this.workOrder.lyr_table_name) {
        this.layerService.zoomOnXyToFeatureByIdAndLayerKey(this.workOrder.lyr_table_name, this.workOrder.equipmentId).then(() => {
          this.markerCreation = this.layerService.addMarker(this.workOrder.x, this.workOrder.y, this.layerService.getCoordinateFeaturesById(this.workOrder.lyr_table_name, this.workOrder.equipmentId));
        });
      } else {
        this.markerCreation = this.layerService.addMarker(this.workOrder.x, this.workOrder.y, [this.workOrder.x, this.workOrder.y], true);
        this.markerCreation.on('dragend', (e) => {
          this.referentialService.getReferentialIdByLongitudeLatitude('contract', this.markerCreation.getLngLat().lng, this.markerCreation.getLngLat().lat).subscribe( l_ctr_id => {
            this.formEditor.paramMap.set('ctr_id',l_ctr_id.join(','));
            console.log(this.formEditor.paramMap);
          });
          this.referentialService.getReferentialIdByLongitudeLatitude('city', this.markerCreation.getLngLat().lng, this.markerCreation.getLngLat().lat).subscribe( l_cty_id => {
            this.formEditor.paramMap.set('cty_id',l_cty_id.join(','));
            console.log(this.formEditor.paramMap);
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

  // Security while still using Ion Router
  ionViewWillLeave(): void {
    if (this.markerCreation) {
      this.markerCreation.remove();
    }
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public createForm(): void {
    let form = 'work-order.mock.json';
    if (!this.workOrder.id) {
      form = 'work-order-create.mock.json';
      this.editMode = true;
    }
    this.http
      .get<Form>('./assets/mocks/' + form)
      .subscribe((woForm: Form) => {
        this.workOrderForm = woForm;
      });
  }

  public onTabButtonClicked(ev: SynthesisButton): void {
    switch (ev.key) {
      case 'update':
        this.editMode = !this.editMode;
        break;
      default:
        break;
    }
  }

  /**
   * Generate title for workorder drawer
   * @returns Title of the workorder drawer
   */
  getTitle(): string {
    return this.workOrder?.id ? 'I' + this.workOrder.id : 'Générer une intervention';
  }

  onSubmit(form: FormGroup) {
    const lyr_table_name = 'workorder';
    form.markAllAsTouched();


    console.log(this.formEditor);
    if (form.valid) {
      this.creationDisabled = true;
      let createdWorkOrder = form.value;
      createdWorkOrder['longitude'] = this.markerCreation.getLngLat().lng;
      createdWorkOrder['latitude'] = this.markerCreation.getLngLat().lat;
      this.exploitationDateService.createWorkOrder(createdWorkOrder, this.asset).subscribe(res => {
        let mapFeature = MapFeature.from(res);
        this.markerCreation.remove();
        this.layerService.addGeojsonToLayer(res, lyr_table_name);
        this.drawer.navigateTo(DrawerRouteEnum.WORKORDER, [mapFeature.id], { lyr_table_name, ...res });
      });
    }
  }

  async onCancel() {
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
      ]
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.location.back();
    }
  }
}
