import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DrawerService } from '../../../../services/drawer.service';

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
