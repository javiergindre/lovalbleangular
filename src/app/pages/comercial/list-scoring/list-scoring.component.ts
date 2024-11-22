import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { GenericPaginationTableComponent } from 'src/app/components/pagination-table/pagination-table.component';
import { ColumnConfig } from 'src/app/components/pagination-table/config';
import { ScoringService } from 'src/app/core/services/scoring.service';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatExpansionPanel } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';
import { Router } from '@angular/router';
import { Customer } from 'src/app/core/models/comercial/customer';
import { DateHelper } from 'src/app/core/helpers/date-helper';

@Component({
  selector: 'app-list-scoring',
  standalone: true,
  imports: [
    GenericPaginationTableComponent,
    MaterialModule,
    TablerIconsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './list-scoring.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListScoringComponent implements OnInit {
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel;
  @ViewChild(GenericPaginationTableComponent)
  tableComponent: GenericPaginationTableComponent;

  scoringService = inject(ScoringService);
  router = inject(Router);

  filteredData$: Observable<PaginatedResponse<Customer>>;
  private searchSubject = new BehaviorSubject<void>(undefined);
  isLoading$ = new BehaviorSubject<boolean>(false);

  currentPage = 1;
  pageSize = 10;

  filter = {
    dni: '',
    // name: '',
    // segment: '',
  };

  ngOnInit() {
    this.filteredData$ = this.searchSubject.pipe(
      tap(() => this.isLoading$.next(true)),
      switchMap(() =>
        this.scoringService.getCustomers(
          this.currentPage,
          this.pageSize,
          this.filter.dni
          // this.filter.document,
          // this.filter.segment
        )
      ),
      tap(() => this.isLoading$.next(false)),
      finalize(() => this.isLoading$.next(false))
    );

    this.onSearch();
  }

  onSearch() {
    this.isLoading$.next(true);
    if (this.expansionPanel && !this.expansionPanel.expanded) {
      // this.filter.document = '';
      // this.filter.segment = '';
    }
    this.currentPage = 1;
    if (this.tableComponent) {
      this.tableComponent.resetPaginator();
    }
    this.searchSubject.next();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.isLoading$.next(true);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.searchSubject.next();
  }

  columns: ColumnConfig[] = [
    {
      name: 'createDate',
      displayName: 'Fecha',
      type: 'text',

    },
    {
      name: 'name',
      displayName: 'Nombre',
      customClasses: 'f-w-500',
      type: 'text',
    },
    { name: 'incomePredictor', displayName: 'Ingresos', type: 'text' },
    { name: 'document', displayName: 'Documento', type: 'text' },
    { name: 'segment', displayName: 'Segmento', type: 'text' },
    { name: 'verazScore', displayName: 'Veraz Score', type: 'text' },
    { name: 'category', displayName: 'Categoría', type: 'text' },
    { name: 'geoNse', displayName: 'GeoNse', type: 'text' },
  ];

  clearFilters() {
    this.filter = {
      // document: '',
      // name: '',
      // segment: '',
      dni: '',
    };

    this.onSearch();

    if (this.expansionPanel.expanded) {
      this.expansionPanel.close();
    }
  }

  viewCustomerDetails(document: string) {
    this.router.navigate(['scoring/customer-details', document]);
  }
}
