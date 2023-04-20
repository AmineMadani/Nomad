import { Component, Input, OnInit } from '@angular/core';
import { FormDefinition, FormSelect } from '../../models/form.model';

@Component({
  selector: 'app-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss'],
})
export class FormSelectComponent implements OnInit {
  constructor() {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  public attributes: FormSelect;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormSelect;
  }
}
