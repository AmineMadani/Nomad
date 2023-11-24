import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';
import { Task, Workorder } from 'src/app/core/models/workorder.model';
import { DialogService } from 'src/app/core/services/dialog.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { DateValidator } from 'src/app/shared/form-editor/validators/date.validator';

@Component({
  selector: 'app-report-date',
  templateUrl: './report-date.component.html',
  styleUrls: ['./report-date.component.scss'],
})
export class ReportDateComponent implements OnInit {

  constructor(
    private dialogService: DialogService,
    private datePipe: DatePipe,
    private utils: UtilsService
  ) { }

  @Input() workorder: Workorder;
  @Input() selectedTasks: Task[];

  @Output() onClosedWko: EventEmitter<boolean> = new EventEmitter();

  public dateForm: FormGroup;
  public isMobile: boolean = false;

  public lockButtons: boolean;

  private currentDateValue: string;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    this.dateForm = new FormGroup({
      realisationStartDate: new FormControl(null, Validators.compose([DateValidator.isDateValid])),
      realisationEndDate: new FormControl(this.datePipe.transform(new Date(), 'dd/MM/yyyy'), Validators.compose([Validators.required, DateValidator.isDateValid]))
    });
    this.dateForm.addValidators(DateValidator.compareDateValidator('realisationStartDate', 'realisationEndDate'));
  }

  public openCalendar(): void {
    this.dialogService
      .open(DatepickerComponent, {
        backdrop: false,
        data: {
          multiple: true,
        },
      })
      .afterClosed()
      .pipe(
        filter(
          (dts: DateTime[]) => dts && (dts.length === 1 || dts.length === 2)
        )
      )
      .subscribe((result: DateTime[]) => {
        if (result.length == 1) {
          this.dateForm.get('realisationEndDate').setValue(this.datePipe.transform(result[0].toJSDate(), 'dd/MM/yyyy'));
        } else {
          this.dateForm.patchValue({
            realisationStartDate: this.datePipe.transform(result[0].toJSDate(), 'dd/MM/yyyy'),
            realisationEndDate: this.datePipe.transform(result[1].toJSDate(), 'dd/MM/yyyy')
          })
        }
      });
  }

  /**
   * manage keydown event on date input
   * prevent non numeric input
   * @param event
   */
  public onDateKeyDown(event: any) {
    this.currentDateValue = event.target.value;
    if (!DateValidator.isKeyValid(event, this.currentDateValue)) {
      event.preventDefault();
    }
  }

  /**
   * manage keyup event on date input
   * post treatment for date format
   * @param event
   */
  public onDateKeyUp(event: any) {
    event.target.value = DateValidator.formatDate(event, this.currentDateValue);
  }

  public disableForm(): void {
    this.dateForm.get('realisationStartDate').disable();
    this.dateForm.get('realisationEndDate').disable();
    this.lockButtons = true;
  }

  public onConfirmDate() {
    this.disableForm();
    this.dateForm.markAsTouched();
    if (!this.dateForm.invalid) {
      if (this.dateForm.controls["realisationStartDate"].value) {
        this.workorder.wkoCompletionStartDate = DateTime.fromFormat(this.dateForm.controls["realisationStartDate"].value, "dd/MM/yyyy").toJSDate();
      }
      this.workorder.wkoCompletionEndDate = DateTime.fromFormat(this.dateForm.controls["realisationEndDate"].value, "dd/MM/yyyy").toJSDate();
      for (let task of this.selectedTasks) {
        task.tskCompletionStartDate = this.workorder.wkoCompletionStartDate;
        task.tskCompletionEndDate = this.workorder.wkoCompletionEndDate;
      }

      this.onClosedWko.emit(true);
    }
  }
}
