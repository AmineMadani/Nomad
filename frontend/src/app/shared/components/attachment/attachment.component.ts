import { Component, Input, OnInit } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { Attachment } from 'src/app/core/models/attachment.model';
import { Workorder } from 'src/app/core/models/workorder.model';
import { AttachmentService } from 'src/app/core/services/attachment.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private attachmentService: AttachmentService,
    private workorderService: WorkorderService
  ) { }

  @Input("workorder") workorder: Workorder;

  public isMobile: boolean;

  public listAttachment: Attachment[] = [];
  public isAttachmentLoaded: boolean = true;

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();

    this.getListAttachment();
  }

  public convertBitsToBytes(x): string {
    let l = 0,
      n = parseInt(x, 10) || 0;

    const units = ['o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
  }

  public getFileExtension(filename: string): string {
    return filename.split('.').pop();
  }

  // ### Attachement ### //
  private getListAttachment(): void {
    this.isAttachmentLoaded = false;

    console.log('get list attachment.....');
    // Get the list of attachment
    this.attachmentService
      .getListAttachmentByWorkorderId(this.workorder.id)
      .then((listAttachment) => {
        console.log(listAttachment);
        this.listAttachment = listAttachment;
        this.isAttachmentLoaded = true;
      })
      .catch((error) => {
        // If there is an error (because the user is offline or anything else)
        // keep it going
        console.log(error);
        this.isAttachmentLoaded = true;
      });
  }

  async addAttachment(event) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    await this.saveAttachments(Array.from(event.target.files));

    // Empty this field to allow the user to select the same file again
    // else if the same file is selected, fileupdload ignore it
    event.target.value = null;
  }

  async addPicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      saveToGallery: true,
      allowEditing: false,
      promptLabelPhoto: 'Depuis la gallerie',
      promptLabelPicture: 'Prendre une photo',
      resultType: CameraResultType.Base64
    });

    const imageBlob = this.dataURItoBlob(image.base64String);
    const imageFile = new File([imageBlob], DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss') + '.png', { type: 'image/png' });

    await this.saveAttachments([imageFile]);
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  async saveAttachments(listFile: File[]) {
    for (const file of listFile) {
      await this.attachmentService.addAttachment(this.workorder.id, file);
    };

    // If there was no attachment before, set the flag of the workorder to true
    if (!this.workorder.wkoAttachment) {
      this.workorder.wkoAttachment = true;
      await firstValueFrom(this.workorderService.updateWorkOrder(this.workorder));
    }

    this.utilsService.showSuccessMessage("Pièce(s) jointe(s) ajoutée(s) avec succès");

    this.getListAttachment();
  }
}
