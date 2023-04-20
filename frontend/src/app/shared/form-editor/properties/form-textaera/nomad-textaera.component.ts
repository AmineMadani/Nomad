import { Component, Input, OnInit } from '@angular/core';
import { FormDefinition, FormTextaera } from '../../models/form.model';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-textaera',
  templateUrl: './form-textaera.component.html',
  styleUrls: ['./form-textaera.component.scss'],
})
export class FormTextaeraComponent implements OnInit {
  constructor() {}

  @Input() definition: FormDefinition;
  @Input() editMode: boolean;
  @Input() control: any;
  public attributes: FormTextaera;

  ngOnInit() {
    console.log(this.attributes);
    this.attributes = this.definition.attributes as FormTextaera;
  }
}
