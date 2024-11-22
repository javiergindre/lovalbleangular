import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';
import {
  LookupComponent,
  LookupConfig,
} from 'src/app/components/lookup/lookup.component';
import { endpoints } from 'src/app/core/helpers/endpoints';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';
import { PatientRqDTO } from 'src/app/core/models/health/patients';
import { PatientListItemDTO } from 'src/app/core/models/invoices/patient';
import { HealthService } from 'src/app/core/services/health.service';
import { LookupService } from 'src/app/core/services/lookup.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MaterialModule } from 'src/app/material.module';
import { environment } from 'src/environments/environment';

const patientMock: PatientRqDTO = {
  person: {
    code: '55445544',
    firstName: 'Test Pab',
    lastName: 'Testttt',
    gender: 0,
    birthDate: new Date('1990-05-15'),
  },
  cardNumber: '45678999',
  healthServiceId: 1,
  healthServicePlanId: 4,
  privateHealthServicePlanId: 4,
  contactData: {
    phoneNumber: '44455445',
    email: 'test@test.test',
    address: 'Calle test 123123',
    country: 2,
    state: 11,
  },
};

@Component({
  selector: 'app-create-patients',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
    LookupComponent,
  ],
  templateUrl: './create-patients.component.html',
})
export class CreatePatientsComponent implements OnInit {
  patientForm: FormGroup;
  personCode: string;

  constructor(
    private lookupService: LookupService,
    private fb: FormBuilder,
    private healthService: HealthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    // this.initializeManagers();
    this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.personCode = params['id'];
        this.loadPatientData(parseInt(this.personCode));
      } else {
        this.patientForm.patchValue({
          countryId: 2,
          stateId: 3,
        });
      }
    });
  }

  private loadPatientData(id: number) {
    this.healthService.getPatient(id).subscribe({
      next: (patient: PatientRqDTO) => {
        this.patientForm.patchValue({
          code: patient.person.code,
          firstName: patient.person.firstName,
          lastName: patient.person.lastName,
          gender: patient.person.gender,
          birthDate: patient.person.birthDate,
          cardNumber: patient.cardNumber,
          privateHealthServiceId: patient.privateHealthServicePlanId,
          HealthServiceId: patient.healthServiceId,
          HealthServicePlanId: patient.healthServicePlanId,
          phone: patient.contactData.phoneNumber,
          email: patient.contactData.email,
          address: patient.contactData.address,
          countryId: patient.contactData.country,
          stateId: patient.contactData.state,
        });
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
      },
    });
  }

  private createForm() {
    this.patientForm = this.fb.group({
      code: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      birthDate: ['', Validators.required],
      privateHealthServiceId: ['', Validators.required],
      HealthServicePlanId: ['', Validators.required],
      cardNumber: ['', Validators.required],
      HealthServiceId: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      countryId: ['', Validators.required],
      stateId: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;

      const patientRqDTO: PatientRqDTO = {
        person: {
          code: formValue.code,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          gender: formValue.gender,
          birthDate: new Date(formValue.birthDate),
        },
        cardNumber: formValue.cardNumber,
        healthServiceId: formValue.HealthServiceId,
        healthServicePlanId: formValue.HealthServicePlanId,
        privateHealthServicePlanId: formValue.HealthServicePlanId,
        contactData: {
          phoneNumber: formValue.phone,
          email: formValue.email,
          address: formValue.address,
          country: formValue.countryId,
          state: formValue.stateId,
        },
      };

      console.log('Converted PatientRqDTO:', patientRqDTO);

      this.healthService.createPatient(patientRqDTO).subscribe({
        next: (res) => {
          console.log('Patient created successfully:', res);
          this.router.navigate(['health/monitoring/patients/list']);
          this.notificationService.showAlert('Paciente creado', 'OK!');
          // Handle success (e.g., show a success message, navigate to another page)
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          // Handle error (e.g., show an error message)
        },
      });
    } else {
      console.error('Form is invalid');
      // Optionally, you can mark all form controls as touched to trigger validation messages
      Object.values(this.patientForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  privateHealthServiceLookupConfig: LookupConfig = {
    placeholder: 'Cobertura',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_SERVICES}?filter=1`,
    showAddNew: false,
    valueField: 'id',
    errorMessage: 'Seleccione una cobertura',
  };

  healthServicePlanLookupConfig: LookupConfig = {
    placeholder: 'Plan',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_SERVICES_PLANS}`,
    showAddNew: false,
    dependentField: 'privateHealthServiceId', // Plan de Servicio depende del Servicio seleccionado
    dependentParamName: 'filter',
    errorMessage: 'Seleccione un plan',
  };

  healthServiceIdLookupConfig: LookupConfig = {
    placeholder: 'Obra social',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_SERVICES}?filter=0`,
    showAddNew: false,
    errorMessage: 'Seleccione una obra social',
  };

  countryLookupConfig: LookupConfig = {
    placeholder: 'País',
    url: `${environment.apiUrl}${endpoints.LOOKUP_PLACES}?typeId=1`,
    showAddNew: false,
    valueField: 'id',
    errorMessage: 'Seleccione un país',
  };

  stateLookupConfig: LookupConfig = {
    placeholder: 'Provincia',
    url: `${environment.apiUrl}${endpoints.LOOKUP_PLACES}?typeId=2`,
    showAddNew: false,
    valueField: 'id',
    errorMessage: 'Seleccione una provincia',
    dependentField: 'countryId', // Provincia depende del país seleccionado
    dependentParamName: 'parentId',
  };
}
