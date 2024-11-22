// export interface PatientRqDTO {
//     person: PersonRqDTO;
//     cardNumber: string;
//     HealthServiceId: number;
//     HealthServicePlanId: number;
// }

// export interface PersonRqDTO {
//     code: string;
//     firstName: string;
//     lastName: string;
//     isOrganization?: boolean;
//     gender?: number;
//     birthDate: Date;
// }

export interface PatientRqDTO {
  person: PersonRqDTO;
  cardNumber: string;
  healthServiceId: number;
  healthServicePlanId: number;
  privateHealthServicePlanId: number;
  contactData: ContactDataRqDTO;
}

export interface ContactDataRqDTO {
  email: string;
  phoneNumber: string;
  address: string;
  state: number;
  country: number;
}

export interface PersonRqDTO {
  code: string;
  firstName: string;
  lastName: string;
  isOrganization?: boolean;
  gender?: number;
  birthDate: Date;
}
