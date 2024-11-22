import {
  Component,
  Input,
  ViewChild,
  OnInit,
  ContentChild,
  TemplateRef,
  Output,
  EventEmitter,
  ElementRef,
  inject,
  SimpleChanges,
} from '@angular/core';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ColumnConfig } from './config';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { TabOption, UserRole } from './models/tab-option';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DateFormatPipe } from 'src/app/pipe/date-format.pipe';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-generic-pagination-table',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    CommonModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './pagination-table.component.html',
  styleUrls: ['./pagination-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class GenericPaginationTableComponent implements OnInit {
  @Input() data$!: Observable<PaginatedResponse<any>>;
  @Input() columns!: ColumnConfig[];
  @Input() title = '';
  @Input() subtitle = '';
  @Input() expandable = false;
  @Input() showCreateButton = true;
  @Input() tabOptions?: TabOption[];

  @Input() createRoute: string = '/health/monitoring/patients/create';
  @Input() userRole: UserRole = 'non-provider';
  @Input() isLoading$: Observable<boolean>;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() edit = new EventEmitter<any>();
  @Output() confirm = new EventEmitter<any>();
  @Output() download = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();
  @Output() signature = new EventEmitter<any>();
  @Output() customAction = new EventEmitter<any>();
  @Output() viewAction = new EventEmitter<any>();

  @ContentChild('expandedContent') expandedContentTemplate: TemplateRef<any>;
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  displayedColumnsWithExpand: string[] = [];
  expandedElement: any | null = null;

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  currentTabValue: string;
  @Input() selectedTabIndex: number = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.data$.subscribe((response) => {
      this.dataSource.data = response.data;
      this.totalItems = response.total;
      this.pageSize = response.pageSize;
      this.currentPage = response.page - 1;
    });

    this.updateDisplayedColumns();
  }

  resetPaginator() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  onPageChange(event: PageEvent) {
    const scrollTop = this.tableContainer.nativeElement.scrollTop;
    this.pageChange.emit(event);
    // Mantener la posición del scroll
    setTimeout(() => {
      this.tableContainer.nativeElement.scrollTop = scrollTop;
    });
  }
  onOptionSelected(element: any) {}

  updateDisplayedColumns() {
    this.displayedColumns = [...this.columns.map((col) => col.name)];

    const currentTab = this.tabOptions?.[this.selectedTabIndex];

    if (currentTab) {
      if (currentTab.addConfirm?.[this.userRole]) {
        this.displayedColumns.push('confirm');
      }
      if (currentTab.addActions?.[this.userRole]) {
        this.displayedColumns.push('actions');
      }
      if (currentTab.addView?.[this.userRole]) {
        this.displayedColumns.push('view');
      }
    }

    this.displayedColumnsWithExpand = this.expandable
      ? [...this.displayedColumns, 'expand']
      : this.displayedColumns;

    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((result) => {
        this.displayedColumns = result.matches
          ? this.displayedColumns
          : this.displayedColumns;
        this.displayedColumnsWithExpand = this.expandable
          ? [...this.displayedColumns, 'expand']
          : this.displayedColumns;
      });
  }

  onTabChange(event: any) {
    if (this.tabOptions) {
      const selectedTab = this.tabOptions[event.index];
      const selectedTabValue = selectedTab.value;

      this.displayedColumns = [...this.columns.map((col) => col.name)];

      if (selectedTab.addConfirm?.[this.userRole]) {
        this.displayedColumns.push('confirm');
      }

      if (selectedTab.addActions?.[this.userRole]) {
        this.displayedColumns.push('actions');
      }

      if (selectedTab.addSignature?.[this.userRole]) {
        this.displayedColumns.push('signature');
      }
      if (selectedTab.addDownload?.[this.userRole]) {
        this.displayedColumns.push('download');
      }
      if (selectedTab.addCustomColumn?.[this.userRole]) {
        this.currentTabValue = selectedTabValue;
        this.displayedColumns.push('custom');
      }
      if (selectedTab.addView?.[this.userRole]) {
        this.displayedColumns.push('view');
      }

      this.displayedColumnsWithExpand = this.expandable
        ? [...this.displayedColumns, 'expand']
        : this.displayedColumns;

      this.breakpointObserver
        .observe(['(max-width: 600px)'])
        .subscribe((result) => {
          this.displayedColumns = result.matches
            ? this.displayedColumns
            : this.displayedColumns;
          this.displayedColumnsWithExpand = this.expandable
            ? [...this.displayedColumns, 'expand']
            : this.displayedColumns;
        });

      this.tabChange.emit(selectedTabValue);
    }
  }

  getHeaderClass(column: ColumnConfig): string {
    let classes = 'f-w-600 mat-subtitle-1 f-s-14';
    if (column.customHeaderClasses) classes += ` ${column.customHeaderClasses}`;
    return classes;
  }

  getCellClass(column: ColumnConfig): string {
    let classes = 'f-s-14';
    if (column.customClasses) classes += ` ${column.customClasses}`;
    return classes;
  }

  navigateToCreate() {
    this.create.emit();
    this.router.navigate([this.createRoute]);
  }

  expandElement(element: any) {
    if (this.expandable) {
      this.expandedElement = this.expandedElement === element ? null : element;
    }
  }

  onEdit(element: any) {
    this.edit.emit(element);
  }

  onSignature(element: any) {
    this.signature.emit(element);
  }

  readonly dialog = inject(MatDialog);

  onConfirm(element: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message: 'Desea confirmar la factura?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.confirm.emit(element);
      }
    });
  }

  onDownload(element: any) {
    this.download.emit(element);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) {
      this.updateDisplayedColumns();
    }
  }

  getCustomColumnContent(element: any): string | SafeHtml {
    const currentTabOption = this.tabOptions?.find(
      (tab) => tab.value === this.currentTabValue
    );
    const customColumn = currentTabOption?.addCustomColumn?.[this.userRole];

    if (customColumn?.condition && !customColumn.condition(element)) {
      return this.getSafeHtml(
        '<span class="bg-light-warning text-warning rounded f-w-600 p-6 p-y-4 f-s-12">Pendiente</span>'
      );
    }

    return customColumn?.content || '';
  }

  getCustomColumnType(element: any): 'icon' | 'text' {
    const currentTabOption = this.tabOptions?.find(
      (tab) => tab.value === this.currentTabValue
    );
    const customColumn = currentTabOption?.addCustomColumn?.[this.userRole];

    if (customColumn?.condition && !customColumn.condition(element)) {
      return 'text';
    }

    return customColumn?.type || 'text';
  }

  onCustomAction(element: any): void {
    const currentTabOption = this.tabOptions?.find(
      (tab) => tab.value === this.currentTabValue
    );
    const actionConfig = currentTabOption?.addCustomColumn?.[this.userRole];
    if (actionConfig) this.customAction.emit(element);
  }

  // revisar funcionalidad
  getCustomColumnHeader(): string {
    return 'Acciones';
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  onViewAction(element: any): void {
    this.viewAction.emit(element);
  }
}
