import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { DrawerService } from '../drawer.service';
import { Dataset, DATASET } from './patrimony-dataset';

@Component({
  selector: 'app-patrimony',
  templateUrl: './patrimony.drawer.html',
  styleUrls: ['./patrimony.drawer.scss'],
})
export class PatrimonyDrawer implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService
  ) {}

  @ViewChild('scrolling') scrolling: ElementRef;

  selectedSegment: string = 'water';
  data: Dataset = DATASET;

  ngOnInit() {}

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

  onClose() {
    this.drawerService.closeDrawer();
  }
}
