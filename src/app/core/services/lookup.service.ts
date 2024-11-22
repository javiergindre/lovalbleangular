import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LookupModel } from '../models/lookup/lookup-model';
import { environment } from 'src/environments/environment';
import { map, Observable, of, pipe, retry, tap } from 'rxjs';
import { endpoints } from '../helpers/endpoints';
import { PaginatedResponse } from '../models/common/paginated-response';

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);
  constructor() {}

  getCountries(
    page: number,
    pageSize: number,
    search: string = '',
    filter: string = ''
  ): Observable<PaginatedResponse<LookupModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('typeId', 1);

    if (search) params = params.set('q', search);
    if (filter) params = params.set('parentId', filter);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_PLACES,
      { params }
    );
  }

  getProvinces(
    page: number,
    pageSize: number,
    search: string = '',
    filter: string = ''
  ): Observable<PaginatedResponse<LookupModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('typeId', 2);

    if (search) params = params.set('q', search);
    if (filter) params = params.set('parentId', filter);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_PLACES,
      { params }
    );
  }

  getMunicipalities(
    page: number,
    pageSize: number,
    search: string = '',
    filter: string = ''
  ): Observable<PaginatedResponse<LookupModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('typeId', 3);

    if (search) params = params.set('q', search);
    if (filter) params = params.set('parentId', filter);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_PLACES,
      { params }
    );
  }

  getLocalities(
    page: number,
    pageSize: number,
    search: string = '',
    filter: string = ''
  ): Observable<PaginatedResponse<LookupModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('typeId', 4);

    if (search) params = params.set('q', search);
    if (filter) params = params.set('parentId', filter);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_PLACES,
      { params }
    );
  }

  getHealthServices(
    page: number,
    pageSize: number,
    search: string = '',
    filter: string = '1'
  ): Observable<PaginatedResponse<LookupModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('q', search);
    if (filter) params = params.set('filter', filter);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_HEALTH_SERVICES,
      { params }
    );
  }

  getPlans(
    page: number,
    pageSize: number,
    search: string = '',
    filter: string = ''
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('q', search);
    if (filter) params = params.set('filter', filter);
    // params = params.set('filter', 4);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_HEALTH_SERVICES_PLANS,
      { params }
    );
  }

  getAffiliates(provider?: number | null) {
    if (provider) {
      console.log(provider);
      let params = new HttpParams().set('issuerId', provider.toString());
      return this.http.get<Affiliate[]>(
        this.baseUrl + endpoints.LOOKUP_AFFILIATES,
        { params }
      );
    }
    return this.http.get<Affiliate[]>(
      this.baseUrl + endpoints.LOOKUP_AFFILIATES
    );
  }

  getProducts(filter: string, issuerId?: number | null) {
    let params = new HttpParams().set('AffiliateCode', filter.toString());
    if (issuerId) {
      params = params.set('issuerId', issuerId.toString());

      return this.http.get<Affiliate[]>(
        this.baseUrl + endpoints.LOOKUP_AFFILIATES,
        {
          params,
        }
      );
    }
    return this.http.get<Affiliate[]>(
      this.baseUrl + endpoints.LOOKUP_AFFILIATES,
      { params }
    );
  }

  getProducts2(filter: string, issuerId?: number | null) {
    let params = new HttpParams().set('filter', filter.toString());

    return this.http.get<any>(
      this.baseUrl + endpoints.LOOKUP_HEALTH_PRODUCT,
      {
        params,
      }
    );
  }

  getTaxConditions(page: number, pageSize: number, search: string = '') {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (search) params = params.set('q', search);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_TAX_CONDITIONS,
      { params }
    );
  }

  getPeriod(page: number, pageSize: number, search: string = '') {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (search) params = params.set('q', search);

    return this.http.get<PaginatedResponse<LookupModel>>(
      this.baseUrl + endpoints.LOOKUP_PERIOD,
      { params }
    );
  }
}

export interface Affiliate {
  codeType: string;
  code: string;
  name: string;
  period: string;
  fromDate: Date;
  toDate: Date;
  productId: string;
  productName: string;
  productRequireDependency: string;
  treatmentRequestPracticeId: number;
}

export interface TaxCondition {
  name: string;
  issueLabel: string;
  description: string;
}
