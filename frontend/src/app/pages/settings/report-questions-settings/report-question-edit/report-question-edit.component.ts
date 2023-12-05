import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ReportQuestionService } from 'src/app/core/services/reportQuestion.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { LIST_RQN_TYPE, ReportQuestionDto, RqnTypeEnum } from 'src/app/core/models/reportQuestion.model';
import { ValueLabel } from 'src/app/core/models/util.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { ValueLabelComponent } from './value-label/value-label.component';
import { TemplateService } from 'src/app/core/services/template.service';
import { Form, FormDefinition, fillDefinitionComponentFromRqnType } from 'src/app/shared/form-editor/models/form.model';
import { FormTemplate, FormTemplateUpdate } from 'src/app/core/models/template.model';
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { TableService } from 'src/app/core/services/table.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { WtrReport } from '../../report-settings/report-settings.component';
import { ReportEditComponent } from '../../report-settings/report-edit/report-edit.component';

export interface FormWithLinkedToDefinition {
  formTemplate: FormTemplate;
  form: Form;
  listDefinitionLinkedToQuestion: FormDefinition[];
}

export interface FormTemplateReport extends WtrReport {
  isInReport: string;
  parameterabilityInReport: string;
  indexInReport: number;
  previousQuestionLabel: string;
  nextQuestionLabel: string;
  conditionQuestionLabel: string;
  conditionQuestionValue: string;
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
    private tableService: TableService,
    private layerService: LayerService,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("id") id: number;

  public isLoading: boolean = false;

  public isConsultation: boolean = true;

  public form: FormGroup;

  public reportQuestion: ReportQuestionDto;
  private listReportDefinition: FormWithLinkedToDefinition[] = [];

  public RqnTypeEnum = RqnTypeEnum;
  public LIST_RQN_TYPE = LIST_RQN_TYPE;
  getRqnTypeLabel = (type: ValueLabel) => {
    return type.label;
  }

  private listParameterabilityInReport: ValueLabel[] = [
    { value: 'required', label: 'Défaut obligatoire'},
    { value: 'not_required', label: 'Défaut non obligatoire'},
    { value: 'optional', label: 'Paramétrable'},
  ];

  private listNoYes: ValueLabel[] = [
    { value: true, label: 'Oui'},
    { value: false, label: 'Non'},
  ];

  public listFormTemplateReport: TableRow<FormTemplateReport>[] = [];

  public toolbar: TableToolbar = {
    title: 'Liste des formulaires',
    buttons: [],
  };

  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.ACTION,
      label: '',
      onClick: (formTemplateReport: TableRow<FormTemplateReport>) => {
        this.openReportFormDetails(formTemplateReport.getRawValue());
      }
    },
    {
      key: 'astCode',
      label: 'Code type',
      type: TypeColumn.TEXT,
      filter: {
        type: 'select',
        isSelectAllRow: true,
      }
    },
    {
      key: 'astSlabel',
      label: 'Libellé type',
      type: TypeColumn.TEXT,
      width: '150px',
    },
    {
      key: 'wtrCode',
      label: 'Code motif',
      type: TypeColumn.TEXT,
      filter: {
        type: 'select',
        isSelectAllRow: true,
      }
    },
    {
      key: 'wtrLlabel',
      label: 'Libellé motif',
      type: TypeColumn.TEXT,
      width: '150px',
    },
    {
      key: 'isInReport',
      label: 'Question présente ?',
      type: TypeColumn.TEXT,
      filter: {
        type: 'select',
        listSelectValue: this.listNoYes.map((v) => {
          return {
            value: v.label,
            label: v.label,
          }
        }),
      }
    },
    {
      key: 'parameterabilityInReport',
      label: 'Niveau de paramétrabilité',
      type: TypeColumn.TEXT,
      filter: {
        type: 'select',
        listSelectValue: this.listParameterabilityInReport.map((v) => {
          return {
            value: v.label,
            label: v.label,
          }
        }),
      },
    },
    {
      key: 'indexInReport',
      label: 'Rang de la question dans le formulaire',
      type: TypeColumn.TEXT,
      filter: {
        type: 'number',
      },
    },
    {
      key: 'previousQuestionLabel',
      label: 'Question précédente dans le formulaire',
      type: TypeColumn.TEXT,
      width: '300px',
    },
    {
      key: 'nextQuestionLabel',
      label: 'Question suivante dans le formulaire',
      type: TypeColumn.TEXT,
      width: '300px',
    },
    {
      key: 'conditionQuestionLabel',
      label: 'Conditionné par la question',
      type: TypeColumn.TEXT,
      width: '300px',
    },
    {
      key: 'conditionQuestionValue',
      label: 'Conditionné par la valeur',
      type: TypeColumn.TEXT,
    },
  ];

  listColumnSort: ColumnSort[] = [
    {
      key: 'astCode', direction: 'asc'
    },
    {
      key: 'wtrCode', direction: 'asc'
    }
  ];

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
    this.isConsultation = !await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_NEW_FORM_FIELDS);

    // Disable form if user hasn't right to customize
    if (this.isConsultation) {
      this.form.disable();
    }

    // ### Data ### //
    await this.getReportFormData();

    this.isLoading = false;
  }

  private async getReportFormData() {
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
        const listDefinitionForQuestion = form.definitions.filter((definition) => definition.rqnCode === this.reportQuestion.rqnCode && definition.isOptional !== true);
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

      // Get the list of report form by asset type / wtr
      let vLayerWtrList = await this.layerService.getAllVLayerWtr();

      // Remove duplicates (because one asset type / wtr can have multiple layers)
      vLayerWtrList = vLayerWtrList.reduce((unique, o) => {
        if (!unique.some((obj) => obj.astCode === o.astCode && obj.wtrCode === o.wtrCode)) {
          unique.push(o);
        }
        return unique;
      }, []);

      this.listFormTemplateReport = this.tableService.createReadOnlyRowsFromObjects(
        vLayerWtrList.map((vLayerWtr) => {
          // For each wtr, get the form, if it exists
          const formTemplateReport = listFormTemplateReport.find((formTemplateReport) => formTemplateReport.formCode === 'REPORT_' + vLayerWtr.astCode + '_' + vLayerWtr.wtrCode)
          
          let definition: FormDefinition = null;
          let parameterabilityInReportValue: string = null;
          let indexInReport: number = null;
          let previousQuestionLabel: string = null;
          let nextQuestionLabel: string = null;
          let conditionQuestionLabel: string = null;
          let conditionQuestionValue: string = null;

          if (formTemplateReport != null) {
            const form: Form = JSON.parse(formTemplateReport.definition);
            definition = form.definitions.find((definition) => definition.rqnCode === this.reportQuestion.rqnCode);
            if (definition) {
              if (definition.isOptional !== true) {
                parameterabilityInReportValue = definition.canBeDeleted === true ? 'not_required' : 'required';

                const index = form.definitions.indexOf(definition);
                indexInReport = index; // no need to add 1, because the first question is a section, so the real first question starts at index 1
              
                if (index > 1) {
                  const previousQuestion = form.definitions[index - 1];
                  previousQuestionLabel = previousQuestion.label;
                }

                if (index < form.definitions.length - 1) {
                  const nextQuestion = form.definitions[index + 1];
                  if (nextQuestion.isOptional !== true)
                    nextQuestionLabel = nextQuestion.label;
                }

                if (definition.displayCondition != null) {
                  const conditionQuestion = form.definitions.find((d) => d.key === definition.displayCondition.key);
                  if (conditionQuestion) {
                    conditionQuestionLabel = conditionQuestion.label;
                    conditionQuestionValue = definition.displayCondition.value.join(', ');
                  }
                }
              } else {
                parameterabilityInReportValue = 'optional';
              }
            }
          }

          const isInReportValue = definition != null;
          
          return {
            ...vLayerWtr,
            fteId: formTemplateReport?.fteId,
            formCode: formTemplateReport?.formCode,
            fdnId: formTemplateReport?.fteId,
            definition: formTemplateReport?.definition,
            hasForm: null,
            isInReport: this.listNoYes.find((v) => v.value === isInReportValue)?.label,
            parameterabilityInReport: this.listParameterabilityInReport.find((v) => v.value === parameterabilityInReportValue)?.label,
            indexInReport: indexInReport,
            previousQuestionLabel: previousQuestionLabel,
            nextQuestionLabel: nextQuestionLabel,
            conditionQuestionLabel: conditionQuestionLabel,
            conditionQuestionValue: conditionQuestionValue,
          }
        })
      );
    }
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

    listValue.splice(lineIndex, 1)
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

  private async openReportFormDetails(formTemplateReport: FormTemplateReport): Promise<void> {
    const modal = await this.modalController.create({
      component: ReportEditComponent,
      componentProps: {
        wtrReport: formTemplateReport,
      },
      backdropDismiss: false,
      cssClass: 'big-modal',
    });

    modal.onDidDismiss().then(async (result) => {
      const reloadNeeded: boolean = result['data'];
      // If some data changed
      if (reloadNeeded) {
        await this.getReportFormData();
      }
    });

    await modal.present();
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
        rqnCode: null,
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
