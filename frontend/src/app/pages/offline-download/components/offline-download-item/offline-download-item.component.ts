import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DownloadState, OfflineDownload } from 'src/app/core/services/offlineDownload.service';

@Component({
  selector: 'app-offline-download-item',
  templateUrl: './offline-download-item.component.html',
  styleUrls: ['./offline-download-item.component.scss'],
})
export class OfflineDownloadItemComponent implements OnInit {

  @Input() offlineDownload: OfflineDownload;
  @Input() title: string;
  @Input() isDirectDownload: boolean = true;

  @Output() onDownload: EventEmitter<void> = new EventEmitter<void>();
  @Output() onDump: EventEmitter<void> = new EventEmitter<void>();

  DownloadState = DownloadState;

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {

  }

  onDownloadClick() {
    this.onDownload.emit();
  }

  onDumpClick() {
    this.onDump.emit();
  }

  dismissPopover() {
    this.popoverController.dismiss();
  }
}
