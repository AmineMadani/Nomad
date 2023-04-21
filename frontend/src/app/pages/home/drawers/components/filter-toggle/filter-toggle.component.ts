import { Component, OnInit, Input } from '@angular/core';
import { ToggleData } from 'src/app/core/models/filter/filter-component-models/ToggleFilter.model';
import { FilterService } from 'src/app/core/services/filter.service';

@Component({
  selector: 'app-filter-toggle',
  templateUrl: './filter-toggle.component.html',
  styleUrls: ['./filter-toggle.component.scss'],
})
export class FilterToggleComponent implements OnInit {
  constructor(
    private filterService: FilterService,
  ) { }

  @Input() data: ToggleData[];
  @Input() tableKey: string[];

  ngOnInit() {
    this.data.forEach((tData: ToggleData) => {
      if (!this.tableKey) {
        this.filterService.setToggleLayer(tData.key, tData.checked);
      }
      else {
        this.filterService.setToggleFilter(this.tableKey, tData.key, tData.value, tData.checked)
      }
    });
  }

  onToggleChange(data: ToggleData, e: Event) {
    data.checked = (e as CustomEvent).detail.checked;
    if (!this.tableKey) {
      this.filterService.setToggleLayer(data.key, data.checked);
    }
    else {
      this.filterService.setToggleFilter(this.tableKey, data.key, data.value, data.checked)
    }
  }

  isChecked(data: ToggleData) {
    return (!this.tableKey) ? this.filterService.isExistLayerData(data.key) : true;
  }
}
