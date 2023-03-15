import { Component, Input, OnInit } from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-actions-layer',
  templateUrl: './actions-layer.component.html',
  styleUrls: ['./actions-layer.component.scss'],
})
export class ActionsLayerComponent implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService
  ) {}

  @Input() currentRoute: DrawerRouteEnum;
  @Input() drawerHasBeenOpened: boolean;

  ngOnInit() {}

  onSelectAction(event: any) {
    const route = event as DrawerRouteEnum;
    this.drawerService.navigateTo(route);
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }
}
