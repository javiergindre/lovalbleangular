import { HealthInvoiceRejectReasonType } from "./health-invoice-reject-reason-type";

export interface RejectInvoiceDTO {
    guid: string;
    reason: string;
    type: HealthInvoiceRejectReasonType;
}