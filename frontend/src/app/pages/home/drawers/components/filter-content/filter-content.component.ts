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

  selectedSegment?: number;

  ngOnInit() {
    this.selectedSegment = this.filter.segments.find(segment => segment.selected)?.id
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

  onSegmentChange(event:any){
    let valSegment = Number(event.detail.value);
    this.selectedSegment=valSegment;
    this.filter.segments.forEach(segment => {
      if(segment.id != valSegment) {
        segment.selected=false;
      } else {
        segment.selected= true;
      }
    })
  }

}
