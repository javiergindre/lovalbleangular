import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Customer } from '../models/comercial/customer';
import { PaginatedResponse } from '../models/common/paginated-response';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  getCustomers(
    page: number,
    pageSize: number,
    dni: string,
    // document: string,
    // segment: string
  ): Observable<PaginatedResponse<Customer>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('status', status.toString());

    if (dni) params = params.set('code', dni);
    // if (document) params = params.set('document', document);
    // if (segment) params = params.set('segment', segment);

    return this.http
      .get<any>(this.baseUrl + endpoints.COMERCIAL_SEGMENTATION_SCORING, {
        params,
      })
      .pipe(tap((result) => console.log(result)));
  }

  constructor() {}
}
