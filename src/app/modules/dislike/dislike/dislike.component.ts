import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit,Renderer2  } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-dislike',
  templateUrl: './dislike.component.html',
  styleUrls: ['./dislike.component.scss'],
})
export class DislikeComponent implements OnInit, OnDestroy {
  customerInfo: any[] = [];
  branches: any[] = [];
  meals: any[] = [];
  reasons: any[] = [];
  selectedMeals: any[] = [];
  selectedBranch: any[] = [];
  selectedReason: any[] = [];

  constructor(
    private _DislikeService: DislikeService,
    private _LocalService: LocalService,
    private _MessageService: MessageService,
    private _Router: Router,
    private renderer: Renderer2,
    private _Location:Location
  ) {}

  goBack(): void {
    // if (this._LocalService.getJsonValue('returnUrl')) {
      // this._Router.navigate([this._LocalService.getJsonValue('returnUrl')]);
    // }else{
      this._Location.back();
    // }
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'h-side');
  }
  ngOnInit(): void {
    this.getMeals();
    this.getReasons();
    this.getAgentBranches();
    setTimeout(() => {}, 15000);
    this.renderer.addClass(document.body, 'h-side');
  }

  addOption(el: HTMLInputElement) {
    if (el.value != '') {
      this.reasons.push({ reason: el.value });
      this.selectedReason.push(el.value);
      el.value = '';
    }
  }

  currentCID: number = 0;
  getCustomerInfo(CID_Input: HTMLInputElement) {
    this.currentCID = Number(CID_Input.value);
    this._DislikeService.getCustomerInfo(Number(CID_Input.value)).subscribe({
      next: (res) => (this.customerInfo = res.data),
    });
  }

  getMeals() {
    this._DislikeService.getMeals().subscribe({
      next: (res) => (this.meals = res.data),
    });
  }

  getReasons() {
    this._DislikeService.getReasons().subscribe({
      next: (res) => (this.reasons = res.data),
    });
  }

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  storeDislikeRequest() {
    const data = {
      name: this.customerInfo[0]?.CustomerName,
      email: this.customerInfo[0]?.CustomerEmail,
      mobile: [
        this.customerInfo[0]?.CustomerMobile,
        this.customerInfo[0]?.CustomerPhone,
      ],
      branch: this.customerInfo[0]?.CustomerAddress3,
      dislike_meals: this.selectedMeals,
      sent_by: this.selectedBranch,
      reasons: this.selectedReason,
      cid: this.currentCID,
      agent_id: this._LocalService.getJsonValue('userInfo_oldLowCalories').id,
    };

    this._DislikeService.storeDislikeRequest(data).subscribe({
      next: (res) => {
        this._MessageService.add({
          severity: 'success',
          summary: 'Notification',
          detail: res.message,
        });
        this._Router.navigate(['dislike/show']);
      },
    });
  }
}
