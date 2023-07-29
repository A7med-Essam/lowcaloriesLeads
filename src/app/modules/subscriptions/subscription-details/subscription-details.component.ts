import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  SubscriptionDetails,
  SubscriptionsService,
} from 'src/app/services/subscriptions.service';
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

  constructor(
    private _Router: Router,
    private _SubscriptionsService: SubscriptionsService,
    private _GuardService: GuardService
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
            this.getSubscriptionDetails(res.id);
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

  backDetailsBtn() {
    this._Router.navigate(['subscriptions/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getSubscriptionDetails(id: number) {
    this._SubscriptionsService.getSubscriptionDetails(id).subscribe({
      next: (res) => {
        if (res.status) {
          this.sub = this.transformObjects(res.data);
        } else {
          this._Router.navigate(['subscriptions/show']);
        }
      },
      error: (err) => {
        this._Router.navigate(['subscriptions/show']);
      },
    });
  }

  transformObjects(arr: any) {
    if (arr.gift_code) {
      arr.codes = arr.gift_code;
      delete arr.gift_code;
    }
    return arr;
  }

  // ===============================================================PRINT PDF=====================================================================

  print() {
    if (this.printPermission) {
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

      let columns1: any[] = [
        // { title: "Title", dataKey:  "Description"},
        { title: 'Tax Registration Number', dataKey: '100346758400003' },
        { title: 'First Name', dataKey: this.sub?.user?.first_name },
        { title: 'Last Name', dataKey: this.sub?.user?.last_name },
        { title: 'Gender', dataKey: this.sub?.user?.gender },
        { title: 'Birthday', dataKey: this.sub?.user?.birthday },
        { title: 'Height', dataKey: this.sub?.user?.height },
        { title: 'Weight', dataKey: this.sub?.user?.Weight },
        { title: 'Email', dataKey: this.sub?.user?.email },
        { title: 'Land Line', dataKey: this.sub?.user?.land_line },
        { title: 'Phone Number', dataKey: this.sub?.user?.phone_number },
        {
          title: 'Second Phone Number',
          dataKey: this.sub?.user?.second_phone_number,
        },
      ];

      let columns2: any[] = [
        { title: 'Invoice', dataKey: this.sub?.invoice_no },
        { title: 'Program', dataKey: this.sub?.full_plan_name },
        { title: 'Plan Title', dataKey: this.sub?.subscriptions_note },
        {
          title: 'Meal Types',
          dataKey: this.replaceMeals(this.sub?.dislike).join(' - '),
        },
        { title: 'Cutlery', dataKey: this.sub?.cutlery },
        { title: 'Agent', dataKey: this.sub?.agent?.name },
      ];
      let columns3: any[] = [
        { title: 'Start Date', dataKey: this.sub?.delivery_starting_day },
        { title: 'Emirate', dataKey: this.sub?.location.emirate.en_name },
        { title: 'Land Mark', dataKey: this.sub?.location.landmark },
        { title: 'Area', dataKey: this.sub?.location?.area_id },
        { title: 'Villa/Flat', dataKey: this.sub?.location?.property_number },
        { title: 'Delivery Days', dataKey: this.sub?.days_of_week },
      ];

      let columns4: any[] = [];

      if (this.sub.version == 'v4') {
        columns4 = [
          {
            title: `TOTAL PRICE WITHOUT VAT ${this.sub?.subscriptions_note}`,
            dataKey: this.sub?.total_price_without_vat.toFixed(3),
          },
          {
            title: `DISCOUNT ${
              this.sub?.codes?.percentage
                ? '(' + this.sub?.codes?.percentage + '%)'
                : ''
            }`,
            dataKey: -this.sub?.discount_amount.toFixed(3),
          },
          {
            title: 'NET TOTAL WITHOUT VAT',
            dataKey: this.sub?.total_after_discount.toFixed(3),
          },
          { title: 'VAT', dataKey: this.sub?.vat_amount.toFixed(3) },
          {
            title: 'REFUNDABLE SECURITY AMOUNT',
            dataKey: this.sub?.refundable_security_amount,
          },
          { title: 'GRAND TOTAL', dataKey: this.sub?.grand_total },
        ];
      } else {
        columns4 = [
          {
            title: `TOTAL PRICE WITHOUT VAT ${this.sub?.subscriptions_note}`,
            dataKey: this.sub?.total_price_without_vat.toFixed(3),
          },
          { title: 'VAT', dataKey: this.sub?.vat_amount.toFixed(3) },
          {
            title: 'NET TOTAL WITH VAT',
            dataKey: this.sub?.total_with_vat.toFixed(3),
          },
          {
            title: `DISCOUNT ${
              this.sub?.codes?.percentage
                ? '(' + this.sub?.codes?.percentage + '%)'
                : ''
            }`,
            dataKey: -this.sub?.discount_amount.toFixed(3),
          },
          {
            title: 'NET TOTAL AFTER DISCOUNT',
            dataKey: this.sub?.total_after_discount.toFixed(3),
          },
          {
            title: 'REFUNDABLE SECURITY AMOUNT',
            dataKey: this.sub?.refundable_security_amount,
          },
          { title: 'GRAND TOTAL', dataKey: this.sub?.grand_total },
        ];
      }

      columns1 = columns1.filter(
        (item) => item.dataKey !== null && item.dataKey !== undefined
      );
      columns2 = columns2.filter(
        (item) => item.dataKey !== null && item.dataKey !== undefined
      );
      columns3 = columns3.filter(
        (item) => item.dataKey !== null && item.dataKey !== undefined
      );
      columns4 = columns4.filter(
        (item) => item.dataKey !== null && item.dataKey !== undefined
      );

      if (this.sub.program_id == 50 || this.sub.program_id < 15) {
        columns2.push({ title: 'Confirmed Terms', dataKey: 'yes' });
      }

      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Client Info', 10, 60);
      autoTable(doc, { body: columns1, startY: 65 });
      doc.setLineWidth(0.4); // Set the line width
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.line(10, 155, 200, 155); // (x1, y1, x2, y2) Horizontal
      // ======================
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Subscription Info', 10, 160);
      autoTable(doc, { body: columns2, startY: 165 });
      doc.setLineWidth(0.4); // Set the line width
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.line(10, 212, 200, 212); // (x1, y1, x2, y2) Horizontal
      // ======================
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Payment Info', 10, 220);
      autoTable(doc, { body: columns4, startY: 225 });
      // ======================
      doc.addPage();
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Delivery Info', 10, 10);
      autoTable(doc, { body: columns3, startY: 15 });

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
        doc.text('lowcalories.ae', 10, doc.internal.pageSize.getHeight() - 5);
      }

      doc.save('Subscription.pdf');
    }
  }

  endsWithPDF(url: string) {
    return url.toLowerCase().endsWith('.pdf');
  }

  replaceMeals(mealsArray: string) {
    mealsArray = JSON.parse(mealsArray);
    // Create a new array to store the updated meal names
    const updatedMeals = [];

    // Loop through each item in the original array
    for (let i = 0; i < mealsArray.length; i++) {
      // Replace the meal names based on the specified rules
      switch (mealsArray[i]) {
        case 'Meal 1':
          updatedMeals.push('Breakfast');
          break;
        case 'Meal 2':
          updatedMeals.push('Lunch');
          break;
        case 'Meal 3':
          updatedMeals.push('Dinner');
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

  printInvoice(sub: SubscriptionDetails) {
    if (this.printPermission) {
      const doc = new jsPDF();
      const imageFile = '../../../../assets/images/logo.png';

      // =================================LINES=================================
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.setLineWidth(0.4); // Set the line width
      doc.line(10, 20, 200, 20); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 50, 200, 50); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 75, 200, 75); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 285, 200, 285); // (x1, y1, x2, y2) Horizontal
      // ======================================================================
      doc.line(10, 285, 10, 20); // (x1, y1, x2, y2) Vertical
      doc.line(80, 50, 80, 75); // (x1, y1, x2, y2) Vertical
      doc.line(200, 285, 200, 20); // (x1, y1, x2, y2) Vertical
      // =================================END-LINES=================================
      doc.addImage(imageFile, 'JPEG', 15, 25, 25, 18);
      // =================================FOOTER=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Lowcalories.ae', 10, 290);
      // =================================TEXT=================================
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('LOWCALORIE HOSPITALITY AND CATERING', 46, 28);
      doc.text('COMPANY SERVICES FOR L.L.C.', 46, 33);
      // =================================END-TEXT=================================
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('M38, Musaffah, Abu Dhabi - , United Arab Emirates', 46, 40);
      doc.text('TRN100346758400003', 46, 45);
      // =================================END-TEXT=================================
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TAX INVOICE', 168, 33);
      doc.setFontSize(10);
      doc.text('Invoice# INV-3285', 168, 38);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Invoice Date :', 15, 58);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text('16 Mar 2023', 40, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Terms :', 15, 63);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text('Net 30', 40, 63);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Due Date :', 15, 68);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text('15 Apr 2023', 40, 68);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Bill To :', 85, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('BRANDFOLIO ONE RESTAURENT & CAFÉ LLC & WTC MALL', 85, 63);
      doc.text('BRANCH OF ABU DHABI -1,B2,', 85, 68);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TRN 100244837900003', 85, 73);

      // =================================TABLE=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#545454'); // Set text color to black
      doc.text('Client Info', 15, 82);
      const body_table1 = [
        {
          name: sub.user?.first_name + ' ' + sub.user?.last_name,
          email: sub.user?.email,
          gender: sub.user?.gender,
          mobile: sub.user?.phone_number,
          birthday: sub.user?.birthday,
          height: sub.user?.height,
          weight: sub.user?.Weight,
        },
      ];

      const columns_table1 = [
        { header: 'Name', dataKey: 'name' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Gender', dataKey: 'gender' },
        { header: 'Mobile', dataKey: 'mobile' },
        { header: 'Birthday', dataKey: 'birthday' },
        { header: 'Height', dataKey: 'height' },
        { header: 'Weight', dataKey: 'weight' },
      ];
      // generate auto table with body
      autoTable(doc, {
        columns: columns_table1,
        body: body_table1,
        startY: 85,
        theme: 'grid',
        // columnStyles:{0: {textColor: [30, 212, 145],fillColor:[3, 146, 48]}},
        // headStyles :{lineWidth: 1,fillColor: [30, 212, 145],textColor: [232, 252, 245],}
      });
      doc.line(10, 105, 200, 105); // (x1, y1, x2, y2) Horizontal

      // =================================TABLE=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#545454'); // Set text color to black
      doc.text('Subscription Info', 15, 112);
      const body_table2 = [
        {
          invoice: sub?.invoice_no,
          program:
            sub.subscriptions_note.split('-')[1] +
            '   ' +
            sub.full_plan_name.split('-')[0] +
            '   ' +
            sub.full_plan_name.split('-')[2] +
            '   ' +
            sub.full_plan_name.split('-')[3],
          plan: sub?.subscriptions_note,
        },
      ];

      const columns_table2 = [
        { header: 'Invoice', dataKey: 'invoice' },
        { header: 'Program', dataKey: 'program' },
        { header: 'Plan ', dataKey: 'plan' },
      ];
      // generate auto table with body
      autoTable(doc, {
        columns: columns_table2,
        body: body_table2,
        startY: 115,
        theme: 'grid',
      });
      const body_table3 = [
        {
          meal_types: this.replaceMeals(sub.dislike).join(' - '),
          cutlery: sub?.cutlery == 'checked' ? 'yes' : 'no',
          agent: sub?.agent?.name,
        },
      ];

      const columns_table3 = [
        { header: 'Meal Types', dataKey: 'meal_types' },
        { header: 'Need Cutlery?', dataKey: 'cutlery' },
        { header: 'Agent', dataKey: 'agent' },
      ];
      // generate auto table with body
      autoTable(doc, {
        columns: columns_table3,
        body: body_table3,
        startY: 135,
        theme: 'grid',
      });
      doc.line(10, 155, 200, 155); // (x1, y1, x2, y2) Horizontal

      // =================================TABLE=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#545454'); // Set text color to black
      doc.text('Delivery Info', 15, 160);
      const body_table4 = [
        {
          date: sub?.delivery_starting_day,
          emirate: sub.location.emirate.en_name,
          landmark: sub?.location.landmark,
        },
      ];

      const columns_table4 = [
        { header: 'Start Date', dataKey: 'date' },
        { header: 'Emirate', dataKey: 'emirate' },
        { header: 'Land Mark', dataKey: 'landmark' },
      ];
      // generate auto table with body
      autoTable(doc, {
        columns: columns_table4,
        body: body_table4,
        startY: 163,
        theme: 'grid',
      });
      const body_table5 = [
        {
          area: sub.location.area_id,
          flat: sub.location.property_number,
          delivery: sub?.days_of_week,
        },
      ];

      const columns_table5 = [
        { header: 'Area', dataKey: 'area' },
        { header: 'Villa/Flat', dataKey: 'flat' },
        { header: 'Delivery Days', dataKey: 'delivery' },
      ];
      // generate auto table with body
      autoTable(doc, {
        columns: columns_table5,
        body: body_table5,
        startY: 183,
        theme: 'grid',
      });
      doc.line(10, 203, 200, 203); // (x1, y1, x2, y2) Horizontal
      // =================================TABLE=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#545454'); // Set text color to black
      doc.text('Payment Info', 15, 210);

      // let columns: any[] = [
      //   {
      //     title: `TOTAL PRICE WITHOUT VAT (${this.sub?.subscriptions_note})`,
      //     dataKey: this.sub?.total_price_without_vat.toFixed(3),
      //   },
      //   {
      //     title: `DISCOUNT (${this.sub?.codes.percentage} %)`,
      //     dataKey: -this.sub?.discount_amount.toFixed(3),
      //   },
      //   {
      //     title: 'NET TOTAL WITHOUT VAT',
      //     dataKey: this.sub?.total_after_discount.toFixed(3),
      //   },
      //   { title: 'VAT', dataKey: this.sub?.vat_amount.toFixed(3) },
      //   {
      //     title: 'REFUNDABLE SECURITY AMOUNT',
      //     dataKey: this.sub?.refundable_security_amount,
      //   },
      //   { title: 'GRAND TOTAL', dataKey: this.sub?.grand_total },
      // ];

      let columns: any[] = [];

      if (this.sub.version == 'v4') {
        columns = [
          {
            title: `TOTAL PRICE WITHOUT VAT ${this.sub?.subscriptions_note}`,
            dataKey: this.sub?.total_price_without_vat.toFixed(3),
          },
          {
            title: `DISCOUNT ${
              this.sub?.codes?.percentage
                ? '(' + this.sub?.codes?.percentage + '%)'
                : ''
            }`,
            dataKey: -this.sub?.discount_amount.toFixed(3),
          },
          {
            title: 'NET TOTAL WITHOUT VAT',
            dataKey: this.sub?.total_after_discount.toFixed(3),
          },
          { title: 'VAT', dataKey: this.sub?.vat_amount.toFixed(3) },
          {
            title: 'REFUNDABLE SECURITY AMOUNT',
            dataKey: this.sub?.refundable_security_amount,
          },
          { title: 'GRAND TOTAL', dataKey: this.sub?.grand_total },
        ];
        autoTable(doc, {
          body: columns,
          startY: 215,
          didParseCell: function (data) {
            if (data.row.index === 5) {
              data.cell.styles.textColor = [3, 146, 48];
            } else if (data.row.index === 1) {
              data.cell.styles.textColor = [239, 67, 67];
            }
          },
        });
      } else {
        columns = [
          {
            title: `TOTAL PRICE WITHOUT VAT ${this.sub?.subscriptions_note}`,
            dataKey: this.sub?.total_price_without_vat.toFixed(3),
          },
          { title: 'VAT', dataKey: this.sub?.vat_amount.toFixed(3) },
          {
            title: 'NET TOTAL WITH VAT',
            dataKey: this.sub?.total_with_vat.toFixed(3),
          },
          {
            title: `DISCOUNT ${
              this.sub?.codes?.percentage
                ? '(' + this.sub?.codes?.percentage + '%)'
                : ''
            }`,
            dataKey: -this.sub?.discount_amount.toFixed(3),
          },
          {
            title: 'NET TOTAL AFTER DISCOUNT',
            dataKey: this.sub?.total_after_discount.toFixed(3),
          },
          {
            title: 'REFUNDABLE SECURITY AMOUNT',
            dataKey: this.sub?.refundable_security_amount,
          },
          { title: 'GRAND TOTAL', dataKey: this.sub?.grand_total },
        ];
        autoTable(doc, {
          body: columns,
          startY: 215,
          didParseCell: function (data) {
            if (data.row.index === 6) {
              data.cell.styles.textColor = [3, 146, 48];
            } else if (data.row.index === 3) {
              data.cell.styles.textColor = [239, 67, 67];
            }
          },
        });
      }




      doc.save('Subscription.pdf');
    }
  }
}
