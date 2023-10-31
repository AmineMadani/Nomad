import { Component, OnDestroy, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { Contract } from 'src/app/core/models/contract.model';
import { Layer } from 'src/app/core/models/layer.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-multicontract-modal',
  templateUrl: './multicontract-modal.component.html',
  styleUrls: ['./multicontract-modal.component.scss'],
})
export class MulticontractModalComponent implements OnInit, OnDestroy {
  constructor(
    private modalCtrl: ModalController,
    private contractService: ContractService,
    private layerService: LayerService,
    private utils: UtilsService
  ) {}

  public isMobile: boolean;

  public isMultiWater: boolean;
  public isMultiContract: boolean;

  public filteredContracts: Contract[];
  public assets: any[];

  public loading: boolean = true;

  public form: FormGroup;

  private contractsPossible: Contract[];
  private selectedLayers: Layer[];

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.isMobile = this.utils.isMobilePlateform();

    await this.buildForm();

    this.addListeners();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public editEquipmentList(): void {
    this.modalCtrl.dismiss(null);
  }

  public confirmContract(): void {
    let assets = this.assets;
    if (this.isMultiWater) {
      assets = assets.filter((ast) =>
        this.selectedLayers
          .filter((l) => l.domCode === this.form.get('selectedDomain').value)
          .map((l) => l.lyrTableName)
          .includes(ast.lyrTableName)
      );
    }

    if (this.isMultiContract) {
      assets = assets.filter(
        (ast) => ast.ctrId === this.form.get('selectedContract').value['id'] || ast.id.includes('TMP')
      );
    }

    this.modalCtrl.dismiss(assets);
  }

  public getNumberOfAssetsPerContract(contract: Contract): number {
    return this.assets.filter((ast) => ast.ctrId === contract.id).length ?? 0;
  }

  private async buildForm(): Promise<void> {
    this.form = new FormGroup({});
    if (this.isMultiWater) {
      this.form.addControl(
        'selectedDomain',
        new FormControl('', [Validators.required])
      );
      await this.getLayers();
    }
    if (this.isMultiContract) {
      this.form.addControl(
        'selectedContract',
        new FormControl('', [Validators.required])
      );
      await this.getContracts();
    }
    this.loading = false;
  }

  private async getContracts(): Promise<void> {
    const contracts = await this.contractService.getAllContracts();
    this.contractsPossible = contracts.filter((c: Contract) =>
      this.assets.map((ast) => ast.ctrId).includes(c.id)
    );
    this.filteredContracts = this.contractsPossible;
  }

  private async getLayers(): Promise<void> {
    const layers = await this.layerService.getAllLayers();
    this.selectedLayers = layers.filter((l: Layer) =>
      this.assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName)
    );
  }

  private addListeners(): void {
    if (this.isMultiWater) {
      this.form
        .get('selectedDomain')
        .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe((domain: 'dw' | 'ww') => {
          const assets = this.assets.filter((ast) =>
            this.selectedLayers
              .filter((l) => l.domCode === domain)
              .map((l) => l.lyrTableName)
              .includes(ast.lyrTableName)
          );
          if (this.isMultiContract) {
            this.filteredContracts = this.contractsPossible.filter((c) =>
              assets.map((ast) => ast.ctrId).includes(c.id)
            );
            this.form.patchValue({ selectedContract: null });
          }
        });
    }
  }
}
