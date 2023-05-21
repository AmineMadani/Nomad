import { Component, Input, OnInit } from '@angular/core';
import { FormDatePicker, FormDefinition } from '../../models/form.model';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-form-datepicker',
  templateUrl: './form-datepicker.component.html',
  styleUrls: ['./form-datepicker.component.scss'],
})
export class FormDatepickerComponent implements OnInit {

  constructor(
    private dialogService: DialogService,
    private datePipe: DatePipe
  ) { }

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() edit: boolean;
  @Input() paramMap: Map<string, string>;

  public attributes: FormDatePicker;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormDatePicker;
    if(this.paramMap?.get(this.definition.key)) {
      this.control.setValue(this.datePipe.transform(this.paramMap?.get(this.definition.key),this.attributes.dateformat));
      this.attributes.value = this.datePipe.transform(this.paramMap?.get(this.definition.key),this.attributes.dateformat);
    }
  }

  openCalendar() {
    this.dialogService.close();
    this.dialogService
      .open(DatepickerComponent, {
        backdrop: false,
        data: {
          multiple: false
        }
      })
      .afterClosed()
      .pipe(filter((dts: DateTime[]) => dts && (dts.length === 2 || dts.length === 1)))
      .subscribe((result: DateTime[]) => {
        this.control.touched = true;
        if(result[0]) {
          this.control.setValue(this.datePipe.transform(result[0].toJSDate(),this.attributes.dateformat));
        }
      });
  }

  getMessageError(val: any):string{
    let error = this.definition.rules.find(rule => rule.key == val.key)?.message;
    return error ? error : val.value;
  }

}
