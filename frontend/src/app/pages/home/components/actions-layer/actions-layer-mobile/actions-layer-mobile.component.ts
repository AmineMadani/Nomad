import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';

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

  onCloseAction(): void {
    this.isOpen = false;
  }
}
