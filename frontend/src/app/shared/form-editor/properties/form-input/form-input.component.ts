import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormDefinition, FormInput } from '../../models/form.model';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
})
export class FormInputComponent implements OnInit {

  constructor(
    private route: ActivatedRoute
  ) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() edit: boolean;
  public attributes: FormInput;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormInput;
    if(this.attributes.value) {
      this.control.setValue(this.attributes.value);
    } else {
      this.route.queryParamMap.subscribe(params => {
        let paramValue =  params.get(this.definition.key);
        this.control.setValue(paramValue ? paramValue : this.attributes.default);
      });
    }

    if(!this.definition.editable) {
      this.control.disable();
    }
  }
}
