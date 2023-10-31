import { Component, Input, OnInit } from '@angular/core';
import { FormNode } from '../../models/form-node.model';

@Component({
  selector: 'app-form-accordion',
  templateUrl: './form-accordion.component.html',
  styleUrls: ['./form-accordion.component.scss'],
})
export class FormAccordionComponent implements OnInit {
  constructor() {}

  @Input() section: FormNode;

  ngOnInit() {}
}
