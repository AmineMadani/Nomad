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
  constructor(private route: ActivatedRoute) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() edit: boolean;
  @Input() paramMap: Map<string, string>;

  public attributes: FormInput;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormInput;
    if (this.attributes.value) {
      this.control.setValue(this.attributes.value);
    } else {
      let paramValue = this.paramMap.get(this.definition.key);
      if (!paramValue && this.attributes.predefineValue !== undefined) {
        const match = this.getValueFromPredifineValue(
          this.attributes.predefineValue
        );
        if (match.length > 0) {
          const resultats: string[] = [];
          this.paramMap.forEach((key, value) => {
            if (match.includes(value)) {
              resultats.push(key);
            }
          });
          if (resultats.length > 0) {
            this.control.setValue(resultats.join(', '));
          } else {
            this.control.setValue(this.attributes.predefineValue);
          }
        }
      } else {
        this.control.setValue(
          paramValue ? paramValue : this.attributes.default
        );
      }
    }
    if (!this.definition.editable) {
      this.control.disable();
    }
  }

  /**
   * Parse a string of type with the pattern "{param1} {param2}" to an Array of ["param1","param2"]
   * @param inputString
   * @returns string[] with the founded values
   */
  private getValueFromPredifineValue(inputString: string): string[] {
    const pattern = /{([^}]+)}/g;
    const matches = inputString.match(pattern);
    const parsedValues = matches.map((match) =>
      match.substring(1, match.length - 1)
    );
    return parsedValues;
  }

  checkIfRuleExist(ruleKey:string): boolean {
    return this.definition.rules.some(rule => rule.key == ruleKey);
  }
}
