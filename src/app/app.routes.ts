import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { tenantGuard } from './core/guards/tenant.guard';
import { authGuard } from './core/guards/auth.guard';
import { pathGuard } from './core/guards/path.guard'; // Asegúrate de importar tu pathGuard
import { AppMaintenanceComponent } from './pages/shared/maintenance/maintenance.component';
import { AppInProgressComponent } from './pages/shared/in-progress/in-progress.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'redirect',
  },
  {
    path: 'redirect',
    component: BlankComponent,
    canActivate: [tenantGuard],
  },
  {
    path: ':tenant',
    canActivate: [tenantGuard],
    children: [
      {
        path: '',
        component: FullComponent,
        canActivate: [authGuard],
        children: [
          // {
          //   path: '',
          //   redirectTo: 'home',
          //   pathMatch: 'full',
          // },
          {
            path: 'home', // Excluimos la ruta 'home' del pathGuard
            loadChildren: () =>
              import('./pages/pages.routes').then((m) => m.PagesRoutes),
          },
          {
            path: 'tools', // Protegemos 'tools' con el pathGuard
            loadChildren: () =>
              import('./pages/tools/tools.routes').then((m) => m.ToolsRoutes),
            //canActivate: [pathGuard],
          },
          {
            path: 'health', // Protegemos 'health' con el pathGuard
            loadChildren: () =>
              import('./pages/health/health.routes').then(
                (m) => m.HealthRoutes
              ),
            // canActivate: [pathGuard],
          },
          {
            path: 'crm', // Protegemos 'crm' con el pathGuard
            loadChildren: () =>
              import('./pages/crm/crm.routes').then((m) => m.CrmRoutes),
            //canActivate: [pathGuard],
          },
          {
            path: 'comercial', // Protegemos 'comercial' con el pathGuard
            loadChildren: () =>
              import('./pages/comercial/comercial.routes').then(
                (m) => m.ComercialRoutes
              ),
            canActivate: [pathGuard],
          },
        ],
      },
      {
        path: '',
        component: BlankComponent,
        children: [
          {
            path: 'auth', // Excluimos la ruta 'auth' del pathGuard
            loadChildren: () =>
              import('./pages/authentication/authentication.routes').then(
                (m) => m.AuthenticationRoutes
              ),
          },
          {
            path: 'in-progress', // Excluimos la ruta 'in-progress' del pathGuard
            component: AppInProgressComponent,
          },
          {
            path: 'maintenance', // Excluimos la ruta 'maintenance' del pathGuard
            component: AppMaintenanceComponent,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'redirect',
  },
];
