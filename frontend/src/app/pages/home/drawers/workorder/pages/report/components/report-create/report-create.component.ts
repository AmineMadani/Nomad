import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  Task,
  Workorder,
  WorkorderTaskStatus,
  WkoStatus,
} from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { IntentAction } from 'plugins/intent-action/src';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DateValidator } from 'src/app/shared/form-editor/validators/date.validator';
import { Form } from 'src/app/shared/form-editor/models/form.model';
import { PraxedoService } from 'src/app/core/services/praxedo.service';
import { ReportAssetComponent } from './report-asset/report-asset.component';
import { MapService } from 'src/app/core/services/map/map.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { ReportDateComponent } from './report-date/report-date.component';

export enum ReportStepEnum {
  ASSET = 1,
  CONTEXT = 2,
  FORM = 3,
  DATE = 4
}
@Component({
  selector: 'app-report-create',
  templateUrl: './report-create.component.html',
  styleUrls: ['./report-create.component.scss'],
})
export class ReportCreateComponent implements OnInit {
  constructor(
    private drawerService: DrawerService,
    private utils: UtilsService,
    private exploitationService: WorkorderService,
    private workorderService: WorkorderService,
    private router: Router,
    private contractService: ContractService,
    private alertController: AlertController,
    private praxedoService: PraxedoService,
    private mapService: MapService,
    private layerService: LayerService,
  ) {}

  @Input() workorder: Workorder;
  @Input() reportForm: Form = null;
  @Input() isTest = false;

  public isMobile: boolean;
  public step: ReportStepEnum = ReportStepEnum.ASSET;
  public selectedTasks: Task[];
  public hasXYInvalid: boolean = false;
  public isCompletionDate: boolean = false;

  public ReportStepEnum = ReportStepEnum;

  @ViewChild('stepAsset') stepAsset: ReportAssetComponent;

  private currentDateValue: string;

  async ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    // Case on admin screen to test forms
    if (this.isTest) {
      this.step = ReportStepEnum.FORM;
      return;
    }

    this.workorderService
      .getAllWorkorderTaskStatus()
      .then((workorderTaskStatus: WorkorderTaskStatus[]) => {
        const status = workorderTaskStatus.find(
          (sts) => sts.id.toString() === this.workorder.wtsId.toString()
        );
        switch (status.wtsCode) {
          case WkoStatus[WkoStatus.TERMINE]:
            if (!this.workorder.isUpdateReport) {
              this.endProcess();
            }
            break;
          case WkoStatus[WkoStatus.CREE]:
            break;
          default:
            break;
        }
      });
    this.selectedTasks = this.workorder.tasks.filter(
      (task) => task.isSelectedTask
    );
    if (this.selectedTasks && this.selectedTasks.length > 0) {
      this.step = ReportStepEnum.CONTEXT;
      setTimeout(() => {
        if (this.selectedTasks[0].report?.reportValues) {
          this.step = ReportStepEnum.FORM;
        }
        if (this.workorder.isUpdateReport) {
          this.onSaveWorkOrderState();
        }
      });
    } else {
      await this.checkHasXYInvalid();
    }
  }

  /**
   * Drawback navigation
   */
  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  /**
   * Close drawer
   */
  public onClose() {
    this.drawerService.closeDrawer();
  }

  /**
   * Next step
   */
  public onNext() {
    if (this.step === ReportStepEnum.ASSET) {
      this.stepAsset.onValidateChangeEquipment();
    }

    if (this.step <= ReportStepEnum.FORM) {
      this.step++;
      if (this.step == ReportStepEnum.CONTEXT) {
        for (let task of this.selectedTasks) {
          task.isSelectedTask = true;
        }
      }
      this.onSaveWorkOrderState();
    }
  }

  /**
   * manage keydown event on date input
   * prevent non numeric input
   * @param event
   */
  public onDateKeyDown(event: any) {
    this.currentDateValue = event.target.value;
    if (!DateValidator.isKeyValid(event, this.currentDateValue)) {
      event.preventDefault();
    }
  }

  /**
   * manage keyup event on date input
   * post treatment for date format
   * @param event
   */
  public onDateKeyUp(event: any) {
    event.target.value = DateValidator.formatDate(event, this.currentDateValue);
  }

  public goToDateStep() {
    this.step = ReportStepEnum.DATE;
  }

  /**
   * Closed the wko -> status to terminate
   * Sync with the server
   */
  public onClosedWko(forced: boolean = false) {
    //Remove partial report
    for (let task of this.workorder.tasks) {
      if (!task.report?.dateCompletion) {
        task.report = null;
      }
    }

    if (this.workorder.tasks.length == 1 || forced) {
      if (this.workorder.id > 0) {
        this.workorderService.terminateWorkOrder(this.workorder).then(() => {
          this.closeReport();
        });
      } else {
        this.workorderService.createWorkOrder(this.workorder).then((res) => {
          this.closeReport(res);
        });
      }
    } else {
      this.step = ReportStepEnum.ASSET;
      this.selectedTasks = [];
    }
  }

  /**
   * List of action after the workorder is send
   */
  private async closeReport(unplanedWko: Workorder = null) {
    if (this.praxedoService.externalReport) {
      this.layerService.getAllVLayerWtr().then((vLayerWtrs) => {
        const vLayerWtr = vLayerWtrs.find(
          (val) =>
            val.wtrCode == this.workorder.tasks[0].wtrCode &&
            val.astCode == this.workorder.tasks[0].astCode
        );
        this.contractService.getAllContracts().then((contracts) => {
          let contract = contracts.find(
            (ctr) => ctr.id === this.workorder.tasks[0].ctrId
          );
          let comment = '';
          for (let reportValue of this.workorder.tasks[0].report
            ?.reportValues) {
            if (reportValue.key.includes('COMMENT')) {
              comment = reportValue.answer; 
            }
          }
          IntentAction.closeIntent({
            value: {
              RETOUR: 'ok',
              CONTRAT: contract ? contract.ctrCode : '',
              COMMENTAIRE: comment,
              GPS_RI:
                this.workorder.tasks[0].latitude +
                ';' +
                this.workorder.tasks[0].longitude,
              ADRESSE: this.workorder.wkoAddress
                ? this.workorder.wkoAddress
                : 'NA',
              TYPE:
                this.workorder.tasks.length > 1
                  ? '38-Multi équipements'
                  : this.workorder.tasks[0].astCode + '-' + vLayerWtr.astLlabel,
              MOTIF:
                this.workorder.tasks[0].wtrCode + '-' + vLayerWtr.wtrLlabel,
              REFEXTINT: this.workorder.id,
              ID_RI: unplanedWko ? unplanedWko.id : this.workorder.id,
            },
          });
          if (!this.workorder.syncOperation) {
            this.exploitationService.deleteCacheWorkorder(this.workorder);
          }
        });
      });
    } else {
      this.router.navigate([
        '/home/workorder/' + (unplanedWko ? unplanedWko.id : this.workorder.id),
      ]);
      if (!this.workorder.syncOperation) {
        this.exploitationService.deleteCacheWorkorder(this.workorder);
      }
    }
  }

  /**
   * Previous step
   */
  public onBack() {
    if (this.step >= 2) {
      this.step--;
    }
  }

  /**
   * Selected task
   * @param task selected task
   */
  public onSelectedTaskChange(tasks: Task[]) {
    this.selectedTasks = tasks;
  }

  /**
   * save work order state
   */
  public onSaveWorkOrderState() {
    this.exploitationService.saveCacheWorkorder(this.workorder);

    if (this.step === ReportStepEnum.ASSET) {
      this.checkHasXYInvalid();
    }
  }

  /**
   * if a workorder report is already done go "exploitation"
   */
  private endProcess() {
    this.router.navigate(['/home/exploitation']);
  }

  /*
   * Delete unplanned workorder
   */
  public async onDelete() {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'Souhaitez-vous supprimer cette intervention opportuniste ?',
      buttons: [
        {
          text: 'Oui',
          role: 'confirm',
        },
        {
          text: 'Non',
          role: 'stop',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      if (this.stepAsset?.draggableMarker) {
        this.stepAsset.draggableMarker.remove();
      }
      this.exploitationService.deleteCacheWorkorder(this.workorder);
      for (let task of this.workorder.tasks) {
        this.mapService.removePoint('task', task.id.toString());
      }
      if (this.praxedoService.externalReport) {
        IntentAction.closeIntent({ value: { RETOUR: 'ko' } });
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  public onEditTask() {
    let equipments = this.workorder.tasks
      .filter((t) => t.assObjRef != null)
      .map((t) => {
        return {
          id: t.assObjRef,
          lyrTableName: t.assObjTable,
        };
      });

    this.drawerService.navigateWithEquipments(
      DrawerRouteEnum.SELECTION,
      equipments,
      {
        draft: this.workorder.id,
        step: 'report',
      }
    );
  }

  public isReportCompleted(): boolean {
    return this.selectedTasks.every((t) => t.report?.dateCompletion)
  }

  /**
   * If there is a XY Asset with reason other than 'Enquête' (16 or 19) and 'Réaliser un métré' (13)
   * The user must choose an existing asset or create a new one
   */
  private async checkHasXYInvalid() {
    if (this.workorder.isDraft) {
      this.hasXYInvalid = false;
    } else {
      const listWtr = await this.workorderService.getAllWorkorderTaskReasons();
      const listWtrNoXy = listWtr.filter((wtr) => wtr.wtrNoXy === true);

      this.hasXYInvalid = this.workorder.tasks && this.workorder.tasks.some((task) => {
        return (
          task.assObjRef == null &&
          (task.wtrId == null ||
            listWtrNoXy.some((wtr) => wtr.id === task.wtrId))
        );
      });
    }
  }

  ngOnDestroy(): void {
    if (this.workorder.isDraft) {
      for (let task of this.workorder.tasks) {
        this.mapService.removePoint('task', task.id.toString());
      }
    }
  }
}
