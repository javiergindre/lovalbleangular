import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  TemplateRef,
  Input,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DOCUMENT, NgSwitch } from '@angular/common';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { FormControl, Validators } from '@angular/forms';
import { CalendarFormDialogComponent } from './calendar-form-dialog/calendar-form-dialog.component';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarModule,
  CalendarView,
} from 'angular-calendar';
import { MaterialModule } from 'src/app/material.module';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormEventComponent } from '../form-event/form-event.component';
import { EntityType } from 'src/app/core/models/entityType/entityType';
import { StringOptionsWithImporter } from 'sass';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { EventService } from 'src/app/core/services/event.service';
import { EventEntityDto } from 'src/app/core/models/calendar/EventEntityDto';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FormCalendarComponent } from '../form-calendar/form-calendar.component';

const colors: any = {
  red: {
    primary: '#fa896b',
    secondary: '#fdede8',
  },
  blue: {
    primary: '#5d87ff',
    secondary: '#ecf2ff',
  },
  yellow: {
    primary: '#ffae1f',
    secondary: '#fef5e5',
  },
};

@Component({
  selector: 'app-fullcalendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fullcalendar.component.html',
  styleUrls: ['./fullcalendar.component.scss'],
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgSwitch,
    CalendarModule,
    CommonModule,
    MatDatepickerModule,
    MatDialogModule, MatFormFieldModule
  ],
  providers: [provideNativeDateAdapter(), CalendarDateFormatter],
})
export class AppFullcalendarComponent implements OnInit {


  constructor(public dialog: MatDialog, @Inject(DOCUMENT) doc: any) { }
  ngOnInit(): void {
    this.loadEvents();
  }

  _calendarService = inject(CalendarService)
  _eventService = inject(EventService)
  _cdr = inject(ChangeDetectorRef)
  @Input() entityType: EntityType;
  @Input() entityId: number
  titleCalendar: string;
  dialogRef: MatDialogRef<FormEventComponent> = Object.create(TemplateRef);
  dialogRef2: MatDialogRef<FormEventComponent> =
    Object.create(TemplateRef);

  lastCloseResult = '';
  actionsAlignment = '';

  config: MatDialogConfig = {
    disableClose: false,
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: '',
    },
    data: {
      action: '',
      event: [],
    },
  };
  numTemplateOpens = 0;

  view: any = 'month';
  viewDate: Date = new Date();

  actions: CalendarEventAction[] = [
    {
      label: '<span class="text-white link m-l-5">: Edit</span>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.editEvent(event);
      },
    },
    {
      label: '<span class="text-danger m-l-5">Delete</span>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.deleteEvent(event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[];
  eventsDto: EventEntityDto;


  activeDayIsOpen = true;

  modifyEventTitles(events: any[]): any[] {

    return events.map(event => ({
      ...event,
      title: `${event.title} - ${new Date(event.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }));
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });

    this.handleEvent('Dropped or resized', event);
  }
  handleEvent(action: string, event: CalendarEvent): void {
    this.config.data = { event, action };
  }


  addEvent(): void {
    let data: { entityId?: number, inputEvent?: any } = {};
    if (this.entityId)
      data["entityId"] = this.entityId;

    const dialogRef = this.dialog.open(FormEventComponent, {
      data,
      width: '40%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.eventData) {
        if (result.action == 'New') {
          const LeadEventDto: EventEntityDto = {
            calendarId: result.eventData.idCalendar,
            description: result.eventData.description,
            scheduleTime: result.eventData.scheduleTime,
            title: result.eventData.title,
            status: result.eventData.status,
            entityId: result.id,
            entityType: EntityType.Lead
          }
          this._eventService.addEvent(LeadEventDto).subscribe(
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

  addCalendar(): void {

    console.log(this.entityId, this.entityType);

    const data = {
      entityType: this.entityType ?? EntityType.User,
      entityId: this.entityId ?? parseInt(localStorage.getItem('idUser')!)
    };
    const dialogRef = this.dialog.open(FormCalendarComponent, {
      data,
      width: '20%',
      height: '8%',
    });
  }

  deleteEvent(eventToDelete: CalendarEvent): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message: 'Desea eliminar el evento?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._eventService.deleteEvent(this.convertCalendarEventToOriginal(eventToDelete)).subscribe(response => {
          this.loadEvents();
        }, error => {
          console.error('Error al eliminar el evento:', error);
        });
      }
    });
  }
  editEvent(eventToEdit: CalendarEvent): void {
    let data: { entityId?: number, inputEvent?: any } = {};
    if (this.entityId)
      data["entityId"] = this.entityId;
    if (this.entityType)
      data["inputEvent"] = this.convertCalendarEventToOriginal(eventToEdit);
    this.dialogRef2 = this.dialog.open(FormEventComponent, {
      panelClass: 'calendar-form-dialog',
      data
    });

    this.dialogRef2.afterClosed().subscribe((result) => {

      if (result) {
        console.log(result.action);

        if (result.action == 'Update') {
          this._eventService.editEvent(result.eventData).subscribe(
            (response) => {
              this.loadEvents();
            }
          );
        }
      }
    });


  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  loadEvents() {
    this._eventService.getEvents(this.entityId, this.entityType).subscribe((events: any) => {
      console.log(events);

      this.events = this.convertArrayToCalendarEvents(events, this.actions);
      console.log(this.events);
      this._cdr.detectChanges();
    });
  }



  convertArrayToCalendarEvents(inputs: any[], actions: CalendarEventAction[]): CalendarEvent[] {
    return inputs.map(input => ({
      id: input.id,
      start: new Date(input.scheduleTime),
      end: undefined,
      title: input.title,
      color: undefined,
      actions: actions,
      allDay: false,
      cssClass: undefined,
      resizable: undefined,
      draggable: false,
      meta: undefined,
    }));
  }

  convertCalendarEventToOriginal(event: CalendarEvent): any {
    return {
      id: event.id,
      scheduleTime: event.start.toISOString(), // Convertir a string ISO
      title: event.title
    };
  }



}
