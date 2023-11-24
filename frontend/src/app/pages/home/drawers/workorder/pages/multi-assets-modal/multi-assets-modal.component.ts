import { Component, OnDestroy, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subject, filter, takeUntil } from 'rxjs';
import { Contract } from 'src/app/core/models/contract.model';
import { GEOM_TYPE, Layer } from 'src/app/core/models/layer.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';

interface GeomType {
  type: string;
  label: string;
}

interface Domain {
  code: string;
  label: string;
}

@Component({
  selector: 'app-multi-assets-modal',
  templateUrl: './multi-assets-modal.component.html',
  styleUrls: ['./multi-assets-modal.component.scss'],
})
export class MultiAssetsModalComponent implements OnInit, OnDestroy {
  constructor(
    private modalCtrl: ModalController,
    private contractService: ContractService,
    private layerService: LayerService,
    private utils: UtilsService,
    private router: Router,
    private drawerService: DrawerService,
  ) {
    this.router.events
    .pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    )
    .subscribe(() => this.modalCtrl.dismiss(null));
  }

  public isMobile: boolean;

  public isMultiGeomType: boolean;
  public isMultiWater: boolean;
  public isMultiContract: boolean;
  public originalGeomType?: string;

  public filteredDomains: Domain[];
  public geomTypes: GeomType[];
  public filteredContracts: Contract[];
  public assets: any[];

  public loading: boolean = true;

  public form: FormGroup;

  private domainsPossible: Domain[];
  private contractsPossible: Contract[];
  private selectedLayers: Layer[];

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.isMobile = this.utils.isMobilePlateform();

    await this.buildForm();

    this.addListeners();

    if (this.isMultiGeomType && this.originalGeomType) {
      this.form.patchValue({
        selectedGeomType: this.geomTypes.find((gt) => gt.type === this.originalGeomType)
      })
      this.form.get('selectedGeomType').markAsTouched();
      this.form.get('selectedGeomType').disable();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public editEquipmentList(): void {
    this.drawerService.setLocationBack();
  }

  public confirmContract(): void {
    let assets = this.assets;
    if (this.isMultiGeomType) {
      assets = assets.filter((ast) => {
        const layer = this.selectedLayers.find(
          (l) => l.lyrTableName === ast.lyrTableName
        );
        return layer.lyrGeomType === this.form.get('selectedGeomType').value.type;
      });
    }

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
        (ast) =>
          ast.ctrId === this.form.get('selectedContract').value['id'] ||
          ast.id.includes('TMP')
      );
    }

    this.modalCtrl.dismiss(assets);
  }

  public getNumberOfAssetsPerContract(contract: Contract): number {
    return (
      this.assets.filter((ast) => {
        if (this.isMultiGeomType) {
          const geomType = this.form.get('selectedGeomType').value.type;
          return (
            this.selectedLayers
              .filter((l) => l.lyrGeomType === geomType)
              .map((l) => l.lyrTableName)
              .includes(ast.lyrTableName) && ast.ctrId === contract.id
          );
        } else {
          return ast.ctrId === contract.id;
        }
      }).length ?? 0
    );
  }

  private async buildForm(): Promise<void> {
    await this.getLayers();
    this.getDomain();

    this.form = new FormGroup({});

    if (this.isMultiGeomType) {
      this.form.addControl(
        'selectedGeomType',
        new FormControl({ value: '', disabled: false }, [Validators.required])
      );
      await this.getGeomType();
    }
    if (this.isMultiWater) {
      this.form.addControl(
        'selectedDomain',
        new FormControl({ value: '', disabled: this.isMultiGeomType }, [
          Validators.required,
        ])
      );
    }
    if (this.isMultiContract) {
      this.form.addControl(
        'selectedContract',
        new FormControl(
          { value: '', disabled: this.isMultiGeomType || this.isMultiWater },
          [Validators.required]
        )
      );
      await this.getContracts();
    }
    this.loading = false;
  }

  private getGeomType(): void {
    const lineLabel: string[] = [];
    const pointLabel: string[] = [];
  
    for (const layer of this.selectedLayers) {
      if (layer.lyrGeomType === GEOM_TYPE.LINE) {
        lineLabel.push(layer.lyrSlabel);
      } else {
        pointLabel.push(layer.lyrSlabel);
      }
    }
  
    this.geomTypes = [
      {
        type: 'line',
        label: `${lineLabel.join(', ')}`,
      },
      {
        type: 'point',
        label: `${pointLabel.join(', ')}`,
      },
    ];
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
    if (this.isMultiGeomType) {
      this.form
        .get('selectedGeomType')
        .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe((geomType: GeomType) => {
          if (this.isMultiWater) {
            const waterType = [...new Set([
              ...this.selectedLayers.filter((l) => l.lyrGeomType === geomType.type),
            ])];
            this.filteredDomains = this.domainsPossible.filter((d) =>
              waterType.map((wt) => wt.domCode).includes(d.code)
            );
            if (this.filteredDomains.length === 1) {
              this.form.patchValue({
                selectedDomain: this.filteredDomains[0].code
              });
            } else {
              this.form.patchValue({
                selectedDomain: null,
              }, { emitEvent: false });
            }
            this.form.get('selectedDomain').enable();
          }
          if (!this.isMultiWater && this.isMultiContract) {
            const assets = this.assets.filter((ast) =>
              this.selectedLayers
                .filter((l) => l.lyrGeomType === geomType.type)
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
              this.form.patchValue({
                selectedContract: null,
              }, { emitEvent: false });
            }
            this.form.get('selectedContract').enable();
          }
        });
    }

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
            this.filteredContracts = this.contractsPossible.filter((c) => {
              if (this.isMultiGeomType) {
                return assets
                  .filter(
                    (ast) =>
                      this.selectedLayers.find(
                        (l) => l.lyrTableName === ast.lyrTableName
                      ).lyrGeomType == this.form.get('selectedGeomType').value.type
                  )
                  .map((ast) => ast.ctrId)
                  .includes(c.id);
              }
              return assets.map((ast) => ast.ctrId).includes(c.id);
            });
            if (this.filteredContracts.length === 1) {
              this.form.patchValue({
                selectedContract: this.filteredContracts[0],
              });
            } else {
              this.form.patchValue({
                selectedContract: null,
              });
            }
            this.form.get('selectedContract').enable();
          }
        });
    }
  }
}
