import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { WorkflowConfiguration } from '../models/workflows/workflow';

@Injectable({
  providedIn: 'root'
})
export class WorkFlowService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);
  constructor() { }
  getWorkFlowConfiguration(id: number): Observable<WorkflowConfiguration> {
    const endpoint = `${this.baseUrl}${endpoints.WORKFLOW_GET}`;
    let params = new HttpParams().set('id', id.toString());

    return this.http
      .get<WorkflowConfiguration>(endpoint, { params })
      .pipe(tap((result) => console.log(result)));
  }
}
