import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Attachment } from 'src/app/core/models/attachment.model';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-attachment-image-viewer',
  templateUrl: './attachment-image-viewer.component.html',
  styleUrls: ['./attachment-image-viewer.component.scss'],
})
export class AttachmentImageViewerComponent implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private modalCtrl: ModalController
  ) { }

  public isMobile: boolean;

  public attachments: Attachment[];
  public currentAttachment: Attachment;

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
  }

  ngAfterViewInit() {
    const swiperEl = document.querySelector('#swiper-large-viewer') as any;
    swiperEl.swiper.slideTo(this.attachments.findIndex(attachment => attachment.id === this.currentAttachment.id));
  }

  public close(): void {
    this.modalCtrl.dismiss();
  }
}
