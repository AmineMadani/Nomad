import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasemapTemplate } from 'src/app/core/models/basemap.model';

@Component({
  selector: 'app-basemaps-selection-modal',
  templateUrl: './basemaps-selection-modal.component.html',
  styleUrls: ['./basemaps-selection-modal.component.scss'],
})
export class BasemapsSelectionModalComponent implements OnInit {
  @Input("basemaps") basemaps: BasemapTemplate[] = [];

  selectedBasemap: BasemapTemplate;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.selectedBasemap = this.basemaps.find((b) => b.selected);
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(
      this.selectedBasemap,
      'confirm'
    );
  }
}
