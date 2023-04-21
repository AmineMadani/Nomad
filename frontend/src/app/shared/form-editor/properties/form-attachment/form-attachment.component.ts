import { Component, OnInit, Input } from '@angular/core';
import { FormAttachment, FormDefinition } from '../../models/form.model';
import { ModalController } from '@ionic/angular';
import { ImageReaderComponent } from 'src/app/shared/components/image-reader/image-reader.component';

@Component({
  selector: 'app-form-attachment',
  templateUrl: './form-attachment.component.html',
  styleUrls: ['./form-attachment.component.scss'],
})
export class FormAttachmentComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  public attributes: FormAttachment;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormAttachment;
  }

  public async openImgReader(img: any): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ImageReaderComponent,
      showBackdrop: true,
      cssClass: 'img-reader',
      componentProps: {
        imgs: this.attributes.value,
        currentImg: img
      }
    });
    modal.present();
  }
}