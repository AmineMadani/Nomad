import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Task, Workorder, Report } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { ReportFormComponent } from '../report-form/report-form.component';
import { IntentAction } from 'plugins/intent-action/src';
import { Router } from '@angular/router';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { AlertController, IonModal } from '@ionic/angular';
import { KeycloakService } from 'src/app/core/services/keycloak.service';
import { Form } from 'src/app/shared/form-editor/models/form.model';

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
    private referential: ReferentialService,
    private alertController: AlertController,
    private keycloakService: KeycloakService
  ) { }

  @Input() workorder: Workorder;
  @Input() reportForm: Form = null;
  @Input() isTest = false;

  public isMobile: boolean;
  public step: number = 1;
  public selectedTask: Task;
  public hasPreviousQuestion: boolean = false;
  public isSubmit: boolean = false;
  public isSubmitting: boolean = false;

  @ViewChild('stepForm') stepForm: ReportFormComponent;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    if (this.isTest) {
      this.step = 3;
      return;
    }


    this.referential.getReferential('workorder_task_status').then(lStatus => {
      const status = lStatus.find(sts => sts['id'] == this.workorder.wtsId);
      if (status.wts_code == 'TERMINE') {
        this.presentAlert();
      }
    });
    if (this.workorder.selectedTaskId) {
      this.selectedTask = this.workorder.tasks.find(task => task.id == this.workorder.selectedTaskId);
      this.step = 2;
      if (this.selectedTask.report?.questionIndex) {
        this.step = 3;
        if (this.selectedTask.report.questionIndex > 0) {
          this.hasPreviousQuestion = true;
        }
        if (this.selectedTask.report.questionIndex == this.selectedTask.report.reportValues.length - 1) {
          this.isSubmit = true;
        }
      }
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
        this.workorder.selectedTaskId = this.selectedTask.id;
      }
      this.onSaveWorkOrderState();
    }
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
   * Save the state of a workorder in cache
   */
  private saveWorkorderState() {
    if (this.isTest) return;

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
          answer: this.stepForm.formEditor.form.value[definition.key]
        });
      }
    }
    this.selectedTask.report = report;
    this.onSaveWorkOrderState();
  }

  /**
   * Send the form
   */
  public submitForm() {
    this.stepForm.formEditor.form.updateValueAndValidity();
    this.stepForm.formEditor.form.markAllAsTouched();

    if (this.stepForm.formEditor.form.valid) {
      this.isSubmitting = true;
      let comment = "";

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
      this.selectedTask.report = report;
      this.onSaveWorkOrderState();
      this.workorderService.updateWorkOrder(this.workorder).subscribe(res => {
        this.closeReport();
      });
    }
  }

  /**
   * List of action after the workorder is send
   */
  private closeReport() {
    if (this.keycloakService.externalReport) {
      this.referential.getReferential('contract').then(contracts => {
        let contract = contracts.find(ctr => ctr['id'] == this.workorder.tasks[0].ctrId);
        let comment = "";
        for (let reportValue of this.workorder.tasks[0].report?.reportValues) {
          if (reportValue.key == 'COMMENT') {
            comment = reportValue.answer;
          }
        }
        IntentAction.closeIntent({ value: { 'RETOUR': 'ok', 'CONTRAT': (contract ? contract['ctr_code'] : ''), 'COMMENTAIRE': comment } });
        this.isSubmitting = false;
        this.exploitationService.deleteStateWorkorder(this.workorder);
      });
    } else {
      this.router.navigate(['/home/workorder/' + this.workorder.id + '/task/' + this.workorder.tasks[0].id]);
      this.isSubmitting = false;
      this.exploitationService.deleteStateWorkorder(this.workorder);
    }
  }

  /**
   * Previous step
   */
  public onBack() {
    if (this.step == 1) {
      this.workorder.selectedTaskId = undefined;
    }
    if (this.step >= 2) {
      this.step--;
    }
  }

  /**
   * Selected task
   * @param task selected task
   */
  public onSelectedTaskChange(task: Task) {
    this.selectedTask = task;
  }

  /**
   * save work order state
   */
  public onSaveWorkOrderState() {
    this.exploitationService.saveStateWorkorder(this.workorder);
  }

  /**
   * count form question label
   * @return the label
   */
  public getFormQuestionLabel(): string {
    if (this.stepForm?.formEditor?.sections[0]?.children) {
      if (this.selectedTask?.report?.questionIndex) {
        return (this.selectedTask.report.questionIndex + 1) + " sur " + this.stepForm.formEditor.sections[0].children.length;
      } else if (this.selectedTask && this.step == 3) {
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
}
