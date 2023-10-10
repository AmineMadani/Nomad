import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LIST_RQN_TYPE, ReportQuestionDto } from 'src/app/core/models/reportQuestion.model';
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { ReportQuestionService } from 'src/app/core/services/reportQuestion.service';
import { firstValueFrom } from 'rxjs';
import { TableService } from 'src/app/core/services/table.service';
import { ReportQuestionEditComponent } from './report-question-edit/report-question-edit.component';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { Form } from 'src/app/shared/form-editor/models/form.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { FormTemplate } from 'src/app/core/models/template.model';

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
    private utilsService: UtilsService,
  ) { }

  public isLoading: boolean = false;

  private userHasPermissionCustomizeFormField: boolean = false;

  private listFormTemplateReport: FormTemplate[] = [];

  public listReportQuestion: TableRow<ReportQuestionDto>[] = [];
  public selectedReportQuestionRows: TableRow<ReportQuestionDto>[] = [];

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
      key: 'rqnSlabel',
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
    const listFormTemplate = await firstValueFrom(this.templateService.getFormsTemplate(true));
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
    let listReportQuestion = await firstValueFrom(this.reportQuestionService.getListReportQuestion());
    listReportQuestion = listReportQuestion.map((reportQuestion) => {
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
    // Check if the selected report questions are used in a form
    const listRqnCode = this.selectedReportQuestionRows.map((row) => row.getRawValue().rqnCode);
    const listFormTemplateUsingQuestion = this.listFormTemplateReport.filter((formTemplate) => {
      const form: Form = JSON.parse(formTemplate.definition);
      return form.definitions.some((definition) => listRqnCode.includes(definition.rqnCode));
    });

    if (listFormTemplateUsingQuestion.length > 0) {
      let message = "Cette question est utilisée dans le(s) formulaire(s) de compte-rendu : ";
      if (listRqnCode.length > 1)
        message = "Ces questions sont utilisées dans le(s) formulaire(s) de compte-rendu : ";
      message += listFormTemplateUsingQuestion.map((formTemplate) => formTemplate.formCode.substring('REPORT_'.length).replace('_', ' - ')).join(', ');
      this.utilsService.showErrorMessage(message, 5000);
      return;
    }

    const listIdToDelete = this.selectedReportQuestionRows.map((row) => row.getRawValue().id);
    this.reportQuestionService.deleteListReportQuestion(listIdToDelete).subscribe(() => {
      this.loadData();
    });
  }
}
