// top-documents.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaginatedRqDTO,
  TopDocument,
} from 'src/app/pages/starter/models/top-documents-interfaces';
import { PaginatedResponse } from '../models/common/paginated-response';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';

@Injectable({
  providedIn: 'root',
})
export class TopDocumentsService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTopDocuments(
    params: PaginatedRqDTO
  ): Observable<PaginatedResponse<TopDocument>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.filter) httpParams = httpParams.set('filter', params.filter);

    return this.http.get<PaginatedResponse<TopDocument>>(
      `${this.baseUrl}${endpoints.TOP_DOCUMENTS}`,
      { params: httpParams }
    );
  }
}
