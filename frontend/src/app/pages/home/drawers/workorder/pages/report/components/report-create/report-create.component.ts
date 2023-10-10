import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Task, Workorder, Report, WorkorderTaskStatus, WkoStatus } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { ReportFormComponent } from '../report-form/report-form.component';
import { IntentAction } from 'plugins/intent-action/src';
import { Router } from '@angular/router';
import { AlertController, IonModal } from '@ionic/angular';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { filter, firstValueFrom } from 'rxjs';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from 'src/app/shared/form-editor/validators/date.validator';
import { Form } from 'src/app/shared/form-editor/models/form.model';
import { PraxedoService } from 'src/app/core/services/praxedo.service';
import { ReportAssetComponent } from '../report-asset/report-asset.component';
import { MapService } from 'src/app/core/services/map/map.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/layer.service';

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
    private dialogService: DialogService,
    private datePipe: DatePipe,
    private praxedoService: PraxedoService,
    private mapService: MapService,
    private layerService: LayerService
  ) { }

  @Input() workorder: Workorder;
  @Input() reportForm: Form = null;
  @Input() isTest = false;

  public isMobile: boolean;
  public step: number = 1;
  public selectedTasks: Task[];
  public hasPreviousQuestion: boolean = false;
  public isSubmit: boolean = false;
  public isSubmitting: boolean = false;
  public hasXYInvalid: boolean = false;

  @ViewChild('stepForm') stepForm: ReportFormComponent;
  @ViewChild('stepAsset') stepAsset: ReportAssetComponent;

  @ViewChild('completeModal', { static: true })
  public completeModal: IonModal;
  public completeModalForm: FormGroup;

  private currentDateValue: string;

  async ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    // Case on admin screen to test forms
    if (this.isTest) {
      this.step = 3;
      return;
    }

    this.workorderService.getAllWorkorderTaskStatus().subscribe((workorderTaskStatus: WorkorderTaskStatus[]) => {
      const status = workorderTaskStatus.find(sts => sts.id.toString() === this.workorder.wtsId.toString());
      switch (status.wtsCode) {
        case WkoStatus[WkoStatus.TERMINE]:
          this.presentAlert();
          break;
        case WkoStatus[WkoStatus.CREE]:
          this.createCompleteForm();
          break;
        default:
          break;
      }
    });

    this.selectedTasks = this.workorder.tasks.filter(task => task.isSelectedTask);
    if (this.selectedTasks && this.selectedTasks.length > 0) {
      this.step = 2;
      if (this.selectedTasks[0].report?.questionIndex) {
        this.step = 3;
        if (this.selectedTasks[0].report.questionIndex > 0) {
          this.hasPreviousQuestion = true;
        }
        if (this.selectedTasks[0].report.questionIndex == this.selectedTasks[0].report.reportValues.length - 1) {
          this.isSubmit = true;
        }
      }
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
    if (this.step <= 3) {
      this.step++;
      if (this.step == 2) {
        for(let task of this.selectedTasks){
          task.isSelectedTask = true;
        }
      }
      this.onSaveWorkOrderState();
    }
  }

  /**
   * Go to first step
   */
  public onGoToFirstStep() {
    this.isSubmit=false;
    this.step=1;
  }

  /**
   * Action on click for the previous question
   */
  public previousFormQuestion() {
    if (this.stepForm.formEditor.indexQuestion > 0) {
      this.stepForm.formEditor.indexQuestion = this.getPreviousValidQuestionIndex(this.stepForm.formEditor.indexQuestion);

      if (this.stepForm.formEditor.indexQuestion == 0) {
        this.hasPreviousQuestion = false
      }
      this.isSubmit = false;
    }
    this.saveWorkorderState();
  }

  /**
   * Return the index of the previous valid question
   * It depends of the previous answer
   * @param currentIndex current question index
   * @returns the index of the preivous valide question
   */
  getPreviousValidQuestionIndex(currentIndex: number): number {
    let previousValidQuestionIndex = currentIndex - 1;

    // Check if the previous question can be skip (depending on previous answers)
    // If there is a previous question
    if (previousValidQuestionIndex > 0) {
      // Get the previous question
      let previousChild = this.stepForm.formEditor.sections[0].children[previousValidQuestionIndex];

      // If there is a condition
      if (previousChild.definition.displayCondition != null) {
        // Get the answer of the question of the condition
        const answer = this.stepForm.formEditor.form.get(previousChild.definition.displayCondition.key).value;

        // List of correct answer needed to display the question
        const listCorrectAnswer = previousChild.definition.displayCondition.value;

        let conditionIsMet = false;

        // If the question can have multiple value selected
        if (answer instanceof Array) {
          // Transform the answer into a list
          let listAnswer: string[] = [];
          if (answer != null) listAnswer = answer as Array<string>;

          // If the condition is not met
          conditionIsMet = listCorrectAnswer.some((correctAnswer) => listAnswer.includes(correctAnswer));
        } else {
          conditionIsMet = listCorrectAnswer.includes(answer);
        }

        if (!conditionIsMet) {
          // Skip the previous question
          // So we search the index of the previous valid question
          previousValidQuestionIndex = this.getPreviousValidQuestionIndex(previousValidQuestionIndex);
        }
      }
    }

    return previousValidQuestionIndex;
  }

  /**
   * Action on click for the next question
   */
  public nextFormQuestion() {
    let child = this.stepForm.formEditor.sections[0].children[this.stepForm.formEditor.indexQuestion];
    let childrens = child.children ? child.children : [child];
    let valid: boolean = true;
    for (let children of childrens) {
      this.stepForm.formEditor.form.get(children.definition.key).updateValueAndValidity();
      this.stepForm.formEditor.form.get(children.definition.key).markAsTouched();
      valid = valid && this.stepForm.formEditor.form.get(children.definition.key).valid;
    }
    if (valid) {
      // Get the index of the next valid question
      this.stepForm.formEditor.indexQuestion = this.getNextValidQuestionIndex(this.stepForm.formEditor.indexQuestion);

      this.hasPreviousQuestion = true;
      if (this.stepForm.formEditor.indexQuestion + 1 >= this.stepForm.formEditor.sections[0].children.length) {
        this.isSubmit = true;
      }
      this.saveWorkorderState();
    }
  }

  /**
   * Return the index of the next valid question
   * It depends of the previous answer
   * @param currentIndex current question index
   * @returns the index of the next valide question
   */
  getNextValidQuestionIndex(currentIndex: number): number {
    let nextValidQuestionIndex = currentIndex + 1;

    // Check if the next question can be skip (depending on previous answers)
    // If there is a next question
    if (nextValidQuestionIndex < this.stepForm.formEditor.sections[0].children.length) {
      // Get the next question
      let nextChild = this.stepForm.formEditor.sections[0].children[nextValidQuestionIndex];

      // If there is a condition
      if (nextChild.definition.displayCondition != null) {
        // Get the answer of the question of the condition
        const answer = this.stepForm.formEditor.form.get(nextChild.definition.displayCondition.key).value;

        // List of correct answer needed to display the question
        const listCorrectAnswer = nextChild.definition.displayCondition.value;

        let conditionIsMet = false;

        // If the question can have multiple value selected
        if (answer instanceof Array) {
          // Transform the answer into a list
          let listAnswer: string[] = [];
          if (answer != null) listAnswer = answer as Array<string>;

          // If the condition is not met
          conditionIsMet = listCorrectAnswer.some((correctAnswer) => listAnswer.includes(correctAnswer));
        } else {
          conditionIsMet = listCorrectAnswer.includes(answer);
        }

        if (!conditionIsMet) {
          // Skip the next question
          // So we search the index of the next valid question
          nextValidQuestionIndex = this.getNextValidQuestionIndex(nextValidQuestionIndex);
        }
      }
    }

    return nextValidQuestionIndex;
  }

  /**
   * manage keydown event on date input
   * prevent non numeric input
   * @param event 
   */
  public onDateKeyDown(event: any) {
    this.currentDateValue = event.target.value;
    if (!DateValidator.isKeyValid(event, this.currentDateValue)){
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

  /**
   * Save the state of a workorder in cache
   */
  private saveWorkorderState() {
    if (this.isTest) return;

    let report: Report = {
      dateCompletion: null,
      reportValues: [],
      questionIndex: this.stepForm.formEditor.indexQuestion
    };
    for (let definition of this.stepForm.formEditor.nomadForm.definitions) {
      if (definition.type == 'property') {
        report.reportValues.push({
          key: definition.key,
          question: definition.label,
          answer: this.stepForm.formEditor.form.value[definition.key]
        });
      }
    }
    for(let task of this.selectedTasks) {
      task.report = report;
    }
    this.onSaveWorkOrderState();
  }

  /**
   * Send the form
   */
  public submitForm(closeCircuit:boolean = false) {
    if(closeCircuit) {
      if (this.completeModalForm !== undefined && !this.utils.isMobilePlateform()) {
        this.openCompleteModal();
      }
      else {
        this.onClosedWko(true);
      }
    } else {
      this.stepForm.formEditor.form.updateValueAndValidity();
      this.stepForm.formEditor.form.markAllAsTouched();

      if (this.stepForm.formEditor.form.valid) {
        if (this.completeModalForm !== undefined && !this.utils.isMobilePlateform() && this.workorder.tasks.length == 1) {
          this.openCompleteModal();
        }
        else {
          this.completeForm();
        }
      }
    }
  }

  /**
   * Popup to validate the completion with start and end completion date
   */
  public createCompleteForm(): void {
    this.completeModalForm = new FormGroup({
      realisationStartDate : new FormControl(false, Validators.compose([Validators.required, DateValidator.isDateValid])),
      realisationEndDate : new FormControl(false, Validators.compose([Validators.required, DateValidator.isDateValid]))
    });
    this.completeModalForm.addValidators(DateValidator.compareDateValidator('realisationStartDate', 'realisationEndDate'));
  }

  /**
   * Complete the workorder with report validation
   */
  private completeForm(): void {
    let comment = "";
    this.isSubmitting = true;

    let report: Report = {
      dateCompletion: new Date(),
      reportValues: [],
      questionIndex: this.stepForm.formEditor.indexQuestion
    };
    for (let definition of this.stepForm.formEditor.nomadForm.definitions) {
      if (definition.type == 'property') {
        report.reportValues.push({
          key: definition.key,
          question: definition.label,
          answer: this.stepForm.formEditor.form.value[definition.key] instanceof Array ?
            this.stepForm.formEditor.form.value[definition.key].join('; ')
            : this.stepForm.formEditor.form.value[definition.key]
        });
        if (definition.key == 'COMMENT' && this.stepForm.formEditor.form.value[definition.key]) {
          comment = this.stepForm.formEditor.form.value[definition.key];
        }
      }
    }
    for(let task of this.selectedTasks) {
      task.report = report;
      task.isSelectedTask = false;
    }
    this.onSaveWorkOrderState();
    this.onClosedWko();

  }

  /**
   * Closed the wko -> status to terminate
   * Sync with the server
   */
  public onClosedWko(forced:boolean=false) {

    //Remove partial report
    for(let task of this.workorder.tasks){
      if(!task.report?.dateCompletion) {
        task.report = null;
      }

    }

    if(this.workorder.tasks.length == 1 || forced) {
      if(this.workorder.id > 0) {
        this.workorderService.terminateWorkOrder(this.workorder).subscribe(() => {
          this.closeReport();
        });
      } else {
        this.workorderService.createWorkOrder(this.workorder).subscribe(res => {
          this.closeReport(res);
        });
      }
    } else {
      this.step = 1;
      this.selectedTasks = [];
      this.isSubmitting = false;
      this.isSubmit = false;
    }
  }

  /**
   * List of action after the workorder is send
   */
  private async closeReport(unplanedWko: Workorder = null) {
    if (this.praxedoService.externalReport) {
      this.layerService.getAllVLayerWtr().subscribe(vLayerWtrs => {
        const vLayerWtr = vLayerWtrs.find(val => val.wtrCode == this.workorder.tasks[0].wtrCode && val.astCode == this.workorder.tasks[0].astCode);
        this.contractService.getAllContracts().subscribe(contracts => {
          let contract = contracts.find(ctr => ctr.id === this.workorder.tasks[0].ctrId);
          let comment = "";
          for (let reportValue of this.workorder.tasks[0].report?.reportValues) {
            if (reportValue.key == 'COMMENT') {
              comment = reportValue.answer;
            }
          }
          IntentAction.closeIntent(
            {
              value:
                {
                  'RETOUR': 'ok',
                  'CONTRAT': (contract ? contract.ctrCode : ''),
                  'COMMENTAIRE': comment,
                  'GPS_RI': this.workorder.tasks[0].latitude+';'+this.workorder.tasks[0].longitude,
                  'ADRESSE': this.workorder.wkoAddress ? this.workorder.wkoAddress : 'NA',
                  'TYPE': (this.workorder.tasks.length > 1 ? '38-Multi équipements':this.workorder.tasks[0].astCode+'-'+vLayerWtr.astLlabel),
                  'MOTIF': this.workorder.tasks[0].wtrCode+'-'+vLayerWtr.wtrLlabel,
                  'REFEXTINT': this.workorder.id,
                  'ID_RI': unplanedWko ? unplanedWko.id : this.workorder.id
                }
            }
          );
          this.isSubmitting = false;
          if (!this.workorder.syncOperation) {
            this.exploitationService.deleteCacheWorkorder(this.workorder);
          }
        });
      });
    } else {
      this.router.navigate(['/home/workorder/' + (unplanedWko ? unplanedWko.id : this.workorder.id)]);
      this.isSubmitting = false;
      if(!this.workorder.syncOperation) {
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

    if (this.step === 1) {
      this.checkHasXYInvalid();
    }
  }

  /**
   * Check terminated report
   * @returns True if a task has a terminated report
   */
  public hasReportClosed() {
    return this.workorder.tasks.some(tsk => tsk.report?.dateCompletion);
  }

  /**
   * count form question label
   * @return the label
   */
  public getFormQuestionLabel(): string {
    if (this.stepForm?.formEditor?.sections[0]?.children) {
      if (this.selectedTasks && this.selectedTasks[0]?.report?.questionIndex) {
        return (this.selectedTasks[0].report.questionIndex + 1) + " sur " + this.stepForm.formEditor.sections[0].children.length;
      } else if (this.selectedTasks && this.selectedTasks.length > 0 && this.step == 3) {
        return '1 sur ' + this.stepForm.formEditor.sections[0].children.length;
      }
    }
    return "";
  }

  /**
   * Modale if a workorder report is already done
   */
  async presentAlert() {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'Alerte',
      subHeader: 'Important',
      message: 'Il existe déjà un compte rendu pour cette intervention.',
      buttons: [{
        text: 'Ok',
        role: 'confirm',
      }]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.closeReport();
    }
  }

  /**
   * Open the complete modal to enter start/end realization date
   */
  public async openCompleteModal(): Promise<void> {
    this.completeModal.present();
  }
  /**
   * Open a calendar to select realization start and end date
   */
  public openCalendar(): void {
    this.dialogService
      .open(DatepickerComponent, {
        backdrop: false,
        data: {
          multiple: true,
        },
      })
      .afterClosed()
      .pipe(
        filter(
          (dts: DateTime[]) => dts && (dts.length === 1 || dts.length === 2)
        )
      )
      .subscribe((result: DateTime[]) => {
        this.completeModalForm.patchValue({
          realisationStartDate: this.datePipe.transform(
            result[0].toJSDate(),
            'dd/MM/yyyy'
          ),
        });
        this.completeModalForm.patchValue({
          realisationEndDate: this.datePipe.transform(
            // if only one day is clicked, end date and start date fields get the same value
            result[1] ? result[1].toJSDate() : result[0].toJSDate(),
            'dd/MM/yyyy'
          ),
        });
      });
  }
  /**
   * Cancel the completion
   */
  public cancelCompleteModal(): void {
    this.completeModal.dismiss();
  }

  /**
   * Validate the completion popup
   */
  public validCompleteModal(): void {
    this.workorder.wkoCompletionStartDate = DateTime.fromFormat(this.completeModalForm.controls["realisationStartDate"].value, "dd/MM/yyyy").toJSDate();
    this.workorder.wkoCompletionEndDate = DateTime.fromFormat(this.completeModalForm.controls["realisationEndDate"].value, "dd/MM/yyyy").toJSDate();
    for(let task of this.selectedTasks) {
      task.tskCompletionStartDate = this.workorder.wkoCompletionStartDate;
      task.tskCompletionEndDate = this.workorder.wkoCompletionEndDate;
    }
    if (this.workorder.tasks.length == 1) {
      this.completeForm();
    } else {
      this.onClosedWko(true);
    }
    this.completeModal.dismiss();
  }

  /*
   * Delete unplanned workorder
   */
  public async onDelete() {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: 'Souhaitez-vous supprimer cette intervention opportuniste ?',
      buttons: [{
        text: 'Oui',
        role: 'confirm',
      },
      {
        text: 'Non',
        role: 'stop',
      }]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      if(this.stepAsset?.draggableMarker) {
        this.stepAsset.draggableMarker.remove();
      }
      this.exploitationService.deleteCacheWorkorder(this.workorder);
      for(let task of this.workorder.tasks) {
        this.mapService.removePoint('task',task.id.toString());
      }
      if (this.praxedoService.externalReport) {
        IntentAction.closeIntent({ value: {'RETOUR': 'ko'} });
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  public onEditTask() {
    let equipments = this.workorder.tasks.map((t) => {
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
        step: 'report'
      }
    );
  }

  public onNewAsset() {
    this.drawerService.navigateTo(
      DrawerRouteEnum.NEW_ASSET,
      [],
      { 
        draft: this.workorder.id,
        step: 'report'
      }
    );
  }

  /**
   * If there is a XY Asset with reason other than 'Enquête' (16 or 19) and 'Réaliser un métré' (13)
   * The user must choose an existing asset or create a new one
   */
  private async checkHasXYInvalid() {
    if(this.workorder.isDraft) {
      this.hasXYInvalid =  false;
    } else {
      const listWtr = await firstValueFrom(this.workorderService.getAllWorkorderTaskReasons());
      const listWtrNoXy = listWtr.filter((wtr) => wtr.wtrNoXy === true);

      this.hasXYInvalid = this.workorder.tasks.some(task => {
        return task.assObjRef == null && (
          task.wtrId == null || listWtrNoXy.some((wtr) => wtr.id === task.wtrId)
        );
      });
    }
  }

  ngOnDestroy(): void {
    if(this.workorder.isDraft) {
      for(let task of this.workorder.tasks) {
        this.mapService.removePoint('task',task.id.toString());
      }
    }
  }
}
