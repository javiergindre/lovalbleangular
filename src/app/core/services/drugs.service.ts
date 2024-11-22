import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DrugDto } from '../models/health/drugs';
import { endpoints } from '../helpers/endpoints';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrugsService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);
  constructor() { }

  addOrUpdateDrugTreatments(drug: DrugDto) {


    const endpoint = this.baseUrl + endpoints.TREATMENT_DRUG_NEW
    return this.http.post(endpoint, drug).pipe(
      tap((result) => console.log(result)),
      catchError((error) => {
        console.error('Error:', error); // Loguea el error
        return throwError(() => new Error(error)); // Rethrow el error para manejarlo en otro lugar si es necesario
      })
    );
  }

  getDrugs(treatmentRequestId: number): Observable<DrugDto[]> {
    const params = {
      treatmentRequestId: treatmentRequestId
    };
    return this.http
      .get<any>(this.baseUrl + endpoints.TREATMENT_DRUGS, { params })
      .pipe(tap((result) => console.log(result)));
  }

  deleteDrug(drug: DrugDto) {
    const endpoint = this.baseUrl + endpoints.TREATMENT_DELETE
    return this.http.post(endpoint, drug).pipe(
      tap((result) => console.log(result)),
      catchError((error) => {
        console.error('Error:', error); // Loguea el error
        return throwError(() => new Error(error)); // Rethrow el error para manejarlo en otro lugar si es necesario
      })
    );
  }




}
