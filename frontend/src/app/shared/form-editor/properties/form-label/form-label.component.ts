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
  @Input() paramMap: Map<string, string>;
  public attributes: FormLabel;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormLabel;
    if(this.paramMap?.get(this.definition.key)) {
      this.attributes.value = this.paramMap?.get(this.definition.key);
    }
  }
}
