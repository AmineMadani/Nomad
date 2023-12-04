import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { VLayerWtr } from 'src/app/core/models/layer.model';
import { Column, ColumnSort, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { WorkorderTaskReason } from 'src/app/core/models/workorder.model';
import { WorkorderTaskReasonDto } from 'src/app/core/models/workorderTaskReason.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { TableService } from 'src/app/core/services/table.service';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { WorkorderTaskReasonService } from 'src/app/core/services/workorderTaskReason.service';

interface AssetType {
  astId: number;
  astCode: string;
  astSlabel: string;
}

@Component({
  selector: 'app-workorder-task-reason-edit',
  templateUrl: './workorder-task-reason-edit.component.html',
  styleUrls: ['./workorder-task-reason-edit.component.scss'],
})
export class WorkorderTaskReasonEditComponent implements OnInit {

  constructor(
    private utilsService: UtilsService,
    private userService: UserService,
    private workorderTaskReasonService: WorkorderTaskReasonService,
    private layerService: LayerService,
    private modalController: ModalController,
    private tableService: TableService,
    private workorderService: WorkorderService,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("id") id: number;

  public isLoading: boolean = false;
  public isConsultation: boolean = true;

  public form: FormGroup;

  private vLayerWtrList: VLayerWtr[] = [];

  private listWtr: WorkorderTaskReason[] = [];

  // ## Available asset type ## //
  public listAvailableAssetType: TableRow<AssetType>[] = [];
  public listSelectedAvailableAssetType: TableRow<AssetType>[] = [];
  public toolbarAvailableAssetType: TableToolbar = {
    title: 'Liste des types',
    buttons: [],
  };

  // Table Columns
  public columnsAvailableAssetType: Column[] = [
    {
      type: TypeColumn.CHECKBOX,
    },
    {
      key: 'astCode',
      label: 'Code',
      type: TypeColumn.TEXT
    },
    {
      key: 'astSlabel',
      label: 'Libellé',
      type: TypeColumn.TEXT
    },
  ];

  listAvailableAssetTypeColumnSort: ColumnSort[] = [
    {
      key: 'astCode', direction: 'asc'
    }
  ];

  // ## Associated asset type ## //
  public listAssociatedAssetType: TableRow<AssetType>[] = [];
  public listSelectedAssociatedAssetType: TableRow<AssetType>[] = [];
  public toolbarAssociatedAssetType: TableToolbar = {
    title: 'Liste des types sélectionnés',
    buttons: [],
  };

  // Table Columns
  public columnsAssociatedAssetType: Column[] = [
    {
      type: TypeColumn.CHECKBOX,
    },
    {
      key: 'astCode',
      label: 'Code',
      type: TypeColumn.TEXT
    },
    {
      key: 'astSlabel',
      label: 'Libellé',
      type: TypeColumn.TEXT
    },
  ];

  listAssociatedAssetTypeColumnSort: ColumnSort[] = [
    {
      key: 'astCode', direction: 'asc'
    }
  ];

  async ngOnInit() {
    this.isLoading = true;

    // ### Form ### //
    this.form = new FormGroup({
      wtrCode: new FormControl<string>(null, Validators.required),
      wtrLlabel: new FormControl<string>(null, Validators.required),
      wtrNoXy: new FormControl<boolean>(true),
    });

    // ### Permissions ### //
    this.isConsultation = !await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_NEW_FORM_FIELDS);

    // Disable form if user hasn't right to customize
    if (this.isConsultation) {
      this.form.disable();
    }

    // ### Reference data ### //
    this.listWtr = await this.workorderService.getAllWorkorderTaskReasons(true);

    this.vLayerWtrList = await this.layerService.getAllVLayerWtr(true);
    this.listAvailableAssetType = this.tableService.createReadOnlyRowsFromObjects(
      this.utilsService.removeDuplicatesFromArr(this.vLayerWtrList, 'astId').map((v) => {
        return {
          astId: v.astId,
          astCode: v.astCode,
          astSlabel: v.astSlabel,
        }
      })
    );

    // ### Data ### //
    if (this.id != null) {
      const wtr = this.listWtr.find((wtr) => wtr.id === this.id);
      if (wtr != null) {
        this.form.patchValue({
          wtrCode: wtr.wtrCode,
          wtrLlabel: wtr.wtrLlabel,
          wtrNoXy: wtr.wtrNoXy,
        });

        this.form.get('wtrCode').disable();

        const listAstIdForWtr = this.vLayerWtrList.filter((v) => v.wtrId === this.id).map((v) => v.astId);
        this.listSelectedAvailableAssetType = this.listAvailableAssetType.filter((assetType) => listAstIdForWtr.includes(assetType.getRawValue().astId));
        if (this.listSelectedAvailableAssetType.length > 0) {
          this.addListAssetType();
        }
      }
    }

    this.isLoading = false;
  }

  addListAssetType() {
    // Add to the right list
    this.listAssociatedAssetType = this.listAssociatedAssetType.concat(
      this.listSelectedAvailableAssetType
    );

    // Remove from the left list
    this.listAvailableAssetType = this.listAvailableAssetType.filter((ast) => {
      return !this.listSelectedAvailableAssetType.some((selectedAst) => selectedAst.getRawValue().astId === ast.getRawValue().astId);
    });

    // Deselect items
    this.listSelectedAvailableAssetType = [];
  }

  removeListAssetType() {
    // Add to the left list
    this.listAvailableAssetType = this.listAvailableAssetType.concat(
      this.listSelectedAssociatedAssetType
    );

    // Remove from the right list
    this.listAssociatedAssetType = this.listAssociatedAssetType.filter((ast) => {
      return !this.listSelectedAssociatedAssetType.some((selectedAst) => selectedAst.getRawValue().astId === ast.getRawValue().astId)
    });

    // Deselect items
    this.listSelectedAssociatedAssetType = [];
  }

  async save() {
    this.utilsService.validateAllFormFields(this.form);

    if (!this.form.valid) return;

    const wtr: WorkorderTaskReasonDto = {
      id: this.id,
      wtrCode: this.form.get('wtrCode').value,
      wtrSlabel: this.form.get('wtrLlabel').value,
      wtrLlabel: this.form.get('wtrLlabel').value,
      wtrNoXy: this.form.get('wtrNoXy').value,
      listAstId: this.listAssociatedAssetType.map((ast) => ast.getRawValue().astId),
    }

    // At least one asset type has to be associated with the reason
    if (wtr.listAstId.length === 0) {
      this.utilsService.showErrorMessage("Veuillez sélectionner au moins un type", 5000);
      return;
    }

    // Check if a relation wtrCode - asset type already exist on another wtr
    const existingAstWtr = this.vLayerWtrList.find((v) => {
      return v.wtrCode === wtr.wtrCode 
        && wtr.listAstId.includes(v.astId)
        && (this.id == null || this.id !== v.wtrId)
    });
    if (existingAstWtr != null) {
      this.utilsService.showErrorMessage("Ce code est déjà associé au type " + existingAstWtr.astCode + " sur un autre motif", 5000);
      return;
    }

    if (this.id == null) {
      await this.workorderTaskReasonService.createWorkorderTaskReason(wtr);
    } else {
      await this.workorderTaskReasonService.updateWorkorderTaskReason(wtr);
    }

    this.modalController.dismiss(true);
  }

  close() {
    this.modalController.dismiss(false);
  }
}
