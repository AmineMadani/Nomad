import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DrawerRouteEnum } from '../../../drawers/drawer.enum';

@Component({
  selector: 'app-actions-layer-mobile',
  templateUrl: './actions-layer-mobile.component.html',
  styleUrls: ['./actions-layer-mobile.component.scss'],
})
export class ActionsLayerMobileComponent implements OnInit {
  constructor() {}

  @Input() currentRoute: DrawerRouteEnum;
  @Output() selectedActionEvent: EventEmitter<DrawerRouteEnum> =
    new EventEmitter();

  public drawerRouteEnum = DrawerRouteEnum;
  public isOpen: boolean = false;

  ngOnInit() {}

  onAction(route: DrawerRouteEnum) {
    this.selectedActionEvent.emit(route);
    this.isOpen = false;
  }

  openActionLayer(): void {
    this.isOpen = true;
  }

  closeActionLayer(): void {
    this.isOpen = false;
  }
}
