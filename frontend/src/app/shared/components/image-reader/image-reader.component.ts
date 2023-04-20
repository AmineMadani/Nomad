import { Component, OnInit } from '@angular/core';
import { IonicSlides, ModalController } from '@ionic/angular';
import { UtilsService } from 'src/app/core/services/utils.service';
import { Navigation } from 'swiper';

@Component({
  selector: 'app-image-reader',
  templateUrl: './image-reader.component.html',
  styleUrls: ['./image-reader.component.scss'],
})
export class ImageReaderComponent implements OnInit {
  constructor(private utils: UtilsService, private modalCtrl: ModalController) {}

  public swiperModules = [Navigation];
  public opts: {
    slidesPerView: true
  }

  public imgs: any[];
  public currentImg: any;
  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  public close(): void {
    this.modalCtrl.dismiss();
  }
}
