import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WorkorderDataService } from './dataservices/workorder.dataservice';
import { ConfigurationService } from './configuration.service';
import { CacheService } from './cache.service';
import { UtilsService } from './utils.service';
import { Attachment } from '../models/attachment.model';
import { AttachmentDataService } from './dataservices/attachment.dataservice';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  constructor(
    private attachmentDataService: AttachmentDataService,
  ) {
  }

  /**
   * Method to get all the attachments for a workorder
   * @returns list of Attachment
   */
  async getListAttachmentByWorkorderId(workorderId: number): Promise<Attachment[]> {
    return firstValueFrom(this.attachmentDataService.getListAttachmentByWorkorderId(workorderId));
  }

  /**
   * Method to add an attachment for a workorder
   * @returns Attachment
   */
  async addAttachment(workorderId: number, file: File): Promise<Attachment> {
    return firstValueFrom(this.attachmentDataService.addAttachment(workorderId, file));
  }
}
