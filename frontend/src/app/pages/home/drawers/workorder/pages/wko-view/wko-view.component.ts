import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CancelWorkOrder,
  Workorder,
} from 'src/app/core/models/workorder.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-wko-view',
  templateUrl: './wko-view.component.html',
  styleUrls: ['./wko-view.component.scss'],
})
export class WkoViewComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private referentialService: ReferentialService,
    private workorderService: WorkorderService,
    private mapLayerService: MapLayerService,
    private mapService: MapService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  public workOrder: Workorder;

  public assetLabel: string;
  public status: string;
  public reason: string;

  public loading: boolean = true;

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.mapService
      .onMapLoaded()
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(async () => {
        const { id } = this.activatedRoute.snapshot.params;

        this.workOrder = await this.workorderService.getWorkorderById(id);

        console.log(this.workOrder);

        await this.mapLayerService.zoomOnXyToFeatureByIdAndLayerKey(
          'workorder',
          id
        );

        Promise.all([
          this.referentialService.getReferential('workorder_task_status'),
          this.referentialService.getReferential('workorder_task_reason'),
          this.referentialService.getReferential('asset'),
        ]).then((res) => {
          this.status = res[0].find(
            (refStatus) =>
              refStatus.id.toString() === this.workOrder.wtsId.toString()
          ).wts_llabel;
          this.status =
            this.status.charAt(0).toUpperCase() + this.status.slice(1);
          this.reason = res[1].find(
            (refReason) =>
              refReason.id.toString() ===
              this.workOrder.tasks[0].wtrId.toString()
          ).wtr_llabel;

          this.loading = false;
        });
      });
  }

  /**
   * Displays an alert to prompt the user to enter a reason for canceling
   * a work order, and then sends a request to cancel the work order with the entered reason.
   */
  public async cancelWorkorder(): Promise<void> {
    const alertReason = await this.alertCtrl.create({
      header: "Veuillez saisir le motif de l'annulation de cette intervention",
      message: '',
      inputs: [
        {
          name: 'cancelComment',
          placeholder: 'Motif',
          attributes: {
            required: true,
          },
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
      this.workorderService.cancelWorkorder(cancelWko).subscribe((res) => {
        this.workOrder.wtsId = 5;
        this.getStatus();
        this.displayCancelToast('Modification enregistré avec succès.');
      });
    }
  }

  private async getStatus(): Promise<void> {
    const statusRef = await this.referentialService.getReferential(
      'workorder_task_status'
    );
    this.status = statusRef.find(
      (refStatus) => refStatus.id.toString() === this.workOrder.wtsId.toString()
    ).wts_llabel;
    this.status = this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }

  /**
   * Display a success message after cancel a workorder
   */
  private async displayCancelToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }
}
