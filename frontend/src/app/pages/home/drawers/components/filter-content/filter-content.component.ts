import { Component, Input, OnInit } from '@angular/core';
import { AccordeonFilter } from 'src/app/models/filter-models/filter-component-models/AccordeonFilter.model';
import { FilterSegment } from 'src/app/models/filter-models/filter-segment.model';
import { Filter } from 'src/app/models/filter-models/filter.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-filter-content',
  templateUrl: './filter-content.component.html',
  styleUrls: ['./filter-content.component.scss'],
})
export class FilterContentComponent implements OnInit {

  constructor(
    private utilsService: UtilsService
  ) { }

  @Input() filter: Filter;

  selectedSegment: number = 1;

  ngOnInit() {
    console.log(this.filter.segments[0].components[0].getType());
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

  onSegmentChange(event:any){
    this.selectedSegment=Number(event.detail.value);
  }

}
