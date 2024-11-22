import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import { PatientRqDTO } from '../models/health/patients';
import { PatientListItemDTO } from 'src/app/core/models/invoices/patient';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { PaginatedResponse } from '../models/common/paginated-response';
import { HealthInvoice } from 'src/app/core/models/invoices/health-invoices';
import { RejectInvoiceDTO } from '../models/invoices/reject-invoice-dto';
import { FileData } from '../models/invoices/FileData';
import { LookupModel } from '../models/lookup/lookup-model';
import {
  createHealthPresentationRqDTO,
  HealthPresentationDetailsDto,
  HealthPresentationDto,
} from '../models/health/health-presentations';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  createPatient(patient: PatientRqDTO) {
    return this.http.post<any>(
      this.baseUrl + endpoints.HEALTH_PATIENTS,
      patient
    );
  }

  getPatients(
    page: number,
    pageSize: number,
    name?: string,
    code?: string,
    credential?: string,
    plan?: string
  ): Observable<PaginatedResponse<PatientListItemDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (name) params = params.set('name', name);
    if (code) params = params.set('code', code);
    if (credential) params = params.set('credential', credential);
    if (plan) params = params.set('plan', plan);

    return this.http.get<PaginatedResponse<PatientListItemDTO>>(
      this.baseUrl + endpoints.HEALTH_PATIENTS,
      { params }
    );
  }

  getPatient(id: number): Observable<PatientRqDTO> {
    let params = new HttpParams().set('HealthServicePatientId', id.toString());

    return this.http.get<PatientRqDTO>(
      this.baseUrl + endpoints.HEALTH_PATIENT,
      { params }
    );
  }

  downloadHealtInvoices(filesInvoices: FileData[]): any {
    filesInvoices.forEach((file: FileData) => {
      if (file.content && file.fileName && file.contentType) {
        const byteCharacters = atob(file.content.toString());
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.contentType });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.fileName.split('/').pop() || 'file.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    });
  }

  downloadHealtInvoiceReceipt(guid: string) {
    return this.http.post(
      this.baseUrl + endpoints.HEALTH_INVOICE_RECEIPT,
      { path: guid },
      {
        responseType: 'blob', // expecting a binary file
      }
    );
  }

  getHealthInvoices(
    page: number,
    pageSize: number,
    affiliateName: string,
    affiliateCode: string,
    providerName: string,
    invoicePeriod: string,
    invoiceNumber: string,
    status: string
  ): Observable<PaginatedResponse<HealthInvoice>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('affiliateName', affiliateName.toString())
      .set('providerName', providerName.toString())
      .set('AffiliateCode', affiliateCode.toString())
      .set('invoicePeriod', invoicePeriod.toString())
      .set('invoiceNumber', invoiceNumber.toString());
    // console.log(typeof invoicePeriod);

    const statusArray = status.split(',');
    statusArray.forEach((st) => {
      params = params.append('status', st);
    });

    return this.http
      .get<PaginatedResponse<HealthInvoice>>(
        this.baseUrl + endpoints.HEALTH_INVOICES,
        { params }
      )
      .pipe
      // tap((res) => res.data.forEach((invoice) => console.log(invoice.status)))
      ();
  }

  createInvoice(formData: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}${endpoints.HEALTH_INVOICE}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(catchError(this.handleError));
  }

  updateInvoice(formData: FormData): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}${endpoints.HEALTH_INVOICE}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(catchError(this.handleError));
  }

  getInvoice(guid: string) {
    let params = new HttpParams().set('guid', guid);

    return this.http.get<HealthInvoice>(
      this.baseUrl + endpoints.HEALTH_INVOICE,
      { params }
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error detallado:', error);
    if (error.error === 'Conflict with invoice status') {
      return throwError('Factura previamente cargada');
    }
    return throwError(
      'Algo salió mal; por favor, inténtalo de nuevo más tarde.'
    );
  }

  confirmInvoice(invoice: HealthInvoice): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}${endpoints.HEALTH_INVOICE_CONFIRM}`,
      invoice,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  signatureInvoice(signature: FormData): Observable<any> {
    return this.http
      .post<any>(
        `${this.baseUrl}${endpoints.HEALTH_INVOICE_INVOICE_SIGNATURE}`,
        signature,
        {
          reportProgress: true,
          observe: 'events',
        }
      )
      .pipe(catchError(async (e) => console.log(e)));
  }

  confirmInvoiceForm(invoice: FormData): Observable<any> {
    return this.http
      .post<any>(
        `${this.baseUrl}${endpoints.HEALTH_INVOICE_CONFIRM_FILES}`,
        invoice,
        {
          reportProgress: true,
          observe: 'events',
        }
      )
      .pipe(catchError(this.handleError));
  }

  approveInvoice(invoice: HealthInvoice): Observable<any> {
    return this.http
      .post<any>(
        `${this.baseUrl}${endpoints.HEALTH_INVOICE_APPROVE}`,
        invoice,
        {
          reportProgress: true,
          observe: 'events',
        }
      )
      .pipe(catchError(this.handleError));
  }

  rejectInvoice(invoice: RejectInvoiceDTO): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}${endpoints.HEALTH_INVOICE_REJECT}`, invoice, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(catchError(this.handleError));
  }

  getRejectReasons() {
    return this.http.get<RejectReasons[]>(
      this.baseUrl + endpoints.HEALTH_INVOICE_REJECT_REASONS
    );
  }

  createCreditNote(payload: FormData): Observable<any> {
    return this.http.post<RejectReasons[]>(
      this.baseUrl + endpoints.HEALTH_INVOICE_CONFIRM_CREDIT_NOTE,
      payload
    );
  }

  closeCreditNote(payload: FormData): Observable<any> {
    return this.http.post<RejectReasons[]>(
      this.baseUrl + endpoints.HEALTH_INVOICE_CLOSE_CREDIT_NOTE,
      payload
    );
  }

  backToApproval(payload: InvoiceSetStatusRqDTO): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + endpoints.HEALTH_INVOICE_SET_STATUS,
      payload
    );
  }

  getInvoicesForRedemptionLots(
    healthService: number,
    dateFrom: string,
    dateTo: string
  ): Observable<HealthInvoice[]> {
    console.log(healthService, dateFrom, dateTo);

    let params = new HttpParams()
      .set('HealthServiceId', healthService.toString())
      .set('FromDate', dateFrom.toString())
      .set('ToDate', dateTo.toString());

    return this.http
      .get<HealthInvoice[]>(
        this.baseUrl + endpoints.HEALTH_INVOICE_REDEMPTION_LOTS,
        { params }
      )
      .pipe(map((res) => res));
  }

  generateRedemptionLots(rq: createHealthPresentationRqDTO): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + endpoints.HEALTH_PRESENTATIONS_LOTS,
      rq
    );
  }

  getInvoicesForHealthPresentations(
    healthService: string,
    dateFrom: string,
    dateTo: string,
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<HealthPresentationDto>> {
    console.log(healthService, dateFrom, dateTo);

    if (dateFrom === null || dateFrom === '') dateFrom = new Date().toISOString();
    if (dateTo === null || dateTo === '') dateTo = new Date().toISOString();

    let params = new HttpParams()
      .set('HealthServiceId', healthService.toString())
      .set('FromDate', dateFrom.toString())
      .set('ToDate', dateTo.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<PaginatedResponse<HealthPresentationDto>>(
        this.baseUrl + endpoints.HEALTH_PRESENTATIONS_LOTS,
        { params }
      )
      .pipe(map((res) => res));
  }

  getInvoicesForHealthPresentationDetails(
    id: number,
    page: number,
    pageSize: number
  ): Observable<PaginatedResponse<HealthPresentationDetailsDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<PaginatedResponse<HealthPresentationDetailsDto>>(
        this.baseUrl + endpoints.HEALTH_PRESENTATIONS_LOTS + '/' + id,
        { params }
      )
      .pipe(map((res) => res));
  }

  // todo mover a servicio propio ↓
  private healthPresentationSubject =
    new BehaviorSubject<HealthPresentationDto | null>(null);
  public healthPresentation$ = this.healthPresentationSubject.asObservable();

  setHealthPresentation(value: HealthPresentationDto) {
    this.healthPresentationSubject.next(value);
  }

  getHealthPresentation(): Observable<HealthPresentationDto | null> {
    return this.healthPresentation$;
  }

  clearHealthPresentation() {
    this.healthPresentationSubject.next(null);
  }
  // ↑
}

export interface RejectReasons {
  rejectReason: string;
  rejectionType: number;
}

export interface InvoiceSetStatusRqDTO {
  guid: string;
  status: number;
}
