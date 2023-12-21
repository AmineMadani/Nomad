import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { Contract } from 'src/app/core/models/contract.model';
import { LayerGrpAction } from 'src/app/core/models/layer-gp-action.model';
import { Layer } from 'src/app/core/models/layer.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { LayerService } from 'src/app/core/services/layer.service';

interface Domain {
  code: string;
  label: string;
}

@Component({
  selector: 'app-multi-assets-modal',
  templateUrl: './multi-assets-modal.component.html',
  styleUrls: ['./multi-assets-modal.component.scss'],
})
export class MultiAssetsModalComponent implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    private layerService: LayerService,
    private contractService: ContractService
  ) {}

  public isMobile: boolean;

  public isMultiWater: boolean;
  public isMultiContract: boolean;

  public form: FormGroup;

  public filteredDomains: Domain[];
  public filteredContracts: Contract[];

  public assets: any[];
  public selectedLayers: Layer[];
  public domain: string;

  public groupLayer: Layer[];
  public groupAction: LayerGrpAction[];
  public selectedGrpAct: LayerGrpAction;
  public selectedAssets: Set<any> = new Set();
  public hasSelectedGroup: boolean;

  public loading: boolean = false;

  private domainsPossible: Domain[];
  private contractsPossible: Contract[];

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.loading = true;

    await this.buildForm();

    this.addListeners();

    this.layerService
      .getAllLayerGrpActions()
      .then((layerGrpActions: LayerGrpAction[]) => {
        if (layerGrpActions?.length > 0) {
          this.groupAction = layerGrpActions.filter((lyrGrpAct) => {
            const count = this.selectedLayers.filter(
              (layer) =>
                lyrGrpAct.lyrTableNames.includes(layer.lyrTableName) &&
                (this.domain ? layer.domCode === this.domain : true)
            ).length;

            return count >= 2;
          });
        }
        this.loading = false;
      });
  }

  public keepLayer(layer: Layer): void {
    this.assets = this.assets.filter(
      (ast) => ast.lyrTableName === layer.lyrTableName
    );
    if (this.isMultiContract) {
      this.assets = this.assets.filter(
        (ast) => ast.ctrId === this.form.get('selectedContract').value.id
      );
    }
    this.modalCtrl.dismiss(this.assets);
  }

  public keepGroup(grp: LayerGrpAction): void {
    this.groupLayer = this.selectedLayers.filter((l) =>
      grp.lyrTableNames.includes(l.lyrTableName)
    );
    this.selectedGrpAct = grp;
    this.hasSelectedGroup = true;
  }

  public addLayer(e: Event, layer: Layer): void {
    this.assets
      .filter((ast) => ast.lyrTableName === layer.lyrTableName)
      .forEach((ast) => {
        if ((e as CustomEvent).detail.checked) {
          this.selectedAssets.add(ast);
        } else {
          if (this.selectedAssets.has(ast)) {
            this.selectedAssets.delete(ast);
          }
        }
      });
  }

  public getNumberOfAssetsPerContract(contract: Contract): number {
    return this.assets.filter((ast) => ast.ctrId === contract.id).length ?? 0;
  }

  public canLyrBeSelected(lyr: Layer): boolean {
    let canBeSelected = false;
    if (this.isMultiWater) {
      canBeSelected = lyr.domCode === this.form.get('selectedDomain').value;
    }
    if (this.isMultiContract) {
      canBeSelected = this.assets
        .filter(
          (ast) => ast.ctrId === this.form.get('selectedContract').value?.id
        )
        .map((ast) => ast.lyrTableName)
        .includes(lyr.lyrTableName);
    }
    if (!this.isMultiContract && !this.isMultiWater) {
      canBeSelected = true;
    }
    return canBeSelected;
  }

  public canGrpBeSelected(grp: LayerGrpAction): boolean {
    let canBeSelected = false;
    const layers = this.selectedLayers.filter((l) =>
      grp.lyrTableNames.includes(l.lyrTableName)
    );
    // In case we only have two layers and these two layers are not the same water domain, we don't want to display the group
    if (
      layers.map((l) => l.domCode).length === 2 &&
      new Set(layers.map((l) => l.domCode)).size === 2
    ) {
      return false;
    }
    if (this.isMultiWater) {
      canBeSelected =
        layers.filter(
          (l) => l.domCode === this.form.get('selectedDomain').value
        ).length > 1;
    }
    if (this.isMultiContract) {
      canBeSelected =
        layers.filter((l) => {
          const asts = this.assets
            .filter(
              (ast) => ast.ctrId === this.form.get('selectedContract').value.id
            )
            .map((ast) => ast.lyrTableName);
          return asts.includes(l.lyrTableName);
        }).length > 1;
    }
    if (!this.isMultiContract && !this.isMultiWater) {
      canBeSelected = true;
    }
    return canBeSelected;
  }

  public confirm(): void {
    this.modalCtrl.dismiss([...this.selectedAssets]);
  }

  public return(): void {
    if (this.hasSelectedGroup) {
      this.hasSelectedGroup = false;
    } else {
      this.modalCtrl.dismiss();
    }
  }

  private async buildForm(): Promise<void> {
    await this.getLayers();
    this.getDomain();

    this.form = new FormGroup({});

    if (this.isMultiWater) {
      this.form.addControl(
        'selectedDomain',
        new FormControl({ value: '', disabled: false }, [Validators.required])
      );
    }
    if (this.isMultiContract) {
      this.form.addControl(
        'selectedContract',
        new FormControl({ value: '', disabled: this.isMultiWater }, [
          Validators.required,
        ])
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

  private getDomain(): void {
    this.domainsPossible = [
      {
        code: 'dw',
        label: 'Eau Potable',
      },
      {
        code: 'ww',
        label: 'Assainissement',
      },
    ];
    this.filteredDomains = [...this.domainsPossible];
  }

  private addListeners(): void {
    if (this.isMultiWater) {
      this.form
        .get('selectedDomain')
        .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe((domainCode: string) => {
          if (this.isMultiContract) {
            const assets = this.assets.filter((ast) =>
              this.selectedLayers
                .filter((l) => l.domCode === domainCode)
                .map((l) => l.lyrTableName)
                .includes(ast.lyrTableName)
            );
            this.filteredContracts = this.contractsPossible.filter((c) =>
              assets.map((ast) => ast.ctrId).includes(c.id)
            );

            if (this.filteredContracts.length === 1) {
              this.form.patchValue({
                selectedContract: this.filteredContracts[0],
              });
            } else {
              this.form.patchValue(
                {
                  selectedContract: null,
                },
                { emitEvent: false }
              );
            }
            this.form.get('selectedContract').enable();
          }
        });
    }

    if (this.isMultiContract) {
      this.form
        .get('selectedContract')
        .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(() => {
          if (this.selectedLayers.length === 1) {
            this.keepLayer(this.selectedLayers[0]);
          }
        });
    }
  }
}
