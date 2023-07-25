import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Column, TypeColumn } from 'src/app/core/models/table/column.model';
import { Layer, LayerStyle, getLayerLabel } from 'src/app/core/models/layer.model';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { LayerStyleDataService } from 'src/app/core/services/dataservices/layer-style.dataservice';
import { ModalController } from '@ionic/angular';
import { LayerStyleComponent } from './layer-style/layer-style.component';

@Component({
  selector: 'app-layer-styles-settings',
  templateUrl: './layer-styles-settings.component.html',
  styleUrls: ['./layer-styles-settings.component.scss'],
})
export class LayerStylesSettingsPage implements OnInit {

  constructor(
    private layerService: LayerDataService,
    private layerStyleDataService: LayerStyleDataService,
    private modalController: ModalController
  ) { }

  public form: FormGroup;
  public modal: any;
  // Layers
  public layers: Layer[];
  public getLayerLabel = getLayerLabel;
  public currentLayerId: number;
  // Styles
  public allLayerStyles: LayerStyle[] = [];
  public layerStyles: LayerStyle[] = [];
  public selectedLayerStyles: LayerStyle[] = [];

  // Table Toolbar
  public toolbar: TableToolbar = {
    title: 'Liste des styles de couche',
    buttons: [
      {
        name: 'trash',
        onClick: () => {
          console.log('trash clicked');
        },
        disableFunction: () => {
          return this.selectedLayerStyles.length === 0;
        }
      },
      {
        name: 'add',
        onClick: () => {
          this.openLayerStyleDetails();
        },
        disableFunction: () => {
          return false;
        }
      }
    ],
  }
  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.CHECKBOX,
      size: '1'
    },
    {
      type: TypeColumn.ACTION,
      label: '',
      size: '1',
      onClick: (style: LayerStyle) => {
        this.openLayerStyleDetails(style.lseId);
      }
    },
    {
      key: 'lseCode',
      label: 'Code',
      type: TypeColumn.TEXT,
      size: '10'
    },
  ];

  async ngOnInit() {
    // Init form
    this.initLayerSelectionForm();

    // Get datas
    // Layers
    this.layerService.getLayers().then((layers) => this.layers = layers);
    // Layer styles
    this.layerStyleDataService.getAllLayerStyles().subscribe((styles) => {
      this.allLayerStyles = styles;
    });
  }

  private initLayerSelectionForm() {
    this.form = new FormGroup({
      lyrTableName: new FormControl(null, Validators.required),
    });

    // Listen form value changes on lyrTableName
    this.form.get('lyrTableName').valueChanges.subscribe((lyrTableName: string) => {
      this.currentLayerId = this.layers.find((lyr) => lyr.lyrTableName === lyrTableName)?.id;
      if (this.currentLayerId) {
        // Get the styles for the selected layer
        this.layerStyles = this.allLayerStyles.filter((style) => style.lyrId === this.currentLayerId);
      } else {
        this.layerStyles = [];
      }
    });
  }

  async openLayerStyleDetails(lseId?: number) {
    const modal = await this.modalController.create({
      component: LayerStyleComponent,
      componentProps: {
        lseId: lseId,
        parentLayer: this.layers.find((lyr) => lyr.lyrTableName === this.form.get('lyrTableName').value),
      },
      backdropDismiss: false,
    });
    return await modal.present();
  }
}
