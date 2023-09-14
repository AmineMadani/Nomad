import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { WorkorderTaskReason, WorkorderTaskStatus } from 'src/app/core/models/workorder.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit {
  constructor(
    private drawer: DrawerService,
    private workorderService: WorkorderService
  ) {}

  @Input() tasks: any[];
  @Input() loading: boolean = false;
  @Output() public onPagination: EventEmitter<any> = new EventEmitter();
  
  public status: WorkorderTaskStatus[];
  public actions: WorkorderTaskReason[];

  ngOnInit() {
    forkJoin([
      this.workorderService.getAllWorkorderTaskStatus(),
      this.workorderService.getAllWorkorderTaskReasons()
    ]).subscribe((res: [WorkorderTaskStatus[], WorkorderTaskReason[]]) => {
      this.status = res[0];
      this.actions = res[1];
    })
  }

  public getPaginationData(e: any): void {
    this.onPagination.next(e);
  }

  public openTask(feature: any): void {
    this.drawer.navigateTo(DrawerRouteEnum.TASK_VIEW, [
      feature.wkoId,
      feature.id,
    ]);
  }

  public getStatus(id: number): string {
    const label = this.status.find((status) => status.id === id).wtsLlabel;
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  public getAction(id: number): string {
    const label = this.actions.find((status) => status.id === id).wtrLlabel;
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
