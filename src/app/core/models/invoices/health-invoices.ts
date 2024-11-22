import { BusinessDocumentStatus } from './BusinessDocumentStatus';
import { FileData } from './FileData';

export interface HealthInvoice {
  number: string;
  affiliateCode: string;
  affiliateName: string;
  date: string;
  basicAmount: number;
  taxCondition: string;
  taxConditionId: number;
  taxAmount: number;
  electronicAuthorizationNumber: string;
  electronicAuthorizationVoidDate: string;
  status: BusinessDocumentStatus;
  concept: null | string;
  period: string;
  productCode: string;
  productName: string;
  productRequireDependency: string;
  comments: string;
  guid: string;
  id: number;
  issuerName: string;
  quantity: number;
  linkedInvoiceId: null | number;
  linkedInvoice: null | HealthInvoice;
  createDate: string;
  treatmentRequestPracticeId: null | number;
  files: FileData[];
  issuerId?: number | null;

  // test
  completed?: boolean;
}
