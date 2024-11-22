import { TabOption } from 'src/app/components/pagination-table/models/tab-option';
import { InvoiceStatus } from '../../../core/models/invoices/invoice-status';

export const allTabOptions: TabOption[] = [
  {
    label: 'Pendientes de firma', // PAGADAS
    value: InvoiceStatus.paid.toString(),
    isFinal: true,
    visibleTo: ['provider', 'non-provider'],
    addSignature: { provider: true },
    addView: { provider: true, 'non-provider': true },
  },
  {
    label: 'Completas',
    isFinal: false,
    value: InvoiceStatus.complete.toString(),
    visibleTo: ['provider', 'non-provider'],
    addDownload: { provider: true, 'non-provider': true },
    addView: { provider: true, 'non-provider': true },
  },
];
