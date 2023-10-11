import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { WtrReport } from '../report-settings.component';
import { Form, FormDefinition, PREFIX_KEY_DEFINITION, fillDefinitionComponentFromRqnType } from 'src/app/shared/form-editor/models/form.model';
import { ValueLabel } from 'src/app/core/models/util.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/core/services/utils.service';
import { FormTemplateUpdate } from 'src/app/core/models/template.model';
import { TemplateService } from 'src/app/core/services/template.service';
import { SelectDuplicateReportComponent } from './select-duplicate-report/select-duplicate-report.component';
import { TestReportComponent } from './test-report/test-report.component';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { ReportQuestionService } from 'src/app/core/services/reportQuestion.service';
import { RqnTypeEnum, ReportQuestionDto, LIST_RQN_TYPE } from 'src/app/core/models/reportQuestion.model';

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
    private layerService: LayerService,
    private toastController: ToastController,
    private userService: UserService,
    private reportQuestionService: ReportQuestionService,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("wtrReport") wtrReport: WtrReport;

  public form: FormGroup;

  private isInit: boolean = false;

  public userHasPermissionCreateNewFormField: boolean = false;
  public userHasPermissionCustomizeFormField: boolean = false;

  RqnTypeEnum = RqnTypeEnum;

  LIST_RQN_TYPE = LIST_RQN_TYPE;
  getComponentTypeLabel = (componentType: ValueLabel) => {
    return componentType.label;
  }

  listReportQuestion: ReportQuestionDto[];
  getReportQuestionLabel = (reportQuestion: ReportQuestionDto) => {
    return reportQuestion.rqnLlabel;
  }
  mapReportQuestionByRqnCode = {};

  async ngOnInit() {
    // ### Form ### //
    this.form = new FormGroup({
      lines: new FormArray([]),
    });

    // ### Permissions ### //
    this.userHasPermissionCreateNewFormField =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_NEW_FORM_FIELDS);
    this.userHasPermissionCustomizeFormField =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CUSTOMIZE_FORM_FIELDS);

    // ### Referential data ### //
    this.listReportQuestion = await firstValueFrom(this.reportQuestionService.getListReportQuestion());
    this.mapReportQuestionByRqnCode = {};
    this.listReportQuestion.forEach((reportQuestion) => {
      this.mapReportQuestionByRqnCode[reportQuestion.rqnCode] = {
        ...reportQuestion,
        listSelectValue: reportQuestion.rqnSelectValues != null ? JSON.parse(reportQuestion.rqnSelectValues) : [],
      }
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

    // For optimization - Set this flag to true to prevent the calculation of the list of available question
    // while doing this init of th form
    this.isInit = true;

    //const parentDefinition = definitions.find((definition) => definition.type === 'section');
    const listDefinition = definitions.filter((definition) => definition.type === 'property');
    for (const [index, definition] of listDefinition.entries()) {
      this.addLine();
      const lineForm = this.lines.at(index);

      lineForm.patchValue({
        rqnCode: definition.rqnCode,
        isRequired: definition.rules.some((rule) => rule.key === 'required'),
        questionCondition: definition.displayCondition?.key != null ? definition.displayCondition.key.substring(PREFIX_KEY_DEFINITION.length) : null,
        listQuestionConditionValues: definition.displayCondition?.value ?? [],
      });
    }

    // Disable form if user hasn't right to customize
    if (!this.userHasPermissionCustomizeFormField) {
      this.form.disable();
    }

    setTimeout(() => {
      this.isInit = false;
    })
  }

  /*
   * Handle lines
   */
  // ### ADD ### //
  addLine() {
    const lineForm = new FormGroup({
      rqnCode: new FormControl<string>(null, Validators.required),
      label: new FormControl<string>(null),
      component: new FormControl<string>({value: null, disabled: true}),
      isRequired: new FormControl<boolean>(false, Validators.required),
      listValue: new FormControl<string[]>([]),
      questionCondition: new FormControl<string>(null),
      listAvailableQuestionValues: new FormControl<ValueLabel[]>([]),
      listQuestionConditionValues: new FormControl<string[]>([]),
    });

    // When changing the question
    lineForm.get('rqnCode').valueChanges.subscribe((rqnCode) => {
      if (rqnCode != null) {
        // Get the report question
        const reportQuestion = this.mapReportQuestionByRqnCode[rqnCode];
        
        if (reportQuestion) {
          // Set the label
          lineForm.get('label').setValue(reportQuestion.rqnLlabel);

          // Set the component
          lineForm.get('component').setValue(reportQuestion.rqnType);

          // Set the requirement
          lineForm.get('isRequired').setValue(reportQuestion.rqnRequired);

          // Set the list of value
          lineForm.get('listValue').setValue(reportQuestion.listSelectValue);

          // If it is COMMENT, check if another line of type COMMENT already exist
          if (reportQuestion.rqnType === RqnTypeEnum.COMMENT) {
            for (let i = 0; i < this.lines.length; i++) {
              const lineFormToCheck = this.lines.at(i);
              if (lineFormToCheck.get('component').value === RqnTypeEnum.COMMENT && lineForm !== lineFormToCheck) {
                lineForm.get('rqnCode').setValue(null);
              }
            }
          }
        }
      } else {
        lineForm.get('label').setValue(null);
        lineForm.get('component').setValue(null);
        lineForm.get('isRequired').setValue(false);
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

        const indexQuestionCondition = Number(questionCondition) - 1;
        if (indexQuestionCondition < this.lines.length) {
          const questionConditionLineForm = this.lines.at(indexQuestionCondition);
          if (questionConditionLineForm) {
            lineForm.get('listAvailableQuestionValues').setValue(
              questionConditionLineForm.get('listValue').value.map((value, index) => {
                return {
                  value: value,
                  label: (index+1) + ' - ' + value,
                }
              })
            );
          }
        }
      } else {
        lineForm.get('listQuestionConditionValues').removeValidators(Validators.required);
      }
    });

    this.lines.push(lineForm);
  }

  // ### DELETE ### //
  deleteLine(lineIndex: number) {
    // The index of the next lines will change so if other line has condition on them
    // The condition will not work anymore
    // Example :
    // Line 1                         --> Line 1
    // Line 2                         --> Deleted
    // Line 3 condition on line 2     --> Line 2 with no condition
    // Line 4 condition on line 3     --> Line 3 with condition on line 2
    // If the line 2 is delete, we have to :
    // - Empty the condition of line 3
    // - Change the index of the condition of line 4 to set 2 instead of 3

    // Check if all the next lines
    for (let i = lineIndex; i < this.lines.length; i++) {
      const lineFormToCheck = this.lines.at(i);

      // If there is a condition
      const questionCondition = lineFormToCheck.get('questionCondition').value;
      if (questionCondition != null) {
        // If the condition is on the line that is about to be deleted
        if (questionCondition === (lineIndex+1).toString()) {
          // Delete the condition and condition values
          lineFormToCheck.get('questionCondition').setValue(null);
        } else {
          // Else change the index to be -1
          // EmitEvent = false to not empty the list of values
          lineFormToCheck.get('questionCondition').setValue((Number(questionCondition) - 1).toString(), {emitEvent: false});
        }
      }
    }

    // Delete the line
    this.lines.removeAt(lineIndex);
  }

  // ### ORDER ### //
  lineDown(lineIndex: number) {
    // Check if there is a line with condition on this line
    for (let i = lineIndex; i < this.lines.length; i++) {
      const lineFormToCheck = this.lines.at(i);

      // If there is a condition
      const questionCondition = lineFormToCheck.get('questionCondition').value;
      if (questionCondition != null) {
        // If the condition is on the line that is moving down the list
        if (questionCondition === (lineIndex+1).toString()) {
          // Change the index
          // EmitEvent = false to not empty the list of values
          lineFormToCheck.get('questionCondition').setValue((Number(questionCondition) - 1).toString(), {emitEvent: false});
        }

        // If the condition is on the line that is moving up the list (by changing its place with the line moving down)
        if (questionCondition === ((lineIndex+1) - 1).toString()) {
          // If its the line moving down
          if (i === lineIndex) {
            // Delete the condition
            lineFormToCheck.get('questionCondition').setValue(null);
          } else {
            // Else, change the index
            // EmitEvent = false to not empty the list of values
            lineFormToCheck.get('questionCondition').setValue((Number(questionCondition) + 1).toString(), {emitEvent: false});
          }
        }
      }
    }

    // Invert both lines
    const listLine = this.lines.getRawValue();
    const lineAtLineIndex = listLine[lineIndex];
    const lineAtLineIndexMinusOne = listLine[lineIndex - 1];
    listLine[lineIndex] = lineAtLineIndexMinusOne;
    listLine[lineIndex - 1] = lineAtLineIndex;
    
    // EmitEvent = false because otherwise valueChanged is activated and we don't want that
    this.lines.setValue(listLine, {emitEvent: false});
  }

  lineUp(lineIndex: number) {
    // Check if there is a line with condition on this line
    for (let i = lineIndex; i < this.lines.length; i++) {
      const lineFormToCheck = this.lines.at(i);

      // If there is a condition
      const questionCondition = lineFormToCheck.get('questionCondition').value;
      if (questionCondition != null) {
        // If the condition is on the line that is moving up the list
        if (questionCondition === (lineIndex+1).toString()) {
          // If its the line moving down
          if (i === (lineIndex+1)) {
            // Delete the condition
            lineFormToCheck.get('questionCondition').setValue(null);
          } else {
            // Change the index
            // EmitEvent = false to not empty the list of values
            lineFormToCheck.get('questionCondition').setValue((Number(questionCondition) + 1).toString(), {emitEvent: false});
          }
        }

        // If the condition is on the line that is moving down the list (by changing its place with the line moving up)
        if (questionCondition === ((lineIndex+1) + 1).toString()) {
          // Else, change the index
          // EmitEvent = false to not empty the list of values
          lineFormToCheck.get('questionCondition').setValue((Number(questionCondition) - 1).toString(), {emitEvent: false});
        }
      }
    }

    // Invert both lines
    const listLine = this.lines.getRawValue();
    const lineAtLineIndex = listLine[lineIndex];
    const lineAtLineIndexPlusOne = listLine[lineIndex + 1];
    listLine[lineIndex] = lineAtLineIndexPlusOne;
    listLine[lineIndex + 1] = lineAtLineIndex;

    // EmitEvent = false because otherwise valueChanged is activated and we don't want that
    this.lines.setValue(listLine, {emitEvent: false});
  }

  /**
   * Get the list of available questions for this line, for the condition
   *
   * @param lineIndex index of the line
   * @returns The list of questions
   */
  getListAvailableQuestion(lineIndex: number): ValueLabel[] {
    if (this.isInit) return [];

    // Display only questions before the index and questions that are a list of values
    const listAvailableQuestion = [];
    for (let i = 0; i < lineIndex; i++) {
      const lineForm = this.lines.at(i);
      if ([RqnTypeEnum.SELECT, RqnTypeEnum.SELECT_MULTIPLE].includes(lineForm.get('component').value)) {
        listAvailableQuestion.push({
          value: (i+1).toString(),
          label: (i+1) + ' - ' + lineForm.get('label').value,
        });
      }
    }

    return listAvailableQuestion;
  }

  /**
   * Duplication another report into this one
   */
  async duplicateFromReport() {
    // Select the type-motif from which to duplicate
    // Only display the ones with report
    this.layerService.getAllVLayerWtr().subscribe((listAssetTypeWtr) => {
      this.templateService.getFormsTemplate().subscribe( async (listFormTemplateReport) => {
        let listAssetTypeWtrWithReport: ValueLabel[] = listAssetTypeWtr
          .filter((assetTypeWtr) => {
            return listFormTemplateReport.some((formTemplateReport) => formTemplateReport.formCode === 'REPORT_' + assetTypeWtr.astCode + '_' + assetTypeWtr.wtrCode);
          })
          .sort((a, b) => {
            if (a.astCode === b.astCode) return a.wtrCode.localeCompare(b.wtrCode);
            return a.astCode.localeCompare(b.astCode);
          })
          .map((assetTypeWtr) => {
            // For each wtr, get the form, if it exists
            const formTemplateReport = listFormTemplateReport.find((formTemplateReport) => formTemplateReport.formCode === 'REPORT_' + assetTypeWtr.astCode + '_' + assetTypeWtr.wtrCode);

            return {
              value: formTemplateReport.formCode,
              label: assetTypeWtr.astCode + ' - ' + assetTypeWtr.astSlabel + ' - ' + assetTypeWtr.wtrCode + ' - ' + assetTypeWtr.wtrSlabel,
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
      });
    });
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
      key: 'FORM_' + this.wtrReport.astCode + '_' + this.wtrReport.wtrCode,
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
        rqnCode: lineForm.get('rqnCode').value,
      }

      const component = lineForm.get('component').value;
      const listValue = lineForm.get('listValue').value;

      fillDefinitionComponentFromRqnType(definition, component, listValue);

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
    this.form.updateValueAndValidity();

    if (!this.form.valid) return;

    const reportForm = this.getReportFormFromForm();

    // Form template update
    const formTemplate: FormTemplateUpdate = {
      fteId: this.wtrReport.fteId,
      fteCode: 'REPORT_' + this.wtrReport.astCode + '_' + this.wtrReport.wtrCode,
      fdnId: this.wtrReport.fdnId,
      fdnCode: 'DEFAULT_REPORT_' + this.wtrReport.astCode + '_' + this.wtrReport.wtrCode,
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
