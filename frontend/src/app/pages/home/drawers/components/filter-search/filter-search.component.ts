import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { filter } from 'rxjs/internal/operators/filter';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { SearchFilter } from 'src/app/core/models/filter/filter-component-models/SearchFilter.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { FilterService } from '../filter.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss'],
})
export class FilterSearchComponent implements OnInit {
  constructor(
    private dialogService: DialogService,
    private utils: UtilsService,
    private filterService: FilterService,
    private datePipe: DatePipe
  ) {}

  @Input() searchFilter: SearchFilter;
  public isMobile: boolean;

  startDate: DateTime | undefined;
  endDate: DateTime | undefined;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  public openCalendar(): void {
    this.dialogService.close();
    this.dialogService
      .open(DatepickerComponent, {
        backdrop: false,
        data: {
          multiple: true
        }
      })
      .afterClosed()
      .pipe(filter((dts: DateTime[]) => dts && (dts.length === 2 || dts.length === 1)))
      .subscribe((result: DateTime[]) => {
        this.startDate=result[0];
        this.endDate=result[1];
        for(let dateKey of this.searchFilter.data.dateKey!) {
          let dates:string[] = [];
          let dateNone = 0;
          if(this.startDate){
            dates.push(this.datePipe.transform(this.startDate.toJSDate(),"yyyy-MM-dd")!);
          } else {
            dates.push('none');
            dateNone++;
          }
          if(this.endDate){
            dates.push(this.datePipe.transform(this.endDate.toJSDate(),"yyyy-MM-dd")!);
          } else {
            dates.push('none');
            dateNone++;
          }
          if(dateNone == 2) dates = [];
          this.filterService.setSearchFilter(this.searchFilter.tableKey, dateKey, dates);
        }        
      });
  }

  changeSelectData(event: Event, key: string) {
    this.filterService.setSearchFilter(this.searchFilter.tableKey, key, (event as CustomEvent).detail.value);
  }

  getDateLibelle(){
    if(this.startDate && this.endDate) {
      return 'Du '+this.datePipe.transform(this.startDate.toJSDate(),"dd/MM/yyyy")+' au '+this.datePipe.transform(this.endDate.toJSDate(),"dd/MM/yyyy");
    } else {
      return 'Sélectionner plages de dates';
    }
  }

  onClearDate(){
    this.startDate=undefined;
    this.endDate=undefined;
    for(let dateKey of this.searchFilter.data.dateKey!) {
      this.filterService.setSearchFilter(this.searchFilter.tableKey, dateKey, []);
    }
  }
}
