import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { DateTime, Interval } from 'luxon';
import { DialogRef, DIALOG_DATA } from 'src/app/core/services/dialog.service';
import { Year, Month, Day } from './datepicker.interface';
import { UtilsService } from 'src/app/core/services/utils.service';

const MAX_DAYS = 42;

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class DatepickerComponent implements OnInit {
  constructor(
    private utils: UtilsService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) private data: { multiple: boolean }
  ) {}

  public year: number;
  public daysOfWeek: string[] = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  public calendar: Map<number, Year> = new Map();
  public selectedDates: Set<Day> = new Set();

  public datesBetween: number[] = [];
  public datesHovered: number[] = [];

  public isMobile: boolean = false;
  public isMultiple: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    this.isMultiple = this.data?.multiple ?? true;
    this.year = DateTime.local().year;
    this.generateCalendar(this.year);
    setTimeout(() => {
      document
        .getElementById(DateTime.local().toFormat('yyyyMMMM'))
        ?.scrollIntoView({ behavior: 'auto' });
    }, 100);
  }

  public changeYear(change: number): void {
    this.year += change;
    if (!this.calendar.has(this.year)) {
      this.generateCalendar(this.year);
    }
  }

  public close(): void {
    this.dialogRef.close();
  }

  public validate(): void {
    this.dialogRef.close([...this.selectedDates].map((d: Day) => d.date));
  }

  public reset(): void {
    this.selectedDates.clear();
    this.datesBetween = [];
  }

  public generateCalendar(year: number): void {
    const y: Year = {
      year: year,
      months: [],
    };
    const days: Day[] = new Array(MAX_DAYS);
    let dayIndex: number = 0;

    const beginningMonth: number = 1;
      //year === DateTime.local().year ? DateTime.local().month : 1;

    for (let i = beginningMonth; i <= 12; i++) {
      const month: Month = { name: '', days: [] };
      const startDate: DateTime = DateTime.local(year, i, 1);
      const endDate: DateTime = startDate.endOf('month');
      const firstDayOfWeek: number = startDate.weekday;
      const prevMonthEndDate: DateTime = startDate.minus({ days: 1 });
      const nextMonthStartDate: DateTime = endDate.plus({ days: 1 });
      const prevMonthDaysToAdd: number = firstDayOfWeek - 1;
      const nextMonthDaysToAdd: number =
        MAX_DAYS - (endDate.day + firstDayOfWeek - 1);

      for (let j = 0; j < prevMonthDaysToAdd; j++) {
        const prevDay: DateTime = prevMonthEndDate.set({
          day: prevMonthEndDate.day - (prevMonthDaysToAdd - j - 1),
        });
        days[dayIndex++] = {
          number: prevDay.day,
          isCurrentMonth: false,
          isToday: false,
          dayOfWeek: prevDay.weekday,
          date: prevDay,
        };
      }

      for (let j = 1; j <= endDate.day; j++) {
        const day: DateTime = startDate.set({ day: j });
        days[dayIndex++] = {
          number: day.day,
          isCurrentMonth: true,
          isToday: day.hasSame(DateTime.local(), 'day'),
          dayOfWeek: day.weekday,
          date: day,
        };
      }

      for (let j = 0; j < nextMonthDaysToAdd; j++) {
        const nextDay: DateTime = nextMonthStartDate.set({
          day: nextMonthStartDate.day + j,
        });
        days[dayIndex++] = {
          number: nextDay.day,
          isCurrentMonth: false,
          isToday: false,
          dayOfWeek: nextDay.weekday,
          date: nextDay,
        };
      }

      month.name = startDate.toFormat('MMMM');
      month.days = days.slice(0, MAX_DAYS);
      dayIndex = 0;
      y.months.push(month);
    }
    this.calendar.set(year, y);
  }

  public onDayClicked(day: Day) {
    if (this.isMultiple) {
      if (this.selectedDates.has(day)) {
        this.selectedDates.delete(day);
      } else if (this.selectedDates.size === 2) {
        this.selectedDates.clear();
        this.selectedDates.add(day);
      } else if (day.date < [...this.selectedDates][0]?.date) {
        const lastDay: Day = [...this.selectedDates][0];
        this.selectedDates.delete(lastDay);
        this.selectedDates.add(day);
      } else {
        this.selectedDates.add(day);
      }

      if (this.selectedDates.size === 2) {
        this.datesBetween = Interval.fromDateTimes(
          [...this.selectedDates][0].date,
          [...this.selectedDates][1].date
        )
          .splitBy({ days: 1 })
          .map((i: Interval) => + i?.start);
        this.datesBetween.push(+[...this.selectedDates][1].date);
        this.datesHovered = [];
      } else {
        this.datesBetween = [];
      }
    } else {
      this.selectedDates.clear();
      this.selectedDates.add(day);
    }
  }

  public setHover(day: Day): void {
    if (this.selectedDates.size === 1 && this.isMultiple) {
      this.datesHovered = Interval.fromDateTimes(
        [...this.selectedDates][0].date,
        day.date
      )
        .splitBy({ days: 1 })
        .map((i: Interval) => +i.start);
      this.datesHovered.push(+day.date);
    }
  }

  public removeHover(day: Day) {
    if (this.datesHovered.length > 0) {
      this.datesHovered = [];
    }
  }
}
