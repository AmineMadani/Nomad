import { Component, Input, OnInit } from '@angular/core';
import { FormNode } from '../../models/form-node.model';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-form-step',
  templateUrl: './form-step.component.html',
  styleUrls: ['./form-step.component.scss'],
})
export class FormStepComponent implements OnInit {
  constructor() {}

  @Input() section: FormNode;
  @Input() stepper: MatStepper;
  @Input() control: any;

  ngOnInit() {}

  public next(): void {
    this.stepper.next();
  }

  public isDisabled(): boolean {
    return this.control.disabled;
  }
}
