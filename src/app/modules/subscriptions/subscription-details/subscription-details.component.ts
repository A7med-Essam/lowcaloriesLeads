import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubscriptionDetails, SubscriptionsService } from 'src/app/services/subscriptions.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GuardService } from 'src/app/services/guard.service';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss'],
})
export class SubscriptionDetailsComponent implements OnInit {
  sub!: SubscriptionDetails;
  // columns: any[] = [];

  constructor(
    private _Router: Router,
    private _SubscriptionsService: SubscriptionsService,
    private _GuardService:GuardService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._SubscriptionsService.subscription
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['subscriptions/show']);
          } else {
            this.getSubscriptionDetails(res.id)
            this.getPermission();
          }
        },
      });
  }
  printPermission: boolean = false;
  getPermission() {
    this.printPermission =
      this._GuardService.getPermissionStatus('print_subscription');
  }

  // capitalize(str: string): string {
  //   return str.charAt(0).toUpperCase() + str.slice(1);
  // }

  backDetailsBtn() {
    this._Router.navigate(['subscriptions/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getSubscriptionDetails(id:number){
    this._SubscriptionsService.getSubscriptionDetails(id).subscribe({
      next:res=>{
        if (res.status) {
          this.sub = res.data
          // this.columns = Object.keys(res.data).map((key) => ({
          //   label: this.capitalize(key.replace(/_/g, ' ')),
          //   key: key,
          // }));
        }
        else{
          this._Router.navigate(['subscriptions/show']);
        }
      },
      error:err=>{
        this._Router.navigate(['subscriptions/show']);
      }
    })
  }

  // ===============================================================PRINT PDF=====================================================================

  print() {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
      doc.text('Issue Subject:Subscription Requests Report', 10, 40);
      doc.text('Prepared By: Low Calories Technical Team', 10, 45);
      doc.text('Requested By: Mohamed Fawzy', 10, 50);
      doc.text('Low Calories Restaurant - Egypt', 150, 30);
      doc.text('3rd Settelment, New Cairo', 150, 35);
      doc.text('Phone: 201116202225', 150, 40);
      doc.text('Email: info@thelowcalories.com', 150, 45);
      doc.text('Website: thelowcalories.com', 150, 50);

      autoTable(doc, { startY: 50 });

      let columns:any[] = [
        // { title: "Title", dataKey:  "Description"},
        { title: "Tax Registration Number", dataKey:  "100346758400003"},
        { title: "First Name", dataKey:  this.sub?.user?.first_name},
        { title: "Last Name", dataKey:  this.sub?.user?.last_name},
        { title: "Gender", dataKey:  this.sub?.user?.gender},
        { title: "Birthday", dataKey:  this.sub?.user?.birthday},
        { title: "Height", dataKey:  this.sub?.user?.height},
        { title: "Weight", dataKey:  this.sub?.user?.Weight},
        { title: "Email", dataKey:  this.sub?.user?.email},
        { title: "Land Line", dataKey:  this.sub?.user?.land_line},
        { title: "Phone Number", dataKey:  this.sub?.user?.phone_number},
        { title: "Second Phone Number", dataKey:  this.sub?.user?.second_phone_number},
        { title: "Program", dataKey:  this.sub?.full_plan_name},
        { title: "Plan Title", dataKey:  this.sub?.subscriptions_note},
        { title: "Meal Types", dataKey: this.replaceMeals(this.sub?.dislike).join(" - ")},
        { title: "Cutlery", dataKey:  this.sub?.cutlery},
        { title: "Start Date", dataKey:  this.sub?.delivery_starting_day},
        { title: "Emirate", dataKey:  this.sub?.location.emirate.en_name},
        { title: "Land Mark", dataKey:  this.sub?.location.landmark },
        { title: "Area", dataKey:  this.sub?.location?.area_id },
        { title: "Villa/Flat", dataKey:  this.sub?.location?.property_number },
        { title: "Delivery Days", dataKey:  this.sub?.days_of_week },
        { title: "Agent", dataKey:  this.sub?.agent?.name},
        { title:`TOTAL PRICE WITHOUT VAT ${(this.sub?.subscriptions_note)}`, dataKey:  this.sub?.total_price_without_vat.toFixed(3)},
        { title: `DISCOUNT (${this.sub?.codes.percentage} %)`, dataKey:  -this.sub?.discount_amount.toFixed(3)},
        { title: "NET TOTAL WITHOUT VAT", dataKey:  this.sub?.total_after_discount.toFixed(3) },
        { title: "VAT", dataKey:  this.sub?.vat_amount.toFixed(3)},
        { title: "REFUNDABLE SECURITY AMOUNT", dataKey:  this.sub?.refundable_security_amount},
        { title: "GRAND TOTAL", dataKey:  this.sub?.grand_total},
      ];
      columns = columns.filter(item => item.dataKey !== null && item.dataKey !== undefined);

      if (this.sub.program_id == 50 || this.sub.program_id < 15) {
        columns.push({ title: "Confirmed Terms", dataKey:  "yes"})
      }
      // doc.text(140, 40, "Report");
      autoTable(doc, { 
        body: 
         columns,
        //  columnStyles:{0: {textColor: [3, 146, 48]}},
        //  theme:'striped' ,
        //  headStyles :{lineWidth: 1,fillColor: [30, 212, 145],textColor: [232, 252, 245],},
      });

      // Set the line color and width
      doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
      doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

      const totalPages = doc.internal.pages;
      for (let i = 1; i <= totalPages.length; i++) {
        doc.line(
          10,
          doc.internal.pageSize.height - 10,
          doc.internal.pageSize.width - 10,
          doc.internal.pageSize.height - 10
        );
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          'Thelowcalories.com',
          10,
          doc.internal.pageSize.getHeight() - 5
        );
      }

      doc.save('Subscription.pdf');
  }

  endsWithPDF(url:string) {
    return url.toLowerCase().endsWith(".pdf");
  }

  replaceMeals(mealsArray:string) {
    mealsArray = JSON.parse(mealsArray)
    // Create a new array to store the updated meal names
    const updatedMeals = [];
  
    // Loop through each item in the original array
    for (let i = 0; i < mealsArray.length; i++) {
      // Replace the meal names based on the specified rules
      switch (mealsArray[i]) {
        case "Meal 1":
          updatedMeals.push("Breakfast");
          break;
        case "Meal 2":
          updatedMeals.push("Lunch");
          break;
        case "Meal 3":
          updatedMeals.push("Dinner");
          break;
        default:
          // If the item doesn't match any meal names, keep it as is
          updatedMeals.push(mealsArray[i]);
          break;
      }
    }
  
    // Return the new array with updated meal names
    return updatedMeals;
  }
  
}
