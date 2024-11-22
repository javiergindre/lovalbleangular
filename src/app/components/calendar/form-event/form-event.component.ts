import { Component, EventEmitter, Inject, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MaterialModule } from 'src/app/material.module';
import { CalendarRq } from 'src/app/core/models/calendar/CalendarRq';
import { CommonModule } from '@angular/common';
import { EntityType } from 'src/app/core/models/entityType/entityType';
import { Event } from 'src/app/core/models/calendar/Event';
import { EventStatus } from 'src/app/core/models/calendar/EventStatus';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { EventService } from 'src/app/core/services/event.service';
import { isThisISOWeek } from 'date-fns';
@Component({
  selector: 'app-form-event',
  standalone: true,
  imports: [
    MaterialModule,
    TablerIconsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './form-event.component.html',
  styleUrl: './form-event.component.scss'
})
export class FormEventComponent implements OnInit {

  @Input() entityId: number = -1;
  @Input() entityType: number = -1;
  @Output() createEventEntity = new EventEmitter<{ id: number, eventData: Event }>();
  @Output() createEvent = new EventEmitter<Event>();
  @Output() editEvent = new EventEmitter<Event>();

  dialog = inject(MatDialog);

  addingNewCalendar: boolean = false;
  openEdit: boolean = false;
  newCalendarName: string = '';
  calendar: CalendarRq;
  calendars: any = [];
  minDate: Date = new Date();
  _calendarService = inject(CalendarService)
  _eventService = inject(EventService)
  @Input() inputEvent = {
    id: -1,
    date: undefined,
    time: '',
    title: '',
    description: '',
    calendar: -1,
  };

  constructor(
    public dialogRef: MatDialogRef<FormEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.data.entityId) {
      this.entityId = this.data.entityId;
      this.loadCalendars();
    }

  }

  loadCalendars(): void {
    this._calendarService.GetCalendars(EntityType.User, parseInt(localStorage.getItem('idUser')!)).subscribe(calendars => {
      this.calendars = calendars;
      if (this.data.inputEvent) {
        const date = new Date(this.data.inputEvent.scheduleTime.toString());
        const hours = date.getHours();
        const minutes = date.getMinutes();
        this.inputEvent.description = this.data.inputEvent.description;
        this.inputEvent.title = this.data.inputEvent.title;
        this.inputEvent.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        this.inputEvent.date = this.data.inputEvent.scheduleTime;
        this.inputEvent.id = this.data.inputEvent.id;
        this._calendarService.GetCalendar(this.data.inputEvent.id).subscribe(calendar => {
          this.inputEvent.calendar = calendar.id;
        });
        const calendarIndex = this.calendars.findIndex((calendar: any) => calendar.id == this.data.inputEvent.idCalendar);

        if (calendarIndex !== -1) {
          this.inputEvent.calendar = calendarIndex;
        }
        this.openEdit = true;
      }
    });
  }

  addNewCalendar() {

    if (this.newCalendarName != '') {
      this.calendars.push(this.newCalendarName);
      const calendarRq: CalendarRq = {
        entityType: EntityType.User,
        entityId: parseInt(localStorage.getItem('idUser')!),
        name: this.newCalendarName
      }
      this._calendarService.addCalendar(calendarRq)
        .subscribe(() => {
          this.loadCalendars();
        });
    }
    this.addingNewCalendar = !this.addingNewCalendar;
  }


  toggleAddCalendar() {
    this.addingNewCalendar = !this.addingNewCalendar;
  }

  deleteEvent() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message: 'Desea eliminar el evento?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.actionEvent(true);
      }
    });
  }



  actionEvent(deleteEvent = false) {
    if (deleteEvent) {
      const event: Event = {
        id: this.inputEvent.id,
        description: this.inputEvent.description,
        scheduleTime: this.getDateWithTime(this.inputEvent.date!, this.inputEvent.time)!,
        title: this.inputEvent.title,
        idCalendar: this.inputEvent.calendar,
        status: EventStatus.confirmed
      }
      this.dialogRef.close({ id: this.entityId, eventData: event, action: 'Delete' });
    }
    console.log("aaa");

    if (this.validateEvent()) {
      const combinedDate = this.getDateWithTime(this.inputEvent.date!, this.inputEvent.time)
      if (combinedDate) {
        const event: Event = {
          id: this.inputEvent.id,
          description: this.inputEvent.description,
          scheduleTime: combinedDate,
          title: this.inputEvent.title,
          idCalendar: this.inputEvent.calendar,
          status: EventStatus.confirmed
        }
        if (this.entityId != -1) {
          this.createEventEntity.emit({ id: this.entityId, eventData: event });
          if (deleteEvent)
            this.dialogRef.close({ id: this.entityId, eventData: event, action: 'Delete' });
          else if (this.openEdit)
            this.dialogRef.close({ id: this.entityId, eventData: event, action: 'Update' });
          else
            this.dialogRef.close({ id: this.entityId, eventData: event, action: 'New' });
        } else {
          this.createEvent.emit(event);
          this.dialogRef.close(event);
        }
      } else {
        console.error('La fecha y hora combinadas no son válidas');
      }
    }

  }


  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
  cancel() {
    this.dialogRef.close();
  }

  validateEvent(): boolean {
    console.log("en validar");

    if (this.inputEvent.calendar != -1 && this.inputEvent.date &&
      this.inputEvent.time !== '' && this.inputEvent.title !== '') {
      console.log("primer if");

      const today = new Date();
      const selectedDate = new Date(this.inputEvent.date);
      // si la fecha es hoy
      if (
        selectedDate.getDate() === today.getDate() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear()) {

        const [selectedHour, selectedMinute] = this.inputEvent.time.split(':').map(Number);
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        // Validacion adicional si la fecha es hoy -> que la hora seleccionada no sea anterior a la hora actual
        if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
          this.showErrorMessage('La hora seleccionada no puede ser anterior a la hora actual.');
          return false;
        }
      }
      return true;
    }
    return false;
  }



  getDateWithTime(date: Date, time: string): Date | undefined {
    date = new Date(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const timeParts = time.split(':');
    if (timeParts.length === 2) {
      const [hours, minutes] = timeParts;

      return new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
    }
    return undefined;
  }

  onClose(): void {
    this.dialogRef.close();
  }

}