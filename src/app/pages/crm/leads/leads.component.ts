import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap, finalize, map } from 'rxjs/operators';
import { GenericPaginationTableComponent } from 'src/app/components/pagination-table/pagination-table.component';
import { ColumnConfig } from 'src/app/components/pagination-table/config';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatExpansionPanel } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';
import { CrmService } from 'src/app/core/services/crm.service';
import { DateFormatPipe } from 'src/app/pipe/date-format.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ModalRejectReasonsComponent } from './components/modal-reject-reasons/modal-reject-reasons.component';
import {
  TabOption,
  UserRole,
} from 'src/app/components/pagination-table/models/tab-option';
import { SessionService } from 'src/app/core/services/session.service';
import { allTabOptions, LeadsStatus } from './tab-options';
import { CommentComponent } from 'src/app/components/Messages/comment/comment.component';
import { Message } from 'src/app/core/models/messages/message';
import { MessagesLeadsComponent } from './components/messages-leads/messages-leads.component';
import { DateHelper } from 'src/app/core/helpers/date-helper';
import { FormEventComponent } from '../../../components/calendar/form-event/form-event.component';
import { Event } from 'src/app/core/models/calendar/Event';
import { EventService } from 'src/app/core/services/event.service';
import { EventEntityDto } from 'src/app/core/models/calendar/EventEntityDto';
import { EntityType } from 'src/app/core/models/entityType/entityType';
import { ListEventsComponent } from '../../../components/calendar/list-events/list-events.component';
import { WorkFlowService } from 'src/app/core/services/work-flow.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import {
  Activity,
  ActivityGroup,
  Workflow,
} from 'src/app/core/models/workflows/workflow';
import { WellKnownWorkflowTypes } from 'src/app/core/models/workflows/WellKnownWorkflowTypes';
import { PersonListItemDTO } from 'src/app/components/claims/claims.component';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    GenericPaginationTableComponent,
    MaterialModule,
    TablerIconsModule,
    CommonModule,
    FormsModule,
    DateFormatPipe,
    MessagesLeadsComponent,
    FormEventComponent,
    FormEventComponent,
    ListEventsComponent,
    MatButtonToggleModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsComponent implements OnInit {
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel;
  @ViewChild(GenericPaginationTableComponent)
  entityType: EntityType = EntityType.Lead;
  tableComponent: GenericPaginationTableComponent;
  _eventService = inject(EventService);
  crmService = inject(CrmService);
  sessionService = inject(SessionService);
  dialog = inject(MatDialog);
  _workFlowService = inject(WorkFlowService);
  _cdr = inject(ChangeDetectorRef);

  filteredData$: Observable<PaginatedResponse<PersonListItemDTO>>;
  isLoading$ = new BehaviorSubject<boolean>(false);
  tabOptions: TabOption[] = [];
  isFinalCurrentTab = false;
  isProvider: boolean = false;
  isSalesManager: boolean = false;
  expandedElement = false;
  setActivityOptions?: any = [];
  workFlows?: Workflow[] = [];
  selectedWorkFlowId: number = -1;
  currentPage = 1;
  pageSize = 10;

  filter = {
    WorkflowActivitiesGroupId: 0,
    personCode: '',
    personFirstName: '',
    personLastName: '',
  };

  baseColumns: ColumnConfig[] = [
    { name: 'campaignName', displayName: 'Campaña', type: 'text' },
    {
      name: 'formReponseDate',
      displayName: 'Fecha',
      type: 'date',
      format: (element: PersonListItemDTO) =>
        DateHelper.utcToLocalString(element.formReponseDate), // Adjust for local formatting
    },
    { name: 'personCode', displayName: 'DNI', type: 'text' },
    { name: 'personFirstName', displayName: 'Nombre', type: 'text' },
    { name: 'personLastName', displayName: 'Apellido', type: 'text' },
    { name: 'personAge', displayName: 'Edad', type: 'text' },
  ];

  columns: ColumnConfig[] = [...this.baseColumns];

  private searchSubject = new BehaviorSubject<void>(undefined);
  workflow: any;

  ngOnInit() {
    this.initializeDataStream();

    this.sessionService.isSalesManager$.subscribe((isSalesManager) => {
      this.isSalesManager = isSalesManager;
      this.updateTabOptions();
      this.updateColumns();
    });
    this.updateColumns(); // Initial column setup
    this.onSearch(); // Initial search

    this.sessionService.workFlows$.subscribe((workFlows) => {
      this.workFlows = workFlows.filter(
        (workFlow) =>
          workFlow.workflowType == WellKnownWorkflowTypes.LeadApproval
      );
      if (this.workFlows.length > 0) {
        this.selectedWorkFlowId = this.workFlows[0].workflowId;
      }
      this.updateTabOptions();
    });
  }

  initializeDataStream() {
    this.filteredData$ = this.searchSubject.pipe(
      tap(() => this.isLoading$.next(true)),
      switchMap(() =>
        this.crmService.getLeads(
          this.currentPage,
          this.pageSize,
          this.filter.WorkflowActivitiesGroupId,
          this.filter.personCode,
          this.filter.personFirstName,
          this.filter.personLastName
        )
      ),
      tap(() => this.isLoading$.next(false)),
      finalize(() => this.isLoading$.next(false))
    );
  }

  onWorkFlowChange(id: number): void {
    this.selectedWorkFlowId = id;
    this.updateTabOptions();
  }

  updateTabOptions() {
    const userRole: UserRole = this.isProvider ? 'provider' : 'non-provider';

    if (this.selectedWorkFlowId != -1) {
      this._workFlowService
        .getWorkFlowConfiguration(this.selectedWorkFlowId)
        .subscribe((workFlowData) => {
          console.log(workFlowData);

          this.tabOptions = workFlowData.activityGroupDTOs.map(
            (group: ActivityGroup) => ({
              label: group.name,
              value: group.id.toString(),
              visibleTo: ['provider', 'non-provider'],
              isFinal: group.isFinal,
              setActivities: {
                provider: group.toActivities.map((activity: Activity) => ({
                  id: activity.id,
                  name: activity.name,
                  isActive: true,
                })),
                nonProvider: group.toActivities.map((activity: Activity) => ({
                  id: activity.id,
                  name: activity.name,
                  isActive: true,
                })),
              },
            })
          );

          if (
            workFlowData.activityGroupDTOs.length > 0 &&
            workFlowData.rejectedTabName
          ) {
            this.tabOptions.push({
              label: workFlowData.rejectedTabName,
              value: '-1',
              visibleTo: ['provider', 'non-provider'],
              isFinal: true,
            });
          }
          let currentTab = this.tabOptions.find(
            (tab) =>
              tab.value == this.filter.WorkflowActivitiesGroupId.toString()
          );
          let indexCurrentTab = currentTab
            ? currentTab.value
            : this.tabOptions.length > 0
            ? this.tabOptions[0].value
            : '0';

          // if (this.isSalesManager) {
          //   this.setActivityOptions = currentTab?.setActivities?.provider;
          // } else {
          //   this.setActivityOptions = currentTab?.setActivities?.['non-provider'];
          // }
          this.setActivityOptions = currentTab?.setActivities?.provider;
          this.onTabChange(indexCurrentTab);
        });
    }

    if (
      !this.tabOptions.some(
        (tab) => tab.value === this.filter.WorkflowActivitiesGroupId.toString()
      )
    ) {
      this.filter.WorkflowActivitiesGroupId = parseInt(
        this.tabOptions[0]?.value || '0',
        10
      );
    }
  }

  updateColumns() {
    this.columns = [...this.baseColumns];
    console.log(this.filter.WorkflowActivitiesGroupId, LeadsStatus.rejected);

    if (this.filter.WorkflowActivitiesGroupId == -1) {
      this.columns.push({
        name: 'rejectReason',
        displayName: 'Motivo',
        type: 'text',
      });
    }

    if (this.isSalesManager) {
      this.columns.push({
        name: 'userPersonName',
        displayName: 'Usuario asignado',
        type: 'text',
      });
    }
  }
  toogleExpandedElement() {
    this.expandedElement = !this.expandedElement;
  }

  onOptionSelected(lead: any, optionSelected: any) {
    let action = this.setActivityOptions.find(
      (option: any) => option.id == optionSelected
    );
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message: 'Desea asignar el lead en ' + action.name + ' ?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.crmService.setActivity(lead.id, action.id).subscribe({
          next: () => {
            console.log('Lead asignado a ' + action.name + ' corretamente');
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => {
            this.isLoading$.next(false);
            this.onSearch();
          },
        });
      }
    });
  }

  onTabChange(event: string) {
    let currentTab = this.tabOptions.find((tab) => tab.value === event);
    this.setActivityOptions = currentTab?.setActivities?.provider;
    // if (this.isSalesManager) {
    //   this.setActivityOptions = currentTab?.setActivities?.provider;

    // } else {
    //   this.setActivityOptions = currentTab?.setActivities?.['non-provider'];
    // }

    this.setActivityOptions = currentTab?.setActivities?.provider;
    this.filter.WorkflowActivitiesGroupId = parseInt(event, 10);
    this.currentPage = 1;
    if (this.tableComponent) {
      this.tableComponent.resetPaginator();
    }
    this.isFinalCurrentTab = currentTab?.isFinal!;
    this.updateColumns(); // Llamamos a updateColumns aquí
    this.searchSubject.next();
  }

  onSearch() {
    this.currentPage = 1;
    if (this.tableComponent) {
      this.tableComponent.resetPaginator();
    }
    this.searchSubject.next();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.searchSubject.next();
  }

  clearFilters() {
    this.filter = {
      WorkflowActivitiesGroupId: this.filter.WorkflowActivitiesGroupId,
      personCode: '',
      personFirstName: '',
      personLastName: '',
    };

    this.onSearch();

    if (this.expansionPanel.expanded) {
      this.expansionPanel.close();
    }
  }

  loadData() {
    this.isLoading$.next(true);
    this.filteredData$ = this.crmService
      .getLeads(
        this.currentPage,
        this.pageSize,
        this.filter.WorkflowActivitiesGroupId,
        this.filter.personCode,
        this.filter.personFirstName,
        this.filter.personLastName
      )
      .pipe(finalize(() => this.isLoading$.next(false)));
  }

  getParsedFields(formResponseFields: string): any[] {
    try {
      console.log(formResponseFields);

      console.log(JSON.parse(formResponseFields));
      return JSON.parse(formResponseFields);
    } catch (error) {
      console.error('Error parsing formResponseFields:', error);
      return [];
    }
  }

  readonly rejectDialog = inject(MatDialog);

  reject(id: number) {
    const dialogRef = this.rejectDialog.open(ModalRejectReasonsComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading$.next(true);

        this.crmService.rejectLead(id, result).subscribe({
          next: () => {
            console.log('Rechazado con éxito');
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => {
            this.isLoading$.next(false);
            this.onSearch();
          },
        });
      }
    });
  }

  approve(id: number) {
    this.isLoading$.next(true);
    this.crmService.approveLead(id).subscribe({
      next: () => {
        console.log('Aprobado con éxito');
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        this.isLoading$.next(false);
        this.onSearch();
      },
    });
  }

  onCreateEvent($event: { id: number; eventData: Event }) {
    const LeadEventDto: EventEntityDto = {
      calendarId: $event.eventData.idCalendar,
      description: $event.eventData.description,
      scheduleTime: $event.eventData.scheduleTime,
      title: $event.eventData.title,
      status: $event.eventData.status,
      entityId: $event.id,
      entityType: EntityType.Lead,
    };

    this._eventService.addEvent(LeadEventDto).subscribe((response) => {});
  }
}
