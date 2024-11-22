import { TabOption } from 'src/app/components/pagination-table/models/tab-option';

export enum LeadsStatus {
  pending = 0,
  approved = 1,
  rejected = 2,
}

export const allTabOptions: TabOption[] = [
  {
    label: 'Pendientes',
    isFinal: false,
    value: LeadsStatus.pending.toString(),
    visibleTo: ['provider', 'non-provider'],
  },
  {
    label: 'Aprobados',
    isFinal: true,
    value: LeadsStatus.approved.toString(),
    visibleTo: ['provider', 'non-provider'],
  },
  {
    label: 'Rechazados',
    isFinal: true,
    value: LeadsStatus.rejected.toString(),
    visibleTo: ['provider', 'non-provider'],
  },
];
