import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-show-dislike',
  templateUrl: './show-dislike.component.html',
  styleUrls: ['./show-dislike.component.scss'],
})
export class ShowDislikeComponent implements OnInit {

  userId:number = 0;
  role:string = ''
  constructor(
    private _Router: Router,
    private _DislikeService: DislikeService,
    private _LocalService:LocalService
  ) {
    this.userId = this._LocalService.getJsonValue("userInfo_oldLowCalories").id
    this.role = this._LocalService.getJsonValue("userInfo_oldLowCalories").role
  }

  branches: any[] = [];
  meals: any[] = [];
  dislikes: any[] = [];
  PaginationInfo: any;

  ngOnInit(): void {
    this.getDislikes();
    this.getAgentBranches();
    this.getMeals();
  }

  getDislikes(page: number = 1) {
    if (this.filterStatus) {
      this.filter();
    } else {
      this._DislikeService.getDislikes(page)
      .subscribe({
        next: (res) => {
          res.data.data.map((e:any) => {
            e.mobile = e.mobile.filter((item:any) => item !== null)
          });
          this.dislikes = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(dislike: any) {
    if (dislike) {
      this._DislikeService.dislikeDetails.next(dislike);
      this._Router.navigate(['dislike/details']);
    }
  }

  paginate(e: any) {
    this.getDislikes(e.first / e.rows + 1);
  }
  
  updateRow(dislike: any) {
    if (dislike) {
      this._DislikeService.dislikeDetails.next(dislike);
      this._Router.navigate(['dislike/update']);
    }
  }

  // *******************************
  // FILTERS
  // *******************************

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  getMeals() {
    this._DislikeService.getMeals().subscribe({
      next: (res) => (this.meals = res.data),
    });
  }
  // ===========================

  filterModal: boolean = false;
  appliedFilters: any = null;
  filterStatus: boolean = false;

  filter_selectedEmail: any = null;
  filter_selectedName: any = null;
  filter_selectedBranch: any = null;
  filter_selectedSentBy: any = null;
  filter_selectedDates: any = null;
  filter_selectedReason: any = null;
  filter_selectedMeal: any = null;
  filter_selectedMobile: any = null;
  filter_selectedCid:any = null

  filter() {
    let FILTER: any = {
      date:
        this.filter_selectedDates && this.filter_selectedDates[1] == null
          ? new Date(this.filter_selectedDates[0]).toLocaleDateString()
          : null,
      from:
        this.filter_selectedDates && this.filter_selectedDates[1] != null
          ? new Date(this.filter_selectedDates[0]).toLocaleDateString()
          : null,
      to:
        this.filter_selectedDates && this.filter_selectedDates[1] != null
          ? new Date(this.filter_selectedDates[1]).toLocaleDateString()
          : null,
      name: this.filter_selectedName || null,
      branch: this.filter_selectedBranch || null,
      email: this.filter_selectedEmail || null,
      sent_by: this.filter_selectedSentBy || null,
      reason: this.filter_selectedReason || null,
      dislike_meal: this.filter_selectedMeal || null,
      mobile: this.filter_selectedMobile || null,
      cid: this.filter_selectedCid || null,
    };
    Object.keys(FILTER).forEach((k) => FILTER[k] == null && delete FILTER[k]);
    this.filterStatus = true;
    this._DislikeService.filterDislikes(FILTER).subscribe((res) => {
      this.dislikes = res.data;
      this.PaginationInfo = [];
    });
  }

  resetFilter() {
    this.filterModal = false;
    this.filterStatus = false;
    this.filter_selectedEmail = null;
    this.filter_selectedName = null;
    this.filter_selectedBranch = null;
    this.filter_selectedSentBy = null;
    this.filter_selectedDates = null;
    this.filter_selectedReason = null;
    this.filter_selectedMeal = null;
    this.filter_selectedMobile = null;
    this.filter_selectedCid = null;
    this.getDislikes();
  }

  resetFields(){
    this.filter_selectedEmail = null;
    this.filter_selectedName = null;
    this.filter_selectedBranch = null;
    this.filter_selectedSentBy = null;
    this.filter_selectedDates = null;
    this.filter_selectedReason = null;
    this.filter_selectedMeal = null;
    this.filter_selectedMobile = null;
    this.filter_selectedCid = null;
  }

  export(){
    this._DislikeService.exportDislike().subscribe({
      next:res=>{
        const link = document.createElement('a');
        link.href = res.data;
        link.target = "_blank"
        link.click();
      }
    })
  }
}
