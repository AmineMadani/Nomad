import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WtrReport } from '../report-list.component';
import { Form, FormDefinition, FormPropertiesEnum, PREFIX_KEY_DEFINITION } from 'src/app/shared/form-editor/models/form.model';
import { ValueLabel } from 'src/app/core/models/util.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValueLabelComponent } from './value-label/value-label.component';
import { UtilsService } from 'src/app/core/services/utils.service';
import { FormTemplateUpdate } from 'src/app/core/models/template.model';
import { TemplateService } from 'src/app/core/services/template.service';

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
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("wtrReport") wtrReport: WtrReport;

  public form: FormGroup;

  FormPropertiesEnum = FormPropertiesEnum;

  listComponentType: ValueLabel[] = [
    {value: FormPropertiesEnum.INPUT, label: 'Saisie libre'},
    {value: FormPropertiesEnum.SELECT, label: 'Liste de valeurs'},
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
      // Extract the form from the string
      const reportForm: Form = JSON.parse(this.wtrReport.definition);
      const definitions = reportForm.definitions;

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
  }

  get lines(): FormArray<FormGroup> {
    return this.form.controls["lines"] as FormArray;
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
      if (component !== FormPropertiesEnum.SELECT) {
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
      if (lineForm.get('component').value === FormPropertiesEnum.SELECT) {
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
   * Save the form
   * @returns nothing
   */
  save(): void {
    this.utilsService.validateAllFormFields(this.form);

    if (!this.form.valid) return;

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
        component: lineForm.get('component').value,
        editable: true,
        attributes: {},
        rules: [],
        section: startDefinition.key,
      }

      // Attributes
      if (definition.component === FormPropertiesEnum.INPUT) {
        definition.attributes = {
          type: 'text',
          hiddenNull: false,
        }
      }
      if (definition.component === FormPropertiesEnum.SELECT) {
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
