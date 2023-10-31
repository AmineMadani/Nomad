import { Component, Input, OnInit } from '@angular/core';
import { FormDefinition } from '../../models/form.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { UserReference } from 'src/app/core/models/layer.model';

@Component({
  selector: 'app-form-layer-reference',
  templateUrl: './form-layer-reference.component.html',
  styleUrls: ['./form-layer-reference.component.scss'],
})
export class FormLayerReferenceComponent implements OnInit {
  constructor(private layerReferencesService: LayerService) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() paramMap: Map<string, string>;

  public userReferences: UserReference[];
  public equipment: any;

  async ngOnInit(): Promise<void> {
    this.equipment = Object.fromEntries(this.paramMap);
    this.userReferences = (
      await this.layerReferencesService.getUserReferences(
        this.paramMap.get('lyrTableName')
      )
    ).filter(
      (ref: UserReference) =>
        ref.displayType === this.definition.attributes.value
    );
  }
}
