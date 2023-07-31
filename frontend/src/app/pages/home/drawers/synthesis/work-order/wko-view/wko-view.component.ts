import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CacheService } from 'src/app/core/services/cache.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-wko-view',
  templateUrl: './wko-view.component.html',
  styleUrls: ['./wko-view.component.scss'],
})
export class WkoViewComponent implements OnInit {
  constructor(
    private referentialService: ReferentialService, 
    private utils: UtilsService,
  ) {}

  @Input() workOrder: any;

  public assetLabel: string;
  public status: string;
  public reason: string;

  ngOnInit() {
    Promise.all([
      this.referentialService.getReferential('workorder_task_status'),
      this.referentialService.getReferential('workorder_task_reason'),
      this.referentialService.getReferential('asset'),
    ]).then((res) => {
      this.status = res[0]
        .find(
          (refStatus) =>
            refStatus.id.toString() === this.workOrder.wts_id.toString()
        )
        .wts_llabel;
      this.status = this.status.charAt(0).toUpperCase() + this.status.slice(1);
      this.reason = res[1].find(
        (refReason) =>
          refReason.id.toString() === this.workOrder.wtr_id.toString()
      ).wtr_llabel;
      this.assetLabel = this.utils.simplifyAssetLabel(
        res[2].find(
          (refAsset) =>
            refAsset.id.toString() === this.workOrder.ass_id.toString()
        )?.ass_obj_table
      );
    });
  }
}
