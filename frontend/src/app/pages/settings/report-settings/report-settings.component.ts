import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { FormTemplate } from 'src/app/core/models/template.model';
import { TemplateService } from 'src/app/core/services/template.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { ReportEditComponent } from './report-edit/report-edit.component';
import { ModalController } from '@ionic/angular';
import { TableService } from 'src/app/core/services/table.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { VLayerWtr, getAssetTypeLabel } from 'src/app/core/models/layer.model';
import { Form, FormPropertiesEnum, PREFIX_KEY_DEFINITION } from 'src/app/shared/form-editor/models/form.model';
import { RqnTypeEnum } from 'src/app/core/models/reportQuestion.model';
import { ReportQuestionService } from 'src/app/core/services/reportQuestion.service';

export interface WtrReport extends VLayerWtr {
  fteId: number;
  formCode: string;
  fdnId: number;
  definition: string;
  hasForm: string;
}

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.scss'],
})
export class ReportSettingsPage implements OnInit {

  constructor(
    private layerService: LayerService,
    private utils: UtilsService,
    private templateService: TemplateService,
    private modalController: ModalController,
    private tableService: TableService,
    private reportQuestionService: ReportQuestionService,
  ) { }

  public form: FormGroup;

  private listAssetTypeWtr: VLayerWtr[] = [];
  public listAssetType: VLayerWtr[] = [];
  getAssetTypeLabel = getAssetTypeLabel;

  private listFormTemplateReport: FormTemplate[] = [];

  public listWtrReportRows: TableRow<WtrReport>[] = [];

  public toolbar: TableToolbar = {
    title: 'Liste des formulaires par motif',
    buttons: [],
  };

  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.ACTION,
      label: '',
      onClick: (wtrReport: TableRow<WtrReport>) => {
        this.openReportFormDetails(wtrReport.getRawValue());
      }
    },
    {
      key: 'wtrCode',
      label: 'Code',
      type: TypeColumn.TEXT,
    },
    {
      key: 'wtrLlabel',
      label: 'Libellé',
      type: TypeColumn.TEXT
    },
    {
      key: 'hasForm',
      label: 'Formulaire ?',
      type: TypeColumn.TEXT,
      filter: {
        type: 'select',
        isSelectAllRow: true,
      }
    },
  ];

  listColumnSort: ColumnSort[] = [
    {
      key: 'wtrCode', direction: 'asc'
    }
  ];

  async ngOnInit() {
    this.form = new FormGroup({
      astId: new FormControl(null, Validators.required),
      wtrId: new FormControl(null, Validators.required),
    });

    // When changing asset type, display the corresponding wtr and form
    this.form.get('astId').valueChanges.subscribe((astId) => {
      // Get the corresponding wtr
      const listWtr: VLayerWtr[] = this.utils.removeDuplicatesFromArr(this.listAssetTypeWtr.filter((assetTypeWtr) => assetTypeWtr.astId === astId), 'wtrId');

      const listWtrReport = listWtr.map((wtr) => {
        // For each wtr, get the form, if it exists
        const formTemplateReport = this.listFormTemplateReport.find((formTemplateReport) => formTemplateReport.formCode === 'REPORT_' + wtr.astCode + '_' + wtr.wtrCode)

        return {
          ...wtr,
          fteId: formTemplateReport?.fteId,
          formCode: formTemplateReport?.formCode,
          fdnId: formTemplateReport?.fteId,
          definition: formTemplateReport?.definition,
          hasForm: formTemplateReport == null ? null : 'X',
        }
      });
      this.listWtrReportRows = this.tableService.createReadOnlyRowsFromObjects(listWtrReport);
    });

    this.layerService.getAllVLayerWtr().then((vLayerWtrList) => {
      this.listAssetTypeWtr = vLayerWtrList;
      this.listAssetType = this.utils.removeDuplicatesFromArr(this.listAssetTypeWtr, 'astId').sort((a, b) => {
        return a.astCode.localeCompare(b.astCode);
      });
    });

    this.templateService.getFormsTemplate(true).then((listFormTemplateReport) => {
      this.listFormTemplateReport = listFormTemplateReport.filter((formTemplate) => formTemplate.formCode.startsWith('REPORT_'));
    });
  }

  private async openReportFormDetails(wtrReport: WtrReport): Promise<void> {
    const modal = await this.modalController.create({
      component: ReportEditComponent,
      componentProps: {
        wtrReport: wtrReport,
      },
      backdropDismiss: false,
      cssClass: 'big-modal',
    });

    modal.onDidDismiss().then(async (result) => {
      const reloadNeeded: boolean = result['data'];
      // If some data changed
      if (reloadNeeded) {
        this.templateService.getFormsTemplate(true).then((listFormTemplateReport) => {
          this.listFormTemplateReport = listFormTemplateReport.filter((formTemplate) => formTemplate.formCode.startsWith('REPORT_'));
          this.form.get('astId').updateValueAndValidity();
        });
      }
    });

    await modal.present();
  }

  // ### HIDDEN ### //
  generateQuestions() {
    const listQuestion = [];

    for (let formTemplateReport of this.listFormTemplateReport) {
      const form: Form = JSON.parse(formTemplateReport.definition);
      const definitions = form.definitions;
      const listDefinition = definitions.filter((definition) => definition.type === 'property');
      for (const [index, definition] of listDefinition.entries()) {
        // Component
        let component = definition.component;
        if (definition.component === FormPropertiesEnum.INPUT) {
          if (definition.attributes?.type === 'number') {
            component = RqnTypeEnum.NUMBER;
          }
          if (definition.attributes?.type === 'text') {
            component = RqnTypeEnum.TEXT;
          }
        }
        if (definition.component === FormPropertiesEnum.SELECT) {
          if (definition.attributes?.multiple === true) {
            component = RqnTypeEnum.SELECT_MULTIPLE;
          } else {
            component = RqnTypeEnum.SELECT;
          }
        }

        listQuestion.push({
          component: component,
          label: definition.label,
          listValue: definition.attributes?.options != null ? definition.attributes.options.map((option) => option.value) : [],
          isRequired: definition.rules.some((rule) => rule.key === 'required'),
        });
      }
    }

    console.log(listQuestion.slice());

    const listQuestionDedoublon = listQuestion.filter((question1, index1) => {
      const index2 = listQuestion.findIndex((question2) => {
        return question1.component === question2.component
          && question1.label === question2.label
      });

      return index1 === index2;
    }).map((questionDedoublon) => {
      const listSameQuestion = listQuestion.filter((question) => {
        return question.component === questionDedoublon.component
          && question.label === questionDedoublon.label
      });

      const countRequired = listSameQuestion.filter((question) => question.isRequired === true);
      const countNotRequired = listSameQuestion.filter((question) => question.isRequired === false);
      questionDedoublon.isRequired = countRequired > countNotRequired;
      return questionDedoublon;
    });

    console.log(listQuestionDedoublon.sort((a, b) => {
      if (a.label !== b.label)
        return a.label.localeCompare(b.label);
      return a.component.localeCompare(b.component);
    }));

    const listInsertReportQuestion: string[] = [];
    let index = 1;
    for (let question of listQuestionDedoublon) {
      const rqnCode: string = `UUID-${index++}`;
      const rqnSlabel: string = question.label.replace(/'/g, '\'\'');
      const rqnLlabel: string = question.label.replace(/'/g, '\'\'');
      const rqnType: string = question.component;
      const rqnRequired: boolean = question.isRequired;
      const rqnSelectValues: string = question.listValue.length > 0 ? '\'' + JSON.stringify(question.listValue).replace(/'/g, '\'\'') + '\'' : null;

      question.uuid = rqnCode;

      listInsertReportQuestion.push(`('${rqnCode}', '${rqnSlabel}', '${rqnLlabel}', '${rqnType}', ${rqnRequired}, ${rqnSelectValues})`);
    }

    console.log(
      "INSERT INTO nomad.REPORT_QUESTION (RQN_CODE, RQN_SLABEL, RQN_LLABEL, RQN_TYPE, RQN_REQUIRED, RQN_SELECT_VALUES) values \n" +
      listInsertReportQuestion.join(',\n') + ';'
    );

    const listInsertFormDefinition = [];
    for (let formTemplateReport of this.listFormTemplateReport) {
      const form: Form = JSON.parse(formTemplateReport.definition);
      const definitions = form.definitions;
      for (const [index, definition] of definitions.entries()) {
        // Component
        let component = definition.component;
        if (definition.component === FormPropertiesEnum.INPUT) {
          if (definition.attributes?.type === 'number') {
            component = RqnTypeEnum.NUMBER;
          }
          if (definition.attributes?.type === 'text') {
            component = RqnTypeEnum.TEXT;
          }
        }
        if (definition.component === FormPropertiesEnum.SELECT) {
          if (definition.attributes?.multiple === true) {
            component = RqnTypeEnum.SELECT_MULTIPLE;
          } else {
            component = RqnTypeEnum.SELECT;
          }
        }

        if (definition.key !== 'questionPrincipal') {
          const reportQuestion = listQuestionDedoublon.find((question) => question.component === component && question.label === definition.label);
          definition.key = PREFIX_KEY_DEFINITION + (index);
          definition.rqnCode = reportQuestion.uuid;

          if (reportQuestion.component === RqnTypeEnum.COMMENT) {
            definition.key = 'COMMENT';
          }

          /*if (definition.displayCondition?.key != null) {
            const conditionDefinition = definitions[Number(definition.displayCondition.key.substring('UUID-'.length))];
            definition.displayCondition.key = conditionDefinition.key;
          }*/
        }
      }

      const fdnCode = 'DEFAULT_' + formTemplateReport.formCode;
      const fdnDefinition = JSON.stringify(form).replace(/'/g, '\'\'');
      listInsertFormDefinition.push(`('${fdnCode}', '${fdnDefinition}')`);
    }

    console.log(
      "INSERT INTO nomad.FORM_DEFINITION (FDN_CODE, FDN_DEFINITION) values \n" +
      listInsertFormDefinition.join(',\n') + ';'
    );
  }

  checkFormsCondition() {
    for (let formTemplateReport of this.listFormTemplateReport) {
      const form: Form = JSON.parse(formTemplateReport.definition);
      const definitions = form.definitions;
      const listDefinition = definitions.filter((definition) => definition.type === 'property');
      for (const [index, definition] of listDefinition.entries()) {
        if (definition.displayCondition != null) {
          const conditionDefinition = listDefinition.find((def) => def.key === definition.displayCondition.key);
          if (!conditionDefinition) {
            console.log("Definition non trouvée", formTemplateReport.formCode, definition.key, definition.displayCondition.key)
          } else {
            const listValue = conditionDefinition.attributes.options;
            if (listValue == null) {
              console.log("Value non trouvée", formTemplateReport.formCode, definition.key, definition.displayCondition.key, definition.displayCondition.value, listValue);
            } else {
              if (!definition.displayCondition.value.every((v) => listValue.some((vl) => vl.value === v))) {
                console.log("Value non trouvée", formTemplateReport.formCode, definition.key, definition.displayCondition.key, definition.displayCondition.value, listValue);
              }
            }
          }
        }
      }
    }
  }

  async generateSqlPlusFix() {
    // Replace the report question code that have cache id (ex: UUID-1697974646)
    // With a correct number
    const listInsertReportQuestion: string[] = [];
    let seqRqnCode = 242;
    let mapOldRqnCodeNewRqnCode = {};
    let listReportQuestion = await this.reportQuestionService.getListReportQuestion();
    listReportQuestion = listReportQuestion.sort((a, b) => a.id - b.id);
    for (const reportQuestion of listReportQuestion) {
      const rqnCodeNumber = Number(reportQuestion.rqnCode.substring('UUID-'.length));
      if (rqnCodeNumber > 300) {
        const oldRqnCode = reportQuestion.rqnCode;
        const newRqnCode = 'UUID-' + seqRqnCode++;
        mapOldRqnCodeNewRqnCode[oldRqnCode] = newRqnCode;
        reportQuestion.rqnCode = newRqnCode;
      }

      const rqnCode: string = reportQuestion.rqnCode;
      const rqnSlabel: string = reportQuestion.rqnSlabel.replace(/'/g, '\'\'');
      const rqnLlabel: string = reportQuestion.rqnLlabel.replace(/'/g, '\'\'');
      const rqnType: string = reportQuestion.rqnType;
      const rqnRequired: boolean = reportQuestion.rqnRequired;
      const rqnSelectValues: string = reportQuestion.rqnSelectValues != null ? '\'' + reportQuestion.rqnSelectValues.replace(/'/g, '\'\'') + '\'' : null;


      listInsertReportQuestion.push(`('${rqnCode}', '${rqnSlabel}', '${rqnLlabel}', '${rqnType}', ${rqnRequired}, ${rqnSelectValues})`);
    }

    console.log('new sequence value :' + seqRqnCode);
    console.log(
      "INSERT INTO nomad.REPORT_QUESTION (RQN_CODE, RQN_SLABEL, RQN_LLABEL, RQN_TYPE, RQN_REQUIRED, RQN_SELECT_VALUES) values \n" +
      listInsertReportQuestion.join(',\n') + ';'
    );

    // Replace the rqnCode that changed in the forms
    const listInsertFormDefinition = [];
    const listInsertFormTemplate = [];
    for (let formTemplateReport of this.listFormTemplateReport) {
      const form: Form = JSON.parse(formTemplateReport.definition);
      const definitions = form.definitions;
      const listDefinition = definitions.filter((definition) => definition.type === 'property');
      for (const [index, definition] of listDefinition.entries()) {
        if (definition.key !== 'questionPrincipal') {
          const newRqnCode = mapOldRqnCodeNewRqnCode[definition.rqnCode];
          if (newRqnCode != null) {
            definition.rqnCode = newRqnCode;
          }

          /*definition.rules = [{
            key: 'required',
            value: 'Obligatoire',
            message: 'Ce champ est obligatoire',
          }];*/
        }
      }

      const fdnCode = 'DEFAULT_' + formTemplateReport.formCode;
      const fdnDefinition = JSON.stringify(form).replace(/'/g, '\'\'');
      listInsertFormDefinition.push(`('${fdnCode}', '${fdnDefinition}')`);

      listInsertFormTemplate.push(`('${formTemplateReport.formCode}', (select id from nomad.form_definition where fdn_code = '${fdnCode}'))`);
    }

    console.log(
      "INSERT INTO nomad.FORM_DEFINITION (FDN_CODE, FDN_DEFINITION) values \n" +
      listInsertFormDefinition.join(',\n') + ';'
    );

    console.log(
      "INSERT INTO nomad.form_template (fte_code,fdn_id) VALUES \n" +
      listInsertFormTemplate.join(',\n') + ';'
    );
  }
}
