import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from 'src/app/core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  constructor(private _ApiConfigService: ApiConfigService) {}

  getSurveyQuestions(n: number, paginate?: any): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions?page=${n}`, {
      paginate: paginate,
    });
  }
  surveyQuestionsId: BehaviorSubject<number> = new BehaviorSubject(0);
  surveyAnswers: BehaviorSubject<number> = new BehaviorSubject(0);
  filterId: BehaviorSubject<number> = new BehaviorSubject(0);
  leadId: BehaviorSubject<number> = new BehaviorSubject(0);
  lead: BehaviorSubject<any> = new BehaviorSubject(null);
  currentUpdatedLead: BehaviorSubject<any> = new BehaviorSubject(null);
  lead_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  deleteRow(id: number): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/delete`, {
      id: id,
    });
  }

  deleteAnswers(lead_answer_id: number): Observable<any> {
    return this._ApiConfigService.postReq(`answers/deleteAnswers`, {
      lead_answer_id,
    });
  }

  uploadFile(file: File): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/imports`, file);
  }

  showRow(id: number): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/show`, id);
  }

  showRowFiltered(id: number): Observable<any> {
    return this._ApiConfigService.postReq(`survey/show`, id);
  }

  deleteSpecificRows(ids: any): Observable<any> {
    return this._ApiConfigService.postReq(
      `lead_questions/deleteSpecificRows`,
      ids
    );
  }

  updateRow(row: any): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/update`, row);
  }

  updateAnswer(answer: any): Observable<any> {
    return this._ApiConfigService.postReq(`answers/updateAnswers`, answer);
  }

  getRecycle(): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/recycleBin`, '');
  }

  restore(id: any): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/restore`, id);
  }

  forceDelete(id: any): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/forceDelete`, id);
  }

  getSample(): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/sample`, '');
  }

  insertRow(row: any): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/insert`, row);
  }

  insertAnswer(row: any): Observable<any> {
    return this._ApiConfigService.postReq(`answers/addAnswers`, row);
  }

  getFilter(filter: any): Observable<any> {
    // paginate && (filter.paginate = paginate);
    filter.withoutPagination = true;
    return this._ApiConfigService.postReq(`lead_questions`, filter);
  }

  getAnswers(): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions/answers`, {
      withoutPagination: true,
    });
  }

  getQuestions(): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions`, {
      withoutPagination: true,
    });
  }

  // =========================================================================

  getCreateLeadsInfo(): Observable<any> {
    return this._ApiConfigService.postReq(`lead_questions`, {
      withoutPagination: true,
    });
  }

  createLead(lead: any): Observable<any> {
    return this._ApiConfigService.postReq3(`leads`, lead);
  }

  createLeadDetails(lead: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addLeadDetails`, lead);
  }
  // =========================================================================

  getLeads(page: number): Observable<any> {
    return this._ApiConfigService.getReq3(`leads?page=${page}`);
  }

  filterLeads(page: number,filter:any){
    return this._ApiConfigService.getReq3(`leads?page=${page}`, filter);
  }

  showLead(id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/show`, { id });
  }

  addReplay(replay: any): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/replay`, replay);
  }

  getAllReplies(id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/replies`, { id });
  }

  getAllAgents(): Observable<any> {
    return this._ApiConfigService.postReq3(`getAgents`, {
      withoutPagination: true,
    });
  }

  assignLead(lead: any): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/assign`, lead);
  }

  exportByIds(leadIds: number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/exportByIds`, {leadIds});
  }

  exportAll(): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/exportAll`, '');
  }
  // =========================================================================

  allReminderLeads(): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/allReminderLeads`, {
      withoutPagination: true,
    });
  }

  addReminderLead(reminder:any): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/addReminderLead`, reminder);
  }

  // =========================================================================

  getPlatforms(): Observable<any> {
    return this._ApiConfigService.postReq3(`platforms`, '');
  }


  // =============================UPDATE STATUS============================================
  updateLeadStatus(data:any): Observable<any> {
    return this._ApiConfigService.postReq3(`leads/updateLead`, data);
  }
  lostReasons(): Observable<any> {
    return this._ApiConfigService.postReq3(`lostReasons`, '');
  }
  addLostReasons(name:string): Observable<any> {
    return this._ApiConfigService.postReq3(`addLostReasons`, {name});
  }
  deleteLostReason(lost_reason_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteLostReason`, {lost_reason_id});
  }

}
