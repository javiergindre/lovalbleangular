import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { GenericPaginationTableComponent } from 'src/app/components/pagination-table/pagination-table.component';
import { PatientListItemDTO } from '../../../core/models/invoices/patient';
import { ColumnConfig } from 'src/app/components/pagination-table/config';
import { HealthService } from 'src/app/core/services/health.service';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatExpansionPanel } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-patients',
  standalone: true,
  imports: [
    GenericPaginationTableComponent,
    MaterialModule,
    TablerIconsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './list-patients.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPatientsComponent implements OnInit {
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel;
  @ViewChild(GenericPaginationTableComponent)
  tableComponent: GenericPaginationTableComponent;

  healthService = inject(HealthService);
  router = inject(Router);

  filteredData$: Observable<PaginatedResponse<PatientListItemDTO>>;
  private searchSubject = new BehaviorSubject<void>(undefined);
  isLoading$ = new BehaviorSubject<boolean>(false);

  currentPage = 1;
  pageSize = 10;

  filter = {
    code: '',
    credential: '',
    name: '',
    plan: '',
  };

  ngOnInit() {
    this.filteredData$ = this.searchSubject.pipe(
      tap(() => this.isLoading$.next(true)),
      switchMap(() =>
        this.healthService.getPatients(
          this.currentPage,
          this.pageSize,
          this.filter.name,
          this.filter.code,
          this.filter.credential,
          this.filter.plan
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
      this.filter.code = '';
      this.filter.credential = '';
      this.filter.plan = '';
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
      name: 'name',
      displayName: 'Paciente',
      customClasses: 'f-w-500',
      type: 'text',
    },
    { name: 'code', displayName: 'DNI', type: 'text' },
    { name: 'cardNumber', displayName: 'Credencial', type: 'text' },
    {
      name: 'plan',
      displayName: 'Plan',
      type: 'custom',
      format: (element: PatientListItemDTO) =>
        element.healthServicePlan || 'No especificado',
    },
    {
      name: 'healthServiceCode',
      displayName: 'Servicio de Salud',
      type: 'text',
    },
  ];

  clearFilters() {
    this.filter = {
      code: '',
      credential: '',
      name: '',
      plan: '',
    };

    this.onSearch();

    if (this.expansionPanel.expanded) {
      this.expansionPanel.close();
    }
  }

  goAnamnesis(healthServicePatientId: string) {
    this.router.navigate(['health/monitoring/anamnesis', healthServicePatientId]);
  }

  goEdit(healthServicePatientId: number) {
    this.router.navigate(['health/monitoring/patients/edit', healthServicePatientId]);
  }
}
