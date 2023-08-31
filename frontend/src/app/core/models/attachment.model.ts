export interface Attachment {
    id: string;
    informations: AttachmentInformation;
    url: string;
}

export interface AttachmentInformation {
    filename: string;
    filesize: number;
    nomad_id: number;
}