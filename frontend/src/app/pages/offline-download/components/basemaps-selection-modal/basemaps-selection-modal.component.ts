import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasemapTemplate } from 'src/app/core/models/basemap.model';
import { TemplateService } from 'src/app/core/services/template.service';

@Component({
  selector: 'app-basemaps-selection-modal',
  templateUrl: './basemaps-selection-modal.component.html',
  styleUrls: ['./basemaps-selection-modal.component.scss'],
})
export class BasemapsSelectionModalComponent implements OnInit {
  name: string;

  @Input("basemaps") basemaps: BasemapTemplate[] = [];

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(
      this.basemaps.filter((b) => b.selected === true),
      'confirm'
    );
  }
}
