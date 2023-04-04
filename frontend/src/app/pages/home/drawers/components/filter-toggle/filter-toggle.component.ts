import { Component, OnInit, Input } from '@angular/core';
import { ToggleData } from 'src/app/core/models/filter/filter-component-models/ToggleFilter.model';
import { MapService } from 'src/app/core/services/map.service';

@Component({
  selector: 'app-filter-toggle',
  templateUrl: './filter-toggle.component.html',
  styleUrls: ['./filter-toggle.component.scss'],
})
export class FilterToggleComponent implements OnInit {
  constructor(
    private mapService: MapService
  ) {}

  @Input() data: ToggleData[];

  ngOnInit() {}

  changeToggle(data:ToggleData, e:Event){
    if(data.key) {
      data.value = (e as CustomEvent).detail.checked;
      if((e as CustomEvent).detail.checked){
        this.mapService.addEventLayer(data.key);
      } else {
        this.mapService.removeEventLayer(data.key);
      }
    }
  }
}
