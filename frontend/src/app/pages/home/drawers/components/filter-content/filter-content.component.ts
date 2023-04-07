import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Output() segmentChange: EventEmitter<number> = new EventEmitter();

  selectedSegment?: number;


  ngOnInit() {
    this.selectedSegment = this.filter.segments.find(segment => segment.selected)?.id;
    this.segmentChange.emit(this.selectedSegment);
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

  onSegmentChange(event:any) {
    let valSegment = Number(event.detail.value);
    this.selectedSegment = valSegment;
    this.segmentChange.emit(this.selectedSegment);
    this.filter.segments.forEach(segment => {
      if(segment.id != valSegment) {
        segment.selected = false;
      } else {
        segment.selected = true;
      }
    })
  }

  customScrollBarStyle(): string {
    return `
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-track {
      background: var(--ion-color-neutral-variant-80);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--ion-color-neutral-variant-30);
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--ion-color-neutral-variant-50);
    }`;
  }

}
