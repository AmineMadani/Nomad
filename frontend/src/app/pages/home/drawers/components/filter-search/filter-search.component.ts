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

  startDate: Date | undefined;
  endDate: Date | undefined;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    if(!this.startDate && this.searchFilter.data.dateKey) {
      for(let dateKey of this.searchFilter.data.dateKey) {
        const datesFilter: string[] | undefined = this.filterService.getSearchFilterValuesByLayerKeyAndProperty(this.searchFilter.tableKey,dateKey);
        if(datesFilter){
          this.startDate=new Date(datesFilter[0]);
          this.endDate=new Date(datesFilter[1]);
        }
        break;
      }
    }
  }

  customActionSheetOptions = {
    header: 'Colors',
    subHeader: 'Select your favorite color',
  };

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
        this.startDate=result[0].toJSDate();
        this.endDate=result[1].toJSDate();
        for(let dateKey of this.searchFilter.data.dateKey!) {
          let dates:string[] = [];
          let dateNone = 0;
          if(this.startDate){
            dates.push(this.datePipe.transform(this.startDate,"yyyy-MM-dd")!);
          } else {
            dates.push('none');
            dateNone++;
          }
          if(this.endDate){
            dates.push(this.datePipe.transform(this.endDate,"yyyy-MM-dd")!);
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
      return 'Du '+this.datePipe.transform(this.startDate,"dd/MM/yyyy")+' au '+this.datePipe.transform(this.endDate,"dd/MM/yyyy");
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

  getValues(key: string){
    return this.filterService.getSearchFilterValuesByLayerKeyAndProperty(this.searchFilter.tableKey,key);
  }
}

