import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Column, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { FormTemplate } from 'src/app/core/models/template.model';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { ReportEditComponent } from './report-edit/report-edit.component';
import { ModalController } from '@ionic/angular';

export interface AssetTypeWtr {
  ast_id: number;
  ast_code: string;
  ast_slabel: string;
  ast_llabel: string;
  wtr_id: number;
  wtr_code: string;
  wtr_slabel: string;
  wtr_llabel: string;
}

export interface AssetType {
  ast_id: number;
  ast_code: string;
  ast_slabel: string;
  ast_llabel: string;
}

export interface WtrReport extends AssetType {
  wtr_id: number;
  wtr_code: string;
  wtr_slabel: string;
  wtr_llabel: string;
  fteId: number;
  formCode: string;
  fdnId: number;
  definition: string;
  hasForm: string;
}

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
})
export class ReportListComponent implements OnInit {

  constructor(
    private referentialService: ReferentialService,
    private utils: UtilsService,
    private templateService: TemplateService,
    private modalController: ModalController,
  ) { }

  public form: FormGroup;

  private listAssetTypeWtr: any[] = [];
  public listAssetType: AssetType[] = [];
  getAssetTypeLabel = (assetType: AssetType) => {
    return assetType.ast_code + ' - ' + assetType.ast_slabel;
  }

  private listFormTemplateReport: FormTemplate[] = [];
  
  public listWtrReport: WtrReport[] = [];

  public toolbar: TableToolbar = {
    title: 'Liste des formulaires par motif',
    buttons: [],
  };

  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.ACTION,
      label: '',
      size: '1',
      onClick: (wtrReport: any) => {
        this.openReportFormDetails(wtrReport);
      }
    },
    {
      key: 'wtr_code',
      label: 'Code',
      type: TypeColumn.TEXT,
    },
    {
      key: 'wtr_slabel',
      label: 'Libellé',
      type: TypeColumn.TEXT,
    },
    {
      key: 'hasForm',
      label: 'Formulaire ?',
      type: TypeColumn.TEXT,
    },
  ];

  async ngOnInit() {
    this.form = new FormGroup({
      astId: new FormControl(null, Validators.required),
      wtrId: new FormControl(null, Validators.required),
    });

    // When changing asset type, display the corresponding wtr and form
    this.form.get('astId').valueChanges.subscribe((astId) => {
      // Get the corresponding wtr
      const listWtr = this.utils.removeDuplicatesFromArr(this.listAssetTypeWtr.filter((assetTypeWtr) => assetTypeWtr.ast_id.toString() === astId), 'wtr_id');
    
      this.listWtrReport = listWtr.map((wtr) => {
        // For each wtr, get the form, if it exists
        const formTemplateReport = this.listFormTemplateReport.find((formTemplateReport) => formTemplateReport.formCode === 'REPORT_' + wtr.ast_code + '_' + wtr.wtr_code)

        return {
          ...wtr,
          fteId: formTemplateReport?.fteId,
          formCode: formTemplateReport?.formCode,
          fdnId: formTemplateReport?.fteId,
          definition: formTemplateReport?.definition,
          hasForm: formTemplateReport == null ? '' : 'X',
        }
      });
    });
    
    this.listAssetTypeWtr = await this.referentialService.getReferential('v_layer_wtr');
    this.listAssetType = this.utils.removeDuplicatesFromArr(this.listAssetTypeWtr, 'ast_id');

    const listFormTemplateReport = await this.templateService.getFormsTemplate();
    this.listFormTemplateReport = listFormTemplateReport.filter((formTemplate) => formTemplate.formCode.startsWith('REPORT_'));
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
        const listFormTemplateReport = await this.templateService.getFormsTemplate();
        this.listFormTemplateReport = listFormTemplateReport.filter((formTemplate) => formTemplate.formCode.startsWith('REPORT_'));
        this.form.get('astId').updateValueAndValidity();
      }
    });

    await modal.present();
  }
}