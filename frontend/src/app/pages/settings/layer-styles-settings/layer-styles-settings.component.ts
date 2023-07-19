import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Column, TypeColumn } from 'src/app/core/models/column.model';
import { Layer, getLayerLabel } from 'src/app/core/models/layer.model';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';

@Component({
  selector: 'app-layer-styles-settings',
  templateUrl: './layer-styles-settings.component.html',
  styleUrls: ['./layer-styles-settings.component.scss'],
})
export class LayerStylesSettingsPage implements OnInit {

  constructor(private layerService: LayerDataService) { }

  public form: FormGroup;

  public layers: Layer[];
  public getLayerLabel = getLayerLabel;

  myColumns: Column[] = [
    { type: TypeColumn.ACTION },
    { key: 'name', label: 'Name', type: TypeColumn.TEXT, size: '6' },
    { key: 'email', label: 'Email', type: TypeColumn.TEXT, size: '5' },
  ];

  myData = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 3, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 4, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 5, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 6, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 7, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 21, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 22, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 23, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 24, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 25, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 26, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 27, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 28, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 29, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 210, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 211, name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 212, name: 'Jane Doe', email: 'jane.doe@example.com' },
    // ... more data ...
  ];

  mySelectedData = [];

  ngOnInit() {
    this.form = new FormGroup({
      listUserEmail: new FormControl([]),
      lyrTableName: new FormControl(null, Validators.required),
    });

    // Get the list of layers
    this.layerService.getLayers().then((layers: Layer[]) => this.layers = layers);
  }

  async save() {
    if (this.form.valid) {
      const formValues = this.form.value;

      console.log(formValues);
    } else {
      // Permit to show the current form errors to the user
      this.form.markAllAsTouched();
    }
  }
}
