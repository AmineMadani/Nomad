import { Component, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';

@Component({
  selector: 'app-actions-layer-mobile',
  templateUrl: './actions-layer-mobile.component.html',
  styleUrls: ['./actions-layer-mobile.component.scss'],
})
export class ActionsLayerMobileComponent implements OnInit {
  constructor(private menuCtlr: MenuController) {}

  @Input() currentRoute: DrawerRouteEnum;

  public drawerRouteEnum = DrawerRouteEnum;

  ngOnInit() {}

  public openMenu(): void {
    this.menuCtlr.open();
  }
}
