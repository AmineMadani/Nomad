import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CustomTask } from 'src/app/core/models/workorder.model';
import { TemplateDataService } from 'src/app/core/services/dataservices/template.dataservice';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { Form } from 'src/app/shared/form-editor/models/form.model';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
})
export class ReportFormComponent implements OnInit {

  constructor(
    private referentialService: ReferentialService,
    private templateDataService: TemplateDataService
  ) { }

  @Input() task: CustomTask;
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();

  public form: Form;

  ngOnInit() {
    this.templateDataService.getformsTemplate().then(forms => {
      console.log(('REPORT_' + this.task.assObjTable.replace("asset.", "") + '_' + this.task.wtrId).toUpperCase());
      let formTemplate = forms.find(form => form['formCode'] == ('REPORT_' + this.task.assObjTable.replace("asset.", "") + '_' + this.task.wtrId).toUpperCase());
      if (formTemplate) {
        this.form = JSON.parse(formTemplate.definition);
      }
    });
  }

  public onSubmit(form: FormGroup) {

    form.markAllAsTouched();

    if (form.valid) {
      console.log("form valid!!");
    }
  }


}
