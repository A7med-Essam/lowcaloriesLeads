import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';


@Injectable({
  providedIn: 'root'
})
export class RefundService  {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }
  refund: BehaviorSubject<any> = new BehaviorSubject(null);

  getCIDs(phone: string): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/GetCid?phone=${phone}`);
  }

  getPlanDetails(cid: number): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/GetPlanDetails?CID=${cid}`);
  }



  getRefunds(page: number): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`refundRequests?page=${page}`, '');
  }

  filterRefund(page: number,filter:any){
    return this._ApiConfigService.postReq3(`refundRequests?page=${page}`, filter);
  }

  addRefund(info:any): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`addRefundRequest`, info);
  }

  RefundExport(): Observable<any> {
    return this._ApiConfigService.postReq3(`RefundExport`, '');
  }

  getAllRefunds(): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`refundRequests`, {withoutPagination:true});
  }

 
}