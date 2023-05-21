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
  @Input() edit: boolean;
  @Input() control: any;
  public attributes: FormTextaera;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormTextaera;
  }
}
