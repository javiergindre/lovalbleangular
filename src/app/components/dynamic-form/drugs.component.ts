import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  inject,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { DrugsModalComponent } from './drugs.modal.component';
import { CommonModule } from '@angular/common';
import { DrugsService } from 'src/app/core/services/drugs.service';
import { DrugDto, DrugsListView } from 'src/app/core/models/health/drugs';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

interface Drug {
  drug: string;
  quantity: string;
  frequency: string;
  doctor: string;
  diagnosis: string;
  longTermTreatment: boolean;
  duplicatePrescription: boolean;
  urgent: boolean;
  showCommercialName: boolean;
  approvedMedication: boolean;
}

@Component({
  selector: 'app-drugs',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="drugs-container">
      <button mat-button color="primary" (click)="openModal()">
        Agregar Medicamento
      </button>

      <table mat-table [dataSource]="drugDto" class="w-100 mt-3">
        <ng-container matColumnDef="drug">
          <th mat-header-cell *matHeaderCellDef>Medicamento</th>
          <td mat-cell *matCellDef="let drug">{{ drug.drug.text }}</td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Cantidad</th>
          <td mat-cell *matCellDef="let drug">{{ drug.quantity }}</td>
        </ng-container>

        <ng-container matColumnDef="frequency">
          <th mat-header-cell *matHeaderCellDef>Frecuencia</th>
          <td mat-cell *matCellDef="let drug">{{ drug.frequency }}</td>
        </ng-container>

        <ng-container matColumnDef="comments">
          <th mat-header-cell *matHeaderCellDef>Comentarios</th>
          <td mat-cell *matCellDef="let drug">{{ drug.comments }}</td>
        </ng-container>

        <ng-container matColumnDef="doctor">
          <th mat-header-cell *matHeaderCellDef>Doctor</th>
          <td mat-cell *matCellDef="let drug">{{ drug.doctor }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let drug">
            <button mat-icon-button color="primary" (click)="editDrug(drug)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="removeDrug(drug)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr
          mat-header-row
          *matHeaderRowDef="[
            'drug',
            'quantity',
            'frequency',
            'comments',
            'actions'
          ]"
        ></tr>
        <tr
          mat-row
          *matRowDef="
            let row;
            columns: ['drug', 'quantity', 'frequency', 'comments', 'actions']
          "
        ></tr>
      </table>
    </div>
  `,
})
export class DrugsComponent implements OnInit {
  @Input() drugs: Drug[] = [];
  @Input() drugDto: DrugDto[] = [];
  //TODO: Levantar id que corresponda
  @Input() param: any; // treatmentRequestId
  @Output() change = new EventEmitter<Drug[]>();
  _drugService: DrugsService = inject(DrugsService);
  constructor(public dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._drugService.getDrugs(this.param).subscribe((drugs: any) => {
      this.drugDto = drugs;
    });
  }

  openModal(drug?: DrugDto): void {
    const dialogRef = this.dialog.open(DrugsModalComponent, {
      data: drug ? { ...drug } : {},
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result) {
          result.treamentRequestId = this.param;
          if (result.edit) {
            result.id = drug!.id;
          }
          this._drugService
            .addOrUpdateDrugTreatments(result)
            .subscribe((drugs: any) => {
              this.drugDto = drugs;
            });
        }
        this.change.emit(this.drugs);
        this.cdr.detectChanges();
      }
    });
  }

  editDrug(drug: DrugDto): void {
    this.openModal(drug);
  }

  removeDrug(drug: DrugDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Eliminar',
        message: 'Desea eliminar el medicamento?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._drugService.deleteDrug(drug).subscribe((drugs: any) => {
          this.drugDto = drugs;
          this.change.emit(this.drugs);
          this.cdr.detectChanges();
        });
      }
    });
  }
}
