import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  HealthService,
  RejectReasons,
} from 'src/app/core/services/health.service';

@Component({
  selector: 'app-modal-reject-reasons',
  templateUrl: './modal-reject-reasons.component.html',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  styleUrl: './modal-reject-reasons.component.scss',
})
export class ModalRejectReasonsComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ModalRejectReasonsComponent>);
  private fb = inject(FormBuilder);
  private healthService = inject(HealthService);

  form: FormGroup;
  rejectReasons: RejectReasons[] = [];
  filteredOptions: Observable<RejectReasons[]> | undefined;

  ngOnInit() {
    this.form = this.fb.group({
      reason: ['', []], // Sin validaciones aquí
      comments: ['', Validators.required], // Hacer comments obligatorio
      requiresCreditNote: [false],
      incomplete: [false],
    });

    this.healthService
      .getRejectReasons()
      .subscribe((reasons: RejectReasons[]) => {
        this.rejectReasons = reasons;
        this.setupFilteredOptions();
      });

    this.form
      .get('reason')
      ?.valueChanges.subscribe((selectedReason: RejectReasons) => {
        if (selectedReason && selectedReason.rejectionType !== undefined) {
          this.updateCheckboxes(selectedReason.rejectionType);
          this.form.get('comments')?.setValue(selectedReason.rejectReason);
        }
      });

    this.form
      .get('requiresCreditNote')
      ?.valueChanges.subscribe((value: boolean) => {
        if (value) {
          this.form.get('incomplete')?.setValue(false);
        }
      });

    this.form.get('incomplete')?.valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.form.get('requiresCreditNote')?.setValue(false);
      }
    });
  }

  private setupFilteredOptions() {
    this.filteredOptions = this.form.get('reason')?.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.rejectReason;
        return name ? this._filter(name as string) : this.rejectReasons.slice();
      })
    );
  }

  private _filter(value: string): RejectReasons[] {
    const filterValue = value.toLowerCase();
    return this.rejectReasons.filter((option) =>
      option.rejectReason.toLowerCase().includes(filterValue)
    );
  }

  reasonValidator(control: AbstractControl): { [key: string]: any } | null {
    const selection: any = control.value;
    if (typeof selection === 'string') {
      return { incorrect: true };
    }
    return null;
  }

  private updateCheckboxes(rejectionType: number) {
    switch (rejectionType) {
      case 0:
        this.form.patchValue({ requiresCreditNote: false, incomplete: false });
        break;
      case 1:
        this.form.patchValue({ requiresCreditNote: true, incomplete: false });
        break;
      case 2:
        this.form.patchValue({ requiresCreditNote: false, incomplete: true });
        break;
    }
  }

  private calculateRejectionType(): number {
    const requiresCreditNote = this.form.get('requiresCreditNote')?.value;
    const incomplete = this.form.get('incomplete')?.value;

    if (requiresCreditNote) return 1;
    if (incomplete) return 2;
    return 0;
  }

  onCancel(): void {
    this.clearInput();
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const result = {
        reason: {
          ...formValue.reason,
          rejectionType: this.calculateRejectionType(),
        },
        comments: formValue.comments,
        requiresCreditNote: formValue.requiresCreditNote,
        incomplete: formValue.incomplete,
      };
      this.dialogRef.close(result);
    }
  }

  displayFn(reason: RejectReasons): string {
    return reason && reason.rejectReason ? reason.rejectReason : '';
  }

  clearInput(): void {
    this.form.get('reason')?.setValue('');
    this.form.patchValue({ requiresCreditNote: false, incomplete: false });
    this.form.get('comments')?.setValue('');
  }
}
