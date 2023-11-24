import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { LayerGrpAction } from 'src/app/core/models/layer-gp-action.model';
import { Layer } from 'src/app/core/models/layer.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-mono-xy-rules-modal',
  templateUrl: './mono-xy-rules-modal.component.html',
  styleUrls: ['./mono-xy-rules-modal.component.scss'],
})
export class MonoXyRulesModalComponent implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    private layerService: LayerService,
  ) {}

  public assets: any[];
  public selectedLayers: Layer[];
  public domain: string;
  
  public groupLayer: Layer[];
  public groupAction: LayerGrpAction[];
  public selectedAssets: Set<any> = new Set();
  public hasSelectedGroup: boolean;
  
  public loading: boolean = false;

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      const layerGrpActions = await this.layerService.getAllLayerGrpActions();

      if (layerGrpActions.length > 0) {
        this.groupAction = [];
        for (const lyrGrpAct of layerGrpActions) {
          let count = 0;

          for (const layer of this.selectedLayers) {
            if (
              lyrGrpAct.lyrTableNames.includes(layer.lyrTableName) &&
              layer.domCode === this.domain
            ) {
              count++;
            }

            if (count >= 2) {
              this.groupAction.push(lyrGrpAct);
              break; // No need to check further, already found at least two
            }
          }
        }
      }
    } finally {
      this.loading = false;
    }
  }

  public keepLayer(layer: Layer): void {
    this.assets = this.assets.filter(
      (ast) => ast.lyrTableName === layer.lyrTableName
    );
    this.modalCtrl.dismiss(this.assets);
  }

  public keepGroup(grp: LayerGrpAction): void {
    this.assets = this.assets.filter((ast) =>
      grp.lyrTableNames.includes(ast.lyrTableName)
    );

    this.assets = this.assets.filter((ast) =>
      this.selectedLayers.find((l) => l.lyrTableName === ast.lyrTableName)
    );

    this.groupLayer = this.selectedLayers.filter((l) =>
      grp.lyrTableNames.includes(l.lyrTableName)
    );

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

  public confirm(): void {
    this.modalCtrl.dismiss([...this.selectedAssets]);
  }

  public return(): void {
    this.modalCtrl.dismiss();
  }
}
