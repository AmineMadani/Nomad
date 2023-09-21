import { Component, Input, OnInit } from '@angular/core';
import { FormDefinition, FormSelect } from '../../models/form.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss'],
})
export class FormSelectComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() edit: boolean;
  @Input() paramMap: Map<string, string>;

  public attributes: FormSelect;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormSelect;

    if (this.attributes.value) {
      this.control.setValue(this.attributes.value);
    } else {
      this.route.queryParamMap.subscribe((params) => {
        let paramValue = params.get(this.definition.key);
        if (
          !this.attributes.options.map((val) => val.key).includes(paramValue)
        ) {
          if (this.attributes.default) {
            this.control.setValue(this.attributes.default.toString());
          } else {
            this.control.setValue('');
          }
        } else {
          this.control.setValue(paramValue);
        }
      });
    }

    if (!this.definition.editable) {
      this.control.disable();
    }
  }

  getMessageError(val: any): string {
    let error = this.definition.rules.find(
      (rule) => rule.key == val.key
    )?.message;
    return error ? error : val.value;
  }

  onSelectValue(key: string){
    if(this.attributes.multiple) {
      let values = this.control.value;
      if(values) {
        if(values.includes(key)) {
          this.control.setValue(values.filter(val => val != key));
        } else {
          values.push(key);
          this.control.setValue(values);
        }
      } else {
        this.control.setValue([key]);
      }
    } else {
      if(this.control.value == key) {
        this.control.setValue(null);
      } else {
        this.control.setValue(key);
      }
    }
  }
}
