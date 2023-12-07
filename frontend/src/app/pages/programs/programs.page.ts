import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { MapService } from 'src/app/core/services/map/map.service';
import { takeUntil, Subject } from 'rxjs';
import {
  PROGRAM_COLUMNS,
  PROGRAM_TEST_DATA,
  Program,
} from 'src/app/core/models/program.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { TableService } from 'src/app/core/services/table.service';
import { TableRow } from 'src/app/core/models/table/column.model';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.page.html',
  styleUrls: ['./programs.page.scss'],
})
export class ProgramsPage implements OnInit, OnDestroy {
  constructor(
    private mapService: MapService,
    private tableService: TableService
  ) {}

  public mapHidden: boolean;

  public columns = PROGRAM_COLUMNS;
  public data: TableRow<Program>[] = [];

  public toolbar: TableToolbar = {
    title: 'Liste des programmes',
    buttons: [
      {
        name: 'create',
        onClick: () => {
          return;
        },
        disableFunction: () => {
          return false;
        },
        tooltip: 'Créer un programme'
      },
      {
        name: 'copy',
        onClick: () => {
          return;
        },
        disableFunction: () => {
          return false;
        },
        tooltip: 'Copier un programme'
      },
      {
        name: 'trash',
        onClick: () => {
          return;
        },
        disableFunction: () => {
          return false;
        },
        tooltip: 'Supprimer un programme'
      },
    ],
  };

  public rows;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.mapService
      .onMapLoaded('program')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(async () => {
        // Mocked data, will be an API
        this.data =
          this.tableService.createReadOnlyRowsFromObjects(PROGRAM_TEST_DATA);
      });
  }

  ngOnDestroy(): void {
    this.mapService.ngOnDestroy();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public showMap(): void {
    this.mapHidden = false;
  }

  public onHideMap(): void {
    this.mapHidden = true;
  }
}
