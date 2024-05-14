import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private _ApiConfigService: ApiConfigService) {}

  getItemLowcalories(page:number): Observable<any> {
    return this._ApiConfigService.postReq3(`getItemLowcalories?page=${page}`, '');
  }
  filterItems(page: number,filter:any):Observable<any>{
    return this._ApiConfigService.postReq3(`getItemLowcalories?page=${page}`, filter);
  }
  updateMealItem(request :IUpdateMealItemRequest): Observable<any> {
    return this._ApiConfigService.postReq3(`updateMealItem`, request);
  }
  deleteItemFile(file_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteItemFile`, {file_id});
  }
  getMealCategories(): Observable<any> {
    return this._ApiConfigService.postReq3(`getAllMealCategories`, {withoutPagination:true});
  }
  getAllDislikes(): Observable<any> {
    return this._ApiConfigService.postReq3(`allDislikes`, '');
  }
  addDislikes(req:any): Observable<any> {
    return this._ApiConfigService.postReq3(`addDislikes`,req);
  }
  deleteDisLikes(dislike_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteDisLikes`, {dislike_id});
  }
  addMealCategory(req:any): Observable<any> {
    return this._ApiConfigService.postReq3(`addMealCategory`, req);
  }
  deleteMealCategory(meal_category_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteMealCategory`, {meal_category_id});
  }
}

interface IUpdateMealItemRequest {
  item_id: number;
  category: string;
  files: any[];
  disLikes: string[];
}