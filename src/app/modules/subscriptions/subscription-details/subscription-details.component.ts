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

  printPage() {
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
        {
          title: 'Program',
          dataKey:
            this.sub.subscriptions_note.split('-')[1] +
            '   ' +
            this.sub.full_plan_name.split('-')[0] +
            '   ' +
            this.sub.full_plan_name.split('-')[2] +
            '   ' +
            this.sub.full_plan_name.split('-')[3],
        },

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

      let columns5: any[] = [];
      if (this.sub.subscription_days.length) {
        this.sub.subscription_days.forEach((m) => {
          columns5.push({ title: 'Date/Day', dataKey: `${m.date} / ${m.day}` });
          m.day_meals.forEach((d) => {
            columns5.push({
              title: d.type,
              dataKey: `${d.meal.name} ${d.meal.max_meal} ${d.meal.meal_unit} ${
                d.meal.max_side ? d.meal.max_side : ''
              } ${d.meal.max_side ? d.meal.side_unit : ''}`,
            });
          });
        });
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
      columns5 = columns5.filter(
        (item) => item.dataKey !== null && item.dataKey !== undefined
      );

      if (this.sub.program_id == 50 || this.sub.program_id < 15) {
        columns2.push({ title: 'Confirmed Terms', dataKey: 'yes' });
      }

      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Client Info', 10, 57);
      autoTable(doc, { body: columns1, startY: 60 });
      doc.setLineWidth(0.4); // Set the line width
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.line(10, 150, 200, 150); // (x1, y1, x2, y2) Horizontal
      // ======================
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Subscription Info', 10, 155);
      autoTable(doc, { body: columns2, startY: 158 });
      doc.setLineWidth(0.4); // Set the line width
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.line(10, 216, 200, 216); // (x1, y1, x2, y2) Horizontal
      // ======================
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Payment Info', 10, 221);
      autoTable(doc, { body: columns4, startY: 223 });
      // ======================
      doc.addPage();
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Delivery Info', 10, 10);
      autoTable(doc, { body: columns3, startY: 15 });

      if (columns5.length) {
        doc.setLineWidth(0.4); // Set the line width
        doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
        doc.line(10, 75, 200, 75); // (x1, y1, x2, y2) Horizontal
        doc.setFontSize(10);
        doc.setTextColor('#9EA4A9'); // Set text color to black
        doc.text('Meals Info', 10, 82);
        autoTable(doc, {
          body: columns5,
          startY: 85,
          didParseCell: function (data) {
            if (data.cell.raw == 'Date/Day') {
              data.row.cells[0].styles.fillColor = [3, 146, 48];
              data.row.cells[0].styles.textColor = [255, 255, 255];
              data.row.cells[1].styles.fillColor = [3, 146, 48];
              data.row.cells[1].styles.textColor = [255, 255, 255];
            }
          },
        });
      }

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
    for (let i = 0; i < mealsArray?.length; i++) {
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

  convertMealNames(meal: string): string {
    switch (meal) {
      case 'Meal 1':
        return 'Breakfast';
      case 'Meal 2':
        return 'Lunch';
      case 'Meal 3':
        return 'Dinner';
      default:
        return meal;
    }
  }

  printTaxInvoice(sub: SubscriptionDetails) {
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
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TAX INVOICE', 160, 42);
      doc.setFontSize(8);
      doc.text('#LC-20230730-141830-78', 158, 45);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Invoice Date :', 15, 58);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text(sub.created_date, 40, 58);
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
      doc.text(sub.delivery_starting_day, 40, 68);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Bill To :', 85, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text(
        `${sub.location.area_id != 'null' ? sub.location.area_id + ' - ' : ''}${
          sub.location.emirate.en_name
        }`,
        85,
        63
      );
      doc.text(
        `${sub.location.landmark != '0' ? sub.location.landmark + ' - ' : ''}${
          sub.location.property_number != '0'
            ? sub.location.property_number
            : ''
        }`,
        85,
        68
      );
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

  // =====================================================ACCOUNTANT TAX=================================================================
  printAccountantTaxInvoice(sub: SubscriptionDetails) {
    if (this.printPermission) {
      const doc = new jsPDF();
      const imageFile = '../../../../assets/images/logo.png';
      const SignatureImageFile =
        '../../../../assets/images/accountant-signature.png';
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
      doc.addImage(SignatureImageFile, 'PNG', 130, 220, 65, 65);
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
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TAX INVOICE', 160, 42);
      doc.setFontSize(8);
      doc.text('#LC-20230730-141830-78', 158, 45);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Invoice Date :', 15, 58);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text(sub.created_date, 40, 58);
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
      doc.text(sub.delivery_starting_day, 40, 68);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Bill To :', 85, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text(
        `${sub.location?.area_id != 'null' ? sub.location?.area_id + ' - ' : ''}${
          sub.location?.emirate?.en_name
        }`,
        85,
        63
      );
      doc.text(
        `${(sub.location.landmark != '0' &&  sub.location.landmark != 'null') ? sub.location.landmark + ' - ' : ''}${
          (sub.location.property_number != '0' && sub.location.property_number != 'null') ? sub.location.property_number : ''
        }`,
        85,
        68
      );
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TRN 100244837900003', 85, 73);
      // =================================START-LINE=================================
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.setLineWidth(0.4); // Set the line width
      doc.line(18, 75, 18, 120); // (x1, y1, x2, y2) Vertical
      doc.line(45, 75, 45, 120); // (x1, y1, x2, y2) Vertical
      doc.line(90, 75, 90, 120); // (x1, y1, x2, y2) Vertical
      doc.line(105, 75, 105, 120); // (x1, y1, x2, y2) Vertical
      doc.line(120, 75, 120, 120); // (x1, y1, x2, y2) Vertical
      doc.line(143, 75, 143, 120); // (x1, y1, x2, y2) Vertical
      doc.line(157, 75, 157, 120); // (x1, y1, x2, y2) Vertical
      doc.line(175, 75, 175, 120); // (x1, y1, x2, y2) Vertical
      // =================================END-LINE=================================
      doc.line(10, 82, 200, 82); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 120, 200, 120); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 155, 200, 155); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 165, 200, 165); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 178, 200, 178); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 188, 200, 188); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 198, 200, 198); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 208, 200, 208); // (x1, y1, x2, y2) Horizontal
      doc.line(10, 218, 200, 218); // (x1, y1, x2, y2) Horizontal
      // =================================END-LINE=================================
      doc.line(125, 120, 125, 155); // (x1, y1, x2, y2) Vertical
      doc.line(125, 165, 125, 285); // (x1, y1, x2, y2) Vertical
      doc.line(163, 165, 163, 218); // (x1, y1, x2, y2) Vertical
      // =================================END-LINE=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('#', 13, 80);
      doc.text('1', 13, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Item', 21, 80);
      doc.setFontSize(9);
      doc.text(sub.program_id == 60 ? 'Nutrition':'Subscription', 20, 90);
      doc.text('Fees', 20, 95);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Description', 48, 80);
      doc.setFontSize(9);
      doc.text(`TOTAL COST OF`, 47, 90);
      doc.text(`${sub.program_id == 60 ? 'FAST MEASUREMENT':'FOOD SOLD'}`, 47, 95);
      doc.text(`${sub.program_id == 60 ? 'FOR THE PERIOD':'FOR THE PERIOD'}`, 47, 100);
      doc.text(
        `${sub.delivery_starting_day} - ${this.calcSubscriptionEndDate(
          sub.delivery_starting_day,
          sub.days_of_week,
          sub.subscriptions_note,
          sub.version,
          sub.program_id
        )}`,
        47,
        105
      );
      // doc.text('MINUS ORIGIN33', 47, 105);
      // doc.text('COMMISSION', 47, 110);
      // doc.text('FOR THE PERIOD', 47, 115);
      // doc.text('(43650.98 - 17363.44)', 47, 120);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Qty', 93, 80);
      doc.setFontSize(9);
      doc.text('1.00', 93, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Units', 108, 80);
      // doc.setFontSize(9);
      // doc.text('TOTAL COST OF FOOD', 108, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Rate', 123, 80);
      doc.setFontSize(9);
      doc.text(sub.total_price_without_vat.toFixed(2), 123, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax %', 145, 80);
      doc.setFontSize(9);
      doc.text('5.00', 145, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax', 160, 80);
      doc.setFontSize(9);
      doc.text(sub.vat_amount.toFixed(2), 160, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Amount', 178, 80);
      doc.setFontSize(9);
      doc.text(sub.total_price_without_vat.toFixed(2), 178, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Notes : Thanks for your business.', 13, 128);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.text('Sub Total', 127, 128);
      doc.text(sub.total_after_discount.toFixed(2), 170, 128);
      doc.text('Standard Rate (5%)', 127, 134);
      doc.text(sub.vat_amount.toFixed(2), 170, 134);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text('Total', 127, 140);
      doc.text(`AED ${sub.total_with_vat.toFixed(2)}`, 170, 140);
      doc.text('Balance Due', 127, 146);
      doc.text(`AED ${sub.total_with_vat.toFixed(2)}`, 170, 146);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax Summary', 13, 161);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax Details', 13, 173);
      doc.setFontSize(9);
      doc.text('Taxable Amount (AED)', 127, 173);
      doc.text('Tax Amount (AED)', 165, 173);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('DISCOUNT', 13, 184);
      doc.text(sub.discount_amount.toFixed(2), 128, 184);
      doc.text(sub.discount_amount.toFixed(2), 165, 184);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('STANDARD RATE (5%)', 13, 194);
      doc.text(sub.vat_amount.toFixed(2), 128, 194);
      doc.text(sub.vat_amount.toFixed(2), 165, 194);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('REFUNDABLE SECURITY AMOUNT', 13, 204);
      doc.text(sub.refundable_security_amount.toFixed(), 128, 204);
      doc.text(sub.refundable_security_amount.toFixed(), 165, 204);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TOTAL', 13, 214);
      doc.text(`AED ${sub.grand_total}`, 128, 214);
      doc.text(`AED ${sub.grand_total}`, 165, 214);
      // =================================END-TEXT=================================
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text(
        'BANK ACCOUNT DETAILS BANK NAME: ADIB (Abu Dhabi Islamic Bank)',
        13,
        225
      );
      doc.text('ACCOUNT NAME: LOWCALORIES HOSPITALITY', 13, 230);
      doc.text('AND CATERING COMPANY SERVICES FOR L L C', 13, 235);
      doc.text('ACCOUNT NUMBER : 19057777', 13, 240);
      doc.text('IBAN NUMBER : AE690500000000019057777', 13, 245);
      // =================================END-TEXT=================================
      doc.text('Authorized Signature', 150, 280);

      doc.save('Subscription.pdf');
    }
  }

  calcSubscriptionEndDate(
    startDate: string,
    weekDays: string,
    subscriptionNote: string,
    version: string,
    programId: number
  ) {
    if (programId == 60) {
      return new Date(startDate).toLocaleDateString('en-CA')
    }
    let subscriptionDaysCount =  Number(subscriptionNote.split('-')[2]);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    let currentDate = new Date(startDate);
    const weekdaysMapV1: any = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };

    const weekdaysMapV3: any = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const DAYS: Array<string> = weekDays.replace(/\[|\]|"/g, '').split(',');

    const weekdaysArray = DAYS.map((day) =>
      version == 'v1' ? weekdaysMapV1[day.toLowerCase()] : weekdaysMapV3[day.toLowerCase()]
    );


    while (weekdaysArray[0]&&subscriptionDaysCount > 0) {
      currentDate = new Date(currentDate.getTime() + millisecondsPerDay);
      if (weekdaysArray.includes(currentDate.getDay())) {
        subscriptionDaysCount--;
      }
    }
    return new Date(currentDate).toLocaleDateString('en-CA');
  }
}
