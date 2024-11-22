import { Routes } from '@angular/router';
import { AppChatComponent } from './chat/chat.component';
import { CalendarComponent } from 'src/app/components/calendar/calendar/calendar.component';
import { ClaimsComponent } from 'src/app/components/claims/claims.component';

export const ToolsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'communications/chat',
        component: ClaimsComponent,
        data: {
          title: 'Chat',
          urls: [
            { title: 'Starter', url: '/default/home' },
            { title: 'Chat' },
          ],
        },
      },
      {
        path: 'calendar',
        component: CalendarComponent,
        data: {
          title: 'Calendario',
          urls: [
            { title: '', url: '/default/home' },
            { title: 'Calendario' },
          ],
        },
      },
      {
        path: 'claims',
        component: ClaimsComponent,
        data: {
          title: 'Reclamos',
          urls: [
            {
              title: 'Inicio',
              url: '',
            },
            { title: 'Reclamos' },
          ],
        },
      },
    ],
  },
];
