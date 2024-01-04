import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RefundService } from 'src/app/services/refund.service';
// import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { GuardService } from 'src/app/services/guard.service';
// import * as html2canvas from "html2canvas";
import html2canvas from 'html2canvas';
import { HttpClient } from '@angular/common/http';
import { Calendar } from 'primeng/calendar';

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
    private _GuardService: GuardService,
    private http:HttpClient
  ) {}

  ngOnInit(): void {
    this.getPermission();
  }

  printPermission: boolean = false;
  getPermission() {
    this.printPermission = true;
      // this._GuardService.getPermissionStatus('print_customerPlan');
  }

  CIDs: any[] = [];
  getCustomerCIDS() {
    if (this.phone && this.phone.length == 10) {
      this._RefundService.getCIDs(this.phone).subscribe((res) => {
        this.CIDs = res.sort((a:any, b:any) => a.cid - b.cid);
        if (this.CIDs.length) {
           this.cid = this.CIDs[0].cid
           this.getCustomerInfo();
        }
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

  meals: any;
  getDetails(cid: number) {
    if (!this.meals) {
      this._RefundService.GetMealsPlanNutiration(cid).subscribe((res) => {
        this.planModal = true;
        this.meals = ([] as any[]).concat(...Object.values(res));
        this.meals = this.updateDaynames(this.meals)
      });
    }
    else{
      this.planModal = true;
    }
  }

  nutirationAVG: any;
  GetNutirationAVG(cid: number) {
    if (!this.nutirationAVG) {
      this._RefundService.GetNutirationAVG(cid).subscribe((res) => {
        this.nutirationAVG = res;
      });
    }
  }

  logsModal: boolean = false;
  selectedDate:Date[]=[];
  logs:any = [];
  loadingLogs:boolean = false;
  getLogs(){
    this.loadingLogs = true;
    const info:any = {
      "cid": this.customerInfo.cid,
      // "from": this.selectedDate.length > 0 ? new Date(new Date(this.selectedDate[0]).setDate(new Date(this.selectedDate[0]).getDate() + 1)):new Date(),
      // "to": this.selectedDate.length == 2 ? new Date(new Date(this.selectedDate[1]).setDate(new Date(this.selectedDate[1]).getDate() + 1)):new Date(),
      // "Opts":this.selectedFilters
    };

    if (this.selectedDate.length) {
      info.from = new Date(new Date(this.selectedDate[0]).setDate(new Date(this.selectedDate[0]).getDate() + 1))
      info.to = this.selectedDate.length == 2 ? new Date(new Date(this.selectedDate[1]).setDate(new Date(this.selectedDate[1]).getDate() + 1)):new Date()
    }
    if (this.selectedFilters.length) {
      info.filter = this.selectedFilters.join(", ")
    }
    this.http.post('https://thelowcalories.com:52/api/Subscription/GetSubscriptionLog',info).subscribe((res) => {
      this.logs = res
      this.loadingLogs = false;
    })
  }

  resetDate(){
    this.selectedDate = []
    this.selectedFilters = []
  }

  onDateSelect(e:Calendar){
    if (this.selectedDate.length == 2 && this.selectedDate[1]) {
      e.hideOverlay();
    }
  }

  // =================================================HELPER =================================
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

  getItem(item: any) {
    return item;
  }

  blur(input: HTMLInputElement) {
    input.blur();
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'deactive': //pending
        return 'danger';
      case 'active': //completed
        return 'success';
      default:
        return 'warning';
    }
  }

  toggleBtnName: string = 'Search By CID';
  toggleSearch() {
    this.searchByCID = !this.searchByCID;
    this.cid = '';
    this.toggleBtnName =
      this.toggleBtnName === 'Search By CID'
        ? 'Search By Phone Number'
        : 'Search By CID';
  }

  reset() {
    this.customerInfo = null;
  }

  updateDaynames(mealPlan:any) {
    const updatedMealPlan = mealPlan.map((day:any) => {
        if (day.dayname.startsWith("MON")) {
            day.dayname = "MONDAY" + (day.dayname.length > 3 ? day.dayname.slice(3) : "");
        } else if (day.dayname.startsWith("TUS")) {
            day.dayname = "TUESDAY" + (day.dayname.length > 3 ? day.dayname.slice(3) : "");
        } else if (day.dayname.startsWith("WED")) {
            day.dayname = "WEDNESDAY" + (day.dayname.length > 3 ? day.dayname.slice(3) : "");
        } else if (day.dayname.startsWith("THU")) {
            day.dayname = "THURSDAY" + (day.dayname.length > 3 ? day.dayname.slice(3) : "");
        } else if (day.dayname.startsWith("FRI")) {
            day.dayname = "FRIDAY" + (day.dayname.length > 3 ? day.dayname.slice(3) : "");
        } else if (day.dayname.startsWith("SAT")) {
            day.dayname = "SATURDAY" + (day.dayname.length > 3 ? day.dayname.slice(3) : "");
        } else if (day.dayname.startsWith("SUN")) {
            day.dayname = "SUNDAY" + (day.dayname.length > 3 ? day.dayname.slice(3) : "");
        }
        return day;
    });
    return updatedMealPlan;
}

  // ========================================= PRINT =================================
  // exportAsPDF() {
  //   if (this.printPermission) {
  //     // Default export is a4 paper, portrait, using millimeters for units
  //     const doc = new jsPDF();
  //     doc.internal.pageSize.width = 520;
  //     const imageFile = '../../../../assets/images/logo.png';
  //     doc.addImage(imageFile, 'JPEG', 15, 10, 20, 15);

  //     doc.setTextColor(50);
  //     doc.setFontSize(14);
  //     doc.text(`CID:${this.customerInfo?.cid}`, 15, 35);
  //     doc.text(`Customer Name:${this.customerInfo?.customerName}`, 15, 45);
  //     doc.text(`Customer Phone:${this.customerInfo?.customerPhone}`, 15, 55);
  //     doc.text(
  //       `Delivery Address:${this.customerInfo?.deliveryAddress}`,
  //       15,
  //       65
  //     );
  //     doc.text(`Status:${this.customerInfo?.status}`, 440, 35);
  //     doc.text(
  //       `Start Date:${this.customerInfo?.startDate?.split('T')[0] ?? ''}`,
  //       440,
  //       45
  //     );
  //     doc.text(`Plan Title:${this.customerInfo?.planTitle}`, 440, 55);
  //     doc.text(
  //       `Last Delivery:${
  //         this.customerInfo?.lastDeliveryDate?.split('T')[0] ?? ''
  //       }`,
  //       440,
  //       65
  //     );
  //     doc.text(`Remaining Days:${this.customerInfo?.remainingDays}`, 440, 75);
  //     doc.text(`Email:${this.customerInfo?.email}`, 15, 75);
  //     doc.text(`Delivery Branch:${this.customerInfo?.deliveryBranch}`, 15, 85);

  //     const mealHeaders = this.meals[0].meals.map((e: any, index: number) => {
  //       return index + 1 > this.customerInfo?.planTitle.split('-')[0].at(0)
  //         ? 'SNACK'
  //         : 'MEAL ' + (index + 1);
  //     });

  //     const headers = ['DAY', ...mealHeaders, 'Day Nutrition Facts'];

  //     const convertedData = this.meals.map((obj: any) => {
  //       const meals = obj.meals.map((e: any) => {
  //         return (
  //           e.mealName +
  //           `\n\nCalories: ${e.calories} - Protiens: ${e.protiens} \nFats: ${e.fats} - Carb: ${e.carb}`
  //         );
  //       });

  //       return [obj.dayname, ...meals];
  //     });

  //     const convertedNutritions = this.meals.map((obj: any) => {
  //       return [
  //         this.calculateTotalNutrition(obj.meals).calories.toFixed(1),
  //         this.calculateTotalNutrition(obj.meals).protiens.toFixed(1),
  //         this.calculateTotalNutrition(obj.meals).fats.toFixed(1),
  //         this.calculateTotalNutrition(obj.meals).carb.toFixed(1),
  //       ];
  //     });

  //     autoTable(doc, { startY: 85 });
  //     autoTable(doc, {
  //       head: [headers],
  //       body: convertedData,
  //       bodyStyles: {
  //         cellPadding: [5, 15, 5, 1],
  //       },
  //       didDrawCell: (data: any) => {
  //         const index = this.meals.findIndex(
  //           (day: any) => day.dayname === data.row.raw[0]
  //         );
  //         if (
  //           data.column.dataKey === headers.length - 1 &&
  //           data.cell.section === 'body' &&
  //           index >= 0
  //         ) {
  //           autoTable(doc, {
  //             head: [['Calories', 'Protein', 'Fats', 'Carb']],
  //             body: [convertedNutritions[index]],
  //             startY: data.cell.y + 2,
  //             margin: { left: data.cell.x - 10 },
  //             tableWidth: 'wrap',
  //             theme: 'grid',
  //             styles: {
  //               fontSize: 7,
  //               cellPadding: 1,
  //             },
  //           });
  //         }
  //       },
  //     });

  //     // Set the line color and width
  //     doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
  //     doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

  //     // Draw a line at the bottom of the page

  //     // Get the total number of pages
  //     const totalPages = doc.internal.pages;

  //     // Iterate over each page and add the footer
  //     for (let i = 1; i <= totalPages.length; i++) {
  //       doc.internal.pageSize.width = 520;
  //       doc.line(
  //         10,
  //         doc.internal.pageSize.height - 10,
  //         doc.internal.pageSize.width - 10,
  //         doc.internal.pageSize.height - 10
  //       );
  //       // Set the current page as active
  //       doc.setPage(i);
  //       // Set the position and alignment of the footer
  //       doc.setFontSize(10);
  //       doc.setTextColor(150);
  //       doc.text(
  //         'Thelowcalories.com',
  //         20,
  //         doc.internal.pageSize.getHeight() - 5
  //       );
  //     }

  //     doc.save('customer_plans.pdf');
  //   }
  // }

  @ViewChild('download_container') download_container!: ElementRef;
  isLoading: boolean = false;

  pdfDownload() {
    this.isLoading = true;
    let HTML_Width = this.download_container.nativeElement.clientWidth;
    let HTML_Height = this.download_container.nativeElement.clientHeight;
    html2canvas(this.download_container.nativeElement).then((canvas) => {
      let imgData = canvas.toDataURL('image/jpeg');
      let pdf = new jsPDF('p', 'pt', [HTML_Width * 1.05, HTML_Height * 1.05]);
      pdf.addImage(imgData, 'JPG', 50, 50, HTML_Width, HTML_Height);
      const fileName =
        this.customerInfo.customerName + '-' + this.customerInfo.cid;
      pdf.save(fileName);
      this.isLoading = false;
    });
  }

  // ================================================================= FILTERS =================================================================
  logFilters:string[] = [
    'Update',
    'ISDELIVERD',
    'Extended',
    'Transfer',
    'Phone',
    'Create',
    'Activate',
    'DeActivate',
  ];
  selectedFilters:any[]=[]
}
