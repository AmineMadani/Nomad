import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { filter } from 'rxjs/internal/operators/filter';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { SearchData } from 'src/app/core/models/filter/filter-component-models/SearchFilter.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DialogService } from 'src/app/core/services/dialog.service';

@Component({
  selector: 'app-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss'],
})
export class FilterSearchComponent implements OnInit {
  constructor(
    private dialogService: DialogService,
    private utils: UtilsService
  ) {}

  @Input() data: SearchData[];
  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  public openCalendar(): void {
    this.dialogService
      .open(DatepickerComponent, {
        backdrop: false,
      })
      .afterClosed()
      .pipe(filter((dts: DateTime[]) => dts && dts.length === 2))
      .subscribe((result: DateTime[]) => {
        console.log(result);
      });
  }
}
