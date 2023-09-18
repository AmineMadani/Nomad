import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DownloadState, OfflineDownload, OfflineDownloadService } from 'src/app/core/services/offlineDownload.service';

@Component({
  selector: 'app-offline-download',
  templateUrl: './offline-download.page.html',
  styleUrls: ['./offline-download.page.scss'],
})
export class OfflineDownloadPage implements OnInit {

  DownloadState = DownloadState;

  // Referential
  referentialOfflineDownload: OfflineDownload = {
    state: DownloadState.NOT_STARTED,
  };
  // Equipments
  equipmentOfflineDownload: OfflineDownload = {
    state: DownloadState.NOT_STARTED,
  };
  // Basemaps
  basemapOfflineDownload: OfflineDownload = {
    state: DownloadState.NOT_STARTED,
  };

  constructor(
    private offlineDownloadService: OfflineDownloadService,
    private cd: ChangeDetectorRef
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
        // Force changes because it's not detect otherwise
        this.cd.detectChanges();
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
