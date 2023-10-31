import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OfflineDownloadPageRoutingModule } from './offline-download-routing.module';

import { OfflineDownloadPage } from './offline-download.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { OfflineDownloadItemComponent } from './components/offline-download-item/offline-download-item.component';
import { BasemapsSelectionModalComponent } from './components/basemaps-selection-modal/basemaps-selection-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfflineDownloadPageRoutingModule,
    SharedModule
  ],
  declarations: [
    OfflineDownloadPage,
    OfflineDownloadItemComponent,
    BasemapsSelectionModalComponent
  ]
})
export class OfflineDownloadPageModule { }
