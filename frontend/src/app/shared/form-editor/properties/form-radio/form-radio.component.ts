import { Component, Input, OnInit } from '@angular/core';
import { FormDefinition, FormSelect } from '../../models/form.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-radio',
  templateUrl: './form-radio.component.html',
  styleUrls: ['./form-radio.component.scss'],
})
export class FormRadioComponent implements OnInit {
  constructor(
    private route: ActivatedRoute
  ) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() editMode: boolean;
  public attributes: FormSelect;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormSelect;
    if(this.attributes.value) {
      this.control.setValue(this.attributes.value);
    } else {
      this.route.queryParamMap.subscribe(params => {
        let paramValue =  params.get(this.definition.key);
        this.control.setValue(paramValue ? paramValue : this.attributes.default);
        this.attributes.value = paramValue ? paramValue : this.attributes.default;
      });
    }

    if(!this.definition.editable) {
      this.control.disable();
    }
  }
}
