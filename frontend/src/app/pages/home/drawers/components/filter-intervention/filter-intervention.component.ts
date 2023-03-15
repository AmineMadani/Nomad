import { Component, OnInit, Input } from '@angular/core';
import { InterventionData } from 'src/app/core/models/filter/filter-component-models/InterventionFilter.model';

@Component({
  selector: 'app-filter-intervention',
  templateUrl: './filter-intervention.component.html',
  styleUrls: ['./filter-intervention.component.scss'],
})
export class FilterInterventionComponent implements OnInit {
  constructor() {}

  @Input() data: InterventionData[];

  ngOnInit() {}
}
