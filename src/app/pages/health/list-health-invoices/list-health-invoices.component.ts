import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap, finalize, elementAt } from 'rxjs/operators';
import { ColumnConfig } from 'src/app/components/pagination-table/config';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';
import {
  HealthService,
  InvoiceSetStatusRqDTO,
} from 'src/app/core/services/health.service';
import { HealthInvoice } from '../../../core/models/invoices/health-invoices';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { InvoiceStatus } from '../../../core/models/invoices/invoice-status';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { SessionService } from 'src/app/core/services/session.service';
import { allTabOptions } from './tab-options';
import {
  TabOption,
  UserRole,
} from 'src/app/components/pagination-table/models/tab-option';
import { GenericPaginationTableComponent } from 'src/app/components/pagination-table/pagination-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FilterInvoices } from 'src/app/core/models/invoices/filter-invoices';
import { SignatureComponent } from '../../../components/signature/signature.component';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpEventType } from '@angular/common/http';
import { FilterService } from 'src/app/core/services/filter.service';
import { ModalErrorMessageComponent } from '../components/modal-error-message/modal-error-message.component';

@Component({
  selector: 'app-list-health-invoices',
  standalone: true,
  imports: [
    GenericPaginationTableComponent,
    MaterialModule,
    TablerIconsModule,
    CommonModule,
    FormsModule,
    SignatureComponent,
  ],
  templateUrl: './list-health-invoices.component.html',
  providers: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHealthInvoicesComponent implements OnInit {
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel;
  @ViewChild(GenericPaginationTableComponent)
  tableComponent: GenericPaginationTableComponent;

  constructor(
    private currencyPipe: CurrencyPipe,
    private route: ActivatedRoute
  ) {}

  healthService = inject(HealthService);
  sessionService = inject(SessionService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  filterService = inject(FilterService);

  readonly dialog = inject(MatDialog);

  initialTab = 0;
  filteredData$: Observable<PaginatedResponse<HealthInvoice>>;
  private searchSubject = new BehaviorSubject<void>(undefined);
  isLoading$ = new BehaviorSubject<boolean>(false);
  tabOptions: TabOption[] = [];
  isProvider: boolean = false;
  isHealthSupervisor: boolean = false;
  showSignature: boolean = true;

  filter = {
    affiliateName: '',
    providerName: '',
    invoiceNumber: '',
    invoicePeriod: '',
    affiliateCode: '',
    currentPage: 1,
    pageSize: 10,
    status: InvoiceStatus.emmited.toString(),
  };

  ngOnInit() {
    this.sessionService.isProvider$.subscribe((isProvider) => {
      this.isProvider = isProvider;
      this.updateTabOptions();
    });

    this.sessionService.isHealthSupervisor$.subscribe((isHealthSupervisor) => {
      this.isHealthSupervisor = isHealthSupervisor;
    });
    this.loadFilters();
    this.loadInvoices();
    this.onSearch();
  }

  updateTabOptions() {
    const userRole: UserRole = this.isProvider ? 'provider' : 'non-provider';

    this.tabOptions = allTabOptions
      .filter((tab) => tab.visibleTo.includes(userRole))
      .map((tab) => ({
        ...tab,
        addConfirm: tab.addConfirm
          ? { [userRole]: tab.addConfirm[userRole] || false }
          : undefined,
        addActions: tab.addActions
          ? { [userRole]: tab.addActions[userRole] || false }
          : undefined,
        addCustomColumn: tab.addCustomColumn
          ? { [userRole]: tab.addCustomColumn[userRole] || undefined }
          : undefined,
      }));

    if (!this.tabOptions.some((tab) => tab.value === this.filter.status)) {
      this.filter.status = this.tabOptions[0]?.value || '';
    }
  }

  onCustomAction(invoice: HealthInvoice): void {
    this.saveCurrentFilter();
    if (
      invoice.status.valueOf() === InvoiceStatus.inprocess.valueOf() ||
      invoice.status.valueOf() === InvoiceStatus.control.valueOf()
    ) {
      this.router.navigate(['/health/invoices/credit-note/' + invoice.guid]);
    }
  }

  onViewAction(invoice: HealthInvoice) {
    this.saveCurrentFilter();
    this.router.navigate(['/health/invoices/view/' + invoice.guid]);
  }

  showApprovedDetails(invoice: HealthInvoice): void {
    this.saveCurrentFilter();
    this.router.navigate(['/health/invoices/credit-note/' + invoice.guid]);
  }

  columns: ColumnConfig[] = [
    {
      name: 'affiliateName',
      displayName: 'Afiliado',
      customClasses: 'f-w-500 fs-11px',
      type: 'text',
    },
    {
      name: 'period',
      displayName: 'Período',
      customClasses: 'fs-11px',
      type: 'text',
    },
    {
      name: 'date',
      displayName: 'Fecha',
      customClasses: 'fs-11px',
      type: 'custom',
      format: (element: HealthInvoice) =>
        new Date(element.createDate).toLocaleDateString(),
    },
    {
      name: 'issuerName',
      displayName: 'Prestador',
      customClasses: 'fs-11px',
      type: 'text',
    },
    {
      name: 'productInfo',
      customClasses: 'fs-11px',
      displayName: 'Producto',
      type: 'custom',
      format: (element: HealthInvoice) =>
        `${element.productCode} - ${element.productName}`,
    },
    {
      name: 'taxCondition',
      customClasses: 'fs-11px one-line',
      displayName: 'Tipo',
      type: 'text',
    },
    {
      name: 'number',
      customClasses: 'fs-11px',
      displayName: 'Comprobante',
      type: 'text',
    },
    {
      name: 'basicAmount',
      customClasses: 'fs-11px one-line',
      displayName: 'Importe',
      type: 'custom',
      format: (element: HealthInvoice) =>
        this.currencyPipe.transform(
          element.basicAmount,
          '$ ',
          'symbol',
          '1.2-2'
        ) ?? '',
    },
  ];

  onSearch() {
    this.isLoading$.next(true);
    if (this.expansionPanel && !this.expansionPanel.expanded) {
      this.filter.providerName = '';
      this.filter.invoiceNumber = '';
      this.filter.invoicePeriod = '';
      this.filter.currentPage = 1;
    }
    if (this.tableComponent) {
      this.tableComponent.resetPaginator();
    }
    this.searchSubject.next();
  }

  loadInvoices() {
    this.filteredData$ = this.searchSubject.pipe(
      tap(() => this.isLoading$.next(true)),
      switchMap(() =>
        this.healthService.getHealthInvoices(
          this.filter.currentPage,
          this.filter.pageSize,
          this.filter.affiliateName,
          this.filter.affiliateCode,
          this.filter.providerName,
          this.filter.invoicePeriod,
          this.filter.invoiceNumber,
          this.filter.status
        )
      ),
      tap(() => this.isLoading$.next(false)),
      finalize(() => this.isLoading$.next(false))
    );
  }

  loadFilters() {
    const queryParams = this.route.snapshot.queryParams;
    console.log(queryParams['status']);

    localStorage.removeItem('currentFilter');

    if (Object.keys(queryParams).length > 0) {
      const filters: FilterInvoices = {
        affiliateName: queryParams['affiliateName'] || '',
        affiliateCode: queryParams['affiliateCode'] || '',
        invoiceNumber: queryParams['invoiceNumber'] || '',
        providerName: queryParams['providerName'] || '',
        invoicePeriod: queryParams['invoicePeriod'] || '',
        status: queryParams['status'] || '0',
        currentPage: parseInt(queryParams['currentPage']) || 1,
        pageSize: queryParams['pageSize'] || 10,
      };

      this.filter = filters;
      const tabSelected = this.tabOptions.findIndex(
        (status) => status.value == this.filter.status
      );
      this.initialTab = tabSelected;

      return true;
    }
    return false;
  }

  clearFilters() {
    this.filter = {
      affiliateName: '',
      affiliateCode: '',
      providerName: '',
      invoiceNumber: '',
      invoicePeriod: '',
      currentPage: 1,
      pageSize: 10,
      status: this.filter.status,
    };

    this.onSearch();

    if (this.expansionPanel.expanded) {
      this.expansionPanel.close();
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.isLoading$.next(true);
    this.filter.currentPage = event.pageIndex + 1;
    this.filter.pageSize = event.pageSize;
    this.searchSubject.next();
  }

  onTabChange(event: string) {
    this.filter.status = event;
    this.filter.currentPage = 1;
    if (this.tableComponent) {
      this.tableComponent.resetPaginator();
    }
    this.searchSubject.next();
  }

  onEdit(invoice: HealthInvoice) {
    this.saveCurrentFilter();
    this.router.navigate(['/health/invoices/edit', invoice.guid]);
  }

  onSignature(invoice: HealthInvoice) {
    this.showSignature = true;

    let titleSifnature = 'Firma de recibo; factura: ' + invoice.guid;
    const dialogRef = this.dialog.open(SignatureComponent, {
      width: '40vw',
      height: '38vh',
      // forma de pasarle parametro al ser llamado desde un dialog
      data: {
        textTitle: titleSifnature,
      },
    });

    const signatureComponent = dialogRef.componentInstance;

    // Suscríbete al evento emitido desde SignatureComponent
    signatureComponent.signature.subscribe((signatureFile: File) => {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Confirmación',
          message:
            'Está seguro de firmar el recibo de la factura de ' +
            invoice.affiliateName +
            ' por  $' +
            invoice.basicAmount +
            ' ?',
          confirmText: 'Aceptar',
          cancelText: 'Cancelar',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (signatureFile) {
            const formData = new FormData();
            formData.append('FormFiles', signatureFile);
            formData.append('InvoiceGuid', invoice.guid);

            this.healthService.signatureInvoice(formData).subscribe(
              (response) => {
                this.onSearch();
                console.log('Factura firmada con éxito', response);
              },
              (error) => {
                console.error('Error al firmar la factura', error);
              }
            );
          }
        }
      });
    });
  }

  onDownload(invoice: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message:
          'Está seguro de descargar el recibo relacionados a la factura  ?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.healthService.downloadHealtInvoiceReceipt(invoice.guid).subscribe(
          (response: Blob) => {
            const fileURL = window.URL.createObjectURL(response);
            const anchor = document.createElement('a');
            anchor.href = fileURL;
            anchor.download = 'Recibo de fc: ' + invoice.number; // The name of the downloaded file
            anchor.click();
            window.URL.revokeObjectURL(fileURL); // Free memory after download
          },
          (error) => {
            console.error('Error downloading the file', error);
          }
        );
        this.healthService.downloadHealtInvoiceReceipt(invoice.guid);
      }
    });
  }

  onCreate(event: Event) {
    this.saveCurrentFilter();
  }

  saveCurrentFilter() {
    const params = this.filterService.getFilterParamsInvoice(
      this.filter.affiliateName,
      this.filter.affiliateCode,
      this.filter.providerName,
      this.filter.invoiceNumber,
      this.filter.invoicePeriod,
      this.filter.status,
      this.filter.currentPage,
      this.filter.pageSize
    );
    console.log(params);

    const filterString = params.toString();
    console.log(filterString);

    localStorage.setItem('currentFilter', filterString);
  }

  onConfirm(invoice: HealthInvoice) {
    this.healthService.confirmInvoice(invoice).subscribe({
      next: (res) => {
        if (res.type === HttpEventType.Response) {
          console.log('Invoice updated successfully:', res.body);
          this.onSearch(); // Reload data after confirmation
        }
      },
      error: (error) => {
        if (error.error === 'Pending signature') {
          this.dialog
            .open(ModalErrorMessageComponent, {
              data: {
                message:
                  'Registramos que usted tiene facturas pagas pendientes de firma y generación de recibo. Le solicitamos que se diriga a la solapa de "Pagas" para poder firmar las mismas.',
              },
            })
            .afterClosed()
            .subscribe(() => {
              this.ngOnInit();
            });
        }

        // Manejar el error (por ejemplo, mostrar un mensaje de error)
      },
    });
  }

  showBackToApprovalButton() {
    console.log(this.filter.status);

    if (
      this.isHealthSupervisor &&
      (this.filter.status === InvoiceStatus.approved.toString() ||
        this.filter.status === InvoiceStatus.rejected.toString() ||
        this.filter.status === InvoiceStatus.incomplete.toString() ||
        this.filter.status ===
          InvoiceStatus.control.toString() +
            ',' +
            InvoiceStatus.inprocess.toString())
    ) {
      return true;
    }
    return false;
  }

  onBackToApproval(guid: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message: 'Está seguro que desea regresar al estado de aprobación?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const info: InvoiceSetStatusRqDTO = {
          guid: guid,
          status: InvoiceStatus.pendingApproval,
        };

        this.healthService.backToApproval(info).subscribe({
          next: (res) => {
            this.onSearch();
          },
          error: (error) => {
            this.notificationService.showAlert(error, 'Error');
          },
        });
      }
    });
  }
}
