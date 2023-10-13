export interface Attachment {
    id: string;
    informations: AttachmentInformation;
  url: string;
  // Used only for local attachments
  file?: File;
}

export interface AttachmentInformation {
    filename: string;
    filesize: number;
    nomad_id: number;
}
