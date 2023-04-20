import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormNode } from '../../models/form-node.model';

@Component({
  selector: 'app-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrls: ['./form-stepper.component.scss'],
})
export class FormStepperComponent implements OnInit {
  constructor() {}

  @Input() section: FormNode;
  @Input() template: TemplateRef<any>;

  ngOnInit() {}
}
