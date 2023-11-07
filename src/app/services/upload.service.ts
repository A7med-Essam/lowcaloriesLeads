import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})

export class UploadService {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }

  getFiles(): Observable<{data:any,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`getAllFiles`,'');
  }

  deleteFile(uploadFile_id:number): Observable<{data:any,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`deleteAllFiles`,{uploadFile_id});
  }

  createFile(data:any): Observable<{data:any,message:string,status:number}> {
    return this._ApiConfigService.postReq3(`uploadNewFile`,data);
  }


}
