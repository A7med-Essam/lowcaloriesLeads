import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DislikeService {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }
  dislikeDetails: BehaviorSubject<any> = new BehaviorSubject(null);

  getCustomerInfo(CID: number): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/SqlQuery?Qry=SELECT * FROM [KOTDB].[dbo].[Customers] WHERE [CustomerId] =${CID}`);
  }

  getMeals(): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/SqlQuery?Qry=SELECT * FROM [KOTDB].[dbo].[MealsDetail]`);
  }

  storeDislikeRequest(data:any): Observable<any> {
    return this._ApiConfigService.postReq3(`storeDislikeRequest`,data);
  }

  getAgentBranches(): Observable<any> {
    return this._ApiConfigService.postReq3(`getAgentBranches`,'');
  }

  getDislikes(page:number):Observable<any> {
    return this._ApiConfigService.postReq(`allDislikeRequests?page=${page}`,'')
  }

  updateDislikes(dislike:any):Observable<any> {
    return this._ApiConfigService.postReq3('updateDislikeRequest',dislike)
  }

  getDislikesDetails(dislike_request_id:number):Observable<any> {
    return this._ApiConfigService.postReq3('showDislikeRequest',{dislike_request_id})
  }

  filterDislikes(filter: any): Observable<any> {
    filter.withoutPagination = true;
    return this._ApiConfigService.postReq3(`allDislikeRequests`, filter);
  }
}