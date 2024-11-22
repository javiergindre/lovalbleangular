import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FilterService } from 'src/app/core/services/filter.service';
import { BusinessDocumentStatus } from 'src/app/core/models/invoices/BusinessDocumentStatus';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Aviso importante!</h5>
      <button type="button" class="close" (click)="onClose()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>{{ data.message }}</p>
    </div>
    <div class="modal-footer">
      <button mat-button (click)="onClose()">Aceptar</button>
      <button mat-flat-button color="primary" (click)="onGoToSign()">
        Ir a firmar
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: white;
        border-radius: 8px;
        padding: 16px;
        max-width: 500px;
        width: 100%;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      .modal-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 10px 0;
      }
      .modal-body {
        font-size: 1rem;
        
      }
    `,
  ],
})
export class ModalErrorMessageComponent {
  constructor(
    private filterService : FilterService,
    public dialogRef: MatDialogRef<ModalErrorMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private router: Router
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onGoToSign(): void {
    this.dialogRef.close();
    var params = this.filterService.getFilterParamsInvoice('','','','','',BusinessDocumentStatus.Paid.toString())
    const paramsObject = Object.fromEntries(params.entries());
    this.router.navigate(['/health/invoices/list'],{ queryParams: paramsObject });
  }
}
