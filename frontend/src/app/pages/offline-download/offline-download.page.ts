import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { DownloadState, OfflineDownload, OfflineDownloadService } from 'src/app/core/services/offlineDownload.service';
import { BasemapsSelectionModalComponent } from './components/basemaps-selection-modal/basemaps-selection-modal.component';
import { TemplateService } from 'src/app/core/services/template.service';
import { BasemapTemplate } from 'src/app/core/models/basemap.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-offline-download',
  templateUrl: './offline-download.page.html',
  styleUrls: ['./offline-download.page.scss'],
})
export class OfflineDownloadPage implements OnInit {

  public availableBasemaps: BasemapTemplate[] = [];

  public referentialsOfflineDownload: OfflineDownload = {
    state: DownloadState.NOT_STARTED,
  };
  public tilesOfflineDownload: OfflineDownload = {
    state: DownloadState.NOT_STARTED,
  };
  public basemapsOfflineDownload: OfflineDownload = {
    state: DownloadState.NOT_STARTED,
  };

  private destroyReferentialsSubscription$ = new Subject<void>();
  private destroyTilesSubscription$ = new Subject<void>();
  private destroyBasemapsSubscription$ = new Subject<void>();

  constructor(
    private offlineDownloadService: OfflineDownloadService,
    private cd: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private templateService: TemplateService,
    private cacheService: CacheService
  ) { }

  async ngOnInit() {
    // Get initial values of downloads
    this.referentialsOfflineDownload = await this.offlineDownloadService.getInitialReferentialsDownloadState();
    this.tilesOfflineDownload = await this.offlineDownloadService.getInitialTilesDownloadState();
    this.basemapsOfflineDownload = await this.offlineDownloadService.getInitialBasemapsDownloadState();

    // Get required data for the basemaps selection
    this.templateService.getFormsTemplate().then((forms) => {
      let formTemplate = forms.find(form => form.formCode === 'OFFLINE_BASEMAPS');
      if (formTemplate) {
        this.availableBasemaps = JSON.parse(formTemplate.definition);
        this.availableBasemaps = this.availableBasemaps.map((basemap) => {
          return {
            ...basemap,
            selected: this.basemapsOfflineDownload.basemapDownloaded === basemap.name,
          }
        });
      }
    });
  }

  onReferentialsDownload() {
    // Launch subscription to listen changes about the percentage progress
    this.launchReferentialsSubscription();

    // Download
    this.offlineDownloadService.downloadReferentials();
  }

  onReferentialsDump() {
    // Reset offline download
    this.resetReferentialsDownload();

    // Dump stored data
    this.offlineDownloadService.dumpReferentials();
  }

  onTilesDownload() {
    // Launch subscription to listen changes about the percentage progress
    this.launchTilesSubscription();

    // Download
    this.offlineDownloadService.downloadTiles();
  }

  onTilesDump() {
    // Reset offline download
    this.resetTilesDownload();

    // Dump stored data
    this.offlineDownloadService.dumpTiles();
  }

  async onBasemapDownload() {
    // Select the basemaps to download
    const modal = await this.modalCtrl.create({
      component: BasemapsSelectionModalComponent,
      componentProps: {
        basemaps: this.availableBasemaps
      },
      cssClass: 'selection-modal'
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (data) {
        // Launch subscription to listen changes about the percentage progress
        this.launchBasemapSubscription();

        // Download
        this.offlineDownloadService.downloadBasemap(data).then(() => {
          // We set the selected basemap after download
          this.availableBasemaps = this.availableBasemaps.map((basemap) => {
            basemap.selected = this.basemapsOfflineDownload.basemapDownloaded === basemap.name;
            return basemap;
          });
        });
      } else {
        // Dump databases if no selection
        this.onBasemapDump();
        // We set all selected basemap to false
        this.availableBasemaps = this.availableBasemaps.map((basemap) => {
          basemap.selected = false;
          return basemap;
        });
      }
    }
  }

  onBasemapDump() {
    // Reset offline download
    this.resetBasemapDownload();

    // Dump stored data
    this.offlineDownloadService.dumpBasemap();
  }

  onDownloadAll() {
    if (this.referentialsOfflineDownload.state !== DownloadState.IN_PROGRESS) {
      this.launchReferentialsSubscription();
      this.onReferentialsDownload();
    }

    if (this.tilesOfflineDownload.state !== DownloadState.IN_PROGRESS) {
      this.launchTilesSubscription();
      this.onTilesDownload();
    }

    if (this.basemapsOfflineDownload.state !== DownloadState.IN_PROGRESS) {
      this.launchBasemapSubscription();
      this.onBasemapDownload();
    }
  }

  onDumpAll() {
    if (this.referentialsOfflineDownload.state !== DownloadState.IN_PROGRESS) {
      this.resetReferentialsDownload();
      this.onReferentialsDump();
    }

    if (this.tilesOfflineDownload.state !== DownloadState.IN_PROGRESS) {
      this.resetTilesDownload();
      this.onTilesDump();
    }

    if (this.basemapsOfflineDownload.state !== DownloadState.IN_PROGRESS) {
      this.resetBasemapDownload();
      this.onBasemapDump();
    }
  }

  onClearLocalDb() {
    this.cacheService.resetCache();
  }

  private launchReferentialsSubscription() {
    this.offlineDownloadService.getReferentialsOfflineDownload()
      .pipe(
        takeUntil(this.destroyReferentialsSubscription$)
      )
      .subscribe((downloadState) => {
        // We stop the subscription when the state passed to "IN_PROGRESS" to "DONE" or "NOT_STARTED"
        if (this.referentialsOfflineDownload.state === DownloadState.IN_PROGRESS &&
          (downloadState.state === DownloadState.DONE || downloadState.state === DownloadState.NOT_STARTED)) {
          this.destroyReferentialsSubscription$.next();
        }

        this.referentialsOfflineDownload = downloadState;
      });
  }

  private launchTilesSubscription() {
    this.offlineDownloadService.getTilesOfflineDownload()
      .pipe(
        takeUntil(this.destroyTilesSubscription$)
      )
      .subscribe((downloadState) => {
        // We stop the subscription when the state passed to "IN_PROGRESS" to "DONE" or "NOT_STARTED"
        if (this.tilesOfflineDownload.state === DownloadState.IN_PROGRESS &&
          (downloadState.state === DownloadState.DONE || downloadState.state === DownloadState.NOT_STARTED)) {
          this.destroyTilesSubscription$.next();
        }

        this.tilesOfflineDownload = downloadState;
      });
  }

  private launchBasemapSubscription() {
    this.offlineDownloadService.getBasemapsOfflineDownload()
      .pipe(
        takeUntil(this.destroyBasemapsSubscription$)
      )
      .subscribe((downloadState) => {
        // We stop the subscription when the state passed to "IN_PROGRESS" to "DONE" or "NOT_STARTED"
        if (this.basemapsOfflineDownload.state === DownloadState.IN_PROGRESS &&
          (downloadState.state === DownloadState.DONE || downloadState.state === DownloadState.NOT_STARTED)) {
          this.destroyBasemapsSubscription$.next();
        }

        this.basemapsOfflineDownload = downloadState;
        this.cd.detectChanges();
      });
  }

  private resetReferentialsDownload() {
    this.referentialsOfflineDownload = {
      state: DownloadState.NOT_STARTED
    };
  }

  private resetTilesDownload() {
    this.tilesOfflineDownload = {
      state: DownloadState.NOT_STARTED
    };
  }

  private resetBasemapDownload() {
    this.basemapsOfflineDownload = {
      state: DownloadState.NOT_STARTED
    };
  }
}
