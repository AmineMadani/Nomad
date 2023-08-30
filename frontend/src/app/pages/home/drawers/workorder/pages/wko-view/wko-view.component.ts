import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CancelWorkOrder,
  WkoStatus,
  Workorder,
} from 'src/app/core/models/workorder.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { AlertController, ToastController } from '@ionic/angular';
import { MapEventService, MultiSelection } from 'src/app/core/services/map/map-event.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { Attachment } from 'src/app/core/models/attachment.model';
import { AttachmentService } from 'src/app/core/services/attachment.service';

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
    private mapEventService: MapEventService,
    private mapService: MapService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private drawerService: DrawerService,
    private userService: UserService,
    private utilsService: UtilsService,
    private attachmentService: AttachmentService,
  ) { }

  public workOrder: Workorder;

  public listAttachment: Attachment[] = [];

  public assetLabel: string;
  public status: string;
  public reason: string;
  public selectedTask: any;
  public taskId: string;
  public loading: boolean = true;

  public userHasPermissionModifyReport: boolean = false;
  public userHasPermissionCreateProgram: boolean = false;

  public CanEdit() : boolean {
    return  !this.loading && this.workOrder  && (this.workOrder.wtsId === WkoStatus.CREE
                                        || this.workOrder.wtsId === WkoStatus.ENVOYEPLANIF);
  }

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.userHasPermissionModifyReport =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.MODIFY_REPORT_MY_AREA);
    this.userHasPermissionCreateProgram =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_PROGRAM_MY_AREA);

    this.mapService
      .onMapLoaded()
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(async () => {

        const { id } = this.activatedRoute.snapshot.params;
        this.taskId = this.activatedRoute.snapshot.params['taskid']?.toString();
        this.workOrder = await this.workorderService.getWorkorderById(id);

        // Get the list of attachment
        this.getListAttachment();
        

        this.checkTask(this.taskId);

        this.displayAndZoomTo(this.workOrder);

        this.selectedTask = this.workOrder.tasks[0];

        if (this.taskId) {
          this.selectedTask = this.workOrder.tasks.find(task => task.id.toString() == this.taskId);
        }

        const wtsid = this.selectedTask?.wtsId;
        const lyrTableName = this.selectedTask?.assObjTable;

        Promise.all([
          this.referentialService.getReferential('workorder_task_status'),
          this.referentialService.getReferential('workorder_task_reason'),
          this.referentialService.getReferential('layers'),
        ]).then((res) => {
          this.status = res[0].find(refStatus => refStatus.id == wtsid)?.wts_llabel;
          this.status = this.status?.charAt(0).toUpperCase() + this.status.slice(1);
          this.reason = res[1].find(
            (refReason) =>
              refReason.id.toString() === this.workOrder.tasks[0].wtrId.toString()
          )?.wtr_llabel;
          const layer = lyrTableName ? res[2].find(asset => asset.lyrTableName == lyrTableName) : null;
          this.assetLabel = layer ? layer.domLLabel + ' - ' + layer.lyrSlabel : null;
          this.loading = false;
        });
      });
  }

  /**
  * Update workorder
  */
  public updateWorkorder(): void {
    this.drawerService.navigateWithWko(DrawerRouteEnum.WORKORDER_EDITION,
      [this.workOrder.id],
      this.workOrder.tasks,
      {wkoId : this.workOrder.id}
    );
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
      this.workorderService.cancelWorkorder(cancelWko).subscribe(async (res) => {
        this.workOrder.wtsId = 5;
        this.getStatus();
        await this.workorderService.deleteStateWorkorder(this.workOrder)
        this.displayCancelToast('Modification enregistré avec succès.');
      });
    }
  }

  public onGenerateReport(): void {
    this.router.navigate(['/home/workorder/'+this.workOrder.id+'/cr'])
  }

  public onDisplayWorkorder(): void {
    this.router.navigate(['/home/workorder/'+this.workOrder.id]);
  }

  public openEquipment(): void {
    if (!(this.taskId || this.workOrder.tasks.length === 1)) {
      return;
    }

    const lyrTableName = this.selectedTask.assObjTable.split('asset.')[1];

    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [this.selectedTask.assObjRef], {
      lyr_table_name: lyrTableName,
    });
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
    this.utilsService.showSuccessMessage(message);
  }

  /**
   * Check task if exist in the workorder
   * @param taskid the task id
   */
  private async checkTask(taskid: string): Promise<void> {
    if (taskid) {
      if (!this.workOrder.tasks.some(task => task.id.toString() == taskid.toString())) {
        const toast = await this.toastCtrl.create({
          message: "Aucune tâche avec l'id " + taskid + " pour l'intervention " + this.workOrder.id,
          duration: 4000,
          color: 'warning'
        });
        await toast.present();
        this.router.navigate(['/home/workorder/' + this.workOrder.id]);
      }
    }
  }

   /**
   * Method to display and zoom to the workorder equipment
   * @param workorder the workorder
   */
   private displayAndZoomTo(workorder: Workorder) {

    let featuresSelection: MultiSelection[] = [];
    let geometries = [];

    for (let task of workorder.tasks) {
      if (!this.taskId || (this.taskId && this.taskId == task.id.toString())) {
        geometries.push([task.longitude, task.latitude]);
        this.mapService.addEventLayer('task').then(() => {
          featuresSelection.push({
            id: task.id.toString(),
            source: 'task'
          });
          this.mapEventService.highlighSelectedFeatures(this.mapService.getMap(), featuresSelection);
        });
        this.mapService.addEventLayer(task.assObjTable.replace('asset.', '')).then(async () => {
          featuresSelection.push({
            id: task.assObjRef,
            source: task.assObjTable.replace('asset.', '')
          });
          this.mapEventService.highlighSelectedFeatures(this.mapService.getMap(), featuresSelection);
        });
      }
    }
    this.mapLayerService.fitBounds(geometries, 20);
  }

  // ### Attachement ### //
  getListAttachment() {
    // Get the list of attachment
    this.attachmentService.getListAttachmentByWorkorderId(this.workOrder.id).then((listAttachment) => {
      this.listAttachment = listAttachment;
    })
    .catch((error) => {
      // If there is an error (because the user is offline or anything else)
      // keep it going
      console.log(error);
    });
  }

  async addAttachment(event) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    for (const file of Array.from(event.target.files) as File[]) {
      await this.attachmentService.addAttachment(this.workOrder.id, file);
    };

    // Reload the list of attachment
    // We wait a bit because the creation is not immediate
    // Otherwise the picture displayed would be broken
    setTimeout(() => {
      this.getListAttachment();
    }, 1000);

    // If there was no attachment before, set the flag of the workorder to true
    if (!this.workOrder.wkoAttachment) {
      this.workOrder.wkoAttachment = true;
      this.workorderService.updateWorkOrder(this.workOrder).subscribe();
    }
    
    // Empty this field to allow the user to select the same file again
    // else if the same file is selected, fileupdload ignore it
    event.target.value = null;
  }

  convertBitsToBytes(x) {
    let l = 0, n = parseInt(x, 10) || 0;

    const units = ['o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];

    while(n >= 1024 && ++l){
        n = n/1024;
    }
    
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
  }

  getFileExtension(filename: string): string {
    return filename.split(".").pop();
  }
}
