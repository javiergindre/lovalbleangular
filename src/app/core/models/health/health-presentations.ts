export interface createHealthPresentationRqDTO {
  healthServiceId: number;
  fromDate: string;
  toDate: string;
  invoicesIds: number[];
}

export interface HealthPresentationDetailsDto {
  businessDocumentTypeId: number;
  number: string;
  taxCondition: string;
  affiliateName: string;
  issuerName: string;
  fromDate: Date;
  toDate: Date;
  total: number;
}

export interface HealthPresentationDto {
  id: number;
  healthServiceId: number;
  healthServiceCode: string;
  healthServiceName: string;
  issuerId: number;
  issuerName: string;
  fromDate: Date;
  toDate: Date;
  createdDate: Date;
  count: number;
  total: number;
}
