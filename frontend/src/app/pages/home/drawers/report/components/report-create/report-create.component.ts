import { Component, Input, OnInit } from '@angular/core';
import { CustomTask, CustomWorkOrder } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-report-create',
  templateUrl: './report-create.component.html',
  styleUrls: ['./report-create.component.scss'],
})
export class ReportCreateComponent implements OnInit {

  constructor(
    private drawerService: DrawerService,
    private utils: UtilsService,
    private referentialService: ReferentialService
  ) { }

  @Input() workorder:CustomWorkOrder;

  public isMobile: boolean;
  public step: number = 1;
  public currentTaskOpen: CustomTask;
  public currentTaskSelected: CustomTask;

  private refLayers: any[];

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    this.referentialService.getReferential('layers').then(layers => {
      this.refLayers = layers;
    })
  }

  /**
   * Get the title
   * @returns Formatted title
   */
  public getTitle(): string {
    let val = "Validation l'élément du patrimoine";
    return val;
  }

  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  onClose() {
    this.drawerService.closeDrawer();
  }

  onNext() {
    if(this.step <= 3){
      this.step++;
    }
  }

  onBack() {
    if(this.step >= 2){
      this.step--
    }
  }

  public onOpenAccordion(data: CustomTask): void {
    if (this.currentTaskOpen === data) {
      this.currentTaskOpen = undefined;
    } else {
      this.currentTaskOpen = data;
    }
    console.log(this.currentTaskOpen)
  }

  public onSelectTask(e: Event, task: CustomTask) {
    if(this.currentTaskSelected && this.currentTaskSelected.id == task.id) {
      this.currentTaskSelected = null;
    } else {
      this.currentTaskSelected = task;
    }
    console.log(this.currentTaskSelected);
  }

  public getLyrLabel(layerKey: string): string {
    if(this.refLayers) {
      return this.refLayers.find(ref => ref.lyrTableName == layerKey).lyrSlabel;
    } else {
      return layerKey;
    }
  }

}
