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
  searchByCID: boolean = false;
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
    if (this.cid && this.cid != '') {
      this._RefundService
        .getCustomerPlanInfo(Number(this.cid))
        .subscribe((res) => {
          this.customerInfo = res;
        });
    }
  }

  toggleSearch() {
    this.searchByCID = !this.searchByCID;
    this.cid = '';
  }

  reset() {
    this.customerInfo = null;
  }

  meals: any;
  getDetails(cid: number) {
    this._RefundService.GetMealsPlanNutiration(cid).subscribe((res) => {
      this.planModal = true;
      this.meals = ([] as any[]).concat(...Object.values(res));
    });
  }

  calculateTotalNutrition(meals: any[]) {
    const totalNutrition: any = {};
    meals.forEach((meal) => {
      for (const nutrient in meal) {
        if (nutrient !== 'mealType' && !isNaN(meal[nutrient])) {
          totalNutrition[nutrient] =
            (totalNutrition[nutrient] || 0) + meal[nutrient];
        }
      }
    });
    return totalNutrition;
  }

  nutirationAVG: any;
  GetNutirationAVG(cid: number) {
    this._RefundService.GetNutirationAVG(cid).subscribe((res) => {
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
      doc.internal.pageSize.width = 520;
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 15, 10, 20, 15);

      doc.setTextColor(50);
      doc.setFontSize(14);
      doc.text(`CID:${this.customerInfo?.cid}`, 15, 35);
      doc.text(`Customer Name:${this.customerInfo?.customerName}`, 15, 45);
      doc.text(
        `Customer Phone:${this.customerInfo?.customerPhone}`,
        15,
        55
      );
      doc.text(
        `Delivery Address:${this.customerInfo?.deliveryAddress}`,
        15,
        65
      );
      doc.text(`Status:${this.customerInfo?.status}`, 440, 35);
      doc.text(`Start Date:${this.customerInfo?.startDate?.split('T')[0]?? ""}`, 440, 45);
      doc.text(`Plan Title:${this.customerInfo?.planTitle}`, 440, 55);
      doc.text(`Last Delivery:${this.customerInfo?.lastDeliveryDate?.split('T')[0] ?? ""}`, 440, 65);
      doc.text(`Remaining Days:${this.customerInfo?.remainingDays}`, 440, 75);
      doc.text(`Email:${this.customerInfo?.email}`, 15, 75);
      doc.text(`Delivery Branch:${this.customerInfo?.deliveryBranch}`, 15, 85);

      const mealHeaders = this.meals[0].meals.map((e: any, index: number) => {
        return index + 1 > this.customerInfo?.planTitle.split('-')[0].at(0)
          ? 'SNACK'
          : 'MEAL ' + (index + 1);
      });

      const headers = ['DAY', ...mealHeaders, 'Day Nutrition Facts'];

      const convertedData = this.meals.map((obj: any) => {
        const meals = obj.meals.map((e: any) => {
          return (
            e.mealName +
            `\n\nCalories: ${e.calories} - Protiens: ${e.protiens} \nFats: ${e.fats} - Carb: ${e.carb}`
          );
        });

        return [
          obj.dayname,
          ...meals,
        ];
      });

      const convertedNutritions = this.meals.map((obj: any) => {
        return [
          this.calculateTotalNutrition(obj.meals).carb.toFixed(1),
          this.calculateTotalNutrition(obj.meals).protiens.toFixed(1),
          this.calculateTotalNutrition(obj.meals).calories.toFixed(1),
          this.calculateTotalNutrition(obj.meals).fats.toFixed(1),
        ];
      });

      autoTable(doc, { startY: 85 });
      autoTable(doc, {
        head: [headers],
        body: convertedData,
        bodyStyles:{
          cellPadding:[5,15,5,1]
        },
        didDrawCell: (data:any) => {
          const index = this.meals.findIndex((day:any) => day.dayname === data.row.raw[0]);
          if (
            data.column.dataKey === headers.length - 1 &&
            data.cell.section === 'body' && index >= 0
          ) {
            autoTable(doc, {
              head: [['Carb', 'Protein', 'Calories', 'Fats']],
              body: [convertedNutritions[index]],
              startY: data.cell.y + 2,
              margin: { left: data.cell.x - 10 },
              tableWidth: 'wrap',
              theme: 'grid',
              styles: {
                fontSize: 7,
                cellPadding: 1,
              },
            });
          }
        },
      });

      // Set the line color and width
      doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
      doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

      // Draw a line at the bottom of the page

      // Get the total number of pages
      const totalPages = doc.internal.pages;

      // Iterate over each page and add the footer
      for (let i = 1; i <= totalPages.length; i++) {
        doc.internal.pageSize.width = 520;
        doc.line(
          10,
          doc.internal.pageSize.height - 10,
          doc.internal.pageSize.width - 10,
          doc.internal.pageSize.height - 10
        );
        // Set the current page as active
        doc.setPage(i);
        // Set the position and alignment of the footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          'Thelowcalories.com',
          20,
          doc.internal.pageSize.getHeight() - 5
        );
      }

      doc.save('customer_plans.pdf');
    }
  }
}
