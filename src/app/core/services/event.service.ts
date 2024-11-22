import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { map, Observable, tap } from 'rxjs';
import { EventEntityDto } from '../models/calendar/EventEntityDto';
import { EntityType } from '../models/entityType/entityType';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  constructor() { }

  addEvent(event: EventEntityDto) {
    const endpoint = `${this.baseUrl}${endpoints.EVENT_NEW}`;
    return this.http.post(endpoint, event).pipe(tap((result) => console.log(result)));
  }
  editEvent(event: Event) {
    console.log(event);
    const endpoint = `${this.baseUrl}${endpoints.EVENT_EDIT}`;
    return this.http.post(endpoint, event).pipe(tap((result) => console.log(result)));
  }


  getEvents(entityId: number, entityType: number): Observable<Event[]> {
    const endpoint = `${this.baseUrl}${endpoints.EVENT_ENTITY_GET}`;
    console.log(endpoint);
    
    const params = new HttpParams()
      .set('entityType', entityType.valueOf().toString())
      .set('entityId', entityId.toString());
  
    return this.http.get<any[]>(endpoint, { params }).pipe(
      map(events => events.map(event => ({
        ...event,
        scheduleTime: new Date(new Date(event.scheduleTime).getTime() - (3 * 60 * 60 * 1000)) // UTC-3
      }))),
      tap(result => console.log(result))
    );
  }
  

  deleteEvent(event: Event) {
    console.log(event);

    const endpoint = `${this.baseUrl}${endpoints.EVENT_DELETE}`;
    return this.http.post(endpoint, event).pipe(tap((result) => console.log(result)));
  }




}
