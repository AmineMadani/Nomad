import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Attachment } from '../models/attachment.model';
import { AttachmentDataService } from './dataservices/attachment.dataservice';
import { AppDB } from '../models/app-db.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  constructor(
    private attachmentDataService: AttachmentDataService,
  ) {
    this.db = new AppDB();
  }

  private db: AppDB;

  public async saveLocalAttachmentsByCacheIdAndObjId(cacheId: number, objId: number) {
    const attachments = await this.getLocalAttachmentsByObjId(cacheId);

    if (attachments.length > 0) {
      for (const attachment of attachments) {
        await firstValueFrom(this.attachmentDataService.addAttachment(objId, attachment.file));
      }

      await this.db.attachments.delete(cacheId.toString());
    }
  }

  public async addLocalAttachmentByObjId(objId: number, file: File) {
    let attachments = await this.getLocalAttachmentsByObjId(objId);

    const newAttachment: Attachment = {
      id: objId + '-' + file.name,
      informations: {
        filename: file.name,
        filesize: file.size,
        nomad_id: objId,
      },
      url: URL.createObjectURL(file),
      file: file,
    };

    attachments.push(newAttachment);

    await this.db.attachments.put({ key: objId.toString(), data: attachments });
  }

  private async getLocalAttachmentsByObjId(objId: number): Promise<Attachment[]> {
    const localAttachments = await this.db.attachments.where('key').equals(objId.toString()).toArray();
    return localAttachments?.length > 0 ? localAttachments[0].data : [];
  }

  private async getRemoteAttachmentsByObjId(objId: number): Promise<Attachment[]> {
    let attachments = await firstValueFrom(this.attachmentDataService.getListAttachmentByWorkorderId(objId));
    if (!attachments) {
      attachments = [];
    }
    return attachments;
  }

  public async getAllAttachmentsByObjId(objId: number): Promise<Attachment[]> {
    // Get remote attachments
    let attachments = await this.getRemoteAttachmentsByObjId(objId);

    // Add local attachments
    const localAttachments = await this.getLocalAttachmentsByObjId(objId);
    attachments = attachments.concat(localAttachments);

    return attachments;
  }
}
