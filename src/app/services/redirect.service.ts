import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';
@Injectable({
  providedIn: 'root'
})

export class RedirectService {
  redirect: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }

  getRedirects(): Observable<any> {
    return this._ApiConfigService.postReq3(`allUrls`,'');
  }

  updateUrl(data:any): Observable<{data:any,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`updateUrl`,data);
  }

  createRedirectLinks(data:any): Observable<{data:any,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`createRedirectLinks`,data);
  }


}
