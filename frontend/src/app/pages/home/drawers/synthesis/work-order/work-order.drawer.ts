import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { WkoCreationComponent } from './wko-creation/wko-creation.component';
import { WorkorderDataService } from 'src/app/core/services/dataservices/workorder.dataservice';
import { CancelWorkOrder } from 'src/app/core/models/workorder.model';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { Status } from 'src/app/core/models/status.model';
import { WkoViewComponent } from './wko-view/wko-view.component';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.drawer.html',
  styleUrls: ['./work-order.drawer.scss'],
})
export class WorkOrderDrawer implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private location: Location,
    private drawerService: DrawerService,
    private workorderDataService: WorkorderDataService,
    private referentialService: ReferentialService,
    private toastController: ToastController
  ) {}

  // As the component is in a ng-template, it's not accessible with a simple ViewChild
  @ViewChildren(WkoCreationComponent)
  public wkoCreations: QueryList<WkoCreationComponent>;

  @ViewChildren(WkoViewComponent)
  public wkoViews: QueryList<WkoCreationComponent>;

  public buttons: SynthesisButton[] = [
    { key: 'note', label: 'Compte-rendu', icon: 'reader' },
    { key: 'add', label: 'Ajouter à un programme', icon: 'link' },
    { key: 'update', label: 'Mettre à jour', icon: 'pencil' },
    { key: 'cancel', label: 'Annuler', icon: 'trash-bin' },
  ];
  public editMode: boolean = false;
  public workOrder: any;
  public equipments: any[];

  public creationDisabled: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {}

  public onInitWorkorder(params: any): void {
    // Case creation
    if (this.activatedRoute.snapshot.params['id']) {
      this.workOrder = params;
      // Disable cancel button if status is canceled or terminated
      this.referentialService
        .getReferential('workorder_task_status')
        .then((res) => {
          let status: Status = res.find(
            (status) => status.id === this.workOrder.wts_id
          );
          this.buttons.find((b) => b.key === 'cancel').disabled =
            status.wts_code === 'ANNULE' || status.wts_code === 'TERMINE';
        });
    } else {
      this.equipments = Array.isArray(params) ? params : [params];
      this.buttons = [];
      this.editMode = true;
    }
  }

  /**
   * Action based on the button clicked
   * @param ev the buttons event
   */
  public onTabButtonClicked(ev: SynthesisButton): void {
    switch (ev.key) {
      case 'update':
        // Not implemented yet
        // this.editMode = !this.editMode;
        break;
      case 'note':
        this.drawerService.navigateTo(DrawerRouteEnum.REPORT, [
          this.workOrder.id,
        ]);
        break;
      case 'cancel':
        this.cancelWorkorder();
        break;
      default:
        break;
    }
  }

  /**
   * Displays an alert to prompt the user to enter a reason for canceling
   * a work order, and then sends a request to cancel the work order with the entered reason.
   */
  public async cancelWorkorder(): Promise<void> {
    const alertReason = await this.alertCtrl.create({
      header: 'Veuillez saisir le motif de l\'annulation de cette intervention',
      message: '',
      inputs: [
        {
          name: 'cancelComment',
          placeholder: 'Motif',
          attributes: {
            required: true
          }
        },
      ],
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          handler: (data) => {
            if (data.cancelComment === '') {
              alertReason.message = 'Le champ est requis';
              return false;
            }
            return true;
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
        },
      ],
    });

    await alertReason.present();

    const { role, data } = await alertReason.onDidDismiss();

    if (role === 'confirm') {
      const cancelWko: CancelWorkOrder = {
        id: this.workOrder.id,
        cancelComment: data.values.cancelComment,
      };
      this.workorderDataService.cancelWorkOrder(cancelWko).subscribe((res) => {
        this.workOrder.wts_id = 5;
        this.wkoViews.first.ngOnInit();
        this.displayCancelToast(res.message);
      });
    }
  }

  /**
   * Display a success message after cancel a workorder
   */
  private async displayCancelToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  /**
   * Generate title for workorder drawer
   * @returns Title of the workorder drawer
   */
  public getTitle(): string {
    if (!this.workOrder && !this.equipments) {
      return null;
    }

    return this.workOrder
      ? 'I' + this.workOrder.id
      : 'Générer une intervention';
  }

  public onSubmit(): void {
    this.wkoCreations.first.workOrderForm.markAllAsTouched();
    if (this.wkoCreations.first.workOrderForm.valid) {
      this.wkoCreations.first.onSubmit();
    }
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

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
