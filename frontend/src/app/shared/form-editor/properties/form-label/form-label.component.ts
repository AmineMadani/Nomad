import { Component, OnInit, Input } from '@angular/core';
import { FormDefinition, FormLabel } from '../../models/form.model';

@Component({
  selector: 'app-form-label',
  templateUrl: './form-label.component.html',
  styleUrls: ['./form-label.component.scss'],
})
export class FormLabelComponent implements OnInit {
  constructor() {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  public attributes: FormLabel;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormLabel;
  }
}
