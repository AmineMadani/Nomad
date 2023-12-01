import { Component, Input, OnInit } from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { FormDefinition } from '../../models/form.model';
import { Workorder, WorkorderTaskReason, WorkorderTaskStatus } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';

@Component({
  selector: 'app-form-history',
  templateUrl: './form-history.component.html',
  styleUrls: ['./form-history.component.scss'],
})
export class FormHistoryComponent implements OnInit {
  constructor(
    private drawer: DrawerService,
    private workorderService: WorkorderService
  ) {}

  @Input() definition: FormDefinition;
  @Input() paramMap: Map<string, string>;

  public workorders: any[];
  public isLoading: boolean;

  private statusRef: WorkorderTaskStatus[];
  private reasonRef: WorkorderTaskReason[];

  ngOnInit() {
    this.isLoading = true;

    Promise.all([
      this.workorderService.getEquipmentWorkOrderHistory(`${this.paramMap.get('lyrTableName')}`, this.paramMap.get('id')),
      this.workorderService.getAllWorkorderTaskStatus(),
      this.workorderService.getAllWorkorderTaskReasons(),
    ]).then((results) => {
      this.statusRef = results[1];
      this.reasonRef = results[2];
      this.workorders = (results[0] as any).map((wk) => {
        /* In the code, `wk` is a variable used in the `map` function to iterate over each element in
        the `workorders` array. It represents an individual `Workorder` object in the array. */
        wk.status = this.statusRef.find((status) => status.id === wk.wtsId);
        wk.wtrLabel = this.reasonRef.find(
          (reason: { id: number; }) => reason.id === wk.tasks[0].wtrId
        )?.wtrLlabel;
        return wk;
      });
      this.isLoading = false;
    });
  }

  /**
   * To open an intervention when clicked
   * @param workorder workorder clicked
   */
  public onWKOClick(workorder: Workorder) {
    this.drawer.navigateTo(DrawerRouteEnum.WORKORDER_VIEW, [workorder.id]);
  }
}
