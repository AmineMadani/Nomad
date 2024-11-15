import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
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
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { TableService } from 'src/app/core/services/table.service';

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
    private tableService: TableService,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("wtrReport") wtrReport: WtrReport;

  public form: FormGroup;
  public isMobile: boolean;

  private isInit: boolean = false;

  public isConsultation: boolean = true;

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

  // ## Optional question ## //
  listAvailableOptionalQuestion: ReportQuestionDto[];

  public listOptionalQuestionRows: TableRow<ReportQuestionDto>[] = [];
  public listSelectedOptionalQuestionRows: TableRow<ReportQuestionDto>[] = [];
  public toolbar: TableToolbar = {
    title: 'Liste des questions paramétrables',
    buttons: [
      {
        name: 'trash',
        tooltip: 'Supprimer',
        onClick: () => {
          this.deleteOptionalQuestions();
        },
        disableFunction: () => {
          return this.listSelectedOptionalQuestionRows.length === 0 || this.isConsultation;
        }
      },
    ],
  };

  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.CHECKBOX,
    },
    {
      key: 'rqnLlabel',
      label: 'Libellé',
      type: TypeColumn.TEXT
    },
    {
      key: 'listSelectValueText',
      label: 'Liste des valeurs',
      type: TypeColumn.TEXT,
    },
  ];

  listColumnSort: ColumnSort[] = [
    {
      key: 'rqnLlabel', direction: 'asc'
    }
  ];

  async ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
    // ### Form ### //
    this.form = new FormGroup({
      lines: new FormArray([]),
      optionalReportQuestionId: new FormControl(),
    });

    // ### Permissions ### //
    this.isConsultation = !await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_NEW_FORM_FIELDS);

    // ### Referential data ### //
    this.listReportQuestion = await this.reportQuestionService.getListReportQuestion();
    this.mapReportQuestionByRqnCode = {};
    this.listReportQuestion.forEach((reportQuestion) => {
      this.mapReportQuestionByRqnCode[reportQuestion.rqnCode] = {
        ...reportQuestion,
        listSelectValue: reportQuestion.rqnSelectValues != null ? JSON.parse(reportQuestion.rqnSelectValues) : [],
      };

      (reportQuestion as any).listSelectValueText = reportQuestion.rqnSelectValues != null ? JSON.parse(reportQuestion.rqnSelectValues).join(', ') : null;
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

    const listDefinition = definitions.filter((definition) => definition.type === 'property' && definition.isOptional !== true);
    for (const [index, definition] of listDefinition.entries()) {
      this.addLine();
      const lineForm = this.lines.at(index);

      lineForm.patchValue({
        rqnCode: definition.rqnCode,
        isRequired: definition.rules.some((rule) => rule.key === 'required'),
        canBeDeleted: definition.canBeDeleted != null ? definition.canBeDeleted : false,
        questionCondition: definition.displayCondition?.key != null ? definition.displayCondition.key.substring(PREFIX_KEY_DEFINITION.length) : null,
        listQuestionConditionValues: definition.displayCondition?.value ?? [],
      });
    }

    // ### Optional questions ### //
    const listOptionalQuestionCode = definitions.filter((definition) => definition.type === 'property' && definition.isOptional === true).map((definition) => definition.rqnCode);
    const listOptionalQuestion = this.listReportQuestion.filter((reportQuestion) => listOptionalQuestionCode.includes(reportQuestion.rqnCode));
    this.listOptionalQuestionRows = this.tableService.createReadOnlyRowsFromObjects(listOptionalQuestion);

    // Calculate the list of available question that can be added as optional
    this.calculateListAvailableOptionalQuestion();


    // Disable form if user doesn't have the right
    if (this.isConsultation) {
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
      canBeDeleted: new FormControl<boolean>(false, Validators.required),
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

          if (!this.isInit) {
            // If there is a question with a condition on this one
            const lineIndex = this.lines.controls.indexOf(lineForm);
            for (let i = lineIndex; i < this.lines.length; i++) {
              const lineFormToCheck = this.lines.at(i);

              // If there is a condition
              const questionCondition = lineFormToCheck.get('questionCondition').value;
              if (questionCondition != null) {
                // If the condition is on this line
                if (questionCondition === (lineIndex+1).toString()) {
                  // Delete the condition and condition values
                  lineFormToCheck.get('questionCondition').setValue(null);
                }
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

      if (!this.isInit) {
        // Calculate the list of available question that can be added as optional
        this.calculateListAvailableOptionalQuestion();
      }
    });

    // When changing the question condition
    lineForm.get('questionCondition').valueChanges.subscribe((questionCondition) => {
      if (!this.isInit) {
        // Empty the list of selected values for the condition
        lineForm.get('listQuestionConditionValues').setValue([]);
      }

      // If there is a question condition, question condition values has to be set
      if (questionCondition != null) {
        lineForm.get('listQuestionConditionValues').addValidators(this.noEmptyList);

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
        lineForm.get('listQuestionConditionValues').removeValidators(this.noEmptyList);
      }
      lineForm.get('listQuestionConditionValues').updateValueAndValidity();
    });

    this.lines.push(lineForm);
  }

  noEmptyList(formControl: FormControl) {
    return formControl.value && formControl.value.length ? null : {
      noEmptyList: {
        valid: false
      }
    };
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

    // Calculate the list of available question that can be added as optional
    this.calculateListAvailableOptionalQuestion();
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
    const line = this.lines.at(lineIndex);
    this.lines.removeAt(lineIndex);
    this.lines.insert(lineIndex - 1, line);

    // Scroll to the question
    const elementList = document.querySelectorAll('.line');
    const element = elementList[lineIndex - 1] as HTMLElement;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
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
    const line = this.lines.at(lineIndex);
    this.lines.removeAt(lineIndex);
    this.lines.insert(lineIndex + 1, line);

    // Scroll to the question
    const elementList = document.querySelectorAll('.line');
    const element = elementList[lineIndex + 1] as HTMLElement;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
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

  removeCondition(lineIndex: number): void {
    const lineForm = this.lines.at(lineIndex);
    lineForm.get('questionCondition').setValue(null);
  }

  // ### Optional questions ### //
  calculateListAvailableOptionalQuestion() {
    const listUsedQuestionCode = this.lines.getRawValue().map((line) => line['rqnCode']);
    const listAlreadyOptionalQuestionCode = this.listOptionalQuestionRows.map((optionalQuestionRow) => optionalQuestionRow.getRawValue().rqnCode);

    this.listAvailableOptionalQuestion = this.listReportQuestion.filter((reportQuestion) => {
      return !listUsedQuestionCode.includes(reportQuestion.rqnCode) 
        && !listAlreadyOptionalQuestionCode.includes(reportQuestion.rqnCode);
    });
  }

  addOptionalQuestion() {
    // Get the id to id
    const id = this.form.get('optionalReportQuestionId').value;

    const reportQuestion = this.listAvailableOptionalQuestion.find((reportQuestion) => reportQuestion.id === id);

    // Add the question to the table
    const listReportQuestionRow = this.tableService.createReadOnlyRowsFromObjects([reportQuestion]);
    this.listOptionalQuestionRows = this.listOptionalQuestionRows.concat(listReportQuestionRow);

    // Remove it from the list of available question to be added
    this.listAvailableOptionalQuestion = this.listAvailableOptionalQuestion.filter((reportQuestion) => reportQuestion.id !== id);
  
    // Unselect the question from the list of available question
    this.form.get('optionalReportQuestionId').setValue(null);
  }

  deleteOptionalQuestions() {
    // Get the ids to delete
    const listIdToDelete = this.listSelectedOptionalQuestionRows.map((optionalQuestion) => optionalQuestion.getRawValue().id);
          
    // Delete the questions from the table
    this.listOptionalQuestionRows = this.listOptionalQuestionRows.filter((optionalQuestion) => {
      return !listIdToDelete.includes(optionalQuestion.getRawValue().id);
    });

    // Add them to the list of available question to be added
    this.listAvailableOptionalQuestion = this.listAvailableOptionalQuestion.concat(
      this.listReportQuestion.filter((reportQuestion) => listIdToDelete.includes(reportQuestion.id))
    ).sort((a, b) => this.getReportQuestionLabel(a).localeCompare(this.getReportQuestionLabel(b)));
  }

  /**
   * Duplication another report into this one
   */
  async duplicateFromReport() {
    // Select the type-motif from which to duplicate
    // Only display the ones with report
    this.layerService.getAllVLayerWtr().then((listAssetTypeWtr) => {
      this.templateService.getFormsTemplate().then( async (listFormTemplateReport) => {
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
        canBeDeleted: lineForm.get('canBeDeleted').value
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

    // Optional questions
    for (const optionalQuestionRow of this.listOptionalQuestionRows) {
      const definition: FormDefinition = {
        key: 'optional',
        type: 'property',
        label: '',
        component: '',
        editable: true,
        attributes: {},
        rules: [],
        section: startDefinition.key,
        rqnCode: optionalQuestionRow.getRawValue().rqnCode,
        isOptional: true,
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
      this.templateService.createFormTemplate(formTemplate).then((res: any) => {
        this.modalController.dismiss(true);
      });
    } else {
      this.templateService.updateFormTemplate(formTemplate).then((res: any) => {
        this.modalController.dismiss(true);
      });
    }
  }

  close() {
    this.modalController.dismiss(false);
  }
}
