import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CancelTask,
  CancelWorkOrder,
  ReportValue,
  Task,
  WkoStatus,
  Workorder,
} from 'src/app/core/models/workorder.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { AlertController, ToastController } from '@ionic/angular';
import {
  MapEventService,
  MultiSelection,
} from 'src/app/core/services/map/map-event.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { DateTime } from 'luxon';
import { ValueLabel } from 'src/app/core/models/util.model';

@Component({
  selector: 'app-wko-view',
  templateUrl: './wko-view.component.html',
  styleUrls: ['./wko-view.component.scss'],
})
export class WkoViewComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
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
    private layerService: LayerService
  ) {}

  public workOrder: Workorder;

  public assetLabel: string;
  public status: string;
  public reason: string;
  public selectedTask: Task;
  public taskId: string;
  public loading: boolean = true;
  public appointmentHours: string;
  public wkoIdLabel: string;
  public listInformationAssetForSig: ValueLabel[] = null;

  public userHasPermissionModifyReport: boolean = false;
  public userHasPermissionModifyReportCompletedStatus : boolean = false;
  public userHasPermissionCreateProgram: boolean = false;
  public userHasPermissionCancelWorkorder: boolean = false;

  public canEdit(): boolean {
    return (
      !this.loading &&
      this.workOrder &&
      (this.workOrder.wtsId === WkoStatus.CREE ||
        this.workOrder.wtsId === WkoStatus.ENVOYEPLANIF ||
        this.workOrder.wtsId === WkoStatus.ERREUR)
    );
  }

  public canEditReport(): boolean {
    return !this.loading && this.userHasPermissionModifyReportCompletedStatus;
  }

  public canCancel(): boolean {
    if (this.loading || !this.workOrder) return false;

    let wtsId = this.workOrder.wtsId;
    if (this.taskId != null) {
      const task = this.workOrder.tasks.find(
        (task) => task.id === Number(this.taskId)
      );
      wtsId = task?.wtsId;
    }

    return this.userHasPermissionCancelWorkorder && wtsId !== WkoStatus.ANNULE;
  }

  public isCancelled(): boolean {
    let wtsId = this.workOrder.wtsId;
    if (this.taskId != null) {
      const task = this.workOrder.tasks.find((task) => task.id === Number(this.taskId));
      wtsId = task?.wtsId;
    }

    return wtsId === WkoStatus.ANNULE;
  }

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.userHasPermissionModifyReport =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.MODIFY_REPORT_MY_AREA
      );
    this.userHasPermissionModifyReportCompletedStatus =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.MODIFY_REPORT_COMPLETED_STATUS
      );
    this.userHasPermissionCreateProgram =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.CREATE_PROGRAM_MY_AREA
      );
    this.userHasPermissionCancelWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.CANCEL_WORKORDER
      );

    this.mapService
      .onMapLoaded()
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(async () => {
        const { id, taskid } = this.activatedRoute.snapshot.params;
        this.taskId = taskid;
        this.workOrder = await this.workorderService.getWorkorderById(id);
        this.mapService.addGeojsonToLayer(this.workOrder,'task');

        this.checkTask(this.taskId);

        this.displayAndZoomTo(this.workOrder);

        if (this.taskId) {
          this.selectedTask = this.workOrder.tasks.find(
            (task) => task.id.toString() == this.taskId
          );
        } else {
          this.selectedTask = this.workOrder.tasks[0];
        }

        if (this.selectedTask?.assetForSig != null) {
          const listInformation = JSON.parse(this.selectedTask?.assetForSig.afsInformations);
          this.listInformationAssetForSig = listInformation;
        }

        const wtsid = this.selectedTask?.wtsId;
        const lyrTableName = this.selectedTask?.assObjTable;

        if (this.workOrder.wkoAppointment) {
          const planningStartDate = DateTime.fromJSDate(
            new Date(this.workOrder.wkoPlanningStartDate)
          );
          const planningEndDate = DateTime.fromJSDate(
            new Date(this.workOrder.wkoPlanningEndDate)
          );

          const formattedStartDate = planningStartDate.toFormat('HH:mm');
          const formattedEndDate = planningEndDate.toFormat('HH:mm');
          this.appointmentHours = `${formattedStartDate} - ${formattedEndDate}`;
        }

        Promise.all([
          this.workorderService.getAllWorkorderTaskStatus(),
          this.workorderService.getAllWorkorderTaskReasons(),
          this.layerService.getAllLayers(),
        ]).then((results) => {
          const workorderTaskStatus = results[0];
          const workorderTaskReasons = results[1];
          const layers = results[2];

          this.status = workorderTaskStatus.find(
            (refStatus) => refStatus.id == wtsid
          )?.wtsLlabel;
          if (this.status) {
            this.status = this.status?.charAt(0).toUpperCase() + this.status.slice(1);
          }

          this.reason = workorderTaskReasons.find(
            (refReason) => refReason.id === this.workOrder.tasks[0].wtrId
          )?.wtrLlabel;

          const layer = lyrTableName
            ? layers.find((asset) => asset.lyrTableName == lyrTableName)
            : null;
          this.assetLabel = layer
            ? `${layer.domLLabel} - ${layer.lyrSlabel}` +
            (this.selectedTask?.assObjRef
              ? ` - ${this.selectedTask?.assObjRef}`
              : '')
            : null;
          this.wkoIdLabel = `Intervention n°${this.workOrder.id}` + (this.taskId ? ` - Tâche n°${this.taskId}` : '');
          this.loading = false;
        });
      });
  }

  /**
   * Update workorder
   */
  public updateWorkorder(): void {
    this.drawerService.navigateTo(DrawerRouteEnum.WORKORDER_EDITION, [
      this.workOrder.id,
    ]);
  }

  /**
   * Cancel
   */
  public cancel(): void {
    let isCancelWorkOrder = this.taskId == null;

    if (
      this.workOrder.tasks.filter((task) => task.wtsId !== WkoStatus.ANNULE)
        .length === 1
    ) {
      isCancelWorkOrder = true;
    }

    if (isCancelWorkOrder) {
      this.cancelWorkorder();
    } else {
      this.cancelTask();
    }
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
      this.workOrder.wkoCancelComment = data.values.cancelComment;
      this.workorderService
        .cancelWorkorder(this.workOrder)
        .then(async (res) => {
          this.displayCancelToast('Modification enregistré avec succès.');
          this.workOrder = res;
          if (this.taskId) {
            this.selectedTask = this.workOrder.tasks.find(
              (task) => task.id.toString() == this.taskId
            );
          } else {
            this.selectedTask = this.workOrder.tasks[0];
          }
          this.getStatus(this.workOrder.wtsId);
          await this.workorderService.deleteCacheWorkorder(this.workOrder);
          for (let task of res.tasks) {
            const feature = this.mapLayerService.getFeatureById(
              'task',
              task.id.toString()
            );
            if (feature) {
              feature.properties['wtsCode'] = 'ANNULE';
              this.mapService.updateFeature('task', feature);
            }
          }
        });
    }
  }

  /**
   * Displays an alert to prompt the user to enter a reason for canceling
   * a task, and then sends a request to cancel the task with the entered reason.
   */
  public async cancelTask(): Promise<void> {
    const alertReason = await this.alertCtrl.create({
      header: "Veuillez saisir le motif de l'annulation de cette tâche",
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
      const cancelTsk: CancelTask = {
        id: this.workOrder.id,
        tskId: Number(this.taskId),
        cancelComment: data.values.cancelComment,
      };
      this.workorderService.cancelTask(cancelTsk).then(async (res) => {
        this.displayCancelToast('Modification enregistré avec succès.');
        this.workOrder = res;
        const task = this.workOrder.tasks.find(
          (task) => task.id === Number(this.taskId)
        );
        this.selectedTask = task;
        this.getStatus(task.wtsId);
        await this.workorderService.deleteCacheWorkorder(this.workOrder);
        const feature = this.mapLayerService.getFeatureById(
          'task',
          this.taskId
        );
        if (feature) {
          feature.properties['wtsCode'] = 'ANNULE';
          this.mapService.updateFeature('task', feature);
        }
      });
    }
  }

  public onGenerateReport(): void {
    this.router.navigate(['/home/workorder/' + this.workOrder.id + '/cr']);
  }

  public onUpdateReport(): void {
    this.router.navigate(['/home/workorder/' + this.workOrder.id + '/task/'+ this.selectedTask.id +'/cr']);
  }
  public onDisplayWorkorder(): void {
    this.router.navigate(['/home/workorder/' + this.workOrder.id]);
  }

  public openEquipment(): void {
    if (this.workOrder.tasks.length > 1) {
      const equipments = this.workOrder.tasks.map((t) => {
        return {
          id: t.assObjRef,
          lyrTableName: t.assObjTable,
          x: t.longitude,
          y: t.latitude,
          assetForSig: t.assetForSig,
          taskId: t.id,
        };
      });

      this.drawerService.navigateWithEquipments(
        DrawerRouteEnum.SELECTION,
        equipments,
        { draft: this.workOrder.id }
      );
    } else {
      const lyrTableName = this.selectedTask.assObjTable;

      if (
        !this.selectedTask?.assObjRef ||
        this.selectedTask.assObjRef.startsWith('TMP-')
      )
        return;

      this.drawerService.navigateTo(
        DrawerRouteEnum.EQUIPMENT,
        [this.selectedTask.assObjRef],
        {
          lyrTableName: lyrTableName,
        }
      );
    }
  }

  public getReportValuesSorted(): ReportValue[] {
    const compareReportKeyFn = (a: ReportValue, b: ReportValue): number => {
      const nA = parseInt(a.key.split('-')[1], 10);
      const nB = parseInt(b.key.split('-')[1], 10);
      return nA - nB;
    }

    const reportValues: ReportValue[] = this.selectedTask.report.reportValues.filter((rv) => !rv.key.includes('COMMENT')).sort(compareReportKeyFn);

    const commentQuestion = this.selectedTask.report.reportValues.find((rv) => rv.key.includes('COMMENT'));

    if (commentQuestion) {
      reportValues.push(commentQuestion);
    }

    return reportValues;
  }

  public trackByReportFn(index: number, reportValue: ReportValue): string {
    return reportValue.key;
  }

  private getStatus(wtsId: number): void {
    this.workorderService
      .getAllWorkorderTaskStatus()
      .then((statusList) => {
        this.status = statusList.find(
          (refStatus) => refStatus.id.toString() === wtsId.toString()
        ).wtsLlabel;
        this.status =
          this.status.charAt(0).toUpperCase() + this.status.slice(1);
      });
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
      if (
        !this.workOrder.tasks.some(
          (task) => task.id.toString() == taskid.toString()
        )
      ) {
        const toast = await this.toastCtrl.create({
          message:
            "Aucune tâche avec l'id " +
            taskid +
            " pour l'intervention " +
            this.workOrder.id,
          duration: 4000,
          color: 'warning',
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
    // Get the list of task to display
    let listTask = [];
    if (this.taskId) {
      const task = workorder.tasks.find(
        (task) => task.id.toString() === this.taskId
      );
      if (task) listTask.push(task);
    } else {
      listTask = workorder.tasks;
    }

    if (listTask.length > 0) {
      // Show the task layer and layers related to the tasks
      let listLayerKey = [...new Set(listTask.map((task) => task.assObjTable))];

      Promise.all(
        listLayerKey
          .map((layerKey) => this.mapService.addEventLayer(layerKey))
          .concat(this.mapService.addEventLayer('task'))
      ).then(() => {
        // Once loaded
        // Highlight the tasks and the layers related to them
        let featuresSelection: MultiSelection[] = [];
        featuresSelection = listTask.map((task) => {
          return {
            id: task.id.toString(),
            source: 'task',
          };
        });
        featuresSelection = featuresSelection.concat(
          listTask
            .filter((t) => !t.assObjTable.includes('_xy'))
            .map((task) => {
              return {
                id: task.assObjRef,
                source: task.assObjTable,
              };
            })
        );

        this.mapEventService.highlighSelectedFeatures(
          this.mapService.getMap(),
          featuresSelection
        );
      });

      // Zoom on the location of the tasks
      let geometries = listTask.map((task) => [task.longitude, task.latitude]);
      this.mapLayerService.fitBounds(geometries, 20);
    }
  }

  ngOnDestroy(){
    if(!this.workorderService.activeWorkorderSwitch) {
      for(let task of this.workOrder.tasks) {
        this.mapService.removePoint('task',task.id.toString());
      }
    }
  }
}
