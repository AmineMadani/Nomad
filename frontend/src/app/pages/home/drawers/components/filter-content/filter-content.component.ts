import { Component, Input, OnInit } from '@angular/core';
import { Filter } from 'src/app/core/models/filter/filter.model';
import { UtilsService } from 'src/app/core/services/utils.service';

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
