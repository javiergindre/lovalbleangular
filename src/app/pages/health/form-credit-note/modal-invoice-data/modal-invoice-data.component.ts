import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HealthInvoice } from 'src/app/core/models/invoices/health-invoices';
import { DateFormatPipe } from "../../../../pipe/date-format.pipe";

@Component({
  selector: 'app-modal-invoice-data',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, DateFormatPipe],
  templateUrl: './modal-invoice-data.component.html',
  styleUrls: ['./modal-invoice-data.component.scss'],
})
export class ModalInvoiceDataComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalInvoiceDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HealthInvoice
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
