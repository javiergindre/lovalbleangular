import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from '@angular/cdk/dialog';

@Component({
  selector: 'app-modal-reject-reasons',
  templateUrl: './modal-reject-reasons.component.html',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  styleUrl: './modal-reject-reasons.component.scss',
})
export class ModalRejectReasonsComponent {
  form: FormGroup;
  @Input() rejectReasons: string[] = ['Patología', 'Ingresos', 'Edad'];
  constructor(
    private dialogRef: MatDialogRef<ModalRejectReasonsComponent>,
    private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      reason: ['', Validators.required],
    });
    if (data) {
      this.rejectReasons = data.rejectReasons;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.reason);
    }
  }
}
