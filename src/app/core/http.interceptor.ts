import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { GuardService } from '../services/guard.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _GuardService: GuardService) {}
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const accessToken = this._GuardService.getUser()?.access_token || '';
    const userId = this._GuardService.getUser()?.id || '';
    const roleName = this._GuardService.getUser()?.role_name || '';

    const HttpHeader = request.clone({
      headers: request.headers
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('agentId', `${userId}`)
        .set('role', roleName),
    });
    return next.handle(HttpHeader);
  }
}
