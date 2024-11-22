import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { CalendarRq } from '../models/calendar/CalendarRq';
import { EntityType } from '../models/entityType/entityType';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  constructor() { }



  addCalendar(calendar: CalendarRq) {
    const endpoint = `${this.baseUrl}${endpoints.CALENDAR_NEW}`;
    console.log(endpoint, calendar);

    return this.http.post(endpoint, calendar).pipe(tap((result) => console.log(result)));;
  }

  testAddCalendar() {
    const calendarData: CalendarRq = { entityType: 2, entityId: 9, name: 'kjbk' };
    console.log('Probar addCalendar con:', calendarData);
    this.addCalendar(calendarData).subscribe(
      response => console.log('Respuesta del servidor:', response),
      error => console.error('Error:', error)
    );
  }


  GetCalendars(entityType: EntityType, entityId: number) {

    let params = new HttpParams()
      .set('entityType', entityType.toString())
      .set('entityId', entityId.toString());
    const url = `${this.baseUrl}${endpoints.CALENDARS_LIST}`;

    return this.http.get<any>(url, { params }).pipe(
      tap(result => console.log(result))
    );
  }


  GetCalendar(eventId: number) {
    let params = new HttpParams()
      .set('eventId', eventId.toString())
    const url = `${this.baseUrl}${endpoints.CALENDARS_GET}`;

    return this.http.get<any>(url, { params }).pipe(
      tap(result => console.log(result))
    );
  }
}

