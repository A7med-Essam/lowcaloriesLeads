import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { tap, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  constructor(
    private http: HttpClient,

    private _MessageService: MessageService
  ) {}

  getReq(url: string, params?: HttpParams): Observable<any> {
    return this.http.get(environment.BaseUrl + url, { params: params }).pipe(
      retry(2),
      tap(
        (res: any) => {
          if (res.status != 1) {
            this._MessageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res.message,
            });
          }
        },
        (err: any) => {
          this._MessageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
          });
        }
      )
    );
  }

  postReq(url: string, body: any, params?: HttpParams): Observable<any> {
    return this.http
      .post(environment.BaseUrl + url, body, { params: params })
      .pipe(
        retry(2),
        tap(
          (res: any) => {
            if (res.status != 1) {
              this._MessageService.add({
                severity: 'error',
                summary: 'Error',
                detail: res.message,
              });
            }
          },
          (err: any) => {
            this._MessageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message,
            });
          }
        )
      );
  }
}
