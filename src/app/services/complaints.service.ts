import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintsService {
  complaint: BehaviorSubject<any> = new BehaviorSubject(null);

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

  exportComplaints(issuesIds:number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`exportIssues`, {issuesIds});
  }

  getAllComplaints(): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`getAllIssues`, {withoutPagination:true});
  }

  updateIssueStatus(data:{id:number,status:string,reason:string}): Observable<{status:number,data:any,message:string}> {
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

}
