import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonModal } from '@ionic/angular';
import { from, switchMap } from 'rxjs';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-wko-referential',
  templateUrl: './wko-referential.component.html',
  styleUrls: ['./wko-referential.component.scss'],
})
export class WkoReferentialComponent implements OnInit {
  constructor(
    private referentialService: ReferentialService,
    private utils: UtilsService
  ) {}

  @ViewChild('modalReferential', { static: true }) modalReferential: IonModal;

  @Input() public key: string;
  @Input() public repository: string;
  @Input() public repositoryKey: string;
  @Input() public repositoryValue: string;
  @Input() public label: string;
  @Input() public control: any;
  @Input() public paramMap: Params;
  @Input() public filters: string[];

  public value: string;
  public disabled: boolean = false;

  public originalOptions: any[] = [];
  public displayOptions: any[] = [];
  public querySearch: string;
  public valueKey: string;

  public valueLabel: string = '';

  ngOnInit(): void {
    from(this.referentialService.getReferential(this.repository)).subscribe(
      (res) => {
        this.originalOptions = res.sort((a, b) =>
          a[this.repositoryValue].localeCompare(b[this.repositoryValue])
        );
        this.valueLabel = this.getValueLabel();
        if (this.control.value && this.control.value.length > 0) {
          this.disabled = true;
        }
      }
    );
  }

  public onOpenModal(): void {
    if(!this.disabled) {
      this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
      this.modalReferential.present();
    }
  }

  public dismiss(): void {
    this;
  }

  public getValueLabel(): string {
    // In this code block, the paramMap is checked for a single value of the current definition.key.
    // If found, the code looks for a matching object in the filtered options and updates the control value accordingly.
    // If not found, it returns the repositoryValue based on the control value.
    // If the paramMap has multiple values, the code directly returns the corresponding repositoryValue based on the control value.
    if (this.paramMap[this.key]?.toString().split(',').length == 1) {
      const obj = this.getFilterOptions(this.querySearch).find(
        (val) => val[this.repositoryKey].toString() == this.paramMap[this.key]
      );
      if (obj) {
        this.valueKey = obj[this.repositoryKey]?.toString();
        this.control.setValue(this.valueKey);
        return obj[this.repositoryValue];
      } else {
        if (this.control.value && this.control.value != '') {
          const obj = this.originalOptions.find(
            (val) => val[this.repositoryKey].toString() == this.control.value
          );
          return obj ? obj[this.repositoryValue] : '';
        }
      }
    } else {
      if (this.control?.value && this.control.value != '') {
        const obj = this.originalOptions.find(
          (val) => val[this.repositoryKey].toString() == this.control.value
        );
        return obj ? obj[this.repositoryValue] : '';
      }
    }
    return '';
  }

  public getFilterOptions(query): any[] {
    let preSelectId = [];
    if (this.paramMap[this.key]?.toString().split(',').length > 1) {
      preSelectId = this.paramMap[this.key]?.split(',');
    }
    if (this.filters) {
      for (let filter of this.filters) {
        if (this.paramMap[filter]) {
          let options = this.originalOptions?.filter(
            (option) =>
              (new RegExp(query, 'gi').test(option[this.repositoryValue]) &&
                (option[filter] ? option[filter] : 'xy') ==
                  this.paramMap[filter]) ||
              this.paramMap[this.key] == option[this.key] ||
              this.value == option[this.key]
          );
          if (preSelectId.length > 0) {
            options = options.filter((option) =>
              preSelectId.includes(option[this.key].toString())
            );
          }
          return options;
        }
      }
    }
    let options = this.originalOptions.filter((s) =>
      new RegExp(query, 'gi').test(s[this.repositoryValue])
    );
    if (preSelectId.length > 0) {
      options = options.filter((option) =>
        preSelectId.includes(option[this.key].toString())
      );
    }
    if(this.repository == 'v_layer_wtr') {
      options = this.utils.removeDuplicatesFromArr(options, this.repositoryKey);
    }
    return options;
  }

  public onHandleInput(event): void {
    this.querySearch = event.target.value.toLowerCase();
    this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
  }

  public onRadioChange(event): void {
    const obj = this.originalOptions.find(
      (val) => val[this.repositoryKey].toString() == event.detail.value
    );
    this.valueKey = obj[this.repositoryKey].toString();
    this.control.setValue(this.valueKey);
    if (this.paramMap[this.key]?.toString().split(',').length < 1) {
      this.paramMap[this.key] = this.control.value;
    }
    this.valueLabel = this.getValueLabel();
  }

  public onIonInfinite(e) {
    this.displayOptions = [
      ...this.displayOptions,
      ...this.getFilterOptions(this.querySearch).slice(
        this.displayOptions.length,
        this.displayOptions.length + 50
      ),
    ];
    (e as InfiniteScrollCustomEvent).target.complete();
  }
}
