import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }

  getHeadMails(): Observable<{data:{id:number,email:string,models:string[],created_at:string,updated_at:string}[],message:string,status:number}> {
    return this._ApiConfigService.postReq3(`getHeadMails`,'');
  }

  updateHeadModels(data:{email:string, models:string[]}): Observable<{data:null,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`addOrUpdateEmailModels`,data);
  }
}
