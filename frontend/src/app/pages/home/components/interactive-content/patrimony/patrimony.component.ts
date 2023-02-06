import { Component, OnInit } from '@angular/core';
import { Dataset, DATASET } from './patrimony-dataset';

@Component({
  selector: 'app-patrimony',
  templateUrl: './patrimony.component.html',
  styleUrls: ['./patrimony.component.scss'],
})
export class PatrimonyComponent implements OnInit {
  constructor() { }
  
  selectedSegment: string = 'water';
  data: Dataset = DATASET;
 
  ngOnInit() {}
}
