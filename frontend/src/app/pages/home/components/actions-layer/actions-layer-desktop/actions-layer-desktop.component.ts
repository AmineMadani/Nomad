import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonPopover } from '@ionic/angular';
import { MapService } from 'src/app/core/services/map/map.service';
import { Subject, fromEvent, takeUntil, debounceTime, finalize } from 'rxjs';

import * as turf from '@turf/turf';
import { DrawingService } from 'src/app/core/services/map/drawing.service';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit, OnDestroy {
  constructor(private mapService: MapService, private drawingService: DrawingService) {}

  @ViewChild('toolbox', { static: true }) toolboxPopover: IonPopover;

  @Input() currentRoute: DrawerRouteEnum;
  @Output() selectedActionEvent: EventEmitter<DrawerRouteEnum> =
    new EventEmitter();

  public drawerRouteEnum = DrawerRouteEnum;
  public isToolboxOpen: boolean = false;

  private isMeasuringLinear: boolean = false;

  private onStopMeasuring$: Subject<void> = new Subject();
  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit() {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

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
    this.drawingService.setDrawMode('draw_polygon');
  }

  public onClickDrawingRectangle(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.toolboxPopover.dismiss();
    this.drawingService.setDrawMode('draw_rectangle');
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

  public async onClickDisplaySurfaceMesureTool(): Promise<void> {
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    this.drawingService.setDrawMode('draw_polygon');
    this.drawingService.setIsMeasuring(true);
  }

  public async onClickDisplayLinearMesureTool(): Promise<void> {
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    this.drawingService.setDrawMode('draw_line_string');
    this.drawingService.setIsMeasuring(true);
  }
}
