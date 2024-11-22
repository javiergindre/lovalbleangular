import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-form-calendar',
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
  templateUrl: './form-calendar.component.html',
  styleUrl: './form-calendar.component.scss'
})
export class FormCalendarComponent {

  newCalendarName: string = '';
  _calendarService = inject(CalendarService)
  constructor(
    public dialogRef: MatDialogRef<FormCalendarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  cancel(): void {
    this.dialogRef.close();
  }

  saveCalendar(): void {
    if (this.newCalendarName.trim()) {
      const newCalendar = {
        name: this.newCalendarName,
        entityType: this.data.entityType,
        entityId: this.data.entityId
      };
      this._calendarService.addCalendar(newCalendar).subscribe(() => {
        this.dialogRef.close(newCalendar);
      })
    }
  }

}
