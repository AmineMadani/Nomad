import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VLayerWtr } from 'src/app/core/models/layer.model';
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { TableService } from 'src/app/core/services/table.service';
import { UserService } from 'src/app/core/services/user.service';
import { WorkorderTaskReasonEditComponent } from './workorder-task-reason-edit/workorder-task-reason-edit.component';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { UtilsService } from 'src/app/core/services/utils.service';

interface Wtr {
  wtrId: number;
  wtrCode: string;
  wtrLlabel: string;
  assetTypes: string;
}

@Component({
  selector: 'app-workorder-task-reasons-settings',
  templateUrl: './workorder-task-reasons-settings.component.html',
  styleUrls: ['./workorder-task-reasons-settings.component.scss'],
})
export class WorkorderTaskReasonsSettingsComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private tableService: TableService,
    private userService: UserService,
    private layerService: LayerService,
    private workorderService: WorkorderService,
    private utilsService: UtilsService,
  ) { }

  public isLoading: boolean = false;

  private isConsultation: boolean = true;

  public listWtr: TableRow<Wtr>[] = [];
  public listSelectedWtr: TableRow<Wtr>[] = [];

  public toolbar: TableToolbar = {
    title: 'Liste des types-motifs',
    buttons: [
      /*{
        name: 'trash',
        tooltip: 'Supprimer',
        onClick: () => {
          this.deleteListWtr();
        },
        disableFunction: () => {
          return this.listSelectedWtr.length === 0 || this.isConsultation;
        }
      },*/
      {
        name: 'add',
        tooltip: 'Créer',
        onClick: () => {
          this.openWtrDetails(null);
        },
        disableFunction: () => {
          return this.isConsultation;
        }
      }
    ],
  };

  // Table Columns
  public columns: Column[] = [
    /*{
      type: TypeColumn.CHECKBOX,
    },*/
    {
      type: TypeColumn.ACTION,
      label: '',
      onClick: (wtr: TableRow<VLayerWtr>) => {
        this.openWtrDetails(wtr.getRawValue());
      }
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
    },
    {
      key: 'assetTypes',
      label: 'Types',
      type: TypeColumn.TEXT,
    },
  ];

  listColumnSort: ColumnSort[] = [
    {
      key: 'wtrCode', direction: 'asc'
    }
  ];

  async ngOnInit() {
    // ### Permissions ### //
    this.isConsultation = !await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_NEW_FORM_FIELDS);

    // ### DATA ### //
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;

    const listAllWtr = await this.workorderService.getAllWorkorderTaskReasons(true);
    let vLayerWtrList = await this.layerService.getAllVLayerWtr(true);

    const listWtr = listAllWtr.map((wtr) => {
    const assetTypes = this.utilsService.removeDuplicatesFromArr(
      vLayerWtrList.filter((v) => v.wtrId === wtr.id), 'astId'
    ).sort((a, b) => a.astCode.localeCompare(b.astCode)).map((v) => v.astCode).join(', ');

      return {
        wtrId: wtr.id,
        wtrCode: wtr.wtrCode,
        wtrLlabel: wtr.wtrLlabel,
        assetTypes: assetTypes
      }
    });

    this.listWtr = this.tableService.createReadOnlyRowsFromObjects(listWtr);
    this.listSelectedWtr = [];

    this.isLoading = false;
  }

  private async openWtrDetails(wtr: VLayerWtr): Promise<void> {
    const modal = await this.modalController.create({
      component: WorkorderTaskReasonEditComponent,
      componentProps: {
        id: wtr?.wtrId,
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

  async deleteListWtr() {
    const listWtrToDelete = this.listSelectedWtr.map((row) => row.getRawValue());

    // TODO ?
  }

}
