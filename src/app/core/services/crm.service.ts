import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { Observable, tap } from 'rxjs';
import { PaginatedResponse } from '../models/common/paginated-response';
import { PersonListItemDTO } from '../models/persons/PersonListItemDTO';
@Injectable({
  providedIn: 'root',
})
export class CrmService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  getLeads(
    page: number,
    pageSize: number,
    WorkflowActivitiesGroupId: number,
    personCode?: string,
    personFirstName?: string,
    personLastName?: string,
    personEmail?: string
  ): Observable<PaginatedResponse<PersonListItemDTO>> {
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
      .get<any>(this.baseUrl + endpoints.CRM_LEADS, { params })
      .pipe(tap((result) => console.log(result)));
  }

  approveLead(id: number) {
    return this.http
      .post<any>(this.baseUrl + endpoints.CRM_LEADS_APPROVE + '/' + id, id)
      .pipe(tap((result) => console.log(result)));
  }

  setActivity(leadId: number, toActivityId: number) {
    const payload = {
      LeadId: leadId,
      ToActivityId: toActivityId
    };

    return this.http
      .post<any>(`${this.baseUrl}${endpoints.CRM_LEADS_SET_ACTIVITY}`, payload)
      .pipe(tap((result) => console.log(result)));
  }

  rejectLead(id: number, reason: string) {
    return this.http
      .post<any>(this.baseUrl + endpoints.CRM_LEADS_REJECT, { id, reason })
      .pipe(tap((result) => console.log(result)));
  }
}
