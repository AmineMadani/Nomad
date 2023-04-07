import { Component, OnInit, Input } from '@angular/core';
import { ToggleData } from 'src/app/core/models/filter/filter-component-models/ToggleFilter.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { FilterService } from '../filter.service';

@Component({
  selector: 'app-filter-toggle',
  templateUrl: './filter-toggle.component.html',
  styleUrls: ['./filter-toggle.component.scss'],
})
export class FilterToggleComponent implements OnInit {
  constructor(
    private filterService: FilterService,
  ) {}

  @Input() data: ToggleData[];

  ngOnInit() {
    this.data.forEach((tData: ToggleData) => {
      this.filterService.setToggleData(tData.key!, false);
    })
  }

  changeToggle(data:ToggleData, e:Event){
    if(data.key) {
      data.value = (e as CustomEvent).detail.checked;
      this.filterService.setToggleData(data.key!, Boolean(data.value!));
    }
  }
}
