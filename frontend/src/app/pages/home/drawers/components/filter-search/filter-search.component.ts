import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { filter } from 'rxjs/internal/operators/filter';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { SearchFilter, Widget } from 'src/app/core/models/filter/filter-component-models/SearchFilter.model';
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

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  customActionSheetOptions = {
    header: 'Colors',
    subHeader: 'Select your favorite color',
  };

  public openCalendar(widget: Widget): void {
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
        for(let dateKey of widget.key) {
          let dates:string[] = [];
          let dateNone = 0;
          if(result[0]){
            dates.push(this.datePipe.transform(result[0].toJSDate(),"yyyy-MM-dd")!);
          } else {
            dates.push('none');
            dateNone++;
          }
          if(result[1]){
            dates.push(this.datePipe.transform(result[1].toJSDate(),"yyyy-MM-dd")!);
          } else {
            dates.push('none');
            dateNone++;
          }
          if(dateNone == 2) dates = [];
          this.filterService.setSearchFilter(this.searchFilter.tableKey, dateKey, dates);
        }      
      });
  }

  changeSelectData(event: Event, widget: Widget) {
    if(widget.multiple) {
      this.filterService.setSearchFilter(this.searchFilter.tableKey, widget.key[0], (event as CustomEvent).detail.value);
    } else {
      this.filterService.setSearchFilter(this.searchFilter.tableKey, widget.key[0], [(event as CustomEvent).detail.value]);
    }
  }

  getDateLibelle(widget: Widget){
    let label:string = widget.label;
    const res:string[]|undefined = this.filterService.getSearchFilterValuesByLayerKeyAndProperty(this.searchFilter.tableKey,widget.key[0]);
    if(res &&  res.length == 2) {
      label = 'Du '+this.datePipe.transform(res[0],"dd/MM/yyyy")+' au '+this.datePipe.transform(res[1],"dd/MM/yyyy");
    }
    return label;
  }

  onClearDate(){
    for(let dateKey of this.searchFilter.data.dateKey!) {
      this.filterService.setSearchFilter(this.searchFilter.tableKey, dateKey, []);
    }
  }

  getValues(key: string){
    return this.filterService.getSearchFilterValuesByLayerKeyAndProperty(this.searchFilter.tableKey,key);
  }
}

