import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-mobile-home-actions',
  templateUrl: './mobile-home-actions.component.html',
  styleUrls: ['./mobile-home-actions.component.scss'],
})
export class MobileHomeActionsComponent implements OnInit {
  constructor(private modalCtlr: ModalController, private drawerService: DrawerService) {}

  public type: 'DISPLAY' | 'ACTIONS' | 'TOOLS';
  public drawerRouteEnum = DrawerRouteEnum

  ngOnInit(): void {}

  public navigateTo(location: DrawerRouteEnum): void {
    this.drawerService.navigateTo(location);
    this.modalCtlr.dismiss();
  }
}
