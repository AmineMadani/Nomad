import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ReportQuestionService } from 'src/app/core/services/reportQuestion.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { firstValueFrom } from 'rxjs';
import { LIST_RQN_TYPE, ReportQuestionDto, RqnTypeEnum } from 'src/app/core/models/reportQuestion.model';
import { ValueLabel } from 'src/app/core/models/util.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { ValueLabelComponent } from './value-label/value-label.component';
import { TemplateService } from 'src/app/core/services/template.service';
import { Form, FormDefinition, PREFIX_KEY_DEFINITION, fillDefinitionComponentFromRqnType } from 'src/app/shared/form-editor/models/form.model';
import { FormTemplate, FormTemplateUpdate } from 'src/app/core/models/template.model';

export interface FormWithLinkedToDefinition {
  formTemplate: FormTemplate;
  form: Form;
  listDefinitionLinkedToQuestion: FormDefinition[];
}

@Component({
  selector: 'app-report-question-edit',
  templateUrl: './report-question-edit.component.html',
  styleUrls: ['./report-question-edit.component.scss'],
})
export class ReportQuestionEditComponent implements OnInit {

  constructor(
    private utilsService: UtilsService,
    private modalController: ModalController,
    private reportQuestionService: ReportQuestionService,
    private userService: UserService,
    private templateService: TemplateService,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("id") id: number;

  public isLoading: boolean = false;

  public userHasPermissionCustomizeFormField: boolean = true;

  public form: FormGroup;

  public reportQuestion: ReportQuestionDto;
  private listReportDefinition: FormWithLinkedToDefinition[] = [];

  public RqnTypeEnum = RqnTypeEnum;
  public LIST_RQN_TYPE = LIST_RQN_TYPE;
  getRqnTypeLabel = (type: ValueLabel) => {
    return type.label;
  }

  async ngOnInit() {
    this.isLoading = true;

    // ### Form ### //
    this.form = new FormGroup({
      rqnCode: new FormControl<string>({value: null, disabled: true}),
      //rqnSlabel: new FormControl<string>(null, Validators.required),
      rqnLlabel: new FormControl<string>(null, Validators.required),
      rqnType: new FormControl<string>(null, Validators.required),
      rqnRequired: new FormControl<boolean>(false, Validators.required),
      rqnSelectValues: new FormControl<string[]>([]),
    });

    // When the type is changed
    this.form.get('rqnType').valueChanges.subscribe((rqnType) => {
      // In modification
      if (this.reportQuestion != null) {
        // If it is changed from SELECT or SELECT_MULTIPLE to something else
        if (
          (
            this.reportQuestion.rqnType === RqnTypeEnum.SELECT
            || this.reportQuestion.rqnType === RqnTypeEnum.SELECT_MULTIPLE
          )
          && (
            rqnType !== RqnTypeEnum.SELECT
            && rqnType !== RqnTypeEnum.SELECT_MULTIPLE
          )
        ) {
          // Check if the question was used as condition
          const listReportDefinitionWithCondition = this.listReportDefinition.filter((reportDefinition) => {
            return reportDefinition.listDefinitionLinkedToQuestion.some((definition) => {
              return definition.rqnCode !== this.reportQuestion.rqnCode;
            })
          });

          // If it's the case
          if (listReportDefinitionWithCondition.length > 0) {
            // Display a message
            let message = "Le type ne peut pas être modifié, cette question est utilisée en tant que condition dans le(s) formulaire(s) de compte-rendu : ";
            message += listReportDefinitionWithCondition.map((reportDefinition) => reportDefinition.formTemplate.formCode.substring('REPORT_'.length).replace('_', ' - ')).join(', ');
            this.utilsService.showErrorMessage(message, 5000);

            // Set the old value
            this.form.get('rqnType').setValue(this.reportQuestion.rqnType);
            return;
          }
        }
      }
    });

    // ### Permissions ### //
    this.userHasPermissionCustomizeFormField =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CUSTOMIZE_FORM_FIELDS);

    // Disable form if user hasn't right to customize
    if (!this.userHasPermissionCustomizeFormField) {
      this.form.disable();
    }

    // ### Data ### //
    const listFormTemplate = await this.templateService.getFormsTemplate(true);
    const listFormTemplateReport = listFormTemplate.filter((formTemplate) => formTemplate.formCode.startsWith('REPORT_'));

    if (this.id != null) {
      this.reportQuestion = await this.reportQuestionService.getReportQuestionById(this.id);
      this.form.patchValue(this.reportQuestion);

      this.form.get('rqnSelectValues').setValue(
        this.reportQuestion.rqnSelectValues != null ? JSON.parse(this.reportQuestion.rqnSelectValues) : [],
      );

      // Get the list of definition that use this question
      // - Directly as a question in a form
      // - As a condition in this form
      this.listReportDefinition = [];
      listFormTemplateReport.forEach((formTemplate) => {
        const form: Form = JSON.parse(formTemplate.definition);
        const listDefinitionForQuestion = form.definitions.filter((definition) => definition.rqnCode === this.reportQuestion.rqnCode);
        const listDefinitionWithConditionOnQuestion = form.definitions.filter((definition) => listDefinitionForQuestion.some((d) => d.key === definition.displayCondition?.key));
        const reportDefinition: FormWithLinkedToDefinition = {
          formTemplate: formTemplate,
          form: form,
          listDefinitionLinkedToQuestion: listDefinitionForQuestion.concat(listDefinitionWithConditionOnQuestion),
        };

        if (reportDefinition.listDefinitionLinkedToQuestion.length > 0) {
          this.listReportDefinition.push(reportDefinition);
        }
      });
    }

    this.isLoading = false;
  }

  /*
   * Handle Values in a List of value question
   */
  // ### ADD ### //
  async addValue() {
    const listValue: string[] = this.form.get('rqnSelectValues').value;

    const modal = await this.modalController.create({
      component: ValueLabelComponent,
      componentProps: {
        value: null,
      },
      backdropDismiss: false,
      cssClass: 'adaptive-modal stack-modal',
      showBackdrop: true,
    });

    modal.onDidDismiss().then((result) => {
      const newValue: string = result['data'];
      // If some data changed
      if (newValue != null) {
        listValue.push(newValue);
        this.form.get('rqnSelectValues').setValue(listValue);
      }
    });

    await modal.present();
  }

  // ### UPDATE ### //
  async updateValue(lineIndex: number) {
    const listValue: string[] = this.form.get('rqnSelectValues').value;
    const value = listValue[lineIndex];

    const modal = await this.modalController.create({
      component: ValueLabelComponent,
      componentProps: {
        value: value,
      },
      backdropDismiss: false,
      cssClass: 'adaptive-modal stack-modal',
    });

    modal.onDidDismiss().then((result) => {
      const newValue: string = result['data'];
      // If some data changed
      if (newValue != null) {
        // Check if the value is used in a report
        if (this.reportQuestion != null) {
          this.listReportDefinition.forEach((reportDefinition) => {
            reportDefinition.listDefinitionLinkedToQuestion.forEach((definition) => {
              if (
                definition.rqnCode !== this.reportQuestion.rqnCode
                && definition.displayCondition?.value?.includes(value)
              ) {
                const index = definition.displayCondition.value.indexOf(value);
                definition.displayCondition.value[index] = newValue;
                (definition.displayCondition as any).hasChanges = true;
              }
            });
          });
        }


        listValue[lineIndex] = newValue;
      }
    });

    await modal.present();
  }

  // ### DELETE ### //
  deleteValue(lineIndex: number) {
    let listValue: string[] = this.form.get('rqnSelectValues').value;
    const value = listValue[lineIndex];

    // Check if the value is used in a report
    if (this.reportQuestion != null) {
      const listReportDefinitionWithCondition = this.listReportDefinition.filter((reportDefinition) => {
        return reportDefinition.listDefinitionLinkedToQuestion.some((definition) => {
          return definition.rqnCode !== this.reportQuestion.rqnCode
            && definition.displayCondition?.value?.includes(value)
        });
      });
      if (listReportDefinitionWithCondition.length > 0) {
        let message = "Cette valeur est utilisée dans le(s) formulaire(s) de compte-rendu : ";
        message += listReportDefinitionWithCondition.map((reportDefinition) => reportDefinition.formTemplate.formCode.substring('REPORT_'.length).replace('_', ' - ')).join(', ');
        this.utilsService.showErrorMessage(message, 5000);
        return;
      }
    }

    listValue = listValue.splice(lineIndex, 1);
    this.form.get('rqnSelectValues').setValue(listValue);
  }

  // ### ORDER ### //
  valueDown(valueIndex: number) {
    // Invert both values
    const listValues = this.form.get('rqnSelectValues').value;
    const valueAtIndex = listValues[valueIndex];
    const valueAtIndexMinusOne = listValues[valueIndex - 1];
    listValues[valueIndex] = valueAtIndexMinusOne;
    listValues[valueIndex - 1] = valueAtIndex;
  }

  valueUp(valueIndex: number) {
    // Invert both values
    const listValues = this.form.get('rqnSelectValues').value;
    const valueAtIndex = listValues[valueIndex];
    const valueAtIndexPlusOne = listValues[valueIndex + 1];
    listValues[valueIndex] = valueAtIndexPlusOne;
    listValues[valueIndex + 1] = valueAtIndex;
  }

  async save() {
    this.utilsService.validateAllFormFields(this.form);

    if (!this.form.valid) return;

    const rqnSelectValues: string[] = this.form.get('rqnSelectValues').value;

    if (this.reportQuestion != null) {
      const reportQuestion: ReportQuestionDto = {
        ...this.reportQuestion
      }

      //reportQuestion.rqnSlabel = this.form.get('rqnSlabel').value;
      reportQuestion.rqnLlabel = this.form.get('rqnLlabel').value;
      reportQuestion.rqnSlabel = reportQuestion.rqnLlabel;
      reportQuestion.rqnType = this.form.get('rqnType').value;
      reportQuestion.rqnRequired = this.form.get('rqnRequired').value;
      reportQuestion.rqnSelectValues = rqnSelectValues.length > 0 ? JSON.stringify(rqnSelectValues) : null;

      await this.reportQuestionService.updateReportQuestion(reportQuestion);

      // Reflect changes on forms that use that question
      const listFormToSave = [];

      // If the label changes
      if (reportQuestion.rqnLlabel !== this.reportQuestion.rqnLlabel) {
        this.listReportDefinition.forEach((reportDefinition) => {
          reportDefinition.listDefinitionLinkedToQuestion.forEach((definition) => {
            if (definition.rqnCode === this.reportQuestion.rqnCode) {
              definition.label = reportQuestion.rqnLlabel;

              if (!listFormToSave.includes(reportDefinition.form.key))
                listFormToSave.push(reportDefinition.form.key);
            }
          });
        });
      }

      // If the type changes
      if (reportQuestion.rqnType !== this.reportQuestion.rqnType) {
        this.listReportDefinition.forEach((reportDefinition) => {
          reportDefinition.listDefinitionLinkedToQuestion.forEach((definition) => {
            if (definition.rqnCode === this.reportQuestion.rqnCode) {
              fillDefinitionComponentFromRqnType(definition, reportQuestion.rqnType as RqnTypeEnum, rqnSelectValues);

              if (!listFormToSave.includes(reportDefinition.form.key))
                listFormToSave.push(reportDefinition.form.key);
            }
          });
        });
      }

      // If the label of a value changes
      this.listReportDefinition.forEach((reportDefinition) => {
        reportDefinition.listDefinitionLinkedToQuestion.forEach((definition) => {
          if (
            definition.rqnCode !== this.reportQuestion.rqnCode
            && (definition.displayCondition as any).hasChanges === true
          ) {
            if (!listFormToSave.includes(reportDefinition.form.key))
              listFormToSave.push(reportDefinition.form.key);
          }
        });
      });

      // Save all the form changed
      for (const formKey of listFormToSave) {
        const reportDefinition = this.listReportDefinition.find((reportDefinition) => reportDefinition.form.key === formKey);

        // Form template update
        const formTemplate: FormTemplateUpdate = {
          fteId: reportDefinition.formTemplate.fteId,
          fteCode: reportDefinition.formTemplate.formCode,
          fdnId: reportDefinition.formTemplate.fdnId,
          fdnCode: reportDefinition.formTemplate.fdnCode,
          fdnDefinition: JSON.stringify(reportDefinition.form),
        }

        this.templateService.updateFormTemplate(formTemplate);
      }
    } else {
      const reportQuestion: ReportQuestionDto = {
        id: null,
        rqnCode: PREFIX_KEY_DEFINITION + this.utilsService.createUniqueId(),
        //rqnSlabel: this.form.get('rqnSlabel').value,
        rqnSlabel: this.form.get('rqnLlabel').value,
        rqnLlabel: this.form.get('rqnLlabel').value,
        rqnType: this.form.get('rqnType').value,
        rqnRequired: this.form.get('rqnRequired').value,
        rqnSelectValues: rqnSelectValues.length > 0 ? JSON.stringify(rqnSelectValues) : null,
      }

      await this.reportQuestionService.createReportQuestion(reportQuestion);
    }

    this.modalController.dismiss(true);
  }

  close() {
    this.modalController.dismiss(false);
  }

}
