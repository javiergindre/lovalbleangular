import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserLogin } from '../models/auth/user-login';
import { Token as Token } from '../models/auth/session';
import {
  EmailValidation,
  RegisterWithProvider,
} from '../models/auth/user-register';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { UserChangePsw, UserForgotPsw } from '../models/auth/user-password';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);
  constructor() { }

  login(user: UserLogin) {
    return this.http.post<Token>(this.baseUrl + endpoints.LOGIN, user);
  }

  validateHealthProvider(model: RegisterWithProvider) {
    return this.http.post(this.baseUrl + endpoints.REGISTER_WITH_PROVIDERS, model, {
      responseType: 'text',
    });
  }

  register(user: EmailValidation) {
    return this.http.post(this.baseUrl + 'user/email-validation', user);
  }

  changePassword(user: UserChangePsw) {
    return this.http.post(this.baseUrl + 'user/change-password', user);
  }

  forgotPassword(user: UserForgotPsw) {
    return this.http.post(this.baseUrl + 'user/reset-password', user);
  }
}
