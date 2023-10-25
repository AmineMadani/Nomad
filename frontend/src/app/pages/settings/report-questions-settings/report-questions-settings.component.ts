import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LIST_RQN_TYPE, ReportQuestionDto, RqnTypeEnum } from 'src/app/core/models/reportQuestion.model';
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { ReportQuestionService } from 'src/app/core/services/reportQuestion.service';
import { TableService } from 'src/app/core/services/table.service';
import { ReportQuestionEditComponent } from './report-question-edit/report-question-edit.component';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { Form, FormDefinition, PREFIX_KEY_DEFINITION } from 'src/app/shared/form-editor/models/form.model';
import { FormTemplate, FormTemplateUpdate } from 'src/app/core/models/template.model';
import { DeleteReportQuestionConfirmationComponent } from './delete-report-question-confirmation/delete-report-question-confirmation.component';

interface ReportQuestion extends ReportQuestionDto {
  rqnTypeTranslate: string;
  rqnSelectValuesTranslate: string;
  rqnRequiredTranslate: string;
  numberTimeUsedInReport: number
  numberTimeUsedInReportCondition: number;
}

@Component({
  selector: 'app-report-questions-settings',
  templateUrl: './report-questions-settings.component.html',
  styleUrls: ['./report-questions-settings.component.scss'],
})
export class ReportQuestionsSettingsComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private tableService: TableService,
    private reportQuestionService: ReportQuestionService,
    private userService: UserService,
    private templateService: TemplateService,
  ) { }

  public isLoading: boolean = false;

  private userHasPermissionCustomizeFormField: boolean = false;

  private listFormTemplateReport: FormTemplate[] = [];

  public listReportQuestion: TableRow<ReportQuestion>[] = [];
  public selectedReportQuestionRows: TableRow<ReportQuestion>[] = [];

  public toolbar: TableToolbar = {
    title: 'Liste des questions',
    buttons: [
      {
        name: 'trash',
        tooltip: 'Supprimer',
        onClick: () => {
          this.deleteListReportQuestion();
        },
        disableFunction: () => {
          return this.selectedReportQuestionRows.length === 0 || !this.userHasPermissionCustomizeFormField;
        }
      },
      {
        name: 'add',
        tooltip: 'Créer',
        onClick: () => {
          this.openReportQuestionDetails(null);
        },
        disableFunction: () => {
          return !this.userHasPermissionCustomizeFormField;
        }
      }
    ],
  };

  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.CHECKBOX,
    },
    {
      type: TypeColumn.ACTION,
      label: '',
      onClick: (reportQuestion: TableRow<ReportQuestionDto>) => {
        this.openReportQuestionDetails(reportQuestion.getRawValue());
      }
    },
    {
      key: 'rqnCode',
      label: 'Code',
      type: TypeColumn.TEXT,
    },
    {
      key: 'rqnLlabel',
      label: 'Libellé',
      type: TypeColumn.TEXT
    },
    {
      key: 'rqnTypeTranslate',
      label: 'Type',
      type: TypeColumn.TEXT,
      filter: {
        type: 'select',
        isSelectAllRow: true,
      }
    },
    {
      key: 'rqnSelectValuesTranslate',
      label: 'Liste de valeur',
      type: TypeColumn.TEXT,
    },
    {
      key: 'rqnRequiredTranslate',
      label: 'Requis ?',
      type: TypeColumn.TEXT,
      filter: {
        type: 'select',
        isSelectAllRow: true,
      }
    },
    {
      key: 'numberTimeUsedInReport',
      label: 'Nombre de formulaire où la question est utilisée',
      type: TypeColumn.TEXT,
      filter: {
        type: 'number',
      }
    },
    {
      key: 'numberTimeUsedInReportCondition',
      label: 'Nombre de formulaire avec dépendance à cette question',
      type: TypeColumn.TEXT,
      filter: {
        type: 'number',
      }
    },
  ];

  listColumnSort: ColumnSort[] = [
    {
      key: 'rqnLlabel', direction: 'asc'
    }
  ];

  async ngOnInit() {
    // ### Permissions ### //
    this.userHasPermissionCustomizeFormField =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CUSTOMIZE_FORM_FIELDS);

    // ### DATA ### //
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;

    // Report form
    const listFormTemplate = await this.templateService.getFormsTemplate(true);
    this.listFormTemplateReport = listFormTemplate.filter((formTemplate) => formTemplate.formCode.startsWith('REPORT_'));

    // Set a map of number of times a question is used
    // Directly
    const mapNumberTimeUsedInReportByRqnCode = {};
    // As condition
    const mapNumberTimeUsedInReportAsConditionByRqnCode = {};
    for (const formTemplate of this.listFormTemplateReport) {
      const form: Form = JSON.parse(formTemplate.definition);

      const listRqnCode = [];
      const listRqnCodeCondition = [];
      for (const definition of form.definitions) {
        if (!listRqnCode.includes(definition.rqnCode)) {
          listRqnCode.push(definition.rqnCode);
        }

        if (definition.displayCondition) {
          const conditionDefinition = form.definitions.find((d) => d.key === definition.displayCondition.key);
          if (!listRqnCodeCondition.includes(conditionDefinition.rqnCode)) {
            listRqnCodeCondition.push(conditionDefinition.rqnCode);
          }
        }
      }

      for (let rqnCode of listRqnCode) {
        if (mapNumberTimeUsedInReportByRqnCode[rqnCode] == null)
          mapNumberTimeUsedInReportByRqnCode[rqnCode] = 0;
        mapNumberTimeUsedInReportByRqnCode[rqnCode]++;
      }

      for (let rqnCode of listRqnCodeCondition) {
        if (mapNumberTimeUsedInReportAsConditionByRqnCode[rqnCode] == null)
          mapNumberTimeUsedInReportAsConditionByRqnCode[rqnCode] = 0;
        mapNumberTimeUsedInReportAsConditionByRqnCode[rqnCode]++;
      }
    }

    // Report question
    let listReportQuestionDto = await this.reportQuestionService.getListReportQuestion();
    const listReportQuestion = listReportQuestionDto.map((reportQuestion) => {
      let rqnSelectValuesTranlate = '-';
      if (reportQuestion.rqnSelectValues != null) {
        const listValue: string[] = JSON.parse(reportQuestion.rqnSelectValues);
        rqnSelectValuesTranlate = listValue.join(', ');
      }

      return {
        ...reportQuestion,
        rqnTypeTranslate: LIST_RQN_TYPE.find((rqnType) => rqnType.value === reportQuestion.rqnType)?.label,
        rqnSelectValuesTranslate: rqnSelectValuesTranlate,
        rqnRequiredTranslate: reportQuestion.rqnRequired === true ? 'Oui' : 'Non',
        numberTimeUsedInReport: mapNumberTimeUsedInReportByRqnCode[reportQuestion.rqnCode] ?? 0,
        numberTimeUsedInReportCondition: mapNumberTimeUsedInReportAsConditionByRqnCode[reportQuestion.rqnCode] ?? 0,
      };
    });
    this.listReportQuestion = this.tableService.createReadOnlyRowsFromObjects(listReportQuestion);

    this.isLoading = false;
  }

  private async openReportQuestionDetails(reportQuestion: ReportQuestionDto): Promise<void> {
    const modal = await this.modalController.create({
      component: ReportQuestionEditComponent,
      componentProps: {
        id: reportQuestion?.id,
      },
      backdropDismiss: false,
      cssClass: 'big-modal',
    });

    modal.onDidDismiss().then(async (result) => {
      const reloadNeeded: boolean = result['data'];
      // If some data changed
      if (reloadNeeded) {
        this.loadData();
      }
    });

    await modal.present();
  }

  async deleteListReportQuestion() {
    const listReportQuestionToDelete = this.selectedReportQuestionRows.map((row) => row.getRawValue());

    const modal = await this.modalController.create({
      component: DeleteReportQuestionConfirmationComponent,
      componentProps: {
        listReportQuestion: listReportQuestionToDelete,
        isUsedAsCondition: listReportQuestionToDelete.some((reportQuestion) => reportQuestion.numberTimeUsedInReportCondition > 0),
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then(async (result) => {
      const accepted: boolean = result['data'];
      // If the user says yes
      if (accepted) {
        // Check if the selected report questions are used in a form as a condition
        const listRqnCode = listReportQuestionToDelete.map((reportQuestion) => reportQuestion.rqnCode);
        const isUsedAsCondition = this.listFormTemplateReport.some((formTemplate) => {
          const form: Form = JSON.parse(formTemplate.definition);
          return form.definitions.some((definition) => {
            if (definition.displayCondition != null) {
              const conditionDefinition = form.definitions.find((d) => d.key === definition.displayCondition.key);
              return listRqnCode.includes(conditionDefinition.rqnCode);
            }
            return false;
          });
        });

        // Delete the report questions
        const listIdToDelete = listReportQuestionToDelete.map((reportQuestion) => reportQuestion.id);
        this.reportQuestionService.deleteListReportQuestion(listIdToDelete).then(() => {
          // Update all report form using those questions
          const listRqnCode = listReportQuestionToDelete.map((reportQuestion) => reportQuestion.rqnCode);

          this.listFormTemplateReport.forEach((formTemplate) => {
            const form: Form = JSON.parse(formTemplate.definition);
            const listNewDefinition: FormDefinition[] = [];
            const listDeletedDefinitionKey: string[] = [];
            for(const definition of form.definitions) {
              // If this definition is not linked to this report question
              if (!listRqnCode.includes(definition.rqnCode)) {
                // Keep it
                listNewDefinition.push(definition);

                // If the condition is linked to a deleted definition
                if (definition.displayCondition != null && listDeletedDefinitionKey.includes(definition.displayCondition.key)) {
                  // Then delete the condition
                  definition.displayCondition = undefined;
                }
              } else {
                // If the definition is linked, don't add it
                listDeletedDefinitionKey.push(definition.key);
              }
            }

            // If there is changes
            if (listDeletedDefinitionKey.length > 0) {
              // Renumber all definitions
              for(const [index, definition] of listNewDefinition.filter((d) => d.type === 'property').entries()) {
                if (definition.component === RqnTypeEnum.COMMENT) continue;

                const oldKey = definition.key;
                definition.key = PREFIX_KEY_DEFINITION + (index+1);

                // And the condition definitions linked to this definition
                const listConditionDefinition = listNewDefinition.filter((d) => d.displayCondition?.key === oldKey);
                listConditionDefinition.forEach((conditionDefinition) => conditionDefinition.displayCondition.key = definition.key);
              }

              form.definitions = listNewDefinition;

              // Form template update
              const formTemplateUpdate: FormTemplateUpdate = {
                fteId: formTemplate.fteId,
                fteCode: formTemplate.formCode,
                fdnId: formTemplate.fdnId,
                fdnCode: formTemplate.fdnCode,
                fdnDefinition: JSON.stringify(form),
              }

              this.templateService.updateFormTemplate(formTemplateUpdate);
            }
          });

          this.loadData();
        });
      }
    });

    await modal.present();
  }
}
