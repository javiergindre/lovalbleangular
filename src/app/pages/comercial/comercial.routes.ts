import { Routes } from '@angular/router';
import { ListScoringComponent } from './list-scoring/list-scoring.component';

export const ComercialRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'segmentation/scoring/list',
        component: ListScoringComponent,
        data: {
          title: 'Scoring',
          urls: [{ title: 'Home', url: 'home' }, { title: 'Listado' }],
        },
      },
    ],
  },
];
