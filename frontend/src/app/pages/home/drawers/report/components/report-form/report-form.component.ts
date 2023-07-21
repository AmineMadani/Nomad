import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CustomTask } from 'src/app/core/models/workorder.model';
import { TemplateDataService } from 'src/app/core/services/dataservices/template.dataservice';
import { FormEditorComponent } from 'src/app/shared/form-editor/form-editor.component';
import { Form } from 'src/app/shared/form-editor/models/form.model';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
})
export class ReportFormComponent implements OnInit {

  constructor(
    private templateDataService: TemplateDataService
  ) { }

  @Input() task: CustomTask;
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();

  @ViewChild('formEditor') formEditor: FormEditorComponent;

  public form: Form;

  ngOnInit() {
    this.templateDataService.getformsTemplate().then(forms => {
      console.log(('REPORT_' + this.task.assObjTable.replace("asset.", "") + '_' + this.task.wtrCode).toUpperCase())
      let formTemplate = forms.find(form => form['formCode'] == ('REPORT_' + this.task.assObjTable.replace("asset.", "") + '_' + this.task.wtrCode).toUpperCase());
      if (formTemplate) {
        this.form = JSON.parse(formTemplate.definition);
      }
    });
  }

  public test() {
    console.log(this.formEditor.sections[0].children);
    console.log(this.formEditor.indexChild);
  }

}
