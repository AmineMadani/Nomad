import { Component, Input, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-report-stepper',
  templateUrl: './report-stepper.component.html',
  styleUrls: ['./report-stepper.component.scss'],
})
export class ReportStepperComponent implements OnInit {

  constructor(
    private utilsService: UtilsService
  ) { }

  @Input() step:number;

  public isMobile: boolean = false;

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
  }

}
