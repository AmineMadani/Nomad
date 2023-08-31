import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonPopover } from '@ionic/angular';
import { MapService } from 'src/app/core/services/map/map.service';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit {
  constructor(
    private mapService: MapService
  ) { }

  @ViewChild('toolbox', { static: true }) toolboxPopover: IonPopover;

  @Input() currentRoute: DrawerRouteEnum;
  @Output() selectedActionEvent: EventEmitter<DrawerRouteEnum> =
    new EventEmitter();

  public drawerRouteEnum = DrawerRouteEnum;
  public isToolboxOpen: boolean = false;

  ngOnInit() {}

  public onAction(route: DrawerRouteEnum) {
    this.selectedActionEvent.emit(route);
  }

  public onClickDrawingPolygone(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.toolboxPopover.dismiss();
    this.mapService.setDrawMode('draw_polygon');
  }

  public onClickDrawingRectangle(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.toolboxPopover.dismiss();
    this.mapService.setDrawMode('draw_rectangle');
  }

  public displayToolbox(e: Event): void {
    this.toolboxPopover.event = e;
    this.isToolboxOpen = true;
  }

  public async onClickDisplayPrintTool(): Promise<void> {
    // Allows waiting for the action selection toolbox to be hidden
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    // Print
    window.print();
  }

  public async onClickDisplayMesureTool(): Promise<void> {
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    this.mapService.addMapBoxDrow();
  }
}
