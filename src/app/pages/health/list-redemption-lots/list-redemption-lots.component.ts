import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { RouterModule } from '@angular/router';
import { HealthInvoice } from 'src/app/core/models/invoices/health-invoices';
import {
  HealthService,
  InvoiceSetStatusRqDTO,
} from 'src/app/core/services/health.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import {
  LookupComponent,
  LookupConfig,
} from 'src/app/components/lookup/lookup.component';
import { endpoints } from 'src/app/core/helpers/endpoints';
import { environment } from 'src/environments/environment';
import { createHealthPresentationRqDTO } from 'src/app/core/models/health/health-presentations';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { InvoiceStatus } from 'src/app/core/models/invoices/invoice-status';
import { NotificationService } from 'src/app/core/services/notification.service';
import { LoadingStateService } from 'src/app/core/services/loading-state.service';

@Component({
  selector: 'app-list-redemption-lots',
  templateUrl: './list-redemption-lots.component.html',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    LookupComponent,
  ],
})
export class RedemptionLotsComponent implements AfterViewInit {
  allComplete: boolean = false;
  searchForm: FormGroup;

  invoiceList: MatTableDataSource<HealthInvoice>;
  displayedColumns: string[] = [
    'chk',
    'affiliateName',
    'period',
    'date',
    'productInfo',
    'taxCondition',
    'number',
    'basicAmount',
  ];

  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);

  subtitle1 = '0';
  subtitle2 = '0';
  dateHasError: string | null = null;

  constructor(
    private healthService: HealthService,
    private formBuilder: FormBuilder,
    private loadingStateService: LoadingStateService
  ) {
    this.invoiceList = new MatTableDataSource<HealthInvoice>([]);
    this.initForm();
  }

  private initForm(): void {
    this.searchForm = this.formBuilder.group({
      healthServiceId: [''],
      dateFrom: [null],
      dateTo: [null],
    });
  }

  loadInvoices(): void {
    const { healthServiceId, dateFrom, dateTo } = this.searchForm.value;

    this.healthService
      .getInvoicesForRedemptionLots(
        healthServiceId,
        dateFrom.toISOString(),
        dateTo.toISOString()
      )
      .subscribe({
        next: (invoices) => {
          this.invoiceList = new MatTableDataSource(invoices);
          this.invoiceList.paginator = this.paginator;
          this.invoiceList.sort = this.sort;
          this.invoiceList.data = this.invoiceList.data.map((invoice) => ({
            ...invoice,
            completed: false,
          }));
        },
        error: (error) => {
          console.error('Error loading invoices:', error);
        },
      });
  }

  private validateDateRange(): boolean {
    const dateFrom = this.searchForm.get('dateFrom')?.value;
    const dateTo = this.searchForm.get('dateTo')?.value;

    if (dateFrom && dateTo) {
      return new Date(dateFrom) <= new Date(dateTo);
    }

    return true; // Si alguna fecha no está definida, consideramos válido
  }

  onSearch(): void {
    if (!this.validateDateRange()) {
      this.dateHasError = 'Rango de fechas no válido.';
      // Puedes mostrar un mensaje de error usando un snackbar o similar
      return;
    }

    if (this.searchForm.valid) {
      this.loadInvoices();
    }
  }

  ngAfterViewInit(): void {
    this.invoiceList.paginator = this.paginator;
    this.invoiceList.sort = this.sort;
  }

  updateAllComplete(): void {
    this.allComplete =
      this.invoiceList?.data?.length > 0 &&
      this.invoiceList.data.every((t) => t.completed);
    this.updateTopcards();
  }

  someComplete(): boolean {
    if (!this.invoiceList?.data?.length) {
      return false;
    }
    const selectedCount = this.invoiceList.data.filter(
      (t) => t.completed
    ).length;
    return selectedCount > 0 && !this.allComplete;
  }

  setAll(completed: boolean): void {
    if (this.invoiceList?.data) {
      this.invoiceList.data = this.invoiceList.data.map((invoice) => ({
        ...invoice,
        completed,
      }));
      this.allComplete = completed;
      this.updateTopcards();
    }
  }

  private updateTopcards(): void {
    if (!this.invoiceList?.data) {
      this.subtitle1 = '0';
      this.subtitle2 = '0';
      return;
    }

    const selectedInvoices = this.invoiceList.data.filter((t) => t.completed);
    this.subtitle1 = selectedInvoices.length.toString();
    const totalAmount = selectedInvoices.reduce(
      (sum, invoice) => sum + (invoice.basicAmount || 0),
      0
    );
    this.subtitle2 = totalAmount.toString();
  }

  onSelectionChange(invoice: HealthInvoice, checked: boolean): void {
    const index = this.invoiceList.data.findIndex((i) => i.id === invoice.id);
    if (index !== -1) {
      this.invoiceList.data[index].completed = checked;
      this.invoiceList.data = [...this.invoiceList.data];
      this.updateAllComplete();
    }
  }

  filter(filterValue: string): void {
    this.invoiceList.filter = filterValue.trim().toLowerCase();
  }

  healthServiceIdLookupConfig: LookupConfig = {
    placeholder: 'Obra social',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_SERVICES}?filter=0`,
    showAddNew: false,
    errorMessage: 'Seleccione una obra social',
  };

  hasSelectedInvoices(): boolean {
    return (
      this.invoiceList?.data?.some((invoice) => invoice.completed) ?? false
    );
  }

  notificationService = inject(NotificationService);
  readonly dialog = inject(MatDialog);

  generateBatch(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message: 'Está seguro que desea generar el lote?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingStateService.setLoading(true);
        this.execGenerateBatch();
      }
    });
  }

  execGenerateBatch() {
    const ids: number[] = this.invoiceList.data
      .filter((x) => x.completed)
      .map((x) => x.id);
    const dateFrom = this.searchForm.get('dateFrom')?.value;
    const dateTo = this.searchForm.get('dateTo')?.value;
    const healthServiceId = this.searchForm.get('healthServiceId')?.value;

    const rq: createHealthPresentationRqDTO = {
      healthServiceId: healthServiceId,
      fromDate: dateFrom.toISOString(),
      toDate: dateTo.toISOString(),
      invoicesIds: ids,
    };

    this.healthService.generateRedemptionLots(rq).subscribe({
      next: (res) => {
        this.notificationService.showAlert('Lote generado con exito', 'OK!');

        this.onSearch();
        this.loadingStateService.setLoading(false);

        // this.healthService.downloadHealtInvoices(res.filesInvoices);
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loadingStateService.setLoading(false);
      },
    });
  }
}
