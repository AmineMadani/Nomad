import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormDefinition, FormSelectReferential } from '../../models/form.model';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-form-select-referential',
  templateUrl: './form-select-referential.component.html',
  styleUrls: ['./form-select-referential.component.scss'],
})
export class FormSelectReferentialComponent implements OnInit {
  constructor(
    private referentialService: ReferentialService
  ) { }

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() paramMap: Map<string, string>;
  @Input() edit: boolean;

  public attributes: FormSelectReferential;
  public originalOptions: any[] = [];
  public displayOptions: any[] = [];
  public querySearch: string = "";
  public valueLabel: string;
  public valueKey: string;
  public disabled: boolean; false;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormSelectReferential;
    this.referentialService.getReferential(this.attributes.repository).then(res => {
      this.originalOptions = res.sort((a, b) => a[this.attributes.repositoryValue].localeCompare(b[this.attributes.repositoryValue]));

      let paramValue = this.paramMap.get(this.definition.key);

      if (this.attributes.value) {
        this.control.setValue(this.attributes.value);
        const obj = this.originalOptions.find(val => val[this.attributes.repositoryKey].toString() == paramValue);
        this.valueLabel = obj[this.attributes.repositoryValue];
        this.valueKey = obj[this.attributes.repositoryKey].toString();
      } else {
        if (!this.getFilterOptions(this.querySearch)?.map(val => val[this.attributes.repositoryKey].toString()).includes(paramValue)) {
          this.control.setValue("");
          this.valueLabel = "";
          this.valueKey = "";
        } else {
          this.control.setValue(paramValue);
          const obj = this.originalOptions.find(val => val[this.attributes.repositoryKey].toString() == paramValue);
          this.valueLabel = obj[this.attributes.repositoryValue];
          this.valueKey = obj[this.attributes.repositoryKey].toString();
        }
      }

      if (!this.definition.editable && this.control.value && this.control.value.length > 0) {
        this.disabled = true;
      }

      this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
    });
  }

  getFilterOptions(query): any[] {
    if (this.attributes.filters) {
      for (let filter of this.attributes.filters) {
        if (this.paramMap.get(filter)) {
          return this.originalOptions?.filter(option => option[this.attributes.repositoryValue].toLowerCase().indexOf(query) > -1 && (option[filter] == this.paramMap.get(filter) || this.paramMap.get(this.definition.key) == option[this.definition.key] || this.attributes.value == option[this.definition.key]));
        }
      }
    }
    return this.originalOptions.filter(option => option[this.attributes.repositoryValue].toLowerCase().indexOf(query) > -1);
  }

  onUpdateParam() {
    this.paramMap.set(this.definition.key, this.control.value);
  }

  onIonInfinite(e) {
    this.displayOptions = [...this.displayOptions, ...this.getFilterOptions(this.querySearch).slice(this.displayOptions.length, this.displayOptions.length + 50)];
    (e as InfiniteScrollCustomEvent).target.complete();
  }

  onHandleInput(event) {
    this.querySearch = event.target.value.toLowerCase();
    this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
  }

  onRadioChange(event) {
    const obj = this.originalOptions.find(val => val[this.attributes.repositoryKey].toString() == event.detail.value);
    this.valueLabel = obj[this.attributes.repositoryValue];
    this.valueKey = obj[this.attributes.repositoryKey].toString();
    this.control.setValue(this.valueKey);
  }
}
