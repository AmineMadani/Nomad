import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { Dataset, DATASET } from './patrimony-dataset';

@Component({
  selector: 'app-patrimony',
  templateUrl: './patrimony.component.html',
  styleUrls: ['./patrimony.component.scss'],
})
export class PatrimonyComponent implements OnInit {
  constructor(private utilsService: UtilsService) { }

  @ViewChild('scrolling') scrolling: ElementRef;
  
  selectedSegment: string = 'water';
  data: Dataset = DATASET;
 
  ngOnInit() {}

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }
}
