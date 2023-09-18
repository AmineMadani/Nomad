import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil, takeWhile } from 'rxjs';
import { DownloadState, OfflineDownload, OfflineDownloadService } from 'src/app/core/services/offlineDownload.service';

@Component({
  selector: 'app-offline-download',
  templateUrl: './offline-download.page.html',
  styleUrls: ['./offline-download.page.scss'],
})
export class OfflineDownloadPage implements OnInit {

  DownloadState = DownloadState;

  // Referential
  referentialOfflineDownload: OfflineDownload;
  // Equipments
  equipmentOfflineDownload: OfflineDownload;
  // Basemaps
  basemapOfflineDownload: OfflineDownload;

  constructor(
    private offlineDownloadService: OfflineDownloadService,
  ) { }

  ngOnInit() {
    this.offlineDownloadService.initReferentialDownloadState();

    this.offlineDownloadService.getReferentialOfflineDownload()
      .subscribe(offlineDownload => {
        this.referentialOfflineDownload = offlineDownload;
      });

    this.offlineDownloadService.getEquipmentOfflineDownload()
      .subscribe(offlineDownload => {
        this.equipmentOfflineDownload = offlineDownload;
      });

    this.offlineDownloadService.getBasemapOfflineDownload()
      .subscribe(offlineDownload => {
        this.basemapOfflineDownload = offlineDownload;
      });
  }

  onReferentialsDownload() {
    this.offlineDownloadService.downloadReferential();
  }


  onReferentialsDump() {
    this.offlineDownloadService.dumpReferential();
  }

  onEquipmentsDownload() {
    this.offlineDownloadService.downloadEquipments();
  }

  onEquipmentsDump() {
    this.offlineDownloadService.dumpEquipments();
  }

  onBasemapsDownload() {
    this.offlineDownloadService.downloadBasemap();
  }

  onBasemapsDump() {
    this.offlineDownloadService.dumpBasemap();
  }

  onDownloadAll() {
    this.offlineDownloadService.downloadAll();
  }

  onDumpAll() {
    this.offlineDownloadService.dumpAll();
  }
}
