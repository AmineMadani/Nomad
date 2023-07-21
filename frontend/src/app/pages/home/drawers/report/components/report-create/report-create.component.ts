import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CustomTask, CustomWorkOrder, Report } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { ExploitationService } from 'src/app/core/services/exploitation.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { ReportFormComponent } from '../report-form/report-form.component';
import { IntentAction } from 'plugins/intent-action/src';

@Component({
  selector: 'app-report-create',
  templateUrl: './report-create.component.html',
  styleUrls: ['./report-create.component.scss'],
})
export class ReportCreateComponent implements OnInit {

  constructor(
    private drawerService: DrawerService,
    private utils: UtilsService,
    private exploitationService: ExploitationService
  ) { }

  @Input() workorder: CustomWorkOrder;

  public isMobile: boolean;
  public step: number = 1;
  public selectedTask: CustomTask;
  public hasPreviousQuestion: boolean = false;
  public isSubmit: boolean = false;

  @ViewChild('stepForm') stepForm: ReportFormComponent;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    if(this.workorder.selectedTaskId) {
      this.selectedTask = this.workorder.tasks.find(task => task.id == this.workorder.selectedTaskId);
      this.step = 2;
      if(this.selectedTask.report?.questionIndex){
        this.step = 3;
        if(this.selectedTask.report.questionIndex > 0) {
          this.hasPreviousQuestion = true;
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
      if(this.step == 2) {
        this.workorder.selectedTaskId= this.selectedTask.id;
      }
      this.onSaveWorkOrderState();
    }
  }

  /**
   * Action on click for the previous question
   */
  public previousFormQuestion(){
    if(this.stepForm.formEditor.indexQuestion > 0){
      this.stepForm.formEditor.indexQuestion--;
      if(this.stepForm.formEditor.indexQuestion == 0){
        this.hasPreviousQuestion = false
      }
      this.isSubmit = false;
    }
    this.saveWorkorderState();
  }

  /**
   * Action on click for the next question
   */
  public nextFormQuestion() {
    let child = this.stepForm.formEditor.sections[0].children[this.stepForm.formEditor.indexQuestion];
    let childrens = child.children ? child.children : [child];
    let valid: boolean = true;
    for(let children of childrens) {
      this.stepForm.formEditor.form.get(children.definition.key).updateValueAndValidity();
      this.stepForm.formEditor.form.get(children.definition.key).markAsTouched();
      valid = valid && this.stepForm.formEditor.form.get(children.definition.key).valid;
    }
    if(valid){
      this.stepForm.formEditor.indexQuestion++;
      this.hasPreviousQuestion = true;
      if(this.stepForm.formEditor.indexQuestion+1 >= this.stepForm.formEditor.sections[0].children.length) {
        this.isSubmit = true;
      }
      this.saveWorkorderState();
    }
  }

  private saveWorkorderState() {
    let report:Report = {
      dateCompletion: new Date(),
      reportValues: [],
      questionIndex: this.stepForm.formEditor.indexQuestion
    };
    for(let definition of this.stepForm.formEditor.nomadForm.definitions) {
      if(definition.type == 'property') {
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

  public submitForm() {
    this.stepForm.formEditor.form.updateValueAndValidity();
    this.stepForm.formEditor.form.markAllAsTouched();

    if(this.stepForm.formEditor.form.valid) {
      if(this.isMobile) {
        IntentAction.closeIntent({value:{"result":"ok","param1":"value"}});
      } else {
        let report:Report = {
          dateCompletion: new Date(),
          reportValues: []
        };
        for(let definition of this.stepForm.formEditor.nomadForm.definitions) {
          if(definition.type == 'property') {
            report.reportValues.push({
              key: definition.key,
              question: definition.label,
              answer: this.stepForm.formEditor.form.value[definition.key]
            });
          }
        }
      }
    }
  }

  /**
   * Previous step
   */
  public onBack() {
    if(this.step == 1) {
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
  public onSelectedTaskChange(task: CustomTask){
    this.selectedTask=task;
  }

  /**
   * save work order state
   */
  public onSaveWorkOrderState() {
    this.exploitationService.saveStateWorkorder(this.workorder);
  }
}
