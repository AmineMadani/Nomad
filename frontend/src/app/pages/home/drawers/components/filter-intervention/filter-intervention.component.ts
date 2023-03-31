import { Component, OnInit, Input } from '@angular/core';
import {
  InterventionData,
  InterventionStatusEnum,
} from 'src/app/core/models/filter/filter-component-models/InterventionFilter.model';

@Component({
  selector: 'app-filter-intervention',
  templateUrl: './filter-intervention.component.html',
  styleUrls: ['./filter-intervention.component.scss'],
})
export class FilterInterventionComponent implements OnInit {
  constructor() {}

  @Input() data: InterventionData[];

  ngOnInit() {}

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
