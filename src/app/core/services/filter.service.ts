import { Injectable } from '@angular/core';
import { FilterInvoices } from '../models/invoices/filter-invoices';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor() {}

  getFilterParamsInvoice(
    affiliateName = '',
    affiliateCode = '',
    providerName = '',
    invoiceNumber = '',
    invoicePeriod = '',
    status = '0',
    currentPage = 1,
    pageSize = 10
  ): URLSearchParams {
    const params = new URLSearchParams();

    params.append('affiliateName', affiliateName);

    params.append('affiliateCode', affiliateCode);

    params.append('providerName', providerName);

    params.append('invoiceNumber', invoiceNumber);

    params.append('invoicePeriod', invoicePeriod);

    params.append('currentPage', currentPage.toString());
    params.append('pageSize', pageSize.toString());
    params.append('status', status);

    return params;
  }
}
