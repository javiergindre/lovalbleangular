import { Filter } from "./filter";

export interface FilterInvoices extends Filter {
    affiliateName: string;
    affiliateCode: string;
    providerName: string;
    invoiceNumber: string;
    invoicePeriod: string;

}
