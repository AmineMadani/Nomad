import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { filter } from 'rxjs';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-wko-creation',
  templateUrl: './wko-creation.component.html',
  styleUrls: ['./wko-creation.component.scss'],
})
export class WkoCreationComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private datePipe: DatePipe
  ) {}

  @Input() form: FormGroup;
  public params: Params;

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((p: Params) => {
      this.params = p;
    });
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
      .pipe(filter((dts: DateTime[]) => dts && dts.length === 2))
      .subscribe((result: DateTime[]) => {
        this.form.patchValue(
          {
            wkoPlanningStartDate: this.datePipe.transform(
              result[0].toJSDate(),
              'yyyy-MM-dd'
            ),
          }
        );

        this.form.patchValue(
          {
            wkoPlanningEndDate: this.datePipe.transform(
              result[1].toJSDate(),
              'yyyy-MM-dd'
            ),
          }
        );
      });
  }
}
