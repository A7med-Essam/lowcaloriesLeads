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

  getHeadMailDetails(head_mail_id:number): Observable<{data:any,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`getHeadMailDetails`,{head_mail_id});
  }

  updateHeadModels(data:{email:string, models:string[]}): Observable<{data:null,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`addOrUpdateEmailModels`,data);
  }

  addHeadEmail(data:{email:string, manager:string, models?:string[]}): Observable<{data:null,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`addHeadEmail`,data);
  }

  deleteEmail(head_mail_id:number): Observable<{data:any,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`deleteEmail`,{head_mail_id});
  }

  updateHeadDetails(data:{head_mail_model_id:number, branches:number[]}): Observable<{data:null,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`addUpdateEmailModelBranches`,data);
  }
}
