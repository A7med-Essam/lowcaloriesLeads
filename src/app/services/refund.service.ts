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
  refund_filter: BehaviorSubject<any> = new BehaviorSubject(null);

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

  exportAll(): Observable<any> {
    return this._ApiConfigService.postReq3(`RefundExport`, '');
  }
  
  // TODO: check refundIds
  exportByIds(refundIds:number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`RefundExportByIds`, refundIds);
  }

  getAllRefunds(): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`refundRequests`, {withoutPagination:true});
  }

//  ===========================================
getDeliveryTimes(): Observable<any> {
  return this._ApiConfigService.postReq3(`deliveryTimes`,'');
}

getFoodQuality(): Observable<any> {
  return this._ApiConfigService.postReq3(`foodQualities`,'');
}

//  ===========================================
uploadAccountingRefundDetails(data:any): Observable<any> {
  return this._ApiConfigService.postReq3(`uploadAccountingRefundDetails`,data);
}

//=======================================================

getRefundReasons(): Observable<any> {
  return this._ApiConfigService.postReq3(`refundReasons`,'');
}

addRefundReason(reason:string): Observable<any> {
  return this._ApiConfigService.postReq3(`addRefundReason`,{reason});
}

deleteRefundReason(refund_id:number): Observable<any> {
  return this._ApiConfigService.postReq3(`deleteRefundReason`,{refund_id});
}

getSample(): Observable<any>{
  return this._ApiConfigService.postReq3(`refundRequestSample` , '');
}

uploadFile(file:File): Observable<any> {
  return this._ApiConfigService.postReq3(`refundRequestImport` , file);
}

getFiles(refund_id:number): Observable<any> {
  return this._ApiConfigService.postReq3(`getRefundFiles` , {refund_id});
}

uploadRefundFiles(file:File): Observable<any> {
  return this._ApiConfigService.postReq3(`uploadRefundFiles` , file);
}

// =============================================

getReasons(): Observable<any> {
  return this._ApiConfigService.postReq3(`refundReasons`,'');
}

addReasons(name:string): Observable<any> {
  return this._ApiConfigService.postReq3(`addRefundReason`,{name});
}

deleteReasons(refund_reason_id:number): Observable<any> {
  return this._ApiConfigService.postReq3(`deleteRefundReason`,{refund_reason_id});
}
}