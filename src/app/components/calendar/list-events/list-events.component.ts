import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { EntityType } from 'src/app/core/models/entityType/entityType';
import { EventService } from 'src/app/core/services/event.service';
import { MaterialModule } from 'src/app/material.module';
import { Event } from 'src/app/core/models/calendar/Event';
import { FormEventComponent } from '../form-event/form-event.component';
import { EventEntityDto } from 'src/app/core/models/calendar/EventEntityDto';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DateFormatPipe } from 'src/app/pipe/date-format.pipe';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-list-events',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, DateFormatPipe],
  templateUrl: './list-events.component.html',
  styleUrl: './list-events.component.scss'
})
export class ListEventsComponent implements OnInit {
  minDate: Date = new Date();
  ngOnInit(): void {
    this._eventService.getEvents(this.entityId, this.entityType).subscribe((events: any) => {

      this.listEvents = events
        .map((event: any) => ({ ...event, scheduleTime: new Date(event.scheduleTime) })) // Convertir a Date si es necesario
        .sort((a: any, b: any) => b.scheduleTime.getTime() - a.scheduleTime.getTime()) // Ordenar por fecha descendente
        .slice(0, 5); // Limitar a los 5 primeros eventos más recientes

      console.log(this.listEvents); // Verificar los eventos resultantes
    });
  }
  constructor(private route: ActivatedRoute, private router: Router) { }

  @Input() entityId: number;
  @Input() entityType: number;
  @Input() listEvents: Event[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalItems: number = 0;
  pageSize: number = 5;
  currentPage: number = 0;
  dataSource = new MatTableDataSource<Event>();
  _cd = inject(ChangeDetectorRef);
  _eventService = inject(EventService);
  dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'title',
    'description',
    'time',
    'date',
    'action'
  ];
  deleteEvent(element: any) {
    console.log(element);

    this._eventService.deleteEvent(element).subscribe((event: any) => {
      console.log("eliminoooo");

      this.loadEvents();
    });
  }
  openDialog(action: string, element: any) {
    let data: { entityId?: number, inputEvent?: any } = {};
    if (this.entityId)
      data["entityId"] = this.entityId;
    if (action == 'Update')
      data["inputEvent"] = element;
    const dialogRef = this.dialog.open(FormEventComponent, {
      data,
      width: '25%',
    });
    // TODO: mejorar esto
    dialogRef.afterClosed().subscribe(result => {
      if (result.eventData) {
        if (result.action == 'Delete') {
          this.deleteEvent(result.eventData);
        }
        else if (result.action == 'New') {
          const EventDto: EventEntityDto = {
            calendarId: result.eventData.idCalendar,
            description: result.eventData.description,
            scheduleTime: result.eventData.scheduleTime,
            title: result.eventData.title,
            status: result.eventData.status,
            entityId: result.id,
            entityType: this.entityType
          }
          this._eventService.addEvent(EventDto).subscribe(
            (response) => {
              this.loadEvents();
            }
          );
        } else {
          if (result.action == 'Update') {
            this._eventService.editEvent(result.eventData).subscribe(
              (response) => {
                this.loadEvents();
              }
            );
          }
        }
      } else {
        this._eventService.editEvent(result.eventData).subscribe(
          (response) => {
            this.loadEvents();
          }
        );
      }
    });
  }

  redirectCalendars() {
    this.router.navigate(['/tools/calendar'], { queryParams: { entityType: this.entityType, entityId: this.entityId } });
  }

  loadEvents() {
    this._eventService.getEvents(this.entityId, this.entityType).subscribe((events: any) => {
      this.listEvents = events;
      this.dataSource.paginator = this.paginator;
      this.totalItems = events.length;
      this._cd.detectChanges();
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadEvents();
  }


}

