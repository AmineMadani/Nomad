import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Task } from 'src/app/core/models/workorder.model';
import { TemplateService } from 'src/app/core/services/template.service';
import { FormEditorComponent } from 'src/app/shared/form-editor/form-editor.component';
import { Form } from 'src/app/shared/form-editor/models/form.model';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
})
export class ReportFormComponent implements OnInit {

  constructor(
    private templateService: TemplateService
  ) { }

  @Input() task: Task;
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();

  @ViewChild('formEditor') formEditor: FormEditorComponent;

  public form: Form;
  public indexQuestion: number=0;
  public isLoading:boolean = true;

  ngOnInit() {
    this.templateService.getFormsTemplate().then(forms => {
      let formTemplate = forms.find(form => form['formCode'] === 'REPORT_' + this.task.astCode + '_' + this.task.wtrCode);
      if (formTemplate) {
        this.form = JSON.parse(formTemplate.definition);
        if(this.task.report?.questionIndex){
          this.indexQuestion = this.task.report?.questionIndex;
        }
      }
      this.isLoading = false;
    });
  }

}
