import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintsService {
  complaint: BehaviorSubject<any> = new BehaviorSubject(null);
  complaints_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private _ApiConfigService: ApiConfigService
  ) { }

  getComplaints(page: number): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`getAllIssues?page=${page}`, '');
  }

  filterComplaints(page: number,filter:any){
    return this._ApiConfigService.postReq3(`getAllIssues?page=${page}`, filter);
  }

  addComplaints(issue:any): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`addIssue`, issue);
  }

  exportAll(): Observable<any> {
    return this._ApiConfigService.postReq3(`issue/exportAll`, '');
  }
  
  exportByIds(issuesIds:number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`issue/exportByIds`, {issuesIds});
  }

  getAllComplaints(): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`getAllIssues`, {withoutPagination:true});
  }

  updateIssueStatus(data:any): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`updateIssueStatus`, data);
  }

  updateIssue(data:any): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`updateIssueStatus`, data);
  }
  

  getSample(): Observable<any>{
    return this._ApiConfigService.postReq3(`issueSample` , '');
  }

  uploadFile(file:File): Observable<any> {
    return this._ApiConfigService.postReq3(`issueImport` , file);
  }

  getFiles(issue_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`getIssueFiles` , {issue_id});
  }

  uploadIssueFiles(files:any): Observable<any> {
    return this._ApiConfigService.postReq3(`uploadIssueFiles` , files);
  }

  deleteIssue(issue_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteIssue` , {issue_id});
  }

}
