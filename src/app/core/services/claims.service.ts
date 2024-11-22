import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PaginatedResponse } from '../models/common/paginated-response';
import { Observable, tap } from 'rxjs';
import { endpoints } from '../helpers/endpoints';
import { PersonListItemDTO } from '../models/persons/PersonListItemDTO';

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  constructor() { }
  getClaims(
    page: number,
    pageSize: number,
    WorkflowActivitiesGroupId: number,
    personCode?: string,
    personFirstName?: string,
    personLastName?: string,
    personEmail?: string
  ): Observable<PaginatedResponse<PersonListItemDTO>> {
    // si esta tengo que recibir -1 en el id
    const rejected = WorkflowActivitiesGroupId == -1 ? true : false;
    let params = new HttpParams().set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('WorkflowActivitiesGroupId', WorkflowActivitiesGroupId.toString())
      .set('Rejected', rejected.toString());

    if (personCode) params = params.set('PersonCode', personCode);
    if (personFirstName)
      params = params.set('PersonFirstName', personFirstName);
    if (personLastName) params = params.set('PersonLastName', personLastName);
    if (personEmail) params = params.set('PersonEmail', personEmail);

    return this.http
      .get<any>(this.baseUrl + endpoints.CLAIMS_GET, { params })
      .pipe(tap((result) => console.log(result)));
  }


  setActivityClaim(claimId: number, toActivityId: number): Observable<any> {
    const body = { ClaimId: claimId, ToActivityId: toActivityId };
  
    return this.http
      .post<any>(this.baseUrl + endpoints.CLAIMS_SET_ACTIVITY, body)
      .pipe(tap((result) => console.log('Set Activity Result:', result)));
  }
  
  
  rejectClaim(id: number, reason: string): Observable<any> {
    const body = { Id: id, Reason: reason };
  
    return this.http
      .post<any>(this.baseUrl + endpoints.CLAIMS_REJECT, body)
      .pipe(tap((result) => console.log('Reject Claim Result:', result)));
  }
  
  
}
