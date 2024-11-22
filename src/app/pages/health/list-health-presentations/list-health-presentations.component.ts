import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BehaviorSubject, finalize, Observable, switchMap, tap } from 'rxjs';
import {
  LookupComponent,
  LookupConfig,
} from 'src/app/components/lookup/lookup.component';
import { ColumnConfig } from 'src/app/components/pagination-table/config';
import { TabOption } from 'src/app/components/pagination-table/models/tab-option';
import { GenericPaginationTableComponent } from 'src/app/components/pagination-table/pagination-table.component';
import { endpoints } from 'src/app/core/helpers/endpoints';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';
import { HealthPresentationDto } from 'src/app/core/models/health/health-presentations';
import { HealthService } from 'src/app/core/services/health.service';
import { MaterialModule } from 'src/app/material.module';
import { environment } from 'src/environments/environment';

interface FilterType {
  healthServiceId: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  currentPage: number;
  pageSize: number;
}

@Component({
  selector: 'app-list-health-presentations',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    LookupComponent,
    GenericPaginationTableComponent,
  ],
  providers: [CurrencyPipe],
  templateUrl: './list-health-presentations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHealthPresentationsComponent implements OnInit {
  healthService = inject(HealthService);
  currencyPipe = inject(CurrencyPipe);
  router = inject(Router);
  searchForm: FormGroup;

  isLoading$ = new BehaviorSubject<boolean>(false);
  private searchSubject = new BehaviorSubject<void>(undefined);
  tableComponent: GenericPaginationTableComponent;
  filteredData$: Observable<PaginatedResponse<HealthPresentationDto>>;
  tabOptions: TabOption[] = [];
  initialTab = 0;

  filter: FilterType = {
    healthServiceId: null,
    dateFrom: null,
    dateTo: null,
    currentPage: 1,
    pageSize: 10,
  };

  columns: ColumnConfig[] = [
    {
      name: 'healthServiceCode',
      customClasses: 'fs-11px one-line',
      displayName: 'Prestadora',
      type: 'text',
    },
    {
      name: 'fromDate',
      displayName: 'Desde',
      customClasses: 'fs-11px',
      type: 'custom',
      format: (element: HealthPresentationDto) =>
        new Date(element.fromDate).toLocaleDateString(),
    },
    {
      name: 'toDate',
      displayName: 'Hasta',
      customClasses: 'fs-11px',
      type: 'custom',
      format: (element: HealthPresentationDto) =>
        new Date(element.toDate).toLocaleDateString(),
    },
    {
      name: 'issuerName',
      displayName: 'Creado por',
      customClasses: 'fs-11px',
      type: 'text',
    },
    {
      name: 'createdDate',
      displayName: 'Fecha creación',
      customClasses: 'fs-11px',
      type: 'custom',
      format: (element: HealthPresentationDto) =>
        new Date(element.createdDate).toLocaleDateString(),
    },
  ];
  // dateHasError: any;

  constructor(private formBuilder: FormBuilder) {
    this.initForm();
  }

  ngOnInit() {
    this.loadInvoices();
    this.onSearch();
  }

  private initForm(): void {
    this.searchForm = this.formBuilder.group({
      healthServiceId: [null],
      dateFrom: [null],
      dateTo: [null],
    });
  }

  currentPage = 1;
  pageSize = 10;

  loadInvoices() {
    this.filteredData$ = this.searchSubject.pipe(
      tap(() => this.isLoading$.next(true)),
      switchMap(() =>
        this.healthService.getInvoicesForHealthPresentations(
          this.filter.healthServiceId ?? '0',
          this.filter.dateFrom?.toISOString() ?? '',
          this.filter.dateTo?.toISOString() ?? '',
          this.currentPage,
          this.pageSize
        )
      ),
      tap(() => this.isLoading$.next(false)),
      finalize(() => this.isLoading$.next(false))
    );
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.isLoading$.next(true);
    this.filter.currentPage = event.pageIndex + 1;
    this.filter.pageSize = event.pageSize;
    this.searchSubject.next();
  }

  onTabChange(event: string) {
    this.filter.currentPage = 1;
    if (this.tableComponent) {
      this.tableComponent.resetPaginator();
    }
    this.searchSubject.next();
  }

  onSearch() {
    this.isLoading$.next(true);
    if (this.tableComponent) {
      this.tableComponent.resetPaginator();
    }
    this.searchSubject.next();
  }

  clearFilters() {
    this.filter = {
      healthServiceId: null,
      dateFrom: null,
      dateTo: null,
      currentPage: 1,
      pageSize: 10,
    };

    this.onSearch();
  }

  healthServiceIdLookupConfig: LookupConfig = {
    placeholder: 'Obra social',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_SERVICES_V2}?filter=0`,
    showAddNew: false,
    errorMessage: 'Seleccione una obra social',
  };

  goToPresentation(element: HealthPresentationDto) {
    this.router.navigate(['/health/presentations/detail/' + element.id]);
    this.healthService.setHealthPresentation(element);
  }
}
