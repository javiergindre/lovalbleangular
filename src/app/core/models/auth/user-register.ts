export interface RegisterWithProvider {
  providerCode: string;
  userPersonCode: string;
  userPersonFirstName: string;
  userPersonLastName: string;
  userEmail: string;
}

export interface EmailValidation {
  emailConfirmationToken: string;
  userName: string;
  password: string;
}
