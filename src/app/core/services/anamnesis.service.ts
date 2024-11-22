import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { endpoints } from '../helpers/endpoints';
import {
  DynamicForm,
  FormDataDto,
} from 'src/app/components/dynamic-form/models';

@Injectable({
  providedIn: 'root',
})
export class AnamnesisService {
  baseUrl = environment.apiUrl;
  http = inject(HttpClient);

  getAnamnesis(id: number): Observable<DynamicForm> {
    return this.http
      .get<DynamicForm>(this.baseUrl + endpoints.HEALTH_ANAMNESIS + id)
      .pipe(tap((result) => console.log(result)));
  }

  updateAnamnesis(dynamicForm: FormDataDto): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + dynamicForm.postUrl,
      dynamicForm,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  downloadReport(code: number) {
    return this.http
      .get(`${this.baseUrl}${endpoints.HEALTH_ANAMNESIS_REPORT}/${code}`, {
        responseType: 'blob',
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        catchError((error) => {
          console.error('Error downloading the report', error);
          return throwError(() => new Error('Error downloading the report'));
        })
      );
  }
}
