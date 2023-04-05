import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  role: string = '';
  agentId: string = '';
  constructor(
    private _AuthService: AuthService,
    private _Router: Router
  ) {
    _AuthService.currentUser.subscribe((res: any) => {
      if (res == null) {
        this.role = '';
        this.agentId = '0';
      } else {
        this.role = res.role;
        this.agentId = res.id
        // setTimeout(() => {
        //   switch (res.country) {
        //     case 'ae':
        //       this.checkToken_ae();
        //       break;
        //     case 'eg':
        //       this.checkToken_eg();
        //       break;
        //     case 'om':
        //       this.checkToken_om();
        //       break;
        //     case 'qr':
        //       this.checkToken_qr();
        //       break;
        //     case 'sa':
        //       this.checkToken_sa();
        //       break;
        //     default:
        //       this.checkToken_Manager();
        //       break;
        //   }
        // }, 1);
      }
    });
  }

  // checkToken_Manager() {
  //   this._AuthService.checkToken(this.token).subscribe((res: any) => {
  //     if (res.status == 0) {
  //       this.tokenExpired();
  //     }
  //   });
  // }

  // checkToken_ae() {
  //   this._AuthService.checkToken_ae(this.token).subscribe((res: any) => {
  //     if (res.status == 0) {
  //       this.tokenExpired();
  //     }
  //   });
  // }

  // checkToken_eg() {
  //   this._AuthService.checkToken_eg(this.token).subscribe((res: any) => {
  //     if (res.status == 0) {
  //       this.tokenExpired();
  //     }
  //   });
  // }

  // checkToken_om() {
  //   this._AuthService.checkToken_om(this.token).subscribe((res: any) => {
  //     if (res.status == 0) {
  //       this.tokenExpired();
  //     }
  //   });
  // }

  // checkToken_qr() {
  //   this._AuthService.checkToken_qr(this.token).subscribe((res: any) => {
  //     if (res.status == 0) {
  //       this.tokenExpired();
  //     }
  //   });
  // }

  // checkToken_sa() {
  //   this._AuthService.checkToken_sa(this.token).subscribe((res: any) => {
  //     if (res.status == 0) {
  //       this.tokenExpired();
  //     }
  //   });
  // }

  tokenExpired() {
    // this._ToastrService.warning('Your old session has been expired', '', {
    //   timeOut: 4000,
    // });
    this._AuthService.logOut();
    this._Router.navigate(['./login']);
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const HttpHeader = request.clone({
      headers: request.headers
        .set('Accept', ['application/json'])
        // .set('Authorization', `Bearer ${this.token}`),
        .set('agentId', `${this.agentId}`)
        .set('role', this.role),
      // .set("api_password",`eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC8xMjcuMC4wLjE6ODAwMFwvYXBpXC9sb2dpbiIsImlhdCI6MTY1Mjg2NjczOSwiZXhwIjoxNjUyODcwMzM5LCJuYmYiOjE2NTI4NjY3MzksImp0aSI6InFkTnN1NTZ2ZFYwQkhjOU4iLCJzdWIiOjQsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.Dk_4v17X5MuTD16LCZImtB4BvwvN30HgTM-OtNtE-Ck`)
    });

    return next.handle(HttpHeader);
  }
}
