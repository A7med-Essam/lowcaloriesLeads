import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DislikeService {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }

  getCustomerInfo(CID: number): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/SqlQuery?Qry=SELECT * FROM [KOTDB].[dbo].[Customers] WHERE [CustomerId] =${CID}`);
  }

  getMeals(): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/SqlQuery?Qry=SELECT * FROM [KOTDB].[dbo].[MealsDetail]`);
  }

  storeDislikeRequest(data:any): Observable<any> {
    return this._ApiConfigService.postReq(`storeDislikeRequest`,data);
  }

  getAgentBranches(): Observable<any> {
    return this._ApiConfigService.postReq(`getAgentBranches`,'');
  }
}