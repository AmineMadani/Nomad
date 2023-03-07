import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FavoriteSelection } from 'src/app/models/favorite.model';
import { Segment, AccordeonSelection } from '../../patrimony-dataset';

@Component({
  selector: 'app-patrimony-content',
  templateUrl: './patrimony-content.component.html',
  styleUrls: ['./patrimony-content.component.scss'],
})
export class PatrimonyContentComponent implements OnInit {

  constructor() { }

  @Input() selectedSegment: string;
  @Input() segments: Map<string,Segment>;
  @Input() selectedElements: string[];
  
  @Output("onSelection") selectedEvent: EventEmitter<AccordeonSelection> = new EventEmitter();
 
  ngOnInit() {
    console.log(this.segments);
  }

  onSingleSelection(item:AccordeonSelection){
    this.segments.get(item.segment)?.data.forEach(ele => {
      if(ele.name != item.data.name) {
        ele.selected = false;
      }
    });
  }

  onSelection(item:AccordeonSelection){
    this.selectedEvent.emit(item);
  }
}
