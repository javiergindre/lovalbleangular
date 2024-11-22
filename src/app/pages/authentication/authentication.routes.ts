import { Routes } from '@angular/router';

import { AppErrorComponent } from '../shared/error/error.component';
import { AppSideLoginComponent } from './side-login/side-login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { ConfirmRegisterComponent } from './confirm-register/confirm-register.component';
import { UnauthorizedComponent } from '../shared/unauthorized/unauthorized.component';
import { AppSideForgotPswComponent } from './side-forgot-pwd/side-forgot-psw.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error',
        component: AppErrorComponent,
      },
      {
        path: 'login',
        component: AppSideLoginComponent,
      },
      {
        path: 'register',
        component: AppSideRegisterComponent,
      },
      {
        path: 'register/confirm',
        component: ConfirmRegisterComponent,
      },
      {
        path: 'unauthorized',
        component: UnauthorizedComponent,
      },
      {
        path: 'forgot-pwd',
        component: AppSideForgotPswComponent,
      },
    ],
  },
];
