import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { LookupComponent, LookupConfig } from '../lookup/lookup.component';
import { environment } from 'src/environments/environment';
import { endpoints } from 'src/app/core/helpers/endpoints';

@Component({
  selector: 'app-drug-modal',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    LookupComponent,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ this.edit ? 'Editar Medicamento' : 'Agregar Medicamento' }}
    </h2>
    <mat-dialog-content class="p-t-12">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-lookup
          [config]="drugsLookupConfig"
          [formGroup]="form"
          formControlName="drug"
          (onSelect)="onDrugsChange($event)"
        ></app-lookup>
        <app-lookup
          [config]="doctorLookupConfig"
          [formGroup]="form"
          formControlName="doctorLookupItem"
          (onSelect)="onDoctorChange($event)"
        ></app-lookup>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Cantidad</mat-label>
          <input matInput formControlName="quantity" type="number" />
          <mat-error *ngIf="form.get('quantity')?.invalid"
            >Campo requerido</mat-error
          >
        </mat-form-field>
        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Frecuencia</mat-label>
          <input matInput formControlName="frequency" />
        </mat-form-field>

        <mat-form-field class="w-100" appearance="outline">
          <mat-label>Comentarios</mat-label>
          <input matInput formControlName="comments" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions class="justify-content-end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button color="primary" (click)="onSubmit()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class DrugsModalComponent implements OnInit {
  form: FormGroup;
  edit: boolean = false;

  noChangesDrugs: boolean = true;
  noChangesDoctor: boolean = true;
  initialDoctor = {};
  initialDrug = {};

  drugsLookupConfig: LookupConfig = {
    placeholder: 'Medicamentos',
    url: `${environment.apiUrl}${endpoints.LOOKUP_DRUGS}`,
    showAddNew: false,
    errorMessage: 'Seleccione un medicamento',
  };
  doctorLookupConfig: LookupConfig = {
    placeholder: 'Doctor',
    url: `${environment.apiUrl}${endpoints.LOOKUP_DOCTORS}`,
    showAddNew: false,
    errorMessage: 'Seleccione un doctor',
  };

  constructor(
    public dialogRef: MatDialogRef<DrugsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      drug: [data?.drug?.text || '', Validators.required],
      quantity: [data?.quantity || '', Validators.required],
      frequency: [data?.frequency || ''],
      doctorLookupItem: [
        data?.doctorLookupItem?.text || '',
        Validators.required,
      ],
      comments: [data?.comments || ''],
      edit: [this.edit],
    });
  }

  ngOnInit(): void {
    this.edit = !(Object.keys(this.data).length == 0);
    if (this.edit) {
      this.initialDrug = this.data?.drug;
      this.initialDoctor = this.data?.doctorLookupItem;
    }
  }

  onSubmit(): void {
    if (
      this.form.get('drug')?.value != '' &&
      this.form.get('doctorLookupItem')?.value != '' &&
      this.form.get('quantity')?.value
    ) {
      if (this.noChangesDrugs)
        this.form.get('drug')?.setValue(this.initialDrug);
      if (this.noChangesDoctor)
        this.form.get('doctorLookupItem')?.setValue(this.initialDoctor);

      this.form.get('edit')?.setValue(this.edit);
      this.dialogRef.close(this.form.value);
    }
  }

  onDrugsChange($event: any) {
    this.form.get('drug')?.setValue($event);
    this.noChangesDoctor = false;
  }

  onDoctorChange($event: any) {
    this.noChangesDrugs = false;
    this.form.get('doctorLookupItem')?.setValue($event);
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}
