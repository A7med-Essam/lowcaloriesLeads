import { Component, OnInit } from '@angular/core';
import { RefundService } from 'src/app/services/refund.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { GuardService } from 'src/app/services/guard.service';

@Component({
  selector: 'app-show-customer-plan',
  templateUrl: './show-customer-plan.component.html',
  styleUrls: ['./show-customer-plan.component.scss'],
})
export class ShowCustomerPlanComponent implements OnInit {
  planModal: boolean = false;
  phone: string = '';
  cid: string = '';
  constructor(
    private _RefundService: RefundService,
    private _GuardService: GuardService
  ) {}

  ngOnInit(): void {
    this.getPermission();
  }

  printPermission: boolean = false;

  getPermission() {
    this.printPermission =
      this._GuardService.getPermissionStatus('print_customerPlan');
  }

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

  reset() {
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

  calculateTotalNutrition(meals:any[]) {
    const totalNutrition:any = {};
    meals.forEach(meal => {
      for (const nutrient in meal) {
        if (nutrient !== "mealType" && !isNaN(meal[nutrient])) {
          totalNutrition[nutrient] = (totalNutrition[nutrient] || 0) + meal[nutrient];
        }
      }
    });
    return totalNutrition;
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

  // ========================================= PRINT =================================
  exportAsPDF() {
    if (this.printPermission) {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      doc.internal.pageSize.width = 420;
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

      doc.setTextColor(50);
      doc.setFontSize(14);
      doc.text(`CID:${this.customerInfo?.cid}`, 10, 35);
      doc.text(`Customer Name:${this.customerInfo?.customerName}`, 10, 45);
      doc.text(`LastDelivery Date:${this.customerInfo?.lastDeliveryDate}`, 10, 55);
      doc.text(`Delivery Address:${this.customerInfo?.deliveryAddress}`, 10, 65);
      doc.text(`Status:${this.customerInfo?.status}`, 320, 35);
      doc.text(`Email:${this.customerInfo?.email}`, 320, 45);
      doc.text(`Plan Title:${this.customerInfo?.planTitle}`, 320, 55);
      doc.text(`Customer Phone:${this.customerInfo?.customerPhone}`, 320, 65);
      doc.text(`Remaining Days:${this.customerInfo?.remainingDays}`, 320, 75);
      doc.text(`Start Date:${this.customerInfo?.startDate}`, 10, 75);
      doc.text(`Delivery Branch:${this.customerInfo?.deliveryBranch}`, 10, 85);

      const mealHeaders= this.meals[0].meals.map((e:any,index:number)=>{
        return (index+1) > this.customerInfo?.planTitle.split("-")[0].at(0) ? "SNACK" : "MEAL "+(index+1)
      })

      // Protiens: {{calculateTotalNutrition(index.meals).protiens.toFixed(1)}}
      // Fats: {{calculateTotalNutrition(index.meals).fats.toFixed(1)}}
      // <br>
      // Carb: {{calculateTotalNutrition(index.meals).carb.toFixed(1)}}
      // Calories: {{calculateTotalNutrition(index.meals).calories.toFixed(1)}}
      const headers = [
        'DAY',
          ...mealHeaders
      ];

      const convertedData = this.meals.map((obj: any) => {
        const meals = obj.meals.map((e:any)=>{
          return e.mealName + `\nProtiens: ${e.protiens} - Fats: ${e.fats} \n Carb: ${e.carb} - Calories: ${e.calories}`
        });

        return [
          obj.dayname + `\n Protiens: ${this.calculateTotalNutrition(obj.meals).protiens.toFixed(1)} \n Fats: ${this.calculateTotalNutrition(obj.meals).fats.toFixed(1)} \n Carb: ${this.calculateTotalNutrition(obj.meals).carb.toFixed(1)} \n Calories: ${this.calculateTotalNutrition(obj.meals).calories.toFixed(1)}`,
          ...meals
        ]
      });

      autoTable(doc, { startY: 90 });
      autoTable(doc, {
        head: [headers],
        body: convertedData,
      });

      // Set the line color and width
      doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
      doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

      // Draw a line at the bottom of the page

      // Get the total number of pages
      const totalPages = doc.internal.pages;

      // Iterate over each page and add the footer
      for (let i = 1; i <= totalPages.length; i++) {
        doc.internal.pageSize.width = 420;
        doc.line(
          20,
          doc.internal.pageSize.height - 20,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 20
        );
        // Set the current page as active
        doc.setPage(i);
        // Set the position and alignment of the footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          'Thelowcalories.com',
          20,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      doc.save('customer_plans.pdf');
    }
  }
}
