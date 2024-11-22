import { Routes } from '@angular/router';
import { AppInProgressComponent } from '../shared/in-progress/in-progress.component';
import { ListPatientsComponent } from './list-patients/list-patients.component';
import { ForbiddenComponent } from '../shared/forbidden/forbidden.component';
import { CreatePatientsComponent } from './create-patients/create-patients.component';
import { ListHealthInvoicesComponent } from './list-health-invoices/list-health-invoices.component';
import { FormHealthInvoicesComponent } from './form-health-invoices/form-health-invoices.component';
import { AnamnesisFormComponent } from './anamnesis-form/anamnesis-form.component';
import { FormCreditNoteComponent } from './form-credit-note/form-credit-note.component';
import { ListHealthReceiptsComponent } from './list-health-receipts/list-health-receipts.component';
import { AppInvoiceListComponent } from './invoice-list/invoice-list.component';
import { RedemptionLotsComponent } from './list-redemption-lots/list-redemption-lots.component';
import { DashboardIntegrationsComponent } from 'src/app/components/Dashboards/dashboard-integrations/dashboard-integrations.component';
import { ListHealthPresentationsComponent } from './list-health-presentations/list-health-presentations.component';
import { ListHealthPresentationDetailsComponent } from './list-health-presentation-details/list-health-presentation-details.component';

export const HealthRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'integration',
        component: AppInProgressComponent,
      },
      {
        path: 'monitoring/patients/create',
        component: CreatePatientsComponent,
        data: {
          title: 'Pacientes',
          urls: [
            {
              title: 'Lista de pacientes',
              url: 'health/monitoring/patients/list',
            },
            { title: 'Pacientes' },
          ],
        },
      },
      {
        path: 'monitoring/patients/edit/:id',
        component: CreatePatientsComponent,
        data: {
          title: 'Pacientes',
          urls: [
            {
              title: 'Lista de pacientes',
              url: 'health/monitoring/patients/list',
            },
            { title: 'Pacientes' },
          ],
        },
      },
      {
        path: 'monitoring/patients/list',
        component: ListPatientsComponent,
        data: {
          title: 'Pacientes',
          urls: [{ title: 'Home', url: '' }, { title: 'Pacientes' }],
        },
      },
      {
        path: 'monitoring/follow-up/survey',
        component: AppInProgressComponent,
        data: {
          title: 'Seguimiento',
          urls: [{ title: 'Home', url: '' }, { title: 'Encuestas' }],
        },
      },
      {
        path: 'monitoring/follow-up/conversations',
        component: ForbiddenComponent,
        data: {
          title: 'Seguimiento',
          urls: [{ title: 'Home', url: '' }, { title: 'Conversaciones' }],
        },
      },
      {
        path: 'invoices/list',
        component: ListHealthInvoicesComponent,
        data: {
          title: 'Integración',
          urls: [
            { title: 'Facturas', url: 'health/invoices/list' },
            { title: 'Listado' },
          ],
        },
      },
      {
        path: 'invoices/dashboard',
        component: DashboardIntegrationsComponent,
        data: {
          title: 'Integración',
          urls: [
            { title: '', url: 'health/invoices/dashboard' },
            { title: 'Dashboard' },
          ],
        },
      },
      {
        path: 'invoices/load',
        component: FormHealthInvoicesComponent,
        data: {
          title: 'Facturas',
          urls: [
            { title: 'Facturas', url: 'health/invoices/list' },
            { title: 'Crear' },
          ],
        },
      },
      {
        path: 'invoices/edit/:id',
        component: FormHealthInvoicesComponent,
        data: {
          title: 'Facturas',
          urls: [
            { title: 'Facturas', url: 'health/invoices/list' },
            { title: 'Edición' },
          ],
        },
      },
      {
        path: 'invoices/view/:id',
        component: FormHealthInvoicesComponent,
        data: {
          title: 'Facturas',
          urls: [
            { title: 'Facturas', url: 'health/invoices/list' },
            { title: 'Ver' },
          ],
        },
      },
      {
        path: 'invoices/credit-note/:id',
        component: FormCreditNoteComponent,
        data: {
          title: 'Facturas',
          urls: [
            { title: 'Facturas', url: 'health/invoices/list' },
            { title: 'Edicion' },
          ],
        },
      },
      {
        path: 'monitoring/anamnesis/:id',
        component: AnamnesisFormComponent,
        data: {
          title: 'Anamnesis/Signos vitales',
          urls: [
            { title: 'Padrón', url: 'health/monitoring/patients/list' },
            { title: 'Anamnesis' },
          ],
        },
      },
      {
        path: 'receipts/list',
        component: ListHealthReceiptsComponent,
        data: {
          title: 'Integración',
          urls: [
            { title: 'Facturas', url: 'health/invoices/list' },
            { title: 'Listado' },
          ],
        },
      },
      {
        path: 'invoices/list/modernize',
        component: AppInvoiceListComponent,
        data: {
          title: 'Integración',
          urls: [
            { title: 'Facturas', url: 'health/invoices/list' },
            { title: 'Listado' },
          ],
        },
      },
      {
        path: 'presentations/create',
        component: RedemptionLotsComponent,
        data: {
          title: 'Integración',
          urls: [
            { title: 'Presentaciones', url: 'health/presentations/list' },
            { title: 'Nueva' },
          ],
        },
      },
      {
        path: 'presentations/list',
        component: ListHealthPresentationsComponent,
        data: {
          title: 'Integración',
          urls: [
            { title: 'Presentaciones', url: 'health/presentations/list' },
            { title: 'Listado' },
          ],
        },
      },
      {
        path: 'presentations/detail/:id',
        component: ListHealthPresentationDetailsComponent,
        data: {
          title: 'Integración',
          urls: [
            { title: 'Presentaciones', url: 'health/presentations/list' },
            { title: 'Vista' },
          ],
        },
      },
    ],
  },
];
