import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { DateTime } from 'luxon';
import { Workorder } from 'src/app/core/models/workorder.model';
import { AttachmentService } from 'src/app/core/services/attachment.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent implements OnInit {

  constructor(
    private attachmentService: AttachmentService,
    private workorderService: WorkorderService,
  ) { }

  @Input("workorder") workorder: Workorder;

  @Output() onSaveAttachment: EventEmitter<void> = new EventEmitter();

  ngOnInit() {}

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
      allowEditing: true,
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
      this.workorderService.updateWorkOrder(this.workorder).subscribe();
    }

    this.onSaveAttachment.emit();
  }
}
