import { Component, Input, OnInit } from '@angular/core';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { FormDefinition } from '../../models/form.model';
import { Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { ReferentialService } from 'src/app/core/services/referential.service';

@Component({
  selector: 'app-form-history',
  templateUrl: './form-history.component.html',
  styleUrls: ['./form-history.component.scss'],
})
export class FormHistoryComponent implements OnInit {
  constructor(
    private drawer: DrawerService,
    private referentialService: ReferentialService,
    private workorderService: WorkorderService
  ) {}

  @Input() definition: FormDefinition;
  @Input() paramMap: Map<string, string>;

  public workorders: any[];
  public isLoading: boolean;

  private statusRef: any;
  private reasonRef: any;

  ngOnInit() {
    this.isLoading = true;

    this.workorderService
      .getEquipmentWorkOrderHistory(
        `asset.${this.paramMap.get('lyr_table_name')}`,
        this.paramMap.get('id')
      )
      .pipe(
        switchMap((wks: Workorder[]) => {
          this.workorders = wks;
          return forkJoin([
            this.referentialService.getReferential('workorder_task_status'),
            this.referentialService.getReferential('workorder_task_reason'),
          ]);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((refs: any[][]) => {
        // Saved for future implementation of pagination
        this.statusRef = refs[0];
        this.reasonRef = refs[1];

        this.workorders.map((wk) => {
          /* In the code, `wk` is a variable used in the `map` function to iterate over each element in
          the `workorders` array. It represents an individual `Workorder` object in the array. */
          wk.status = this.statusRef.find((status) => status.id === wk.wtsId);
          wk.wtrLabel = this.reasonRef.find(
            (reason: { id: number; }) => reason.id === wk.wtsId
          )?.wtr_llabel;
          return wk;
        });
      });
  }

  /**
   * To open an intervention when clicked
   * @param workorder workorder clicked
   */
  public onWKOClick(workorder: Workorder) {
    const feature = MapFeature.from(workorder);
    this.openIntervention(feature);
  }

  /**
   * Open the selected intervention
   * @param feature selected intervention
   */
  public openIntervention(feature: MapFeature): void {
    this.drawer.navigateTo(DrawerRouteEnum.WORKORDER, [feature.id], {
      lyr_table_name: 'workorder',
      ...feature,
    });
  }

  public openReport(w: Workorder): void {
    // To do in a following US
  }
}
