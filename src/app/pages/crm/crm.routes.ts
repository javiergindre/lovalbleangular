import { Routes } from '@angular/router';
import { LeadsComponent } from './leads/leads.component';
import { DashboardComponent } from 'src/app/components/Dashboards/dashboard/dashboard.component';

export const CrmRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'leads',
        component: LeadsComponent,
        data: {
          title: 'Leads',
          urls: [
            {
              title: 'Inicio',
              url: '',
            },
            { title: 'Leads' },
          ],
        },
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          title: 'Dashboard',
          urls: [
            {
              title: 'Inicio',
              url: '',
            },
            { title: 'Dashboard' },
          ],
        },
      },
    ],
  },
];
