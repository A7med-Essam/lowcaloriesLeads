import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  logs_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private _ApiConfigService: ApiConfigService) {}

  getLogActivities(page: number): Observable<any> {
    return this._ApiConfigService.postReq3(`logActivities?page=${page}`, '');
  }

  filterLogActivities(page: number, filter: any) {
    return this._ApiConfigService.postReq3(
      `logActivities?page=${page}`,
      filter
    );
  }
}
