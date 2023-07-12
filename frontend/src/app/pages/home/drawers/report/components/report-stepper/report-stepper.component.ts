import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-stepper',
  templateUrl: './report-stepper.component.html',
  styleUrls: ['./report-stepper.component.scss'],
})
export class ReportStepperComponent implements OnInit {

  constructor() { }

  @Input() step:number;

  ngOnInit() {}

}
