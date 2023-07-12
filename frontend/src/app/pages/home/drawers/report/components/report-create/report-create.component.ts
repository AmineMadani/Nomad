import { Component, Input, OnInit } from '@angular/core';
import { CustomTask, CustomWorkOrder } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { ExploitationService } from 'src/app/core/services/exploitation.service';
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
    private exploitationService: ExploitationService 
  ) { }

  @Input() workorder: CustomWorkOrder;

  public isMobile: boolean;
  public step: number = 1;
  public selectedTask: CustomTask;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
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
    if (this.step <= 3) {
      this.step++;
      this.onSaveWorkOrderState();
    }
  }

  onBack() {
    if (this.step >= 2) {
      this.step--;
    }
  }

  onSelectedTaskChange(task: CustomTask){
    this.selectedTask=task;
  }

  onSaveWorkOrderState() {
    this.exploitationService.saveStateWorkorder(this.workorder);
  }
}
