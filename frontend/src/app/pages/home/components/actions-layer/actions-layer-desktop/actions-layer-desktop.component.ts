import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapComponent } from '../../map/map.component';
import { IonPopover } from '@ionic/angular';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit {
  constructor() {}

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

  public openDrawingMode(): void {
    const button: Element = document.getElementsByClassName('mapbox-gl-draw_ctrl-draw-btn')[0];
    (button as any).click();
    this.toolboxPopover.dismiss();
  }
}
