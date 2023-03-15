import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit {
  constructor() {}

  @Input() currentRoute: DrawerRouteEnum;
  @Output() selectedActionEvent: EventEmitter<DrawerRouteEnum> =
    new EventEmitter();

  public drawerRouteEnum = DrawerRouteEnum;

  ngOnInit() {}

  onAction(route: DrawerRouteEnum) {
    this.selectedActionEvent.emit(route);
  }
}
