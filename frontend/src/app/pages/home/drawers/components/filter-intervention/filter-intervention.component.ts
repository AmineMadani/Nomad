import { Component, OnInit, Input } from '@angular/core';
import {
  InterventionData,
  InterventionStatusEnum,
} from 'src/app/core/models/filter/filter-component-models/InterventionFilter.model';
import { LayerService } from 'src/app/core/services/map/layer.service';

@Component({
  selector: 'app-filter-intervention',
  templateUrl: './filter-intervention.component.html',
  styleUrls: ['./filter-intervention.component.scss'],
})
export class FilterInterventionComponent implements OnInit {
  constructor(private layerService: LayerService) {}

  @Input() data: InterventionData[];

  ngOnInit() {}

  public highlightFeature(featureId: string): void {
    this.layerService.highlightFeature('aep_branche', featureId);
  }

  public getStatusIcon(status: InterventionStatusEnum): string {
    switch (status) {
      case InterventionStatusEnum.SUCCESS:
        return 'checkmark';
      case InterventionStatusEnum.FAIL:
        return 'close';
      case InterventionStatusEnum.PLANNED:
        return 'calendar';
      case InterventionStatusEnum.CREATED:
        return 'create'
      case InterventionStatusEnum.OVER:
        return 'checkmark-done'
      default:
        return '';
    }
  }
}
