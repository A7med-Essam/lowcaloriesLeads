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

  getFilter(filter: any, page: number, paginate?: any): Observable<any> {
    paginate ? (filter.paginate = paginate) : false;
    return this._ApiConfigService.postReq(`survies?page=${page}`, filter);
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
    return this._ApiConfigService.postReq(`leads`, lead);
  }
  // =========================================================================

  getLeads(page: number): Observable<any> {
    return this._ApiConfigService.getReq(`leads?page=${page}`);
  }

  showLead(id: number): Observable<any> {
    return this._ApiConfigService.postReq(`leads/show`, { id });
  }

  addReplay(replay: any): Observable<any> {
    return this._ApiConfigService.postReq(`leads/replay`, replay);
  }

  getAllReplies(id: number): Observable<any> {
    return this._ApiConfigService.postReq(`leads/replies`, { id });
  }

  getAllAgents(): Observable<any> {
    return this._ApiConfigService.postReq(`getAgents`, {
      withoutPagination: true,
    });
  }

  assignLead(lead: any): Observable<any> {
    return this._ApiConfigService.postReq(`leads/assign`, lead);
  }
}
