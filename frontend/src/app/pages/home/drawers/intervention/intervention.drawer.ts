import { Component, OnInit } from '@angular/core';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-intervention',
  templateUrl: './intervention.drawer.html',
  styleUrls: ['./intervention.drawer.scss'],
})
export class InterventionDrawer implements OnInit {
  constructor(private drawerService: DrawerService) {}

  ngOnInit() {}

  onClose() {
    this.drawerService.closeDrawer();
  }
}
