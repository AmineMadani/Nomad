import { Component, OnInit, Input } from '@angular/core';
import { ToggleData } from 'src/app/core/models/filter/filter-component-models/ToggleFilter.model';

@Component({
  selector: 'app-filter-toggle',
  templateUrl: './filter-toggle.component.html',
  styleUrls: ['./filter-toggle.component.scss'],
})
export class FilterToggleComponent implements OnInit {
  constructor() {}

  @Input() data: ToggleData[];

  ngOnInit() {}
}
