import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReferenceDisplayType, UserReference } from 'src/app/core/models/layer-references.model';
import { Layer } from 'src/app/core/models/layer.model';
import { LayerReferencesDataService } from 'src/app/core/services/dataservices/layer-reference.dataservice';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';

@Component({
  selector: 'app-layer-references-settings',
  templateUrl: './layer-references-settings.component.html',
  styleUrls: ['./layer-references-settings.component.scss'],
})
export class LayerReferencesSettingsComponent implements OnInit {

  constructor(private layerService: LayerDataService, private layerReferencesDataService: LayerReferencesDataService) { }

  public layers: Layer[];
  public currentLayer: Layer;
  public userReferences: UserReference[];
  public ReferenceDisplayType = ReferenceDisplayType;

  public form: FormGroup;

  public allUsers: any[] = [
    {
      id: 1,
      name: 'even',
    },
    {
      id: 2,
      name: 'baptiste',
    },
    {
      id: 3,
      name: 'brice',
    },
    {
      id: 4,
      name: 'alexandre',
    },
    {
      id: 5,
      name: 'franck',
    },
    {
      id: 6,
      name: 'franck',
    },
  ];

  async ngOnInit() {
    this.form = new FormGroup({
      listUserId: new FormControl([], Validators.required),
      layerId: new FormControl(null, Validators.required),
    });

    this.layerService.getLayers().subscribe((layers: Layer[]) => this.layers = layers);
  }

  handleLayerChange(event) {
    this.currentLayer = event.target.value;

    this.layerReferencesDataService.getUserLayerReferencesByLyrTableName(this.currentLayer.lyrTableName).subscribe((userReferences) => {
      this.userReferences = userReferences;
    });
  }

  save() {
    console.log(this.form);
  }
}
