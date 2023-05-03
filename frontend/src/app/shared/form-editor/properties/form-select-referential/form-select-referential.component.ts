import { Component, Input, OnInit } from '@angular/core';
import { FormDefinition, FormSelect, FormSelectReferential } from '../../models/form.model';
import { ActivatedRoute } from '@angular/router';
import { ReferentialDataService } from 'src/app/core/services/dataservices/referential.dataservice';
import { filter } from 'jszip';

@Component({
  selector: 'app-form-select-referential',
  templateUrl: './form-select-referential.component.html',
  styleUrls: ['./form-select-referential.component.scss'],
})
export class FormSelectReferentialComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private referentialDataService: ReferentialDataService
  ) { }

  @Input() definition: FormDefinition;
  @Input() control: any;
  public attributes: FormSelectReferential;
  public options: any[];

  ngOnInit() {
    this.attributes = this.definition.attributes as FormSelectReferential;
    this.referentialDataService.getReferential(this.attributes.repository).subscribe(res => {
      this.options = res;

      this.route.queryParamMap.subscribe(params => {
        let paramValue = params.get(this.definition.key);

        if (this.attributes.filters) {
          for (let filter of this.attributes.filters) {
            if (params.get(filter)) {
              this.options = this.options.filter(option => option[filter] == params.get(filter));
            }
          }
        }

        if (this.attributes.value) {
          this.control.setValue(this.attributes.value);
        } else {
          if (!this.options.map(val => val[this.attributes.repositoryKey]).includes(paramValue)) {
            this.control.setValue("");
          } else {
            this.control.setValue(paramValue);
          }
        }

        if (!this.definition.editable && this.control.value && this.control.value.length > 0) {
          this.control.disable();
        }
      });
    })
  }
}
