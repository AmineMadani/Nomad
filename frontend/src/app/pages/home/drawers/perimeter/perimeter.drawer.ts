import { Component, OnInit } from '@angular/core';
import { DrawerService } from '../drawer.service';

@Component({
  selector: 'app-perimeter',
  templateUrl: './perimeter.drawer.html',
  styleUrls: ['./perimeter.drawer.scss'],
})
export class PerimeterDrawer implements OnInit {
  constructor(private drawerService: DrawerService) {}

  ngOnInit() {}

  onClose() {
    this.drawerService.closeDrawer();
  }
}
