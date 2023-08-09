import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { WtrReport } from '../report-list.component';
import { Form, FormDefinition, FormPropertiesEnum, PREFIX_KEY_DEFINITION } from 'src/app/shared/form-editor/models/form.model';
import { ValueLabel } from 'src/app/core/models/util.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValueLabelComponent } from './value-label/value-label.component';
import { UtilsService } from 'src/app/core/services/utils.service';
import { FormTemplateUpdate } from 'src/app/core/models/template.model';
import { TemplateService } from 'src/app/core/services/template.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { SelectDuplicateReportComponent } from './select-duplicate-report/select-duplicate-report.component';
import { TestReportComponent } from './test-report/test-report.component';

enum CustomFormPropertiesEnum {
    TEXT = 'text',
    NUMBER = 'number',
    SELECT = 'select',
}


@Component({
  selector: 'app-report-edit',
  templateUrl: './report-edit.component.html',
  styleUrls: ['./report-edit.component.scss'],
})
export class ReportEditComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private utilsService: UtilsService,
    private templateService: TemplateService,
    private referentialService: ReferentialService,
    private toastController: ToastController,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("wtrReport") wtrReport: WtrReport;

  public form: FormGroup;

  CustomFormPropertiesEnum = CustomFormPropertiesEnum;

  listComponentType: ValueLabel[] = [
    {value: CustomFormPropertiesEnum.TEXT, label: 'Saisie libre'},
    {value: CustomFormPropertiesEnum.SELECT, label: 'Liste de valeurs'},
    {value: CustomFormPropertiesEnum.NUMBER, label: 'Valeur numérique'}
  ];
  getComponentTypeLabel = (componentType: ValueLabel) => {
    return componentType.label;
  }

  ngOnInit() {
    // ### Form ### //
    this.form = new FormGroup({
      lines: new FormArray([]),
    });

    // ### Data ### //
    // Check if there is already a existing form
    if (this.wtrReport.definition != null) {
      this.createFormFromDefinition(this.wtrReport.definition);
    }
  }

  get lines(): FormArray<FormGroup> {
    return this.form.controls["lines"] as FormArray;
  }

  createFormFromDefinition(definition: string) {
    // Extract the form from the string
    const reportForm: Form = JSON.parse(definition);
    const definitions = reportForm.definitions;

    this.lines.clear();

    //const parentDefinition = definitions.find((definition) => definition.type === 'section');
    const listDefinition = definitions.filter((definition) => definition.type === 'property');
    for (const [index, definition] of listDefinition.entries()) {
      this.addLine();
      const lineForm = this.lines.at(index);

      lineForm.patchValue({
        ...definition,
        isRequired: definition.rules.some((rule) => rule.key === 'required'),
        listValue: definition.attributes?.options != null ? definition.attributes.options.map((option) => option.value) : [],
        questionCondition: definition.displayCondition?.key != null ? definition.displayCondition.key.substring(PREFIX_KEY_DEFINITION.length) : null,
        listQuestionConditionValues: definition.displayCondition?.value ?? [],
      });
    }
  }

  addLine() {
    const lineForm = new FormGroup({
      component: new FormControl<string>(null, Validators.required),
      label: new FormControl<string>(null, Validators.required),
      isRequired: new FormControl<boolean>(false, Validators.required),
      listValue: new FormControl<string[]>([]),
      questionCondition: new FormControl<string>(null),
      listQuestionConditionValues: new FormControl<string[]>([]),
    });

    // When changing the type of component
    lineForm.get('component').valueChanges.subscribe((component) => {
      // Empty the list of values if it is not a select
      if (component !== CustomFormPropertiesEnum.SELECT) {
        lineForm.get('listValue').setValue([]);
      }
    });

    // When changing the question condition
    lineForm.get('questionCondition').valueChanges.subscribe((questionCondition) => {
      // Empty the list of selected values for the condition
      lineForm.get('listQuestionConditionValues').setValue([]);

      // If there is a question condition, question condition values has to be set
      if (questionCondition != null) {
        lineForm.get('listQuestionConditionValues').addValidators(Validators.required);
      } else {
        lineForm.get('listQuestionConditionValues').removeValidators(Validators.required);
      }
    });

    this.lines.push(lineForm);
  }

  getListAvailableQuestion(index: number): ValueLabel[] {
    // Display only questions before the index and question that are a list of values
    const listAvailableQuestion = [];
    for (let i = 0; i < index; i++) {
      const lineForm = this.lines.at(i);
      if (lineForm.get('component').value === CustomFormPropertiesEnum.SELECT) {
        listAvailableQuestion.push({
          value: (i+1).toString(),
          label: (i+1) + ' - ' + lineForm.get('label').value,
        });
      }
    }

    return listAvailableQuestion;
  }

  getListAvailableQuestionValues(index: number): ValueLabel[] {
    // Display the list of values linked to the selected question condition
    const lineForm = this.lines.at(index);

    const questionCondition = lineForm.get('questionCondition').value;
    if (questionCondition != null) {
      const indexQuestionCondition = Number(questionCondition) - 1;
      if (indexQuestionCondition < this.lines.length) {
        const questionConditionLineForm = this.lines.at(indexQuestionCondition);
        if (questionConditionLineForm) {
          return questionConditionLineForm.get('listValue').value.map((value, index) => {
            return {
              value: value,
              label: (index+1) + ' - ' + value,
            }
          });
        }
      }
    }

    return [];
  }

  /*
   * Handle Values in a List of value question
   */
  // ### ADD ### //
  async addValue(lineForm: FormGroup) {
    const listValue: string[] = lineForm.get('listValue').value;

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
        lineForm.get('listValue').setValue(listValue);
      }
    });

    await modal.present();
  }

  // ### UPDATE ### //
  async updateValue(lineForm: FormGroup, value: string) {
    const listValue: string[] = lineForm.get('listValue').value;
    const index = listValue.indexOf(value);
    
    const modal = await this.modalController.create({
      component: ValueLabelComponent,
      componentProps: {
        value: listValue[index],
      },
      backdropDismiss: false,
      cssClass: 'adaptive-modal stack-modal',
    });

    modal.onDidDismiss().then((result) => {
      const newValue: string = result['data'];
      // If some data changed
      if (newValue != null) {
        listValue[index] = newValue;
        lineForm.get('listValue').setValue(listValue);
      }
    });

    await modal.present();
  }

  // ### DELETE ### //
  deleteValue(lineForm: FormGroup, value: string) {
    let listValue: string[] = lineForm.get('listValue').value;
    listValue = listValue.filter((v) => v !== value);
    lineForm.get('listValue').setValue(listValue);
  }

  /**
   * Duplication another report into this one
   */
  async duplicateFromReport() {
    // Select the type-motif from which to duplicate
    // Only display the ones with report
    const listAssetTypeWtr = await this.referentialService.getReferential('v_layer_wtr');

    const listFormTemplateReport = await this.templateService.getFormsTemplate();

    let listAssetTypeWtrWithReport: ValueLabel[] = listAssetTypeWtr
      .filter((assetTypeWtr) => {
        return listFormTemplateReport.some((formTemplateReport) => formTemplateReport.formCode === 'REPORT_' + assetTypeWtr.ast_code + '_' + assetTypeWtr.wtr_code);
      })
      .sort((a, b) => {
        if (a.ast_code === b.ast_code) return a.wtr_code.localeCompare(b.wtr_code);
        return a.ast_code.localeCompare(b.ast_code);
      })
      .map((assetTypeWtr) => {
        // For each wtr, get the form, if it exists
        const formTemplateReport = listFormTemplateReport.find((formTemplateReport) => formTemplateReport.formCode === 'REPORT_' + assetTypeWtr.ast_code + '_' + assetTypeWtr.wtr_code);

        return {
          value: formTemplateReport.formCode,
          label: assetTypeWtr.ast_code + ' - ' + assetTypeWtr.ast_slabel + ' - ' + assetTypeWtr.wtr_code + ' - ' + assetTypeWtr.wtr_slabel,
        }
      });

      // Remove duplicates
      listAssetTypeWtrWithReport = this.utilsService.removeDuplicatesFromArr(listAssetTypeWtrWithReport, 'value');

      const modal = await this.modalController.create({
        component: SelectDuplicateReportComponent,
        componentProps: {
          listAssetTypeWtrReport: listAssetTypeWtrWithReport,
        },
        backdropDismiss: false,
        cssClass: 'adaptive-modal stack-modal',
      });
  
      modal.onDidDismiss().then((result) => {
        const report: string = result['data'];
        // If a report is selected
        if (report != null) {
          const formTemplate = listFormTemplateReport.find((formTemplateReport) => formTemplateReport.formCode === report);
          this.createFormFromDefinition(formTemplate.definition);
        }
      });
  
      await modal.present();
  }

  /**
   * Test the current report
   */
  async testReport() {
    if (!this.form.valid) {
      const toast = await this.toastController.create({
        message: "Le formulaire n'est pas valide",
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    const reportForm = this.getReportFormFromForm();

    const modal = await this.modalController.create({
      component: TestReportComponent,
      componentProps: {
        reportForm: reportForm,
      },
      backdropDismiss: false,
      cssClass: 'adaptive-modal stack-modal',
    });

    await modal.present();
  }

  /**
   * Get the report form from the form
   * @returns the report form
   */
  getReportFormFromForm(): Form {
    // Convert the form into report form
    const reportForm: Form = {
      key: 'FORM_' + this.wtrReport.ast_code + '_' + this.wtrReport.wtr_code,
      editable: true,
      definitions: [],
      relations: [],
    }

    // Add the start definition
    const startDefinition: FormDefinition = {
      key: 'questionPrincipal',
      type: 'section',
      label: '',
      component: 'question',
      editable: true,
      attributes: {},
      rules: [],
    }
    reportForm.definitions.push(startDefinition);

    // Add each definition
    for (let i = 0; i < this.lines.length; i++) {
      const lineForm = this.lines.at(i);

      const definition: FormDefinition = {
        key: PREFIX_KEY_DEFINITION + (i+1),
        type: 'property',
        label: lineForm.get('label').value,
        component: null,
        editable: true,
        attributes: {},
        rules: [],
        section: startDefinition.key,
      }

      // Component
      const component = lineForm.get('component').value;
      if ([CustomFormPropertiesEnum.TEXT, CustomFormPropertiesEnum.NUMBER].includes(component)) {
        definition.component = FormPropertiesEnum.INPUT;
      }
      if (CustomFormPropertiesEnum.SELECT === component) {
        definition.component = FormPropertiesEnum.SELECT;
      }

      // Attributes
      if (component === CustomFormPropertiesEnum.TEXT) {
        definition.attributes = {
          type: 'text',
          hiddenNull: false,
        }
      }
      if (component === CustomFormPropertiesEnum.NUMBER) {
        definition.attributes = {
          type: 'number',
          hiddenNull: false,
        }
      }
      if (component === CustomFormPropertiesEnum.SELECT) {
        definition.attributes = {
          value: '',
          options: lineForm.get('listValue').value.map((value) => {
            return {
              key: value,
              value: value,
            }
          })
        }
      }

      // Rules
      if (lineForm.get('isRequired').value === true) {
        definition.rules.push({
          key: 'required',
          value: 'Obligatoire',
          message: 'Ce champ est obligatoire',
        });
      }

      // Display condition
      if (lineForm.get('questionCondition').value != null) {
        definition.displayCondition = {
          key: PREFIX_KEY_DEFINITION + lineForm.get('questionCondition').value,
          value: lineForm.get('listQuestionConditionValues').value,
        }
      }

      reportForm.definitions.push(definition);
    }

    return reportForm;
  }

  /**
   * Save the form
   * @returns nothing
   */
  save(): void {
    this.utilsService.validateAllFormFields(this.form);

    if (!this.form.valid) return;

    const reportForm = this.getReportFormFromForm();

    // Form template update
    const formTemplate: FormTemplateUpdate = {
      fteId: this.wtrReport.fteId,
      fteCode: 'REPORT_' + this.wtrReport.ast_code + '_' + this.wtrReport.wtr_code,
      fdnId: this.wtrReport.fdnId,
      fdnCode: 'DEFAULT_REPORT_' + this.wtrReport.ast_code + '_' + this.wtrReport.wtr_code,
      fdnDefinition: JSON.stringify(reportForm),
    }

    // Create
    if (formTemplate.fteId == null) {
      this.templateService.createFormTemplate(formTemplate).subscribe((res: any) => {
        this.modalController.dismiss(true);
      });
    } else {
      this.templateService.updateFormTemplate(formTemplate).subscribe((res: any) => {
        this.modalController.dismiss(true);
      });
    }
  }

  close() {
    this.modalController.dismiss(false);
  }
}
