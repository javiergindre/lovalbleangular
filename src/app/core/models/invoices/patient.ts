import { Person } from './person';

export interface CreatePatientDTO {
  person: Person;
  credential: string;
  plan: string;
  healthServiceId: number;
}

// export interface PatientListItemDTO {
//   name: string;
//   code: string;
//   credential: string;
//   plan: string | null;
//   healthServiceCode: string;
// }

export interface PatientListItemDTO {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
  age?: number | null;
  gender?: string | null;
  birthDate?: Date | null;
  cardNumber: string;
  healthServicePlan: string;
  healthServicePlanId: number;
  privateHealthServiceCode: string;
  privateHealthServiceId: number;
  healthServiceCode: string;
  healthServiceId: number;
  genderDescription: string;
  healthServicePatientId: number;
}
