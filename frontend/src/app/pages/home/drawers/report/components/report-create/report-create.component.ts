import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CustomTask, CustomWorkOrder } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { ExploitationService } from 'src/app/core/services/exploitation.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { ReportFormComponent } from '../report-form/report-form.component';
import { Router } from '@angular/router';
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
    private exploitationService: ExploitationService,
    private route: Router
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
      this.onSaveWorkOrderState();
    }
  }

  /**
   * Action on click for the previous question
   */
  public previousFormQuestion(){
    if(this.stepForm.formEditor.indexChild > 0){
      this.stepForm.formEditor.indexChild--;
      if(this.stepForm.formEditor.indexChild == 0){
        this.hasPreviousQuestion = false
      }
      this.isSubmit = false;
    }
  }

  /**
   * Action on click for the next question
   */
  public nextFormQuestion() {
    let child = this.stepForm.formEditor.sections[0].children[this.stepForm.formEditor.indexChild];
    let childrens = child.children ? child.children : [child];
    let valid: boolean = true;
    for(let children of childrens) {
      this.stepForm.formEditor.form.get(children.definition.key).updateValueAndValidity();
      this.stepForm.formEditor.form.get(children.definition.key).markAsTouched();
      valid = valid && this.stepForm.formEditor.form.get(children.definition.key).valid;
    }
    if(valid){
      this.stepForm.formEditor.indexChild++;
      this.hasPreviousQuestion = true;
      if(this.stepForm.formEditor.indexChild+1 >= this.stepForm.formEditor.sections[0].children.length) {
        this.isSubmit = true;
      }
    }
  }

  public submitForm() {
    this.stepForm.formEditor.form.updateValueAndValidity();
    this.stepForm.formEditor.form.markAllAsTouched();

    if(this.stepForm.formEditor.form.valid) {
      if(this.isMobile) {
        IntentAction.echo({value:"retour ok"});
      } else {
        this.route.navigate(["/home"]);
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
