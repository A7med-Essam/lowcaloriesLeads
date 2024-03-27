import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  notes_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private _ApiConfigService: ApiConfigService) {}

  getStickyNotes(page: number): Observable<any> {
    return this._ApiConfigService.postReq3(`getStickyNotes?page=${page}`, '');
  }

  addStickyNote(row: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addStickyNote`, row);
  }

  updateStickyNote(row: any): Observable<any> {
    return this._ApiConfigService.postReq3(`updateStickyNote`, row);
  }

  deleteStickyNote(sticky_id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteStickyNote`, { sticky_id });
  }

  filterNotes(page: number, filter: any) {
    return this._ApiConfigService.postReq3(
      `getStickyNotes?page=${page}`,
      filter
    );
  }

  // ================================== Inquiry ====================================

  getInquiryNotes(page: number): Observable<any> {
    return this._ApiConfigService.postReq3(`getInquiry?page=${page}`, '');
  }

  addInquiryNote(row: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addInquiry`, row);
  }

  updateInquiryNote(row: any): Observable<any> {
    return this._ApiConfigService.postReq3(`updateInquiry`, row);
  }

  deleteInquiryNote(inquiry_id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteInquiry`, { inquiry_id });
  }
}
