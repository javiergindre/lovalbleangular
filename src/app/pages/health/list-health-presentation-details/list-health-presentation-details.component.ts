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
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import {
  HealthPresentationDetailsDto,
  HealthPresentationDto,
} from 'src/app/core/models/health/health-presentations';
import { HealthService } from 'src/app/core/services/health.service';
import { MaterialModule } from 'src/app/material.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list-health-presentation-details',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    GenericPaginationTableComponent,
  ],
  providers: [CurrencyPipe],
  templateUrl: './list-health-presentation-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHealthPresentationDetailsComponent implements OnInit {
  healthService = inject(HealthService);
  currencyPipe = inject(CurrencyPipe);
  // searchForm: FormGroup;

  isLoading$ = new BehaviorSubject<boolean>(false);
  private searchSubject = new BehaviorSubject<void>(undefined);
  tableComponent: GenericPaginationTableComponent;
  filteredData$: Observable<PaginatedResponse<HealthPresentationDetailsDto>>;
  tabOptions: TabOption[] = [];
  initialTab = 0;

  filter = {
    healthServiceId: '',
    dateFrom: '',
    dateTo: '',
    currentPage: 1,
    pageSize: 10,
  };

  columns: ColumnConfig[] = [
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
      name: 'affiliateName',
      displayName: 'Afiliado',
      customClasses: 'f-w-500 fs-11px',
      type: 'text',
    },
    {
      name: 'issuerName',
      displayName: 'Prestador',
      customClasses: 'fs-11px',
      type: 'text',
    },
    {
      name: 'fromDate',
      displayName: 'Desde',
      customClasses: 'fs-11px',
      type: 'custom',
      format: (element: HealthPresentationDetailsDto) =>
        new Date(element.fromDate).toLocaleDateString(),
    },
    {
      name: 'toDate',
      displayName: 'Hasta',
      customClasses: 'fs-11px',
      type: 'custom',
      format: (element: HealthPresentationDetailsDto) =>
        new Date(element.toDate).toLocaleDateString(),
    },
    {
      name: 'total',
      customClasses: 'fs-11px one-line',
      displayName: 'Importe',
      type: 'custom',
      format: (element: HealthPresentationDetailsDto) =>
        this.currencyPipe.transform(element.total, '$ ', 'symbol', '1.2-2') ??
        '',
    },
  ];
  id: number;
  subtitle1: any;
  subtitle2: any;

  constructor(
    // private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  healthPresentation: HealthPresentationDto | null;

  ngOnInit() {
    this.healthService
      .getHealthPresentation()
      .subscribe((healthPresentation) => {
        this.healthPresentation = healthPresentation;
      });
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.id = params['id'];
        this.loadInvoices(this.id);
        this.onSearch();
      }
    });
  }

  private initForm(): void {
    // this.searchForm = this.formBuilder.group({
    //   healthServiceId: [''],
    //   dateFrom: [null],
    //   dateTo: [null],
    // });
  }

  loadInvoices(id: number) {
    this.filteredData$ = this.searchSubject.pipe(
      tap(() => this.isLoading$.next(true)),
      switchMap(() =>
        this.healthService
          .getInvoicesForHealthPresentationDetails(
            id,
            this.filter.currentPage,
            this.filter.pageSize
          )
          .pipe(
            tap((data) => {
              this.subtitle1 = data.total;
              this.subtitle2 = data.data
                .map((x) => x.total)
                .reduce((a, b) => a + b, 0);
            })
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
      healthServiceId: '',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      pageSize: 10,
    };

    this.onSearch();
  }

  healthServiceIdLookupConfig: LookupConfig = {
    placeholder: 'Obra social',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_SERVICES}?filter=0`,
    showAddNew: false,
    errorMessage: 'Seleccione una obra social',
  };
}
