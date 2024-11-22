// top-document.interface.ts
export interface TopDocument {
  id: number;
  tenantId: number;
  img: string;
  name: string;
  fileUrl: string;
  status: TopDocumentStatus;
}

export enum TopDocumentStatus {
  Active,
  Inactive,
}

export interface PaginatedRqDTO {
  q?: string;
  filter?: string;
  page: number;
  pageSize: number;
}
