import { TabOption } from 'src/app/components/pagination-table/models/tab-option';
import { InvoiceStatus } from '../../../core/models/invoices/invoice-status';

export const allTabOptions: TabOption[] = [
  {
    label: 'Carga',
    value: InvoiceStatus.emmited.toString(),
    visibleTo: ['provider'],
    addConfirm: { provider: true },
    addActions: { provider: true },
    isFinal: false,
    addView: { provider: true, 'non-provider': true },
  },
  {
    label: 'En Aprobación',
    value: InvoiceStatus.pendingApproval.toString(),
    isFinal: false,
    visibleTo: ['provider', 'non-provider'],
    addActions: { 'non-provider': true },
    addView: { provider: true, 'non-provider': true },
  },
  {
    label: 'Aprobados',
    value: InvoiceStatus.approved.toString(),
    isFinal: true,
    visibleTo: ['provider', 'non-provider'],
    addView: { provider: true, 'non-provider': true },
  },
  // {
  //   label: 'Pagadas',
  //   value: InvoiceStatus.paid.toString(),
  //   isFinal: true,
  //   visibleTo: ['provider', 'non-provider'],
  //   addSignature: { provider: true },
  //   addView: { provider: true, 'non-provider': true },
  // },
  {
    label: 'Rechazados',
    isFinal: true,
    value: InvoiceStatus.rejected.toString(),
    visibleTo: ['provider', 'non-provider'],
    addView: { provider: true, 'non-provider': true },
  },
  {
    label: 'Requieren nota de crédito',
    isFinal: false,
    value: [InvoiceStatus.control, InvoiceStatus.inprocess].toString(),
    visibleTo: ['provider', 'non-provider'],
    addView: { provider: true, 'non-provider': true },
    addCustomColumn: {
      provider: {
        type: 'icon',
        content: 'edit',
        action: (element) => {
          console.log('Provider action for', element);
        },
        condition: (element) => element.status === InvoiceStatus.control,
      },
      'non-provider': {
        type: 'icon',
        content: 'edit',
        action: (element) => {
          console.log('Non-provider action for', element);
        },
        condition: (element) => element.status === InvoiceStatus.inprocess,
      },
    },
  },
  {
    label: 'Incompletas',
    isFinal: false,
    value: InvoiceStatus.incomplete.toString(),
    visibleTo: ['provider', 'non-provider'],
    addActions: { provider: true },
    addView: { provider: true, 'non-provider': true },
  },
  // {
  //   label: 'Completas',
  //   isFinal: false,
  //   value: InvoiceStatus.complete.toString(),
  //   visibleTo: ['provider', 'non-provider'],
  //   addDownload: { provider: true, 'non-provider': true },
  //   addView: { provider: true, 'non-provider': true },
  // },
];
