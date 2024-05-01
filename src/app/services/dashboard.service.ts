import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private _ApiConfigService: ApiConfigService
  ) { }

  getDashboardCards(): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`getDashboardCards`, '');
  }
  getInvoices(invoice_str: string): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`getInvoices`, {invoice_str});
  }
}
