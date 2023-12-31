import { Component, OnInit } from '@angular/core';
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-show-customer-plan',
  templateUrl: './show-customer-plan.component.html',
  styleUrls: ['./show-customer-plan.component.scss'],
})
export class ShowCustomerPlanComponent implements OnInit {
  planModal: boolean = false;
  phone: string = '';
  cid: string = '';
  constructor(private _RefundService: RefundService) {}

  ngOnInit(): void {}

  CIDs: any[] = [];
  getCustomerCIDS() {
    if (this.phone && this.phone.length == 10) {
      this._RefundService.getCIDs(this.phone).subscribe((res) => {
        this.CIDs = res;
      });
    }
  }

  customerInfo: any = null;
  getCustomerInfo() {
    if (this.phone != '' && this.cid && this.cid != '') {
      this._RefundService
        .getCustomerPlanInfo(Number(this.cid))
        .subscribe((res) => {
          this.customerInfo = res;
        });
    }
  }

  reset(){
    this.customerInfo = null;
  }

  meals: any;
  getDetails() {
    this._RefundService
      .GetMealsPlanNutiration(Number(this.cid))
      .subscribe((res) => {
        this.planModal = true;
        this.meals = ([] as any[]).concat(...Object.values(res));
      });
  }

  nutirationAVG: any;
  GetNutirationAVG() {
    this._RefundService.GetNutirationAVG(Number(this.cid)).subscribe((res) => {
      this.nutirationAVG = res;
    });
  }

  getItem(item: any) {
    return item;
  }
}
