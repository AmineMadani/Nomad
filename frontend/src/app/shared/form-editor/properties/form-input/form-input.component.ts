import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormDefinition, FormInput } from '../../models/form.model';


@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
})
export class FormInputComponent implements OnInit {
  constructor() {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() edit: boolean;
  public attributes: FormInput;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormInput;
  }
}
