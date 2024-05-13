import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class GiftcodeService {
  giftcode: BehaviorSubject<any> = new BehaviorSubject(null);
  giftcode_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private _ApiConfigService: ApiConfigService) {}

  getGiftCodes(page: number): Observable<any> {
    return this._ApiConfigService.postReq3(`giftCodes?page=${page}`, '');
  }

  createGiftCode(code: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addGiftCode`, code);
  }

  updateGiftCode(code: any): Observable<any> {
    return this._ApiConfigService.postReq3(`updateGiftCode`, code);
  }

  getPrograms(): Observable<any> {
    return this._ApiConfigService.postReq2(`programs`, '');
  }

  filterGiftCodes(page: number, filter: any) {
    return this._ApiConfigService.postReq3(`giftCodes?page=${page}`, filter);
  }
  exportFilteredGiftCodes(filter: any) {
    return this._ApiConfigService.postReq3(`exportGiftCodes`, filter);
  }
}
