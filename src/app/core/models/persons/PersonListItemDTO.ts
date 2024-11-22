export interface PersonListItemDTO {
    id: number;
    personId: number;
    personCode: string;
    personFirstName: string;
    personLastName: string;
    personBirthDate: string;
    personAge: number;
    formResponseFields: string;
    status: number;
    rejectReason?: string;
    userName?: string;
    formReponseDate: Date;
  }