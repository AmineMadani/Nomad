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
    private tableService: TableService
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
      key: 'wtrSlabel',
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

    this.layerService.getAllVLayerWtr().subscribe((vLayerWtrList) => {
      this.listAssetTypeWtr = vLayerWtrList;
      this.listAssetType = this.utils.removeDuplicatesFromArr(this.listAssetTypeWtr, 'astId');
    });

    this.templateService.getFormsTemplate(true).subscribe((listFormTemplateReport) => {
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
        this.templateService.getFormsTemplate(true).subscribe((listFormTemplateReport) => {
          this.listFormTemplateReport = listFormTemplateReport.filter((formTemplate) => formTemplate.formCode.startsWith('REPORT_'));
          this.form.get('astId').updateValueAndValidity();
        });
      }
    });

    await modal.present();
  }
}
