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
      doc.addFileToVFS('Cairo-Regular-normal.ttf', this.getFontBase64());
      doc.addFont('Cairo-Regular-normal.ttf', 'Cairo-Regular', 'normal');
      doc.setFont('Cairo-Regular', 'normal');
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
        { title: 'Note', dataKey: this.sub?.note },
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
            title: `TOTAL PRICE WITHOUT VAT (${this.sub?.subscriptions_note})`,
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
      autoTable(doc, { body: columns1, startY: 60,
        styles:{
          font:'Cairo-Regular'
        } });
      doc.setLineWidth(0.4); // Set the line width
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.line(10, 155, 200, 155); // (x1, y1, x2, y2) Horizontal
      // ======================
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Subscription Info', 10, 160);
      autoTable(doc, { body: columns2, startY: 163 ,
        styles:{
          font:'Cairo-Regular'
        }});
      doc.setLineWidth(0.4); // Set the line width
      doc.setDrawColor(187, 187, 187); // RGB color values (black in this case)
      doc.line(10, 221, 200, 221); // (x1, y1, x2, y2) Horizontal
      // ======================
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Payment Info', 10, 226);
      autoTable(doc, { body: columns4, startY: 228 ,
        styles:{
          font:'Cairo-Regular'
        }});
      // ======================
      doc.addPage();
      doc.setFontSize(10);
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Delivery Info', 10, 10);
      autoTable(doc, { body: columns3, startY: 15,
        styles:{
          font:'Cairo-Regular'
        } });

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
          styles:{
            font:'Cairo-Regular'
          },
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
      doc.addFileToVFS('Cairo-Regular-normal.ttf', this.getFontBase64());
      doc.addFont('Cairo-Regular-normal.ttf', 'Cairo-Regular', 'normal');
      doc.setFont('Cairo-Regular', 'normal');
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
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Lowcalories.ae', 10, 290);
      // =================================TEXT=================================
      doc.setFontSize(13);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('LOWCALORIE HOSPITALITY AND CATERING', 46, 28);
      doc.text('COMPANY SERVICES FOR L.L.C.', 46, 33);
      // =================================END-TEXT=================================
      doc.setFontSize(9);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('M38, Musaffah, Abu Dhabi - , United Arab Emirates', 46, 40);
      doc.text('TRN100346758400003', 46, 45);
      // =================================END-TEXT=================================
      doc.setFontSize(12);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TAX INVOICE', 160, 42);
      doc.setFontSize(8);
      doc.text('#LC-20230730-141830-78', 158, 45);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Invoice Date :', 15, 58);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text(sub?.created_date, 40, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Terms :', 15, 63);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text('Net 30', 40, 63);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Due Date :', 15, 68);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text(sub.delivery_starting_day, 40, 68);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Bill To :', 85, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
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
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TRN 100244837900003', 85, 73);

      // =================================TABLE=================================
      doc.setFontSize(10);
      // doc.setFont('Cairo-Regular', 'normal'); // Set font and style to bold
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
        styles:{
          font:'Cairo-Regular'
        }
        // columnStyles:{0: {textColor: [30, 212, 145],fillColor:[3, 146, 48]}},
        // headStyles :{lineWidth: 1,fillColor: [30, 212, 145],textColor: [232, 252, 245],}
      });
      doc.line(10, 105, 200, 105); // (x1, y1, x2, y2) Horizontal

      // =================================TABLE=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
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
        styles:{
          font:'Cairo-Regular'
        }
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
        styles:{
          font:'Cairo-Regular'
        }
      });
      doc.line(10, 155, 200, 155); // (x1, y1, x2, y2) Horizontal

      // =================================TABLE=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
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
        styles:{
          font:'Cairo-Regular'
        }
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
        styles:{
          font:'Cairo-Regular'
        }
      });
      doc.line(10, 203, 200, 203); // (x1, y1, x2, y2) Horizontal
      // =================================TABLE=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
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
          styles:{
            font:'Cairo-Regular'
          },
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
          styles:{
            font:'Cairo-Regular'
          },
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
      doc.addFileToVFS('Cairo-Regular-normal.ttf', this.getFontBase64());
      doc.addFont('Cairo-Regular-normal.ttf', 'Cairo-Regular', 'normal');
      doc.setFont('Cairo-Regular', 'normal');

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
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#9EA4A9'); // Set text color to black
      doc.text('Lowcalories.ae', 10, 290);
      // =================================TEXT=================================
      doc.setFontSize(13);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('LOWCALORIE HOSPITALITY AND CATERING', 46, 28);
      doc.text('COMPANY SERVICES FOR L.L.C.', 46, 33);
      // =================================END-TEXT=================================
      doc.setFontSize(9);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('M38, Musaffah, Abu Dhabi - , United Arab Emirates', 46, 40);
      doc.text('TRN100346758400003', 46, 45);
      // =================================END-TEXT=================================
      doc.setFontSize(12);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TAX INVOICE', 160, 42);
      doc.setFontSize(8);
      doc.text('#LC-20230730-141830-78', 158, 45);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Invoice Date :', 15, 58);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text(sub.created_date, 40, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Terms :', 15, 63);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text('Net 30', 40, 63);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Due Date :', 15, 68);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text(sub.delivery_starting_day, 40, 68);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Bill To :', 85, 58);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
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
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
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
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('#', 13, 80);
      doc.text('1', 13, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Item', 21, 80);
      doc.setFontSize(9);
      doc.text(sub.program_id == 60 ? 'Nutrition':'Subscription', 20, 90);
      doc.text('Fees', 20, 95);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Description', 48, 80);
      doc.setFontSize(9);
      doc.text(sub.program_id == 60 ? 'FAST MEASUREMENT':sub.subscriptions_note, 47, 90);
      // doc.text(`${sub.program_id == 60 ? 'FAST MEASUREMENT':'FOOD SOLD'}`, 47, 95);
      // doc.text(`${sub.program_id == 60 ? 'FOR THE PERIOD':'FOR THE PERIOD'}`, 47, 100);
      // doc.text(
      //   `${sub.delivery_starting_day} - ${this.calcSubscriptionEndDate(
      //     sub.delivery_starting_day,
      //     sub.days_of_week,
      //     sub.subscriptions_note,
      //     sub.version,
      //     sub.program_id
      //   )}`,
      //   47,
      //   105
      // );
      // doc.text('MINUS ORIGIN33', 47, 105);
      // doc.text('COMMISSION', 47, 110);
      // doc.text('FOR THE PERIOD', 47, 115);
      // doc.text('(43650.98 - 17363.44)', 47, 120);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Qty', 93, 80);
      doc.setFontSize(9);
      doc.text('1.00', 93, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Units', 108, 80);
      // doc.setFontSize(9);
      // doc.text('TOTAL COST OF FOOD', 108, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Rate', 123, 80);
      doc.setFontSize(9);
      doc.text(sub.total_price_without_vat.toFixed(2), 123, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax %', 145, 80);
      doc.setFontSize(9);
      doc.text('5.00', 145, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax', 160, 80);
      doc.setFontSize(9);
      doc.text(sub.vat_amount.toFixed(2), 160, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Amount', 178, 80);
      doc.setFontSize(9);
      doc.text(sub.total_price_without_vat.toFixed(2), 178, 90);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Notes : Thanks for your business.', 13, 128);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.text('Sub Total', 127, 128);
      doc.text(sub.total_after_discount.toFixed(2), 170, 128);
      doc.text('Standard Rate (5%)', 127, 134);
      doc.text(sub.vat_amount.toFixed(2), 170, 134);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.text('Total', 127, 140);
      doc.text(`AED ${sub.total_with_vat.toFixed(2)}`, 170, 140);
      doc.text('Balance Due', 127, 146);
      doc.text(`AED ${sub.total_with_vat.toFixed(2)}`, 170, 146);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax Summary', 13, 161);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('Tax Details', 13, 173);
      doc.setFontSize(9);
      doc.text('Taxable Amount (AED)', 127, 173);
      doc.text('Tax Amount (AED)', 165, 173);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('DISCOUNT', 13, 184);
      doc.text(sub.discount_amount.toFixed(2), 128, 184);
      doc.text(sub.discount_amount.toFixed(2), 165, 184);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('STANDARD RATE (5%)', 13, 194);
      doc.text(sub.vat_amount.toFixed(2), 128, 194);
      doc.text(sub.vat_amount.toFixed(2), 165, 194);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('REFUNDABLE SECURITY AMOUNT', 13, 204);
      doc.text(sub.refundable_security_amount.toFixed(), 128, 204);
      doc.text(sub.refundable_security_amount.toFixed(), 165, 204);
      // =================================END-TEXT=================================
      doc.setFontSize(10);
      // doc.setFont('helvetica', 'bold'); // Set font and style to bold
      doc.setTextColor('#1f1f1f'); // Set text color to black
      doc.text('TOTAL', 13, 214);
      doc.text(`AED ${sub.grand_total}`, 128, 214);
      doc.text(`AED ${sub.grand_total}`, 165, 214);
      // =================================END-TEXT=================================
      doc.setFontSize(9);
      // doc.setFont('helvetica', 'normal'); // Set font and style to bold
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

  // calcSubscriptionEndDate(
  //   startDate: string,
  //   weekDays: string,
  //   subscriptionNote: string,
  //   version: string,
  //   programId: number
  // ) {
  //   if (programId == 60) {
  //     return new Date(startDate).toLocaleDateString('en-CA')
  //   }
  //   let subscriptionDaysCount =  Number(subscriptionNote.split('-')[2]);
  //   const millisecondsPerDay = 24 * 60 * 60 * 1000;
  //   let currentDate = new Date(startDate);
  //   const weekdaysMapV1: any = {
  //     sun: 0,
  //     mon: 1,
  //     tue: 2,
  //     wed: 3,
  //     thu: 4,
  //     fri: 5,
  //     sat: 6,
  //   };

  //   const weekdaysMapV3: any = {
  //     sunday: 0,
  //     monday: 1,
  //     tuesday: 2,
  //     wednesday: 3,
  //     thursday: 4,
  //     friday: 5,
  //     saturday: 6,
  //   };

  //   const DAYS: Array<string> = weekDays.replace(/\[|\]|"/g, '').split(',');

  //   const weekdaysArray = DAYS.map((day) =>
  //     version == 'v1' ? weekdaysMapV1[day.toLowerCase()] : weekdaysMapV3[day.toLowerCase()]
  //   );


  //   while (weekdaysArray[0]&&subscriptionDaysCount > 0) {
  //     currentDate = new Date(currentDate.getTime() + millisecondsPerDay);
  //     if (weekdaysArray.includes(currentDate.getDay())) {
  //       subscriptionDaysCount--;
  //     }
  //   }
  //   return new Date(currentDate).toLocaleDateString('en-CA');
  // }


  getFontBase64():string{
    return `
    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AEUAeAB0AHIAYQBMAGkAZwBoAHQAIABTAGwAYQBuAHQAIABMAGUAZgB0AEUAeAB0AHIAYQBCAGwAYQBjAGsAIABTAGwAYQBuAHQAIABSAGkAZwBoAHQAQgBsAGEAYwBrACAAUwBsAGEAbgB0ACAAUgBpAGcAaAB0AEUAeAB0AHIAYQBCAG8AbABkACAAUwBsAGEAbgB0ACAAUgBpAGcAaAB0AEIAbwBsAGQAIABTAGwAYQBuAHQAIABSAGkAZwBoAHQAUwBlAG0AaQBCAG8AbABkACAAUwBsAGEAbgB0ACAAUgBpAGcAaAB0AE0AZQBkAGkAdQBtACAAUwBsAGEAbgB0ACAAUgBpAGcAaAB0AFMAbABhAG4AdAAgAFIAaQBnAGgAdABMAGkAZwBoAHQAIABTAGwAYQBuAHQAIABSAGkAZwBoAHQARQB4AHQAcgBhAEwAaQBnAGgAdAAgAFMAbABhAG4AdAAgAFIAaQBnAGgAdABFAHgAdAByAGEAQgBsAGEAYwBrAEIAbABhAGMAawBFAHgAdAByAGEAQgBvAGwAZABCAG8AbABkAFMAZQBtAGkAQgBvAGwAZABNAGUAZABpAHUAbQBMAGkAZwBoAHQARQB4AHQAcgBhAEwAaQBnAGgAdABTAGwAYQBuAHQAVwBlAGkAZwBoAHQAaAB0AHQAcAA6AC8ALwBzAGMAcgBpAHAAdABzAC4AcwBpAGwALgBvAHIAZwAvAE8ARgBMAFQAaABpAHMAIABGAG8AbgB0ACAAUwBvAGYAdAB3AGEAcgBlACAAaQBzACAAbABpAGMAZQBuAHMAZQBkACAAdQBuAGQAZQByACAAdABoAGUAIABTAEkATAAgAE8AcABlAG4AIABGAG8AbgB0ACAATABpAGMAZQBuAHMAZQAsACAAVgBlAHIAcwBpAG8AbgAgADEALgAxAC4AIABUAGgAaQBzACAAbABpAGMAZQBuAHMAZQAgAGkAcwAgAGEAdgBhAGkAbABhAGIAbABlACAAdwBpAHQAaAAgAGEAIABGAEEAUQAgAGEAdAA6ACAAaAB0AHQAcAA6AC8ALwBzAGMAcgBpAHAAdABzAC4AcwBpAGwALgBvAHIAZwAvAE8ARgBMAGgAdAB0AHAAcwA6AC8ALwBnAGEAYgBlAHIALgBkAGUAcwBpAGcAbgBNAG8AaABhAG0AZQBk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AuEC3gLgAqYCxwABAA4ADwAVABkAIwAkACkALAA2ADgAOgA/AEAARgBSAFQAVQBZAF8AZABvAHAAdQB2AHsCtwKtArgC6AKyAxUAgQCOAI8AlQCZAKMApACpAKwAtgC5ALsAwADBAMcA0wDVANYA2gDhAOYA9QD2APsA/AEBArUCzwK2AuYCjAKlAtQC1wLVAtgC0ALKAxMCywEFAr8C5wKvAswDHQLOAuQCgwKEAxYC8ALJAqgDHgKCAQYCwAJ1AnQCdgKnAAYAAgAEAAsABQAJAAwAEgAgABoAHQAeADIALQAvADAAFgBEAEsARwBJAFAASgLcAE4AaQBlAGcAaAB3AFMA4ACGAIIAhACLAIUAiQCMAJIAoACaAJ0AngCyAK4AsACxAJYAxQDMAMgAygDRAMsC3QDPAOsA5wDpAOoA/QDUAP8ABwCHAAMAgwAIAIgAEACQABMAkwAUAJQAEQCRABcAlwAYAJgAIQChABsAmwAfAJ8AIgCiABwAnAAmAKYAJQClACgAqAAnAKcAKwCrACoAqgA1ALUAMwCzAC4ArwA0ALQAMQCtADcAuAA5ALoAOwC8AD0AvgA8AL0APgC/AEEAwgBDAMQAQgDDAEUAxgBNAM4ASADJAEwAzQBRANIAVgDXAFgA2QBXANgAWgDbAF0A3gBcAN0AWwDcAGIA5ABhAOMAYADiAG4A9ABrAO0AZgDoAG0A8wBqAOwAbADyAHIA+AB4AP4AeQB8AQIAfgEEAH0BAwAKAIoADQCNAE8A0ABeAN8AYwDlAywDKwMaAxQDGwMfAxwDFwKYApwBCAEPAQsBswENAbsBCQEZAa0BIwEnAS8BNwE7AT8BQQFFAUcBTQFRAVUBWQFdAWEBZQFpAccBbQF7AYEBjQGRAZUBnQGxAbUBtwMCAwMDBAMFAwYDBwMIAxADEQL5AvoC+ALGAj0CPgKbARMBeQL3AREBoQGlAa8BwwHFApcAdAD6AHEA9wBzAPkAegEAAIAA8QK9Ar4CuQK7ArwCugLRAtICqQLuAtsC4wLiAR4BIAEfASwBLgEtAXIBdAFzATQBNgE1AYYBiAGHAYoBjAGLAaIBpAGjAaoBrAGrAcYCjQKOApECkgKVApYCkwKUASIBIQHAAcIBwQHXAiACNwI4AjkB0QHSAdMB1AHVAeAB4QHiAeMB5AHmAecB2AIhAe4B8AIAAgICDgIQAhoCHAH6AewCBgIUAe8B8QIBAgMCDwIRAhsCHQH7Ae0CBwIVAbwBvgG9ARoBHAEbASQBJgElASgBKgEpATABMgExATgBOgE5ATwBPgE9AU4BUAFPAVIBVAFTAVYBWAFXAVoBXAFbAV4BYAFfAWIBZAFjAWYBaAFnAWoBbAFrAW4BcAFvAXwBfgF9AYIBhAGDAY4BkAGPAZIBlAGTAZYBmAGXAZ4BoAGfAbgBugG5Ac4BzwHKAcsBzAHNAcgByQDrABUCVAAXAlQAFwJUABcCVAAXAlQAFwJUABcCVAAXAlQAFwJUABcCVAAXAlQAFwNsABMDbAATAmcAVAIgADoCIAA6AiAAOgIgADoCIAA6AiAAOgKEAFQChwAUAoQAVAKHABQCKQBUAikAVAIpAFQCKQBUAikAVAIpAFQCKQBUAikAVAIpAFQCKQBUAg4AVAJoADgCaAA4AmgAOAJoADgCaAA4AqMAVAKuAA8CowBUAPgAVAD4AA0A+P/mAPj/0AD4//AA+ABUAPj/7AD4/+IA+AAPAPj/zQEhABIBIQAAAjoAVAI5AFQB3gBUAd8AVAHvAFQB3gBUAeP/+wNJAFQCpQBUAqUAVAKlAFQCpQBUAqUAVAKmAFQClAA4ApQAOAKUADgClAA4ApQAOAKUADgClAA4ApQAOAKUADgClgA4ApQAOAOcADUCUABUAlcAVAKUADgCaABUAmgAVAJoAFQCaABUAh4AMAIeADACHgAwAh4AMAIeADACHgAwAg4ADQIRAA8CDgANAg4ADQIOAA0ChQBPAoUATwKFAE8ChQBPAoUATwKFAE8ChQBPAoUATwKFAE8ChQBPAoUATwJHABgDeAAeA3gAHgN4AB4DeAAeA3gAHgIvABICGwAKAhsACgIbAAoCGwAKAhsACgIYACsCGAArAhgAKwIYACsCUgAXAhMABwH2ACgB9gAoAfYAKAH2ACgB9gAoAfYAKAH2ACgB9gAoAfYAKAH2ACgB9gAoAyMAKAMjACgCDwBHAbQAMwG0ADMBtAAzAbQAMwG0ADMBtAAzAhIAMQIlACoCQwAxAhIAMQH5ADEB+QAxAfkAMQH5ADEB+QAxAfkAMQH5ADEB+QAxAfkAMQH5ADEBTAAeAgMAMQIDADECAwAxAgMAMQIDADECGgBIAhoACgIaAEgA3QBIAN0ASADdACYA3f/aAN3/1gDd//cA3f/EAN3/5ADdAAQA3f/SAN3/0ADd/9AA3f/QAeEASAHhAEgA6QBOAOkAMwEUAE4A6QAhAToACQNEAEgCGgBIAhoASAIaAEgCGgBIAhoASAIaAEcCEQAyAhEAMgIRADICEQAyAhEAMgIRADICEQAyAhEAMgIRADICEQAyAhEAMgNYADICEABIAhAASAIPADEBWwBIAVsAQgFbABkBWwAfAdIALQHSAC0B0gAtAdIALQHSAC0B0gAtAkAASAFfABoBYwAaAbMAGgFfABoBXwAaAhQAQwIUAEMCFABDAhQAQwIUAEMCFABDAhQAQwIUAEMB9gAoAfoAMQIRADIB5AAZAhQAQwIUAEMCFABDAeIAGAL7AB8C+wAfAvsAHwL7AB8C+wAfAcUAFgHkABkB5AAZAeQAGQHkABkB5AAZAccAKgHHACoBxwAqAccAKgGEADUBfgA1AjAAFgIgACgBDQBgAScAYAENACQBJwAkAQ0AJAEnACQBDQALAScACwENABABJwAQAxYAKAMxACgBJv/sASb/7AEL/+wBC//sAxYAKAMxACgBJv/sAQv/7AMWACgDMQAoASb/7AEL/+wBJv/sAQv/7AMWACgDMQAoASb/7AEL/+wDFgAoAzEAKAEm/+wBC//sAxYAKAMxACgBJv/sAQv/7AJEACgCdAAoAlv/7AIr/+wCRAAoAnQAKAJb/+wCK//sAkQAKAJ0ACgCW//sAiv/7AJEACgCdAAoAlv/7AIr/+wB4wAoAhcAKAHjACgCFwAoAeMAKAIXACgBB//RASz/0QEH/9EBLP/RAQf/0QEs/9EBB//RASz/0QS7ACgE3wAoA1z/7AM7/+wEuwAoBN8AKANc/+wDO//sBKcAKATIACgDVf/sAzT/7ASnACgEyAAoA1X/7AM0/+wC/AAUAx0AFALt/+wC5//sAvwAFAMdABQC7f/sAuf/7AIoACgCdwAoAnz/7AJQ/+wCKAAoAncAKAJ8/+wCUP/sBAkANgQfADYCf//sAl//7AQJADYEHwA2An//7AJf/+wECQA2BB8ANgJ//+wCX//sA18AKAN/ACgDXwAoA38AKAJ//+wCX//sAxAAKAMxACgDEAAoAzEAKAKS/+wCcf/sAxAAKAMxACgCkv/sAnH/7AMQACgDMQAoAsT/7AKj/+wCmgAoArsAKAEz/+wBE//sAnIAKAKTACgCo//sAoL/7AKaACgCuwAoASb/7AEL/+wCmgAoASb/7AEL/+wCuwAoAkgAKAJCACgClP/sAxz/7AJIACgCQgAoAkL/7AEL/+wCSAAoAkIAKAJC/+wBC//sAxMAKAMzACgDM//sAxz/7AJIACgCQgAoAkgAKAJCACgCIQAoAkIAKAIhACgCQgAoA4AAKAN0ACgDgAAoA3QAKAEm/+wBC//sA4AACgN0AAoBJv/sAQv/7AOAACgDdAAoASb/7AEL/+wC1wAoAsIAKALXACUCwgAlAPr/7AKEACgCnwAoAoQAKAKfACgChAAoAp8AKAKEACgCnwAoAoQAKAJS/9ECUv/RA+EAKARXACgEVwAoBFcACgP8ACgEHAAoAp8AKAJS/9ECUv/RA+EAKARXACgEVwAoBFcACgJS/9ECUv/RA+EAKARXACgEVwAoBFcACgJS/9ECUv/RA+EAKARXACgEVwAoBFcACgRW/9EEd//RBk4AKAZvACgGTgAoBm8AKARW/9EEd//RBeUAKAYFACgF5QAoBgUAKAZOAAoGbwAKBFb/0QR3/9EEVv/RBHf/0QXlACgGBQAoBk4AKAZvACgGTgAoBm8AKAZOAAoGbwAKBD7/0QRf/9EEPv/RBF//0QXNACgF7gAoBc0AKAXuACgGNgAoBlcAKAY2ACgGVwAoBjYACgZXAAoEPv/RBF//0QQ+/9EEX//RBc0AKAXuACgGNgAoBlcAKAY2ACgGVwAoBjYACgZXAAoD/AAoBBwAKAP8AAoEHAAKAlL/0QJS/9ED4QAoBFcAKARXACgEVwAKAlL/0QJS/9ECUv/RA+EAKAPhACgEVwAoBFcAKAJS/9ECUv/RA+EAKARXACgCUv/RAlL/0QPhACgEVwAoBFcAKARXAAoFLAAoBSsAKADhACIAwQAiAPoAUAE1AHQCDwB0AqQAbwHUADICpgBHAeIAHgJwACQCcAAkAgcAFAD6AFABNQB0Ag8AdAKkAG8CmAB0AiIARgHeAEICcAAkAnAAJAIHABQCMQBkAasAGgIwACYCMABpAjAARQIwAD4CMAAoAjAAPwIwADECMABNAjAAHwIwACkBGAAVARgAHgEYAB4BGAAeARgAGAEYACYBGAAcARgAHQEYABYBGAAZARgAFQEYAB4BGAAeARgAHgEYABgBGAAmARgAHAEYAB0BGAAW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AAIBRgIYAAIBlgIaAAIBtgAGACwAJgAgABoAFAAOAhcAAgFIAh8AAgG8Ah0AAgG4AhUAAgFGAhkAAgGWAhsAAgG2AAcANAAuACgAIgAcABYAEAIIAAIBSAISAAIBvAIQAAIBuAIGAAIBRgIMAAIBnAIKAAIBlgIOAAIBtgAHADQALgAoACIAHAAWABACCQACAUgCEwACAbwCEQACAbgCBwACAUYCDQACAZwCCwACAZYCDwACAbYABgAsACYAIAAaABQADgH8AAIBSAIEAAIBvAICAAIBuAH6AAIBRgH+AAIBlgIAAAIBtgAGACwAJgAgABoAFAAOAf0AAgFIAgUAAgG8AgMAAgG4AfsAAgFGAf8AAgGWAgEAAgG2AAcANAAuACgAIgAcABYAEAHyAAIBSAH4AAIBvAHwAAIBuAHsAAIBRgH2AAIBnAH0AAIBlgHuAAIBtgAHADQALgAoACIAHAAWABAB8wACAUgB+QACAbwB8QACAbgB7QACAUYB9wACAZwB9QACAZYB7wACAbYABgAsACYAIAAaABQADgHnAAIBSAHrAAIBvAHqAAIBuAHmAAIBRgHoAAIBlgHpAAIBtgAGACwAJgAgABoAFAAOAeEAAgFIAeUAAgG8AeQAAgG4AeAAAgFGAeIAAgGWAeMAAgG2AAQAHAAWABAACgIsAAIBSAIqAAIBRgItAAIBlgIvAAIBtgAGACwAJgAgABoAFAAOAdsAAgFIAd8AAgG8Ad4AAgG4AdoAAgFGAdwAAgGWAd0AAgG2AAYALAAmACAAGgAUAA4B0gACAUgB1gACAbwB1QACAbgB0QACAUYB0wACAZYB1AACAbYAAQAEAjsABAGQAY8BngABABMBCQEbAR8BIQElASkBTwFQAVMBVAFXAVgBWwFcAY8BkAGXAbkBvQABAAAAAQAIAAIAugBaAQoBDAEOARABEgEUARoBHgEkASgBLAEwATQBOAE8AUABQgFEAUYBSAFKAUwBTgFSAVYBWgFeAWIBZgFqAW4BcgF2AXoBfAGCAYYBigGOAZIBlgGcAZ4BogGmAaoBrgGwAbIBtAG2AbgBvAHAAcQBxgHJAcsBzQHPAdkB2AHtAe8B8QHzAfUB9wH5AfsB/QH/AgECAwIFAgcCCQILAg0CDwIRAhMCFQIXAhkCGwIdAh8CIQIjAAEAWgEJAQsBDQEPAREBEwEZ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AkUCVAJfAmACYQJiAmMCZAJlAmYCZwJoAnMAAQBLAAEARgBcAGIAgQDHAN0A5AEJAQsBDQEPAREBPwFBAUMBRQFHAUkBSwF5Aa0BrwGxAbMBwwHFAcgBygHMAc4B0AHXAewB7gHwAfIB9AH2AfgB+gH8Af4CAAICAgQCBgIIAgoCDAIOAhACEgIUAhYCGAIaAhwCHgIgAiICTQJPAlACaQJqAmsCbAJtAm4CbwJwAnECcgKsAAIAAAAAAAD/nAAyAAAAAAAAAAAAAAAAAAAAAAAAAAADNgAAACQAyQECAMcAYgCtAQMBBABjAQUArgCQAQYAJQAmAP0A/wBkAQcBCAAnAOkBCQEKACgAZQELAQwAyADKAQ0AywEOAQ8AKQAqAPgBEAERARIAKwETARQALADMARUAzQDOAPoAzwEWARcBGAAtARkALgEaAC8BGwEcAR0A4gAwADEBHgEfASAAZgEhADIA0AEiANEAZwDTASMBJACRASUArwCwADMA7QA0ADUBJgEnASgANgEpAOQA+wEqASsANwEsAS0BLgEvADgA1AEwANUAaADWATEBMgEzATQBNQA5ADoBNgE3ATgBOQA7ADwA6wE6ALsBOwA9ATwA5gE9AT4BPwBEAGkBQABrAGwAagFBAUIAbgFDAG0AoAFEAEUARgD+AQAAbwFFAUYARwDqAUcBAQBIAHABSAFJAHIAcwFKAHEBSwFMAEkASgD5AU0BTgFPAEsBUAFRAEwA1wB0AVIAdgB3AHUBUwFUAVUATQFWAVcATgFYAE8BWQFaAVsA4wBQAFEBXAFdAV4AeAFfAFIAeQFgAHsAfAB6AWEBYgChAWMAfQCxAFMA7gBUAFUBZAFlAWYAVgFnAOUA/AFoAWkAiQBXAWoBawFsAW0AWAB+AW4AgACBAH8BbwFwAXEBcgFzAXQBdQF2AXcAWQBaAXgBeQF6AXsAWwBcAOwBfAC6AX0AXQF+AOcBfwCdAJ4AmwGAAYEBggGDAYQBhQGGAYcBiAGJAYoBiwGMAY0BjgGPAZABkQGSAZMBlAGVAZYBlwGYAZkBmgGbAZwBnQGeAZ8BoAGhAaIBowGkAaUBpgGnAagBqQGqAasBrAGtAa4BrwGwAbEBsgGzAbQBtQG2AbcBuAG5AboBuwG8Ab0BvgG/AcABwQHCAcMBxAHFAcYBxwHIAckBygHLAcwBzQHOAc8B0AHRAdIB0wHUAdUB1gHXAdgB2QHaAdsB3AHdAd4B3wHgAeEB4gHjAeQB5QHmAecB6AHpAeoB6wHsAe0B7gHvAfAB8QHyAfMB9AH1AfYB9wH4AfkB+gH7AfwB/QH+Af8CAAIBAgICAwIEAgUCBgIHAggCCQIKAgsCDAINAg4CDwIQAhECEgITAhQCFQIWAhcCGAIZAhoCGwIcAh0CHgIfAiACIQIiAiMCJAIlAiYCJwIoAikCKgIrAiwCLQIuAi8CMAIxAjICMwI0AjUCNgI3AjgCOQI6AjsCPAI9Aj4CPwJAAkECQgJDAkQCRQJGAkcCSAJJAkoCSwJMAk0CTgJPAlACUQJSAlMCVAJVAlYCVwJYAlkCWgJbAlwCXQJeAl8CYAJhAmICYwJkAmUCZgJnAmgCaQJqAmsCbAJtAm4CbwJwAnECcgJzAnQCdQJ2AncCeAJ5AnoCewJ8An0CfgJ/AoACgQKCAoMChAKFAoYChwKIAokCigKLAowCjQKOAo8CkAKRApICkwKUApUClgKXApgCmQKaApsCnAKdAp4CnwKgAqECogKjAqQCpQKmAqcCqAKpAqoCqwKsAq0CrgKvArACsQKyArMCtAK1ArYCtwK4ArkCugK7ArwCvQK+Ar8CwALBAsICwwLEAsUCxgLHAsgCyQLKAssCzAATABQAFQAWABcAGAAZABoAGwAcAs0CzgLPAtAC0QLSAtMC1ALVAtYC1wLYAtkC2gLbAtwC3QLeAt8C4AC8APQA9QD2AuEC4gLjAuQC5QLmAucC6ALpAuoC6wLsAu0C7gLvAvAC8QLyAvMC9AADAvUC9gL3AvgC+QL6AvsC/AL9Av4C/wMAAwEDAgMDAwQDBQMGAwcAEQAPAB0AHgCrAAQAowAiAKIAwwCHAA0ABgASAD8AEAMIALIAswBCAAsADABeAGAAPgBAAMQAxQC0ALUAtgC3AKkAqgC+AL8ABQAKAKYDCQAjAAkAiACGAIsAigCMAIMAXwDoAIIAwgMKAIQAvQAHAIUAlgMLAA4A7wDwALgAIACPACEAHwCVAJQAkwCnAGEApABBAJIAnAMMAw0AmgCZAKUDDgCYAAgAxgC5Aw8DEAMRAxIDEwMUAxUDFgMXAxgDGQMaAxsDHAMdAx4DHwMgAyEDIgMjAyQDJQMmAycDKAMpAyoDKwMsAI4A3ABDAI0A3wDYAOEA2wDdANkA2gDeAOADLQMuAy8DMAMxAzIDMwM0AzUDNgM3AzgDOQM6AzsDPAM9Az4DPwNAA0EDQgZBYnJldmUHQW1hY3JvbgdBb2dvbmVrCkFyaW5nYWN1dGUHQUVhY3V0ZQtDY2lyY3VtZmxleApDZG90YWNjZW50BkRjYXJvbgZEY3JvYXQGRWJyZXZlBkVjYXJvbgpFZG90YWNjZW50B0VtYWNyb24HRW9nb25lawtHY2lyY3VtZmxleAd1bmkwMTIyCkdkb3RhY2NlbnQESGJhcgtIY2lyY3VtZmxleAZJYnJldmUHSW1hY3JvbgdJb2dvbmVrBkl0aWxkZQtKY2lyY3VtZmxleAd1bmkwMTM2BkxhY3V0ZQZMY2Fyb24HdW5pMDEzQgZOYWN1dGUGTmNhcm9uB3VuaTAxNDUDRW5nBk9icmV2ZQ1PaHVuZ2FydW1sYXV0B09tYWNyb24LT3NsYXNoYWN1dGUGUmFjdXRlBlJjYXJvbgd1bmkwMTU2BlNhY3V0ZQtTY2lyY3VtZmxleAd1bmkwMjE4BFRiYXIGVGNhcm9uB3VuaTAxNjIHdW5pMDIxQQZVYnJldmUNVWh1bmdhcnVtbGF1dAdVbWFjcm9uB1VvZ29uZWsFVXJpbmcGVXRpbGRlBldhY3V0ZQtXY2lyY3VtZmxleAlXZGllcmVzaXMGV2dyYXZlC1ljaXJjdW1mbGV4BllncmF2ZQZaYWN1dGUKWmRvdGFjY2VudAd1bmkxRUIwB3VuaTFFRjgGYWJyZXZlB2FtYWNyb24HYW9nb25lawphcmluZ2FjdXRlB2FlYWN1dGULY2NpcmN1bWZsZXgKY2RvdGFjY2VudAZkY2Fyb24GZWJyZXZlBmVjYXJvbgplZG90YWNjZW50B2VtYWNyb24HZW9nb25lawtnY2lyY3VtZmxleAd1bmkwMTIzCmdkb3RhY2NlbnQEaGJhcgtoY2lyY3VtZmxleAZpYnJldmUHaW1hY3Jvbgdpb2dvbmVrBml0aWxkZQd1bmkwMjM3C2pjaXJjdW1mbGV4B3VuaTAxMzcGbGFjdXRlBmxjYXJvbgd1bmkwMTNDBm5hY3V0ZQZuY2Fyb24HdW5pMDE0NgNlbmcGb2JyZXZlDW9odW5nYXJ1bWxhdXQHb21hY3Jvbgtvc2xhc2hhY3V0ZQZyYWN1dGUGcmNhcm9uB3VuaTAxNTcGc2FjdXRlC3NjaXJjdW1mbGV4B3VuaTAyMTkEdGJhcgZ0Y2Fyb24HdW5pMDE2Mwd1bmkwMjFCBnVicmV2ZQ11aHVuZ2FydW1sYXV0B3VtYWNyb24HdW5pMUVBQgd1bmkxRUM1B3VuaTFFRDcHdW5pMUVGOQd1b2dvbmVrBXVyaW5nBnV0aWxkZQZ3YWN1dGULd2NpcmN1bWZsZXgJd2RpZXJlc2lzBndncmF2ZQt5Y2lyY3VtZmxleAZ5Z3JhdmUGemFjdXRlCnpkb3RhY2NlbnQHdW5pMDYyMQd1bmkwNjI3B3VuaUZFOEUHdW5pMDYyMwd1bmlGRTg0B3VuaTA2MjUHdW5pRkU4OAd1bmkwNjIyB3VuaUZFODIHdW5pMDY3MQd1bmlGQjUxB3VuaTA2NkUMdW5pMDY2RS5maW5hDHVuaTA2NkUubWVkaRB1bmkwNjZFLm1lZGkuYWx0DHVuaTA2NkUuaW5pdBB1bmkwNjZFLmluaXQuYWx0B3VuaTA2MjgHdW5pRkU5MAd1bmlGRTkyB3VuaUZFOTEHdW5pMDY3RQd1bmlGQjU3B3VuaUZCNTkHdW5pRkI1OAd1bmlGQkU5B3VuaUZCRTgHdW5pMDYyQQd1bmlGRTk2B3VuaUZFOTgHdW5pRkU5Nwd1bmkwNjJCB3VuaUZFOUEHdW5pRkU5Qwd1bmlGRTlCB3VuaTA2NzkHdW5pRkI2Nwd1bmlGQjY5B3VuaUZCNjgHdW5pMDYyQwd1bmlGRTlFB3VuaUZFQTAHdW5pRkU5Rgd1bmkwNjg2B3VuaUZCN0IHdW5pRkI3RAd1bmlGQjdDB3VuaTA2MkQHdW5pRkVBMgd1bmlGRUE0B3VuaUZFQTMHdW5pMDYyRQd1bmlGRUE2B3VuaUZFQTgHdW5pRkVBNwd1bmkwNjJGB3VuaUZFQUEHdW5pMDYzMAd1bmlGRUFDB3VuaTA2ODgHdW5pRkI4OQd1bmkwNjMxB3VuaUZFQUUHdW5pMDYzMgd1bmlGRUIwB3VuaTA2OTEHdW5pRkI4RAd1bmkwNjk4B3VuaUZCOEIHdW5pMDYzMwd1bmlGRUIyB3VuaUZFQjQHdW5pRkVCMwd1bmkwNjM0B3VuaUZFQjYHdW5pRkVCOAd1bmlGRUI3B3VuaTA2MzUHdW5pRkVCQQd1bmlGRUJDB3VuaUZFQkIHdW5pMDYzNgd1bmlGRUJFB3VuaUZFQzAHdW5pRkVCRgd1bmkwNjM3B3VuaUZFQzIHdW5pRkVDNAd1bmlGRUMzB3VuaTA2MzgHdW5pRkVDNgd1bmlGRUM4B3VuaUZFQzcHdW5pMDYzOQd1bmlGRUNBB3VuaUZFQ0MHdW5pRkVDQgd1bmkwNjNBB3VuaUZFQ0UHdW5pRkVEMAd1bmlGRUNGB3VuaTA2NDEHdW5pRkVEMgd1bmlGRUQ0B3VuaUZFRDMHdW5pMDZBNAd1bmlGQjZCB3VuaUZCNkQHdW5pRkI2Qwd1bmkwNkExDHVuaTA2QTEuZmluYQx1bmkwNkExLm1lZGkMdW5pMDZBMS5pbml0B3VuaTA2NkYMdW5pMDY2Ri5maW5hB3VuaTA2NDIHdW5pRkVENgd1bmlGRUQ4B3VuaUZFRDcMa2FmRG90bGVzc2FyEWthZkRvdGxlc3Nhci5maW5hB3VuaTA2NDMHdW5pRkVEQQd1bmlGRURDB3VuaUZFREIHdW5pMDZBOQd1bmlGQjhGB3VuaUZCOTEHdW5pRkI5MAd1bmkwNkFGB3VuaUZCOTMHdW5pRkI5NQd1bmlGQjk0B3VuaTA2NDQHdW5pRkVERQd1bmlGRUUwB3VuaUZFREYHdW5pMDY0NQd1bmlGRUUyB3VuaUZFRTQHdW5pRkVFMwd1bmkwNjQ2B3VuaUZFRTYHdW5pRkVFOAd1bmlGRUU3B3VuaTA2QkEMdW5pMDZCQS5tZWRpDHVuaTA2QkEuaW5pdAd1bmlGQjlGB3VuaTA2NDcHdW5pRkVFQQd1bmlGRUVDB3VuaUZFRUIHdW5pMDZDMQd1bmlGQkE3B3VuaUZCQTkHdW5pRkJBOAd1bmkwNkMyDHVuaTA2QzIuZmluYQx1bmkwNkMyLm1lZGkMdW5pMDZDMi5pbml0B3VuaTA2QkUHdW5pRkJBQgd1bmlGQkFEB3VuaUZCQUMHdW5pMDYyOQd1bmlGRTk0B3VuaTA2QzMMdW5pMDZDMy5maW5hB3VuaTA2NDgHdW5pRkVFRQd1bmkwNjI0B3VuaUZFODYHdW5pMDY0OQd1bmlGRUYwB3VuaTA2NEEHdW5pRkVGMgd1bmlGRUY0B3VuaUZFRjMHdW5pMDYyNgd1bmlGRThBB3VuaUZFOEMHdW5pRkU4Qgd1bmkwNkNDB3VuaUZCRkQHdW5pRkJGRgd1bmlGQkZFB3VuaTA2RDIHdW5pRkJBRgd1bmkwNkQzB3VuaUZCQjEHdW5pMDY0MAd1bmlGRUZCB3VuaUZFRkMHdW5pRkVGNwd1bmlGRUY4B3VuaUZFRjkHdW5pRkVGQQd1bmlGRUY1B3VuaUZFRjYPbGFtX2FsZWZXYXNsYWFyB3VuaUZDNkEHdW5pRkM2Qgd1bmlGQzZEB3VuaUZDNkUHdW5pRkM2RhhiZWhfeWVoSGFtemFhYm92ZWFyLmZpbmEHdW5pRkM0Mwd1bmlGQzg2FGxhbV9hbGVmV2FzbGFhci5maW5hDnBlaF9yZWhhci5maW5hD3BlaF96YWluYXIuZmluYQ9wZWhfbm9vbmFyLmZpbmEWcGVoX2FsZWZNYWtzdXJhYXIuZmluYQ5wZWhfeWVoYXIuZmluYRhwZWhfeWVoSGFtemFhYm92ZWFyLmZpbmEHdW5pRkM3MAd1bmlGQzcxB3VuaUZDNzMHdW5pRkM3NAd1bmlGQzc1GHRlaF95ZWhIYW16YWFib3ZlYXIuZmluYQd1bmlGQzc2B3VuaUZDNzcHdW5pRkM3OQd1bmlGQzdBB3VuaUZDN0IZdGhlaF95ZWhIYW16YWFib3ZlYXIuZmluYQd1bmlGRDBFB3VuaUZEMkEHdW5pRkNGQgd1bmlGRDE3B3VuaUZDRkMHdW5pRkQxOAtzZWVuX3phaW5hchBzZWVuX3phaW5hci5maW5hC3NlZW5fbm9vbmFyEHNlZW5fbm9vbmFyLmZpbmERc2Vlbl9ub29uZ2h1bm5hYXIWc2Vlbl9ub29uZ2h1bm5hYXIuZmluYRRzZWVuX3llaEhhbXphYWJvdmVhchlzZWVuX3llaEhhbXphYWJvdmVhci5maW5hB3VuaUZEMEQHdW5pRkQyOQxzaGVlbl96YWluYXIRc2hlZW5femFpbmFyLmZpbmEMc2hlZW5fbm9vbmFyEXNoZWVuX25vb25hci5maW5hB3VuaUZDRkQHdW5pRkQxOQd1bmlGQ0ZFB3VuaUZEMUEVc2hlZW5feWVoSGFtemFhYm92ZWFyGnNoZWVuX3llaEhhbXphYWJvdmVhci5maW5hB3VuaUZEMEYHdW5pRkQyQgpzYWRfemFpbmFyD3NhZF96YWluYXIuZmluYQpzYWRfbm9vbmFyD3NhZF9ub29uYXIuZmluYRBzYWRfbm9vbmdodW5uYWFyFXNhZF9ub29uZ2h1bm5hYXIuZmluYQd1bmlGRDA1B3VuaUZEMjEHdW5pRkQwNgd1bmlGRDIyE3NhZF95ZWhIYW16YWFib3ZlYXIYc2FkX3llaEhhbXphYWJvdmVhci5maW5hB3VuaUZEMTAHdW5pRkQyQwpkYWRfemFpbmFyD2RhZF96YWluYXIuZmluYQpkYWRfbm9vbmFyD2RhZF9ub29uYXIuZmluYQd1bmlGRDA3B3VuaUZEMjMHdW5pRkQwOAd1bmlGRDI0E2RhZF95ZWhIYW16YWFib3ZlYXIYZGFkX3llaEhhbXphYWJvdmVhci5maW5hB3VuaUZDNDQHdW5pRkM4NxNsYW1feWVoSGFtemFhYm92ZWFyGGxhbV95ZWhIYW16YWFib3ZlYXIuZmluYQd1bmlGQzhBB3VuaUZDOEIHdW5pRkM4RAd1bmlGQzhFB3VuaUZDOEYZbm9vbl95ZWhIYW16YWFib3ZlYXIuZmluYRZhbGVmTWFrc3VyYV9yZWhhci5maW5hGmFsZWZNYWtzdXJhX3JlaGFyLmZpbmEuYWx0F2FsZWZNYWtzdXJhX3phaW5hci5maW5hF2FsZWZNYWtzdXJhX25vb25hci5maW5hG2FsZWZNYWtzdXJhX25vb25hci5maW5hLmFsdB5hbGVmTWFrc3VyYV9hbGVmTWFrc3VyYWFyLmZpbmEiYWxlZk1ha3N1cmFfYWxlZk1ha3N1cmFhci5maW5hLmFsdAd1bmlGQzkxB3VuaUZDOTIHdW5pRkM5NAd1bmlGQzk2B3VuaUZDNjQHdW5pRkM2NQd1bmlGQzY3B3VuaUZDNjgHdW5pRkM2OSJ5ZWhIYW16YWFib3ZlX3llaEhhbXphYWJvdmVhci5maW5hB3VuaUZERjIQdW5pRkRGMi50YXNoa2VlbAd1bmkwNjZCB3VuaTA2NkMHdW5pMDY2MAd1bmkwNjYxB3VuaTA2NjIHdW5pMDY2Mwd1bmkwNjY0B3VuaTA2NjUHdW5pMDY2Ngd1bmkwNjY3B3VuaTA2NjgHdW5pMDY2OQd1bmkwNkYwB3VuaTA2RjEHdW5pMDZGMgd1bmkwNkYzB3VuaTA2RjQHdW5pMDZGNQd1bmkwNkY2B3VuaTA2RjcHdW5pMDZGOAd1bmkwNkY5DHVuaTA2RjQudXJkdQx1bmkwNkY3LnVyZHUJemVyby5kbm9tCG9uZS5kbm9tCHR3by5kbm9tCnRocmVlLmRub20JZm91ci5kbm9tCWZpdmUuZG5vbQhzaXguZG5vbQpzZXZlbi5kbm9tCmVpZ2h0LmRub20JbmluZS5kbm9tCXplcm8ubnVtcghvbmUubnVtcgh0d28ubnVtcgp0aHJlZS5udW1yCWZvdXIubnVtcglmaXZlLm51bXIIc2l4Lm51bXIKc2V2ZW4ubnVtcgplaWdodC5udW1yCW5pbmUubnVtcgd1bmkyMDgwB3VuaTIwODEHdW5pMjA4Mgd1bmkyMDgzB3VuaTIwODQHdW5pMjA4NQd1bmkyMDg2B3VuaTIwODcHdW5pMjA4OAd1bmkyMDg5B3VuaTIwNzAHdW5pMDBCOQd1bmkwMEIyB3VuaTAwQjMHdW5pMjA3NAd1bmkyMDc1B3VuaTIwNzYHdW5pMjA3Nwd1bmkyMDc4B3VuaTIwNzkHdW5pMDBBMApkb3RhYm92ZWFyCmRvdGJlbG93YXIWdHdvZG90c3ZlcnRpY2FsYWJvdmVhchZ0d29kb3RzdmVydGljYWxiZWxvd2FyGHR3b2RvdHNob3Jpem9udGFsYWJvdmVhchh0d29kb3RzaG9yaXpvbnRhbGJlbG93YXIUdGhyZWVkb3RzZG93bmFib3ZlYXIUdGhyZWVkb3RzZG93bmJlbG93YXISdGhyZWVkb3RzdXBhYm92ZWFyEnRocmVlZG90c3VwYmVsb3dhcgd1bmkwNkQ0B3VuaTA2MEMHdW5pMDYxQgd1bmkwNjFGB3VuaTA2NkQHdW5pMDYwRAd1bmlGRDNFB3VuaUZEM0YHdW5pMDBBRAd1bmkwNjZBBEV1cm8HdW5pMjIxNQd1bmkwM0E5B3VuaTAzOTQHdW5pMDNCQwd1bmkwNjE1B3dhc2xhYXIHdW5pMDY3MAd1bmkwNjU2B3VuaTA2NTQHdW5pMDY1NQt1bmkwNjU0MDY0Rgt1bmkwNjU0MDY0Qwt1bmkwNjU0MDY0RQt1bmkwNjU0MDY0Qgt1bmkwNjU0MDY1Mgt1bmkwNjU1MDY1MAt1bmkwNjU1MDY0RAd1bmkwNjRCB3VuaTA2NEMHdW5pMDY0RAd1bmkwNjRFB3VuaTA2NEYHdW5pMDY1MAd1bmkwNjUxDXVuaTA2NTEwNjRC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BeYFzgXaBcgF2gXIBeYFwgXmBcIF2gW8BdoFtgXaBdQF2gXUBbAF4AWwBeAFqgXUBaoF1AWkBeAFpAXgBZ4F1AWeBdQFmAXgBZgF4AWSBdQFkgXUBYwFhgWMBYYFgAV6BYAFegWMBYYFjAWGBYAFdAWABXQFjAWGBYwFhgWABW4FgAVuBWgFhgVoBYYFYgVuBWIFbgVcBVYFXAVWBVAFVgVQBVYFSgVWBUoFVgVEBT4FRAU+BTgFPgU4BT4FMgU+BTIFPgUsBT4FLAU+BSYFIAUmBSAFGgUUBRoFFAUOBSAFDgUgBQgFFAUIBRQFAgUgBQIFIAT8BPYE/AT2BPAFIATwBSAE6gT2BOoE9gTkBN4E5ATeBNgE0gTYBNIEzATeBMwE3gTGBNIExgTSBMAEugS0BK4EqASiBJwElgSQBLoEigSuBIQEogR+BJYEeARyBHgEcgRsBGYEbARmBGAEcgRgBHIEWgRmBFoEZgRUBHIEVARyBE4EZgROBGYESARCBEgEQgQ8BEIEPARCBDYEZgQ2BGYEMAXgBDAF4AQqBCQEKgQkBB4EGAQeBBgEKgQkBCoEJAQSBBgEDAQYBAYEAAQGBAAD+gP0A/oD9APuA+gD7gPoA+ID3APiA9wD1gPQA9YD0APKA8QDygPEA74F1AO+BdQDuAPEBdoF1AXaBdQDuAPEA7IDrAOmA6ADmgOUA44DiAOyA6wDpgOgA4IDfAN2A3ADagOsA2QDoANeA3wDWANwA1IDTANSA0wDUgNMA44DiANGA6wDQAOgA0YDrANAA6AGFgM6BhYDOgM0AzoDNAM6Ay4DKAMuAygDLgMiAy4DIgXaAxwF2gMcAxYDKAMWAygDEAXUAxAF1AMuAygDLgMoBdoDHAXaAxwDCgMEAwoDBAL+AwQC/gMEAvgC8gABAHv/pgABAHsB9AABAIgBlgABAXf+vQABAIgArQABAJMDNwABAG0B6gABAJP+9gABAbP9/AABAbP+rAABAG0BAQABARADNwABARD+ogABAREDAwABASQDAwABAXn/pgABAXkChgABAJQDPwABASICAwABAREDNwABASQDNwABAJT+lQABAJQCPQABASL+aQABASIBGgABAYP/pgABAYICegABASv+jgABASsCTgABARH/pgABARECTgABAST/pgABASQCTgABAT0B9AABAJMC5AABAUH+tgABAT0CigABATf/pgABATcCTgABASj+fAABASgCTwABAKD/pgABAKADEwABAUb+rAABAigDEwABATv/pgABANsDSAABANgDHwABAS4DTAABAaj/pgABAOcC2gABAP3/pgABANADEwABAXcCQwABAVMDAwABAlMDAwABAbD+hAABAlMCTgABAVMCTgABAvMCTgABAVMDiwABAvMDiwABAVP/pgABAVMC5AABAYX/pgABAvMC5AABAUoC5AABAUAC5AABAT4C5AABAS4C5AABAUr/pgABAUoCTgABAUD/pgABAUACTgABASD+cAABAT4CTgABASj+cAABAS4CTgABAXoC5AABAY4C5AABAXr/pgABAXoCTgABAY7/pgABAY4CTgABAcYC4wABAzkC4wABAcb/pgABAcYCTQABAzkCTQABAbYDiwABAzkDiwABAbb/pgABAbYCTgABAzn/pgABAzkCTgABAJkDiwABAJkDHwABAJkC5AABAGX+ygABAJkCTgABANMDHwABAJsC5AABAO7/pgABAJsCTgABAPsCzwABARQC0wABAPv/pgABAPv+aQABAPv+/wABAPsCOQABART+cAABARQCPQABAJMDHwABAXcCvgABAJMDiwABAXcDKgABAJMDAwABAXcCogABAJP+aQABAJT+hwABAXf+aQABAJP+/wABAXf+/wABAJP/pgABAJMCTgABAXf/pgABAXcB7QABAIcD+wABAIcDrAABAIf+vQABAIcD+AABAIf/pgABAIcDDwABARD/pgABARACTgACAAQBCAEVAAABFwEXAA4BGQF+AA8BgQHHAHUAJQAAAVAAAQFKAAABRAABAT4AAAE4AAEBMgAAASwAAQEmAAABIAABARoAAAEUAAABDgABAQgAAAECAAEA/AAAAPYAAADwAAABAgAAAQIAAAECAAEA6gAAAOQAAADeAAEA2AAAANIAAADMAAEAxgAAAMAAAAC6AAAAtAAAAK4AAAC6AAAAqAAAALoAAACiAAAAnAAAAJYAAQByAXgAAQCUAjsAAQBiAboAAQB1AhwAAQB2APcAAQBxAbEAAQB2Aa0AAQB1Aa0AAQB3AB4AAQB/Ah4AAQB2Ah4AAQB3ADIAAQCaAh4AAQB3AgoAAQB3ACEAAQCOAe0AAQBzAe0AAQB3AB8AAQB3Ae0AAQAmAnAAAQAm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ALgAEgAhAAH/6gAC/+YAA//mAAT/5gAF/+YABv/mAAf/5gAI/+YACf/mAAr/5gAL/+YADP/fAA3/5gA2//UAN//pAF//9wBg//cAYf/3AGP/9wBv//kAdf/3AHb/8QB3/+oAeP/qAHn/6gB6/+oAe//zAHz/8wB9//MAfv/zAH//5gCA/+oAsQAOAEYAD//6ABD/+gAR//oAEv/6ABP/+gAU//oAFgAKABgACgAk//oAJf/6ACb/+gAn//oAKP/6AD4ABgBG//oAR//6AEj/+gBJ//oASv/6AEv/+gBM//oATf/6AE7/+gBP//oAUP/6AFH/+gBU//oAX//gAGD/1wBh/9cAY//XAGT/+gBl//oAZv/6AGf/+gBo//oAaf/6AGr/+gBr//oAbP/6AG3/+gBu//oAb//fAHD/7ABx/+wAcv/sAHP/7AB0/+wAdv/ZAHf/ygB4/8oAef/KAHr/ygCA/8oA4f/5AOL/+QDj//kA5f/5APH/9AD1//QA9v/2APf/9gD4//YA+f/2APr/9gD8//QA/f/0AP7/9AD///QBAP/0AA4ADP/6ADb/+QA3//kAX//xAGD/8QBh//EAY//xAG//+QB2/+oAd//jAHj/4wB5/+MAev/jAID/4wAVAAH/4gAM/8wANv/4AG8ACAB1AAcAdgANAI//8wCV/+4Alv/zAJn/7wCqAAoArwAVALAAFACxADEAsgARALMAHAC1ACoAuAATAMf/8ADV//AA2v/3AAMADP/MAJb/8wCyABEABwAM//oAX//aAG//7gB1/+wAdv/VAPX/+QD7//AAAwBf//MAb//2AHb/5AAFAAz/+gBv/+QAdf/oAPX/+QD7/+YAAQBv/+0AGQAB/98ADP/EACT/+AA2//gARv/3AG8AEQB1ABEAdgAWAIH/9gCP/+0Alf/oAJb/9wCZ/+kApP/yAKoAEgCvAB0AsAAOALEAOQCyAAsAswAkALUAMgC4AA4Ax//qANX/6gDa//EAEgAB/+UADP/GADb/+AB2AAcAj//4AJX/9ACW//cAmf/1AKoABwCvABAAsAAVALEALACyACAAswAXALUAJQC4ABQAx//2ANX/9wAFAAz/xACW//cArwASALIAIwC1ABYABQAM/8YAlv/3AK8ADACyACAAtQASAJ8AAf/qAAL/6gAD/+oABP/qAAX/6gAG/+oAB//qAAj/6gAJ/+oACv/qAAv/6gAM/+oADf/qAA//9AAQ/+YAEf/mABL/5gAT/+YAFP/mACT/8wAl/+QAJv/kACf/5AAo/+QALwAiADAAIwAzAAsANAAaADUACwBG//EAR//kAEj/5ABJ/+QASv/kAEv/5ABM/+QATf/kAE7/5ABP/+QAUP/kAFH/5ABU/+QAWf/1AFr/9QBb//UAXP/1AF3/9QBe//UAdgAIAH//6gCB/+EAgv/hAIP/4QCE/+EAhf/hAIb/4QCH/+EAiP/hAIn/4QCK/+EAi//hAIz/4QCN/+EAj//xAJD/2gCR/9oAkv/aAJP/2gCU/9oAlf/yAJb/8wCX/9sAmP/bAJn/8ACa/9oAm//aAJz/2gCd/9oAnv/aAJ//2gCg/9oAof/aAKL/2gCj//EAqgAIAK8AGACwABkAsQAsALIAJwCzABcAtAAkALUAJQC2ADcAwP/oAMH/6ADC/+gAw//oAMT/6ADF/+gAxv/oAMf/7wDI/9oAyf/aAMr/2gDL/9oAzP/aAM3/2gDO/9oAzwABANAAAQDR/9oA0v/aANP/6ADV//EA1v/oANf/6ADY/+gA2f/oANr/6QDb/+kA3P/pAN3/6QDe/+kA3//pAOH/6ADi/+gA4//oAOX/6ADm//MA5//fAOj/3wDp/98A6v/fAOv/3wDs/98A7f/fAO7/4QDv/9oA8P/aAPH/4gDy/98A8//fAPT/3wD1/+EA9v/zAPf/4AD4/+AA+f/gAPr/4AD7/+8A/P/xAP3/4gD+/+IA///iAQD/4gEB/+0BAv/tAQP/7QEE/+0AoQAB/+0AAv/tAAP/7QAE/+0ABf/tAAb/7QAH/+0ACP/tAAn/7QAK/+0AC//tAAz/7AAN/+0AD//yABD/6QAR/+kAEv/pABP/6QAU/+kAJP/wACX/5wAm/+cAJ//nACj/5wAvACMAMAAkADMADAA0ABsANQAQAEb/7gBH/+cASP/nAEn/5wBK/+cAS//nAEz/5wBN/+cATv/nAE//5wBQ/+cAUf/nAFT/5wBZ//YAWv/2AFv/9gBc//YAXf/2AF7/9gBvAAUAdQAFAHYACwB//+0Agf/mAIL/5gCD/+YAhP/mAIX/5gCG/+YAh//mAIj/5gCJ/+YAiv/mAIv/5gCM/+YAjf/mAI//7wCQ/98Akf/fAJL/3wCT/98AlP/fAJX/8ACW//cAl//gAJj/4ACZ/+4Amv/fAJv/3wCc/98Anf/fAJ7/3wCf/98AoP/fAKH/3wCi/98Ao//2AKoACgCvABkAsAASALEALgCyACcAswAZALQAJQC1ACcAtgA5AMD/6gDB/+oAwv/qAMP/6gDE/+oAxf/qAMb/6gDH/+0AyP/fAMn/3wDK/98Ay//fAMz/3wDN/98Azv/fAM8AAgDQAAIA0f/fANL/3wDT/+oA1f/vANb/6gDX/+oA2P/qANn/6gDa/+sA2//rANz/6wDd/+sA3v/rAN//6wDh//UA4v/vAOP/7wDl/+8A5v/xAOf/4wDo/+MA6f/jAOr/4wDr/+MA7P/jAO3/4wDu/+YA7//fAPD/3wDx/+cA8v/jAPP/4wD0/+MA9f/mAPb/8gD3/+QA+P/kAPn/5AD6/+QA+//xAPz/7wD9/+cA/v/nAP//5wEA/+cBAf/wAQL/8AED//ABBP/wAFsAD//xABD/9AAR//QAEv/0ABP/9AAU//QAJP/xACX/8wAm//MAJ//zACj/8wAvACIAMAAsADMAFAA0ACMANQAUAEb/8ABH//MASP/zAEn/8wBK//MAS//zAEz/8wBN//MATv/zAE//8wBQ//MAUf/zAFT/8wCB//MAj//uAJD/7gCR/+4Akv/uAJP/7gCU/+4Alf/vAJb/9QCX/+4AmP/uAJn/7gCa/+4Am//uAJz/7gCd/+4Anv/uAJ//7gCg/+4Aof/uAKL/7gCj//QArwASALEALACyABYAswAUALQALgC1AAgAtgArAMH/9QDH/+4AyP/uAMn/7gDK/+4Ay//uAMz/7gDN/+4Azv/uAM//7gDQ/+4A0f/uANL/7gDV/+4A2v/0AOH/9ADm//EA5//yAOj/8gDp//IA6v/yAOv/8gDs//IA7f/yAO//7gDw/+4A8v/yAPP/8gD0//IA9f/xAPb/8gD8//EBAf/1AAYADP/vAG//4gB1/9oAo//0APX/9AD7/+IACgAB//gADP/vAF//1gBv/+0AcP/4AHX/7QB2/9YAo//0APX/9AD7//EALwAP/+4AJP/sAEb/6gBf/9cAYP/HAGH/xwBj/8cAZP/uAG//1ABw/+4Acf/iAHL/4gBz/+IAdP/iAHb/zQB3/7wAeP+8AHn/vAB6/7wAgP+8AI//8wCV//MAlv/2AJn/8gC0AAkAtgAjAMf/8QDPAAMA0AADANX/8wDh/+4A4v/zAOP/8wDl//MA5v/yAPH/6QD1/+kA9v/zAPf/7gD4/+4A+f/uAPr/7gD8/+sA/f/pAP7/6QD//+kBAP/pAHMAAf/bAAL/1QAD/9UABP/VAAX/1QAG/9UAB//VAAj/1QAJ/9UACv/VAAv/1QAM/80ADf/VAA//8gAk//AANv/tADf/7QBG/+4AdgAJAH//1QCB/+cAgv/qAIP/6gCE/+oAhf/qAIb/6gCH/+oAiP/qAIn/6gCK/+oAi//qAIz/6gCN/+oAj//fAJD/3wCR/98Akv/fAJP/3wCU/98Alf/fAJb/8QCX/94AmP/eAJn/3QCa/98Am//fAJz/3wCd/98Anv/fAJ//3wCg/98Aof/fAKL/3wCj//YApP/jAKX/4ACm/+AAp//gAKj/4ACvABgAsQAaALIAKQCzABIAtQAjAMD/7ADB/+0Awv/sAMP/7ADE/+wAxf/sAMb/7ADH/94AyP/fAMn/3wDK/98Ay//fAMz/3wDN/98Azv/fAM//3wDQ/98A0f/fANL/3wDT/+0A1f/eANb/7ADX/+wA2P/sANn/7ADa/+IA2//mANz/5gDd/+YA3v/mAN//5gDh//YA5v/uAOf/7gDo/+4A6f/uAOr/7gDr/+4A7P/uAO3/7gDu/+oA7//fAPD/3wDy/+4A8//uAPT/7gD1//MA9v/zAPv/9gD8//MBAf/uAEoAAf/kAAL/2gAD/9oABP/aAAX/2gAG/9oAB//aAAj/2gAJ/9oACv/aAAv/2gAM/9EADf/aADb/+AA3/+sAe//1AHz/9QB9//UAfv/1AH//2gCP//AAkP/vAJH/7wCS/+8Ak//vAJT/7wCV/+sAlv/vAJf/7ACY/+wAmf/rAJr/7wCb/+8AnP/vAJ3/7wCe/+8An//vAKD/7wCh/+8Aov/vAKT/9gCl//IApv/yAKf/8gCo//IAqgAQAK8ACACwACUAsQA0ALMAHwC1AB0AuAAlAMf/7QDI/+8Ayf/vAMr/7wDL/+8AzP/vAM3/7wDO/+8Az//vAND/7wDR/+8A0v/vANX/7QDa//QA2//1ANz/9QDd//UA3v/1AN//9QDv/+8A8P/vAPsABQAFALv/4AC8/8kAvf/JAL7/yQC//8kA/AAB/9sAAv/bAAP/2wAE/9sABf/bAAb/2wAH/9sACP/bAAn/2wAK/9sAC//bAAz/2QAN/9sADv/kAA//7wAQ/+UAEf/lABL/5QAT/+UAFP/lABX/5AAW/+QAF//kABj/5AAZ/+QAGv/kABv/5AAc/+QAHf/kAB7/5AAf/+QAIP/kACH/5AAi/+QAI//kACT/7wAl/+UAJv/lACf/5QAo/+UAKf/kACr/5AAr/+QALP/kAC3/5AAu/+QAL//kADD/5AAx/+QAMv/kADP/5AA0/+gANf/kADb/8wA3//MAOP/kADn/5AA6/+QAO//kADz/5AA9/+QAPv/kAD//5ABA/+QAQf/kAEL/5ABD/+QARP/kAEX/5ABG/+8AR//lAEj/5QBJ/+UASv/lAEv/5QBM/+UATf/lAE7/5QBP/+UAUP/lAFH/5QBS/+QAU//kAFT/5QBV/+QAVv/kAFf/5ABY/+QAWf/zAFr/5QBb/+UAXP/lAF3/5QBe/+UAX//qAGD/sgBh/7IAY/+yAGT/7gBl/+MAZv/jAGf/4wBo/+MAaf/jAGr/4wBr/+MAbP/jAG3/4wBu/+MAb//UAHD/7QBx/9wAcv/cAHP/3AB0/9wAdf/cAHb/2QB3/74AeP++AHn/vgB6/74Ae//cAHz/3AB9/9wAfv/cAH//2wCA/74Agf/wAIL/3wCD/98AhP/fAIX/3wCG/98Ah//fAIj/3wCJ/98Aiv/fAIv/3wCM/98Ajf/fAI7/9gCP/+4AkP/gAJH/4ACS/+AAk//gAJT/4ACV/+4Alv/fAJf/4ACY/+AAmf/uAJr/4ACb/+AAnP/gAJ3/4ACe/+AAn//gAKD/4ACh/+AAov/gAKP/5QCp/+EAqv/hAKv/4QCs/+EArf/hAK7/4QCv/+EAsP/hALH/4QCy/+EAs//hALT/8QC1/+EAtgAhALgAIQC5/+EAuv/hALv/4QC8/+EAvf/hAL7/4QC//+EAwP/hAMH/4QDC/+EAw//hAMT/4QDF/+EAxv/hAMf/7gDI/+AAyf/gAMr/4ADL/+AAzP/gAM3/4ADO/+AAz//8AND//ADR/+AA0v/gANP/4QDU/+EA1f/tANb/4QDX/+EA2P/hANn/4QDa//QA2//hANz/4QDd/+EA3v/hAN//4QDg/+EA4f/yAOL/5ADj/+QA5f/kAOb/8ADn/+IA6P/iAOn/4gDq/+IA6//iAOz/4gDt/+IA7v/fAO//4ADw/+AA8f/iAPL/4gDz/+IA9P/iAPX/4AD2//IA9//hAPj/4QD5/+EA+v/hAPv/5gD8//AA/f/iAP7/4gD//+IBAP/iAQH/5AEC/+QBA//kAQT/5AAOADQAEgBf/9EAYP/RAGH/0QBj/9EAb//5AHb/5wB3/+AAeP/gAHn/4AB6/+AAgP/gALQAHAC2AC4AAQBv//MAAwBf/+wAb//0AHb/4wADAG//zACj//YA9f/eAAcAX//YAG//5ABw//QAdv/OAKP/9gD1//QA/P/0AAYAb//zAJb/+AKm//gCtv/wArj/7QLN//sACgBf//oAb//zAHD/+wB2/80Alv/4Aqb/+AKt/+4Ctv/wArj/7QLN//IAFwAB/+wADP/rADb/9wBv//kAdf/sAHb/5QCB//wAj//6AJX/+QCW//kAmf/4AKT//ADH//kA1f/5ANr/+wKf//UCpv/3Aqz/7wKt//QCtP/yArb/8gK4//UCzf/2AFMAD//7ACT/+wA2//0AN//9AEb/+gBf/7kAYP+5AGH/uQBj/7kAb//5AHb/5QB3/9kAeP/ZAHn/2QB6/9kAgP/ZAIH/9wCC//0Ag//9AIT//QCF//0Ahv/9AIf//QCI//0Aif/9AIr//QCL//0AjP/9AI3//QCP//AAkP/0AJH/9ACS//QAk//0AJT/9ACV/+8Alv/uAJf/9ACY//QAmf/sAJr/9ACb//QAnP/0AJ3/9ACe//QAn//0AKD/9ACh//QAov/0AKT/8wCl//YApv/2AKf/9gCo//YAx//sAMj/9ADJ//QAyv/0AMv/9ADM//QAzf/0AM7/9ADP//QA0P/0ANH/9ADS//QA1f/uANr/+gDu//0A7//0APD/9AKqAAgCrf/2Aq7/9AKw/+ECsf/hArb/8QK4/+4Cv//mAsH/8wLN//YDNP/0AzX/9AAIAAz/7gBv//YAdf/nAJb/9wKm//cCrP/vArb/5AK4/+AAFAAB//UADP/uADb/+gBv//cAdf/xAHb/3ACP//wAlf/7AJb//ACZ//sApP/8AMf/+wDV//sCpv/3Aqz/9QKt//ICtP/xArb/9AK4//YCzf/1AG8AAf/rAAL/7wAD/+8ABP/vAAX/7wAG/+8AB//vAAj/7wAJ/+8ACv/vAAv/7wAM/+wADf/vADb/9gA3/+cAX/++AGD/vgBh/74AY/++AG//+AB1/+YAdv/kAHf/2AB4/9gAef/YAHr/2AB7//EAfP/xAH3/8QB+//EAf//vAID/2ACB//sAgv/4AIP/+ACE//gAhf/4AIb/+ACH//gAiP/4AIn/+ACK//gAi//4AIz/+ACN//gAj//5AJD/9wCR//cAkv/3AJP/9wCU//cAlf/4AJb/8wCX//gAmP/4AJn/+ACa//cAm//3AJz/9wCd//cAnv/3AJ//9wCg//cAof/3AKL/9wCk//sApf/3AKb/9wCn//cAqP/3AMf/+ADI//cAyf/3AMr/9wDL//cAzP/3AM3/9wDO//cAz//3AND/9wDR//cA0v/3ANX/+ADa//sA2//6ANz/+gDd//oA3v/6AN//+gDu//gA7//3APD/9wKf//QCoP/eAqP/3gKm//cCrP/sAq3/8wKu//MCsP/zArH/8wK0//ECtv/mArj/4QK5/94Cuv/eAr//9ALB//QCzf/1AzT/9wM1//cABwBv/+YAtgARAqb/9AKt/+kCtv/qArj/6ALN//UACAAM/+sAb//4AHX/5gCW//ICpv/3Aqz/6wK2/+gCuP/jAAYAb//mAqb/9AKt/+kCtv/qArj/6ALN//UACQBv//IAcP/6AHb/zAKm//QCrf/tArT/9gK2/+oCuP/oAs3/8gBRAIUAUgCOAIkAj//xAJD/8QCRAHMAkv/xAJP/8QCU//EAlf/wAJb/5ACX//AAmP/wAJn/8QCa//EAm//xAJwARwCd//EAnv/xAJ//8QCg//EAof/xAKL/8QCjAFcApP/4AKX/+ACm//gAp//4AKj/+ACpAIoArACLAK4AHgC2AIkAuwCKAMMAQwDH//EAyP/xAMn/8QDK//EAy//xAMz/8QDN//EAzv/xAM//8QDQ//EA0f/xANL/8QDUAIwA1f/wANr//gDb//4A3ABmAN3//gDe//4A3//+AOAAWQDhAFwA7//xAPD/8QKkAHkCpgB/AqoAdgKtAIQCrv+8ArD/vAKx/7wCtACcArYAmAK4AJYCvQA/Ar4AaAK//8YCwP/oAsH/xgLC/+gCxACEAsgAFALMAEQCzQBwAs8AeQM0//EDNf/xAAMAlv/9Arb/+AK4//UACABf//sAb//2AHb/1QCW//0Crf/wArb/+AK4//UCzf/0AEkADP/9ADb/7QA3/+0AWf/7AFr/+wBb//sAXP/7AF3/+wBe//sAX//SAGD/4gBh/+IAY//iAG//5ABw/+8Acf/tAHL/7QBz/+0AdP/tAHX/+gB2/7wAd//XAHj/1wB5/9cAev/XAID/1wCj//sApP/6AKX/+wCm//sAp//7AKj/+wDa//4A2//+ANz//gDd//4A3v/+AN///gDh//cA4v/4AOP/+ADl//gA8f/wAPX/8AD2//gA9//1APj/9QD5//UA+v/1APv/9wD8//QA/f/wAP7/8AD///ABAP/wAQH//gEC//4BA//+AQT//gKm//cCqv/xAq3/7QK0//UCtv/wArj/7AK7//ECvP/yAr3/6gK+/+wCw//zAsT/7QLM//MCzf/1AAkADP/7AG//6gD1//kA+//9Aqb/9AKt/+oCtv/mArj/4QLN//QAEAAB//oADP/7AF//+QBv//AAcP/5AHX/8QB2/8gApP/8APX/+QD7//kCpv/0Aq3/7AK0//ICtv/1Arj/4QLN//EABwAM/9YAdf/lAJb/2QKs/94Ctv/pArj/5ALI//YADwAB/+MADP/WADb/8wBv//sAdf/nAHb/5wCW//wCn//kAqz/4wKt//QCtP/xArb/8QK4//QCyP/2As3/9wAJAF//+wBv//EAcP/5AHb/yQKm//QCrf/sArb/6gK4/+gCzf/yAAwADP/5AG//4QB1/+wA9f/4APv/9QKm/+cCqv/4Aq3/3AK0/+4Ctv/gArj/2wLN/+8AFQAB//kADP/5AF//wQBv/+IAcP/zAHX/5AB2/7AAo//8APX/+QD2//sA+//tAPz/+QKm//ACqv/0Aqz/8gKt/98CtP/vArb/7wK4//MCxP/zAs3/7QALAAz/+QBv/+AAdf/rAPX/9wD7//QCpv/5Aq3/2gK0/+4Ctv/fArj/2gLN//EACwAM//kAb//gAHX/6wD1//cA+//0Aqb/6QKt/9oCtP/uArb/3wK4/9oCzf/xABUAAf/4AAz/+QBf/8AAb//hAHD/8gB1/98Adv+rAKP//AD1//gA9v/6APv/6QD8//gCpv/wAqr/8AKs//ECrf/eArT/7gK2/+4CuP/yAsT/8ALN/+0ADwBf/8QAb//hAHD/8wB2/7AA9f/4APb/+wD8//gCpv/yAqr/9AKt/98CtP/2Arb/6QK4/+gCxP/0As3/7AACAL8ABgKo/8kAKACB//wAjgA5AI//3ACR//0Alf/XAJYAGQCZ/8sAowAMAKT/7gCpADkArAA6ALYAOgC7ADkAx//RANX/0gDa/+oA3P/3AOAADgDhABAA9QAVAPYADQD7ABgA/AAVAQMADQKf/80CpAAvAqYANQKqACwCrP/TAq0ANQKu/9QCtAAlArYAOAK4ADYCvgAeAsH/3wLEADoCyP/1As0AJgLPACUAAQKo/8kAAQKo/+AABQBv//cAlv/vAqb/+gK2//MCuP/wABQAJP/7AEb/+gBv//gAdv/eAIH/+QCP//IAlf/yAJb/8wCZ/+8ApP/2AMf/7wDV//EA2v/6Aqb/+gKt//QCrv/2Arb/8wK4//ACwf/2As3/8gAJAqQAFAKmABsCqgAbArYAFgK4ABsCvgAQAsQAFQLNABICzwAPAAsCpAAfAqYAJgKqABQCrQApArQACwK2ABQCuAAUAr4AFQLEACUCzQAgAs8AGAABALYAEAAJAqQACgKmABECqgAeAq0AEwK0AAsCtgATArgAEgLEABUCzQAJAA0CpAAkAqYALAKqADgCrQATArQAKAK2AC0CuAAsAr0ABgK+ABwCxAAvAswADQLNACMCzwAbAAkCpAAUAqYAGwKqABMCtgAVArgAGwK+ABACxAAVAs0AEgLPAA8ABgKmABECrQAWArQAEwK2ABkCuAAZAsQADwAIANgAIwKmACcCrQAsArQAGQK2ACgCuAApAsMAEQLEABEABwBv/+MA9f/7Aqb/6wKt/9wCtv/pArj/6ALN//AAAwCW//sAtgATALgAEwARAG//+QB2/98Aj//7AJX/+gCW//YAmf/4ALYAEwC4ABMAx//5AM8AAQDQAAEA1f/5Aq3/8wKu//YCzf/3AzQAAQM1AAEAWwAB/+cAAv/jAAP/4wAE/+MABf/jAAb/4wAH/+MACP/jAAn/4wAK/+MAC//jAAz/3wAN/+MANv/oADf/6ABf/+MAYP/jAGH/4wBj/+MAbwANAHX/8wB2ABQAd//3AHj/9wB5//cAev/3AHv/9QB8//UAff/1AH7/9QB//+MAgP/3AI//9wCQ//cAkf/3AJL/9wCT//cAlP/3AJX/9wCW/94Al//3AJj/9wCZ//wAmv/3AJv/9wCc//cAnf/3AJ7/9wCf//cAoP/3AKH/9wCi//cApP/7AKX/+wCm//sAp//7AKj/+wCvADcAsgBNALUAIwDH//cAyP/3AMn/9wDK//cAy//3AMz/9wDN//cAzv/3AM//9wDQ//cA0f/3ANL/9wDV//cA7//3APD/9wKf/+0CoP/XAqP/1wKs/+UCrv/XArD/1wKx/9cCuf/XArr/1wK//94CwP/sAsH/3gLC/+wCyP/3AzT/9wM1//cAEQAM//sAX//BAG//5QBw//UAdv+yAPX/+gD2//wA+//7APz/+gKm//ICqv/0Aq3/4AK0//QCtv/mArj/6QLE//QCzf/vAAUCpgAJAqoAFgK2AAsCuAAKAsQADAAMAJEACwCjAAgA4AAVAPUADgD7ABABAwANAqYALgKqACcCrQA0ArQAGAK2ABcCuAAXAHkAAf/xAAL/9wAD//cABP/3AAX/9wAG//cAB//3AAj/9wAJ//cACv/3AAv/9wAM//UADf/3AA7/+wAV//sAFv/7ABf/+wAY//sAGf/7ABr/+wAb//sAHP/7AB3/+wAe//sAH//7ACD/+wAh//sAIv/7ACP/+wAp//sAKv/7ACv/+wAs//sALf/7AC7/+wAv//sAMP/7ADH/+wAy//sAM//7ADT/+wA1//sANv/5ADf/5gA4//sAOf/7ADr/+wA7//sAPP/7AD3/+wA+//sAP//7AED/+wBB//sAQv/7AEP/+wBE//sARf/7AFL/+wBT//sAVf/7AFb/+wBX//sAWP/7AFn//QBa//0AW//9AFz//QBd//0AXv/9AF//9QBg/88AYf/PAGP/zwBv/+sAcP/5AHH/9ABy//QAc//0AHT/9AB1/+QAdv/WAHf/1gB4/9YAef/WAHr/1gB7//kAfP/0AH3/9AB+//QAf//3AID/1gDx//kA9f/6APb//AD3//wA+P/8APn//AD6//wA+//7APz/+QD9//kA/v/5AP//+QEA//kCn//3AqD/9wKj//cCpv/0Aqz/6gKt/+0CtP/yArb/6wK4/+gCuf/3Arr/9wK7//sCvP/7Ar3/+wK+//sCzf/6AAUAb//0AJb/9QKm//cCtv/xArj/7gAJAG//9gB2/84Alv/1AMf//AKm//cCrf/vArb/8QK4/+4Czf/1ABQAAf/4AAz/+QBf/8EAb//jAHD/8wB1/+IAdv+wAPX/+QD2//sA+//sAPz/+QKm//ACqv/xAqz/8gKt/+ACtP/vArb/7wK4//MCxP/wAs3/6wAJAAz/+wBv/+EA9f/4APv//AKm/+wCrf/dArb/5gK4/+kCzf/yAAgAb//nALYAMQD1//sCpv/xAq3/3AK2//cCuP/1As3/9AAHAG//5wD1//sCpv/xAq3/3AK2//cCuP/1As3/9AAUAF//wgBv/9gAcP/rAHb/qACj//sApP/7AMf//ADV//wA4f/6AOb//AD1//QA9v/3APz/8wKm//ECqv/xAq3/3QK2//cCuP/1AsT/8ALN/+gACQCW//gArwAKALAAEACyACcAswAJALUAGwC4AA8A9f/0Asz/+QAPAA//+wAk//kARv/3AJb/+ACk//cAqgAHAK8ADgCwABwAsQAqALIAJwCzABYAtQAjALgAGwD1//QCzP/5ABoADP/MAIP/wgCF/8gAi//MAJb/2QCe/70Ao//uAK3/wwCvAC4AsQAuALIAQACzAB8AtQAuAL//+gDN/8MA1//TANj/2QDx/+MA9f/YAPv/2AD//98BAP/bAqz/wALH/9wCyP/bAsz/6gBFAAH/rQAM/8wAD//fACT/2QA2/+YARv/VAFn/7ABfAAkAgf+/AIP/wgCF/8gAi//MAI//sACR/8YAk/+9AJX/rQCW/+8Amf+pAJ7/xACj/+wApP+2AKoAIACt/80Arv/xAK8AMgCwABIAsQBOALIAIACzADkAtQBHALgAEgC///oAwf/NAMf/qwDL/74Azf+xANH/uADT/80A1f+rANf/0wDY//sA2v+4AOD/6QDh/+wA5v/SAPH/4wD1/+YA9v/dAPv/5gD8/+YA///fAQD/2wEB/9ACn//OAqH/4wKkAAYCpgAMAqz/zQKtAAwCrv/VArYADwK4AA0Cvf/3AsH/1QLC/+MCxAARAsf/5ALI/94CzP/yAHYAD//kABD/7gAR/+4AEv/uABP/7gAU/+4AJP/gACX/7QAm/+0AJ//tACj/7QBG/90AR//tAEj/7QBJ/+0ASv/tAEv/7QBM/+0ATf/tAE7/7QBP/+0AUP/tAFH/7QBU/+0AWf/2AF8ABQCB//cAj//lAJD/6wCR/+sAkv/rAJP/6wCU/+sAlf/mAJb/9ACX/+4AmP/uAJn/5ACa/+sAm//rAJz/6wCd/+sAnv/rAJ//6wCg/+sAof/rAKL/6wCj//kApP/1AKX/8ACm//AAp//wAKj/8ACqAB0ArwAmALAADQCxACUAsgA4ALMAFwC1ACYAuAANAMf/4QDI/+sAyf/rAMr/6wDL/+sAzP/rAM3/6wDO/+sAz//tAND/7QDR/+sA0v/rANX/5QDh//AA4v/3AOP/9wDl//cA5v/rAOf/8ADo//AA6f/wAOr/8ADr//AA7P/wAO3/8ADv/+sA8P/rAPH/5gDy//AA8//wAPT/8AD1/+YA9v/qAPf/5wD4/+cA+f/nAPr/5wD8/+kA/f/mAP7/5gD//+YBAP/mAqYACQKtAAcCrv/vArD/2gKx/9oCtgAKArgACQK//+kCwf/uAsQADALM//cDMf/tAzL/7QM0/+0DNf/tAAoADP/lAJb/7gCt//EArwAaALIAMACzABIAtQAkALgADwKs/+UCyP/6ACAAAf/jAAz/5QAP//kAJP/4ADb/8wBG//gAgf/2AI//8wCV//IAlv/3AJn/4gCk//QAqgAQAK3/+QCvABkAsAAaALEANgCyAAgAswAhALUALwC4ABkAwf/5AMf/8gDT//kA1f/yANr/9ADm//sBAf/6Ap//9AKs/+4Crv/4Asj/+gC2AAH/0gAC/+QAA//kAAT/5AAF/+QABv/kAAf/5AAI/+QACf/kAAr/5AAL/+QADP/gAA3/5AAP//MAEP/1ABH/9QAS//UAE//1ABT/9QAk//IAJf/0ACb/9AAn//QAKP/0ADb/7gA3/+YARv/xAEf/9ABI//QASf/0AEr/9ABL//QATP/0AE3/9ABO//QAT//0AFD/9ABR//QAVP/0AFn/+ABa//gAW//4AFz/+ABd//gAXv/4AH//5ACB/+oAgv/mAIP/5gCE/+YAhf/mAIb/5gCH/+YAiP/mAIn/5gCK/+YAi//mAIz/5gCN/+YAj//jAJD/4ACR/+AAkv/gAJP/4ACU/+AAlf/hAJb/5ACX/+AAmP/gAJn/3wCa/+AAm//gAJz/4ACd/+AAnv/gAJ//4ACg/+AAof/gAKL/4ACj//gApP/oAKX/2wCm/9sAp//bAKj/2wCqABsArf/mAK8AIACwAB0AsQAgALIANwCzABcAtQAoALgAEADA/+YAwf/xAML/5gDD/+YAxP/mAMX/5gDG/+YAx//gAMj/4ADJ/+AAyv/gAMv/4ADM/+AAzf/gAM7/4ADP/+AA0P/gANH/4ADS/+AA0//xANX/4ADW/+YA1//qANj/6gDZ/+YA2v/nANv/5wDc/+cA3f/nAN7/5wDf/+cA4P/4AOH/+gDi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AGT/+ABv/7sAcP/GAHb/kgCW//sAo//5AKT/+ADh//MA5v/7APX/6AD2//MA/P/nAqb/7wKo/8sCqv/EAq3/zAK2//YCuP/yAr3/xQK+/8UCxP/FAsz/1QLN/8QACACW//gArwAcALEAHACyADEAswAOALUAHwD1/+gCzP/1ACMAD//rACT/6ABG/+QAWf/4AI//8ACV//AAlv/3AJn/7wCj//sApP/4AKoAEgCvACAAsAAJALEAOwCyAA0AswAmALUANAC4AAgAx//sAM//9QDQ//UA1f/vAOH/9ADm//QA9f/wAPb/8gD8//ACrv/0ArYABwK4AAYCvf/4AsH/8wLM//UDNP/1AzX/9QADArQAJwK2ACsCuAApAAkAAf/1AHb/+gCvAAgAsAAVALEAJACzAA4AtQAdALgAFAKs//MAAwK0ABgCtgAXArgADQABALYACgADArQAFQK2AA8CuAAOAAMCtAAsArYAJgK4ACUAAwK0ACECtgAmArgAJQAFALAAEgCxACEAswAMALUAGgC4ABIAAQKqAAYABABv//cAo//6ALIADwD1//kADAAB//sAX//7AG//+gB2//cAo//6ALAAEACxAB4AsgAPALMACgC1ABMAuAAOAPX/+QCvAAH/yQAC/98AA//fAAT/3wAF/98ABv/fAAf/3wAI/98ACf/fAAr/3wAL/98ADP/TAA3/3wAP//oAEP/3ABH/9wAS//cAE//3ABT/9wAk//kAJf/2ACb/9gAn//YAKP/2ADb/8gA3/+sARv/3AEf/9gBI//YASf/2AEr/9gBL//YATP/2AE3/9gBO//YAT//2AFD/9gBR//YAVP/2AFn/9gBa//YAW//2AFz/9gBd//YAXv/2AHX//QB2AAgAf//fAIH/9gCC/+AAg//gAIT/4ACF/+AAhv/gAIf/4ACI/+AAif/gAIr/4ACL/+AAjP/gAI3/4ACP/+UAkP/uAJH/7gCS/+4Ak//uAJT/7gCV/+QAlv/sAJf/7QCY/+0Amf/jAJr/7gCb/+4AnP/uAJ3/7gCe/+4An//uAKD/7gCh/+4Aov/uAKP/+QCk/+YApf/rAKb/6wCn/+sAqP/rAKoAEwCt/+sArwAdALAAKACxAB0AsgA4ALMAGQC1ACwAuAAnAMD/6wDB/+sAwv/rAMP/6wDE/+sAxf/rAMb/6wDH/+QAyP/uAMn/7gDK/+4Ay//uAMz/7gDN/+4Azv/uAM//7gDQ/+4A0f/uANL/7gDT/+sA1f/kANb/6wDX/+sA2P/rANn/6wDa/+UA2//vANz/7wDd/+8A3v/vAN//7wDh//kA4v/5AOP/+QDl//kA5v/uAOf/7gDo/+4A6f/uAOr/7gDr/+4A7P/uAO3/7gDu/+AA7//uAPD/7gDx//MA8v/uAPP/7gD0/+4A9f/1APb/8wD3//MA+P/zAPn/8wD6//MA+//qAPz/8wD9//MA/v/zAP//8wEA//MBAf/tAQL/7QED/+0BBP/tAp//7AKg/7oCo/+6Aqz/4AKu//ACuf+6Arr/ugLB//QCyP/0AzH/9gMy//YDNP/uAzX/7gAIAJb/+ACj//0ArwAKALIAJACzAAYAtQAZALYAFgD1//UADwAP//sAJP/5AEb/9wCW//gAo//9AKT/+gCqAAsArwASALAAHwCxAC4AsgAkALMAGgC1ACcAuAAfAPX/9QAIAAz/7wBv//QAdf/rAPv//QKm//cCtP/0Arb/5wK4/+MAEQAB/+wADP/vADb/9gBf//QAb//xAHD/+AB1/9sAdv/SAHv/9gD7//kCpv/3Aqz/6QKt/+4CtP/vArb/7wK4//MCzf/2AAgAlv/5AKP/+gCvAA8AsgAhALMACQC1AB0A9f/xAsz/9AAQAA//+gAk//kARv/3AJb/+QCj//oApP/6AKoADQCvABMAsAAfALEAMgCyACEAswAcALUAKAC4AB8A9f/xAsz/9AA8AAH/9wAC//YAA//2AAT/9gAF//YABv/2AAf/9gAI//YACf/2AAr/9gAL//YADP/zAA3/9gA2//EAN//xAF//+ABg//EAYf/xAGP/8QBv//UAcP/4AHH//QBy//0Ac//9AHT//QB1//MAdv/iAHf/5wB4/+cAef/nAHr/5wB///YAgP/nAKT/9wCl//cApv/3AKf/9wCo//cAsAALALEAGgC4AAsA8f/9APX//QD2//0A9//9APj//QD5//0A+v/9APv/+wD8//0A/f/9AP7//QD///0BAP/9Aqb/+QKs//QCrf/0ArT/8gK2/+0CuP/mAAcAlv/4AKP//QCvAAoAsgAkALMABgC1ABkA9f/1AAwAb//kAJb/+wCj//kAtgBAAPX/7wKm/+gCqv/cAq3/0QK2/+0CuP/qAsz/5wLN/9gACwBv/+QAlv/7AKP/+QD1/+8Cpv/oAqr/3AKt/9ECtv/tArj/6gLM/+cCzf/YACAAD//xACT/8ABG/+4AX//HAGT/8QBv/9IAcP/jAHb/rQCP//kAlf/5AJb/+wCZ//kAo//5AKT/+gDH//gA1f/5AOH/8gDm//gA9f/sAPb/8gD8/+wCpv/xAqr/5AKt/9sCrv/4ArYABgK4/+oCvf/sAr7/6QLE/+ICzP/qAs3/3wACAAgAAQAIAAIAKAAFAAAAuACEAAIAAwAAAAAAAAAAAFAAUAAAAAD/Of85AAAAAAABACwBRQFGAUcBSAFJAUoBSwFMAXABdAF4AX4B0QHSAdoB2wHgAeEB5gHnAewB7QHyAfMB+gH7AfwB/QIGAgcCCAIJAhQCFQIWAhcCJAIlAioCLAIxAjICNQI2AAIACAEgASAAAgG2AbYAAQG4AbgAAQG6AboAAgG8AbwAAQHAAcAAAQHEAcQAAQHGAcYAAQACAAQBcAFwAAEBdAF0AAEBeAF4AAEBfgF+AAEAAAACABUAAADPAsUAAwAHAABTMxEjExEzERW6uhSSAsX9OwKx/WMCnQAAAgAXAAACPQKzAAcACwAAcxMzEyMnIQc3IQMjF72tvFAx/twxQgECZzQCs/1Nr6/2AXkA//8AFwAAAj0DpAYmAAEAAAAHAyMArQAA//8AFwAAAj0DlgYmAAEAAAAHAycAnwAA//8AFwAAAj0DnQYmAAEAAAAGAyVNAP//ABcAAAI9A4IGJgABAAAABwMgALUAAP//ABcAAAI9A6QGJgABAAAABwMiAJgAAP//ABcAAAI9A2cGJgABAAAABwMqAKMAAP//ABf/MQJRArMGJgABAAAABwMfAOYAAP//ABcAAAI9A1EGJgABAAAABwMoAKX/3P//ABcAAAI9BAIGJgABAAAAJwMoAKX/3gAHAyMAnQBe//8AFwAAAj0DmwYmAAEAAAAHAykAmgAAAAIAEwAAAz0CuAAPABMAAHMTIRUhFSEVIRUhFSE1Iwc3MxMjE94CTP6pARv+5QFX/lr4OU7jAW0CuE3hTPJMrKz5AXL//wATAAADPQOkBiYADAAAAAcDIwGPAAAAAwBUAAACMwKzABMAHwApAABzETMyFhYVFAYGBx4CFRQOAiMnMzI2NjU0LgIjIzUzMjY2NTQmIyNU/ERbLxUmHB4xHR45TzG4tSo9Ih0sMBSxsCs1GT9BqQKzJE4+LD0oDgomQDI2Sy0URhY3MicwGAhGGzYpOzYAAQA6//YB9wK+ACQAAEUiLgI1ND4CMzIWFhcHLgIjIg4CFRQeAjMyNjcXDgIBOE5jOBUVOGNOJEc+FgMWQEIbOUcmDg4lSDoqZSMDGEBGCi5ahFZYhlouBwsFQwQIBiJHa0pIa0UiCwZEBQoGAP//ADr/9gH3A6QGJgAPAAAABwMjAKgAAP//ADr/9gH3A50GJgAPAAAABwMmAKsAAP//ADr/JgH3Ar4GJgAPAAAABwMeANQAAP//ADr/9gH3A50GJgAPAAAABgMlWgD//wA6//YB9wN1BiYADwAAAAcDIQCt//0AAgBUAAACTQKzAAwAGQAAcxEzMh4CFRQOAiMnMzI+AjU0LgIjI1T3TGQ6GBc6ZE2npzZEJg8PJkQ2pwKzMVl7SkuBYjZHLlBmOThgSCgAAwAUAAACUAKzAAMAEAAdAABTNSEVAxEzMh4CFRQOAiMnMzI+AjU0LgIjIxQBL+z3TGQ6GBc6ZE2npzZEJg8PJkQ2pwE1TU3+ywKzMVl7SkuBYjZHLlBmOThgSCgA//8AVAAAAk0DnQYmABUAAAAHAyYAowAAAAMAFAAAAlACswADABAAHQAAUzUhFQMRMzIeAhUUDgIjJzMyPgI1NC4CIyMUAS/s90xkOhgXOmRNp6c2RCYPDyZENqcBNU1N/ssCszFZe0pLgWI2Ry5QZjk4YEgoAAABAFQAAAH7ArMACwAAcxEhFSEVIRUhFSEVVAGn/qkBG/7lAVcCs0fqRvVH//8AVAAAAfsDpAYmABkAAAAHAyMApAAA//8AVAAAAfsDlgYmABkAAAAHAycApwAA//8AVAAAAfsDnQYmABkAAAAHAyYAnQAA//8AVAAAAfsDnQYmABkAAAAGAyVKAP//AFQAAAH7A4IGJgAZAAAABwMgALIAAP//AFQAAAH7A3gGJgAZAAAABwMhALIAAP//AFQAAAH7A6QGJgAZAAAABwMiAJ4AAP//AFQAAAH7A2cGJgAZAAAABwMqAJ8AAP//AFT/MQH7ArMGJgAZAAAABwMfAI8AAAABAFQAAAHzArMACQAAcxEhFSERIRUhEVQBn/6xARv+5QKzR/72R/7lAAABADj/9gImAr4AKQAARSIuAjU0PgIzMhYWFwcuAiMiDgIVFBYWMzI2Njc1IzUzEQ4DAUVQaDwZGT1nTidVTRoDGkxPITtMKhEeU08XNDEQcL8ROEA/Ci9bhFRXhVsvCA0GQgUJByJHa0pgfj0EBgPRR/6sAwgIBf//ADj/9gImA5YGJgAkAAAABwMnAL8AAP//ADj/9gImA5oGJgAkAAAABgMlZv0AAgA4/uICJgK+ACkALQAARSIuAjU0PgIzMhYWFwcuAiMiDgIVFBYWMzI2Njc1IzUzEQ4DAzczBwFFUGg8GRk9Z04nVU0aAxpMTyE7TCoRHlNPFzQxEHC/EThAP1wpTTIKL1uEVFeFWy8IDQZCBQkHIkdrSmB+PQQGA9FH/qwDCAgF/uzQ0AACADj/9gImA3gAAwAtAABBNTMVAyIuAjU0PgIzMhYWFwcuAiMiDgIVFBYWMzI2Njc1IzUzEQ4DARJOG1BoPBkZPWdOJ1VNGgMaTE8hO0wqER5TTxc0MRBwvxE4QD8DH1lZ/NcvW4RUV4VbLwgNBkIFCQciR2tKYH49BAYD0Uf+rAMICAUAAAEAVAAAAk8CswALAABzETMRIREzESMRIRFUUAFbUFD+pQKz/swBNP1NATj+yAACAA8AAAKkArMAAwAPAABTNSEVAREzESERMxEjESERDwKV/bRQAVtQUP6lAfpFRf4GArP+zAE0/U0BOP7I//8AVAAAAk8DnQYmACkAAAAGAyV2AAABAFQAAACkArMAAwAAcxEzEVRQArP9Tf//AA0AAAEBA6QGJgAsAAAABgMjAQD////mAAABIwOWBiYALAAAAAYDJ/sA////0AAAASADnQYmACwAAAAGAyWcAP////AAAAEHA4IGJgAsAAAABgMgBwAAAgBUAAAApAN4AAMABwAAUzUzFQMRMxFWTU9QAx9ZWfzhArP9Tf///+wAAADgA6QGJgAsAAAABgMi4gD////iAAABGwNnBiYALAAAAAYDKvgA//8AD/8xALwCswQnAx//UQAAAgYALAAA////zQAAASEDmwYmACwAAAAGAynrAAABABL/uADRArMADQAAVzUyPgI1ETMRFA4CEiEsGApQFi9ISEcGFSwlAkj9rThDIgsA//8AAP+4AVADmgYmADYAAAAGAyXM/QABAFQAAAIqArMADAAAcxEzETcTMwMTIwMHEVRQca5cw85ftXICs/7ABAE8/qX+qAEwBP7UAAACAFT+4gIqArMAAwAQAABTNzMHAxEzETcTMwMTIwMHEd4pTTLOUHGuXMPOX7Vy/uLQ0AEeArP+wAQBPP6l/qgBMAT+1AAAAQBUAAAB0gKzAAUAAHMRMxEhFVRQAS4Cs/2VSAD//wBUAAAB0gOkBCYDI3kAAAYAOgAAAAIAVAAAAdICuAADAAkAAEE1MxUBETMRIRUBbUv+nFABLgHM7Oz+NAKz/ZVIAAACAFT+4gHSArMAAwAJAABTNzMHAxEzESEVxilNMrZQAS7+4tDQAR4Cs/2VSAAAAv/7AAAB1wKzAAMACQAAdyclFwERMxEhFSInATon/v1QAS7mNtw1/j0Cs/2VSAAAAQBUAAAC9QKzAA4AAHMRMxMTMxEjESMDIwMjEVSRv8CRUA/FWcUPArP9vAJE/U0CXv27AkX9ogABAFQAAAJRArMACwAAcxEzATMRMxEjASMRVJUBBBRQkv74EwKz/ZQCbP1NAmz9lP//AFQAAAJRA6QGJgBAAAAABwMjAM8AAP//AFQAAAJRA5oGJgBAAAAABwMmAM///QACAFT+4gJRArMAAwAPAABBNzMHAREzATMRMxEjASMRARkpTTH+9pUBBBRQkv74E/7i0NABHgKz/ZQCbP1NAmz9lP//AFQAAAJRA5sGJgBAAAAABwMpAMQAAAACAFT/RwJRArMADQAZAABFNTI+AjU1MxUUDgIlETMBMxEzESMBIxEBkiErGQpQFi9I/pCVAQQUUJL++BO5RwYULCYtODhDIgu5ArP9lAJs/U0CbP2UAAIAOP/2AlwCvgAPAB8AAEUiJiY1NDY2MzIWFhUUBgYnMjY2NTQmJiMiBgYVFBYWAUpsdy8wd2trdzAvd2xPUh4fUk5OUh8eUgpQnXNzoFVUoXN2nU1HPH1gXYFDQ4BeXX0/AP//ADj/9gJcA6QGJgBGAAAABwMjALkAAP//ADj/9gJcA5YGJgBGAAAABwMnAMIAAP//ADj/9gJcA50GJgBGAAAABgMlbgD//wA4//YCXAOCBiYARgAAAAcDIADVAAD//wA4//YCXAOkBiYARgAAAAcDIgC9AAD//wA4//YCXAOYBiYARgAAAAcDJAC/AAD//wA4//YCXANnBiYARgAAAAcDKgDCAAAABAA4/4sCXAMgAAMABwAXACcAAGUnARcBJxMXAyImJjU0NjYzMhYWFRQGBicyNjY1NCYmIyIGBhUUFhYBMTsBCTz+XzvQPCFsdy8wd2trdzAvd2xPUh4fUk5OUh8eUs4cAjYa/IUcAb0a/qxQnXNzoFVUoXN2nU1HPH1gXYFDQ4BeXX0/AAAFADj/iwJcA6QAAwAHAAsAGwArAABlJwEXAScTFwMnNxcDIiYmNTQ2NjMyFhYVFAYGJzI2NjU0JiYjIgYGFRQWFgExOwEJPP5fO9A8hBfaGnpsdy8wd2trdzAvd2xPUh4fUk5OUh8eUs4cAjYa/IUcAb0aAb44ZEX8l1Cdc3OgVVShc3adTUc8fWBdgUNDgF5dfT///wA4//YCXAObBiYARgAAAAcDKQC7AAAAAgA1//YDbQK9ABsALgAARSImJjU0PgIzMhYWFyEVIRUhFSEVIRUhDgInMj4CNxEuAyMiBgYVFBYWAT5rcysYO2dPEzQ0FAGg/q8BFf7rAVH+ZRU3NQkJISglDQ0nJyEJTlIfHVMKUp91W4VXKgIFA0jnR/VJAgUCSAECAwECKAEDAgI5fWVjfjsAAgBUAAACLwKzAAwAFQAAcxEzMhYWFRQGBiMjFREzMjY1NCYjI1T9TGIwMGJMra1KQkJKrQKzMWNMS2k36AEuVk9QSgACAFQAAAIwArgADgAXAABzETMVMzIWFhUUBgYjIxU1MzI2NTQmIyNUUK1MYzAwY0ytrUpDQ0qtArhwMWJMTGw6d8VYTExHAAACADj/bgJcAr4AFAAkAABFJwYGIyImJjU0NjYzMhYWFRQGBxcnMjY2NTQmJiMiBgYVFBYWAfRYECsXbHcvMHdra3cwMUFV9U9SHh9STk5SHx5SkpEEBU+ddHOgVVShc3mcJoqsPH1gXYFDQ4BeXn0+AAACAFQAAAI5ArMADgAYAABzESEyFhYVFAYHEyMDIxERMzI2NjU0JiMjVAEBSWMyPUGEWXrCsjM9GkRHsQKzLF1JTGgV/ugBB/75AU0mQypHRgD//wBUAAACOQOkBiYAVQAAAAcDIwCvAAD//wBUAAACOQOdBiYAVQAAAAcDJgCoAAAAAwBU/uICOQKzAA4AGAAcAABzESEyFhYVFAYHEyMDIxERMzI2NjU0JiMjEzczB1QBAUljMj1BhFl6wrIzPRpER7FQKU0yArMsXUlMaBX+6AEH/vkBTSZDKkdG/HXQ0AAAAQAw//cB7wK/ADMAAEUiJiYnNx4CMzI2NjU0JiYnLgM1NDY2MzIWFhcHLgIjIgYGFRQWFhceAxUUBgYBER5QTx4IHU1LGjFAIB1DODZQNho3ZUMeTUsbBx1MRhUwQiIhSjw0SzEXNmQJBwsEQgMIBh08LyYtGwsLHCtCMUNSJgcJBUMEBwYYMSYsLhoODBwpPS1MXiv//wAw//cB7wOkBiYAWQAAAAcDIwCXAAD//wAw//cB7wOdBiYAWQAAAAcDJgCWAAD//wAw/yYB7wK/BiYAWQAAAAcDHgC+AAD//wAw//cB7wOaBiYAWQAAAAYDJTb9AAIAMP7iAe8CvwADADcAAFM3MwcDIiYmJzceAjMyNjY1NCYmJy4DNTQ2NjMyFhYXBy4CIyIGBhUUFhYXHgMVFAYGzyhOMgIeUE8eCB1NSxoxQCAdQzg2UDYaN2VDHk1LGwcdTEYVMEIiIUo8NEsxFzZk/uLQ0AEVBwsEQgMIBh08LyYtGwsLHCtCMUNSJgcJBUMEBwYYMSYsLhoODBwpPS1MXisAAQANAAACAQKzAAcAAHMRIzUhFSMR4NMB9NECa0hI/ZUAAAIADwAAAgMCswADAAsAAFM1IRUDESM1IRUjEUEBk/LTAfTRASpERP7WAmtISP2V//8ADQAAAgEDnQYmAF8AAAAHAyYAhAAA//8ADf8mAgECswYmAF8AAAAHAx4ArgAAAAIADf7iAgECswADAAsAAFM3MwcDESM1IRUjEcwpTTIw0wH00f7i0NABHgJrSEj9lQAAAQBP//YCNgKzABMAAEUiJiY1ETMRFBYzMjY1ETMRFAYGAUBMbDlQVUxQVlA5bgosYVAB4P4eT0VFTwHi/iBPYiz//wBP//YCNgOkBiYAZAAAAAcDIwC6AAD//wBP//YCNgOWBiYAZAAAAAcDJwC7AAD//wBP//YCNgOdBiYAZAAAAAYDJWYA//8AT//2AjYDggYmAGQAAAAHAyAAzgAA//8AT//2AjYDpAYmAGQAAAAHAyIAuQAA//8AT//2AjYDmAYmAGQAAAAHAyQAwgAA//8AT//2AjYDZwYmAGQAAAAHAyoAvgAA//8AT/8xAjYCswYmAGQAAAAGAx9QAP//AE//9gI2A7gGJgBkAAAABwMoAMAAQ///AE//9gI2A5sGJgBkAAAABwMpALUAAAABABgAAAIvArMABwAAcwMzEzMTMwPMtFOdN51TswKz/ZQCbP1NAAEAHgAAA1oCswAPAABzAzMTMxMzEzMTMwMjAzMDqYtTdByMXowcdFOMkIkOiQKz/ZMCaP2YAm39TQJu/ZL//wAeAAADWgOkBiYAcAAAAAcDIwFAAAD//wAeAAADWgOaBiYAcAAAAAcDJQDg//3//wAeAAADWgOCBiYAcAAAAAcDIAFHAAD//wAeAAADWgOkBiYAcAAAAAcDIgE2AAAAAQASAAACHQKzAAsAAHMTAzMTEzMDEyMDAxLV1VusrlbU1FurrwFSAWH+2wEl/qL+qwEc/uQAAQAKAAACEQKzAAgAAHMRAzMTEzMDEebcWqmqWtsBIgGR/r8BQf5v/t7//wAKAAACEQOkBiYAdgAAAAcDIwCaAAD//wAKAAACEQOdBiYAdgAAAAYDJTIA//8ACgAAAhEDggYmAHYAAAAHAyAAmAAA//8ACgAAAhEDpAYmAHYAAAAHAyIAggAAAAEAK///Ae0CswALAABXNQE1ITUhFQEVIRUrAWX+mwHC/poBZgFbAf0VR1v+AxRI//8AK///Ae0DpAYmAHsAAAAHAyMAjAAA//8AK///Ae0DnQYmAHsAAAAHAyYAjwAA//8AK///Ae0DeAYmAHsAAAAHAyEAlAAA//8AFwAAAj0EPAQnAycAn//eACcDFQCwAVcABgABAAD//wAHAAACDgOTBCcDHACEAMQABgB2/QAAAgAo//YB4wH+ACgANAAAVyImNTQ2Njc3NTQmIyIGBgcnPgIzMhYWFRUWFhcHIiYmJyYmJw4CJzI2Njc1BwYGFRQWtUVIIkUzmi0sGUVEGgQYREofOUghAh8YAw4aFwsNFwsTO0MUGzo0EZEtJyYKTksxPiEEDyszKgQGAzsFCgcjRzf9FhQDPQIFAwUOCggSDUEKDgajDgQsKSowAP//ACj/9gHjAuUGJgCBAAAABgMWXAD//wAo//YB4wLbBiYAgQAAAAYDGngF//8AKP/2AeMC3AYmAIEAAAAGAxhxAP//ACj/9gHjAsgGJgCBAAAABgMTdAD//wAo//YB4wLlBiYAgQAAAAYDFXoA//8AKP/2AeMCrAYmAIEAAAAGAx19AP//ACj/MQHjAf4GJgCBAAAABgMfeAD//wAo//YB4wLtBiYAgQAAAAcDGwCFAAD//wAo//YB4wOcBiYAgQAAACYDG3wAAAcDFgBqALf//wAo//YB4wLPBiYAgQAAAAYDHGkAAAMAKP/2AvcB/gAyAEEASAAAVyImNTQ2Njc3NTQmIyIGBgcnPgIzMhYXNjYzMhYVByEUFjMyNjY3Fw4CIyImJw4CJzI+AjcmJjUHBgYVFBYlMzQmIyIGsENFJ1A9gCwpG0ZEGQMaRkkcM0MQG1AxZGYF/rg5SRxDQRcCGERJHjRIFyRGSh4YNzImCAoIjyspJQEO/ztBQEMKUEk4PR0GCykuKgMEA0YDBwUjJCYhb3s7TU8DBAI/BAgFHBkQGA1ECQwLAxpWJgwDKCsrLN5YSEoA//8AKP/2AvcC5QYmAIwAAAAHAxYBCAAAAAIAR//2Ad0CzQASACIAAFciJiYnETMVPgIzMhYWFRQGBicyNjY1NCYmIyIGBgcRFhbwFj0+GE4QMDcZRFEjK2dcREMXFDErGDQtDxU3CgMGAgLM8QgPCzNvWmR1M0YpWEVAUCYJDQb+pQIDAAEAM//2AYwB/gAhAABFIiYmNTQ2NjMyFhYXBy4CIyIGBhUUFhYzMjY2NxcOAgEBT1olKVxKETE0EwMRLCoOOT8ZFj49DistEQIUNDIKNXZhW28yBQcDQAIEAyRPQ0lXJgMEAUADBgX//wAz//YBjALlBiYAjwAAAAYDFmQA//8AM//2AYwC3AYmAI8AAAAGAxlrAP//ADP/JgGMAf4GJgCPAAAABwMeAIsAAP//ADP/9gGMAtwGJgCPAAAABgMYZQD//wAz//YBjAK4BiYAjwAAAAcDFACEAAAAAgAx//YBygLNABYAKAAAVyIuAzU0NjYzMhYWFzUzESM1DgInMjY2NxEuAiMiBgYVFB4C5h42LSISKlxMEy4rDU5NEDM5ERo1Lg8MKi0SMzoZEh8oCg0gOVpAWXU6BAYD3P0zIQkUDkYMEQcBTwIFBCxXQTxJJw4AAwAq//cB8gLmABgAJwArAABFIiY1NDY2MzIWFhcuAyc3HgIVFAYGJzI2NjUuAiMiBgYVFBYDJyUXAQpqdjBeRBs9ORMDI0p4WQ9+rVkvZlM1QSASNzsbKzweRyQjAQYjCXJuQWE2DBAILFFFOhY6GF+Va4GfSUcxc2MIEAsnQSlJUAHIMLAxAAMAMf/2An0CzQADABoALAAAQTczBwEiLgM1NDY2MzIWFhc1MxEjNQ4CJzI2NjcRLgIjIgYGFRQeAgIHKU0y/pseNi0iEipcTBMuKw1OTRAzOREaNS4PDCotEjM6GRIfKAHb0ND+Gw0gOVpAWXU6BAYD3P0zIQkUDkYMEQcBTwIFBCxXQTxJJw4AAAMAMf/2Ad4CzQADABoALAAAUzUhFQMiLgM1NDY2MzIWFhc1MxEjNQ4CJzI2NjcRLgIjIgYGFRQeArkBJfgeNi0iEipcTBMuKw1OTRAzOREaNS4PDCotEjM6GRIfKAJuRET9iA0gOVpAWXU6BAYD3P0zIQkUDkYMEQcBTwIFBCxXQTxJJw4AAgAx//YBzQH+ABgAIAAAVyImJjU0NjYzMhYVByEWFjMyNjY3Fw4CAzM0JiMiBgb5S1cmNF5AZGYE/rcBOEkcQ0IXAhhFSJf/O0EqOh8KOnJVX3M1b3s7TlADBAI9BAgFASJcSSFIAP//ADH/9gHNAuUGJgCZAAAABgMWdgD//wAx//YBzQLWBiYAmQAAAAYDGnwA//8AMf/2Ac0C3AYmAJkAAAAGAxl4AP//ADH/9gHNAtwGJgCZAAAABwMYAIIAAP//ADH/9gHNAsgGJgCZAAAABwMTAIMAAP//ADH/9gHNArgGJgCZAAAABwMUAIcAAP//ADH/9gHNAuYGJgCZAAAABgMVegH//wAx//YBzQKsBiYAmQAAAAcDHQCIAAD//wAx/zQBzQH+BiYAmQAAAAYDH04DAAEAHgAAAUoC1wAaAABzESM1MzU0NjYzMhYWFwcmJiMiBgYVFTMVIxFdPz8aPDEMKigIARIzEBwgDZCQAbFDLEhQHwIDAkEBARMyLStD/k8AAwAx/xUB8AH+ADUASQBVAABFIiYmNTQ2NjcmJjU0NjY3LgI1NDY2MzIWFzcVJxYWFRQGBiMiJicGBhUUHgIzMhYWFRQGJzI2NTQmJiMiLgIjDgIVFBYWEzI2NTQmIyIGFRQWAQlOXysSIxoNDwsQBxUjFi9VNxs8EZVeDhMsVkEHIQgGDAcXMCpIViV2aUpGFzYtCSAiGwUUGQoYPSA+NDQ+OjMz6xtCOR0pIxMKJRcHHB8NCiM8Lj5LIggFBEICDi4mQUoeAwEOJAcPEQoDGD88VUtCKjAlIwsBAQIPGRsTISgSAZExOjoyMjo6MQD//wAx/xUB8ALWBiYApAAAAAcDGgCCAAD//wAx/xUB8ALcBiYApAAAAAcDGACEAAAABAAx/xUB8AMdAAMAOQBNAFkAAFM3MwcDIiYmNTQ2NjcmJjU0NjY3LgI1NDY2MzIWFzcVJxYWFRQGBiMiJicGBhUUHgIzMhYWFRQGJzI2NTQmJiMiLgIjDgIVFBYWEzI2NTQmIyIGFRQWvzJEKQNOXysSIxoNDwsQBxUjFi9VNxs8EZVeDhMsVkEHIQgGDAcXMCpIViV2aUpGFzYtCSAiGwUUGQoYPSA+NDQ+OjMzAk3Q0PzIG0I5HSkjEwolFwccHw0KIzwuPksiCAUEQgIOLiZBSh4DAQ4kBw8RCgMYPzxVS0IqMCUjCwEBAg8ZGxMhKBIBkTE6OjIyOjoxAP//ADH/FQHwArgGJgCkAAAABwMUAI4AAAABAEgAAAHXAs0AGAAAcxEzFT4CMzIeAhURIxE0JiYjIgYGBxFITRIzOho0QiUOTg8sLhk1Lg8CzfQIEQwbO11C/vcBBkFOIwkOBv5lAAACAAoAAAHXAs0AAwAcAABTNSEVAxEzFT4CMzIeAhURIxE0JiYjIgYGBxEKASXnTRIzOho0QiUOTg8sLhk1Lg8CQUVF/b8CzfQIEQwbO11C/vcBBkFOIwkOBv5l//8ASAAAAdcDkQYmAKkAAAAHAxgAiQC1AAIASAAAAJUCvAADAAcAAHMRMxEDNTMVSE1NTQH0/gwCYlpaAAEASAAAAJUB9AADAABzETMRSE0B9P4M//8AJgAAARoC5QYmAK0AAAAGAxYNAP///9oAAAEEAtYGJgCtAAAABgMa6wD////WAAABAgLcBiYArQAAAAYDGOkA////9wAAAQsCyAYmAK0AAAAGAxPtAP///8QAAAC5AuUGJgCtAAAABgMVxgD////kAAAA+AKsBiYArQAAAAYDHfIA//8ABP8xALECvAQnAx//RgAAAgYArAAA////0gAAAQ8CzwYmAK0AAAAGAxzvAAAC/9D/IQCWArwADQARAABHJz4DNREzERQOAhM1MxURHyYvGQpODyVBJ07fPBYjJDAkAeb+GS5DNC0DJ1paAAH/0P8hAJYB9AAMAABHJz4CNREzERQOAhEfMjQSTg8lQd88Hiw5LgHm/hkuQzQt////0P8hAQMC3AYmALcAAAAGAxjqAAABAEgAAAHPAs0ADAAAcxEzETc3MwcTIycHFUhNTYxZoalZkk8Czf5aA8rn/vPmBOIAAAIASP7iAc8CzQADABAAAFM3MwcDETMRNzczBxMjJwcVXilNMlpNTYxZoalZkk/+4tDQAR4Czf5aA8rn/vPmBOIAAAEATgAAAJsCzQADAABzETMRTk0Czf0z//8AMwAAAScDsQYmALsAAAAHAxYAGgDMAAIATgAAAU8CzQADAAcAAFM3MwcDETMR2SlNMs9NAdvQ0P4lAs39MwACACH+4gCbAs0AAwAHAABzETMRAzczB05NeilNMgLN/TP+4tDQAAIACQAAATACzQADAAcAAHcnJRcDETMRMCcBACe9TeY2szb+ZwLN/TMAAAEASAAAAwEB/gAtAABzETMVPgIzMhYXPgIzMh4CFREjETQmJiMiBgYHFhYVESMRNCYmIyIGBgcRSE0QMDcZMj0TFDpDIDNCJQ9NDywtGjUtDgcFTQ4tLRkzKg4B9CMKFA8YGwsYEBo6XUT+9wEGQU4jCxEIGk0p/vwBAkRPIwsRCP5sAAEASAAAAdgB/gAYAABzETMVPgIzMh4CFREjETQmJiMiBgYHEUhNETM6GzRCJQ9ODy0uGTUuDwH0IwoUDxs7XUL+9wEGQU4jCxEI/mwA//8ASAAAAdgC5QYmAMEAAAAHAxYAhwAA//8ASAAAAdgC3AYmAMEAAAAHAxkAiAAAAAIASP7iAdgB/gADABwAAFM3MwcDETMVPgIzMh4CFREjETQmJiMiBgYHEXgpTTJ0TREzOhs0QiUPTg8tLhk1Lg/+4tDQAR4B9CMKFA8bO11C/vcBBkFOIwsRCP5sAP//AEgAAAHYAs8GJgDBAAAABwMcAJQAAAABAEf/EgHYAf4AIAAARSc+AjURNCYmIyIGBgcRIxEzFT4CMzIWFhURFA4CATciMTISDysrGDYxEU5OEzU7GUNIHA4iP+5CHSs2KwEGPFAoCxEI/m0B9CEKEw42blb++i9CMy4AAgAy//YB3wH+AA8AHwAARSImJjU0NjYzMhYWFRQGBicyNjY1NCYmIyIGBhUUFhYBCFRdJSleT1BeKSVdVTo6Exg6NTQ7GBM6Cjp2WlZwODhwVlp2OkMpWEZFUiQkUkVGWCkA//8AMv/2Ad8C5QYmAMcAAAAGAxZ/AP//ADL/9gHfAtYGJgDHAAAABwMaAIcAAP//ADL/9gHfAtwGJgDHAAAABwMYAIMAAP//ADL/9gHfAsgGJgDHAAAABwMTAIgAAP//ADL/9gHfAuUGJgDHAAAABwMVAI4AAP//ADL/9gIYAv4GJgDHAAAABwMXAI4AAP//ADL/9gHfArcGJgDHAAAABwMdAI4ACwAEADL/kQHfAl4AAwAHABcAJwAAVycBFwEnARcDIiYmNTQ2NjMyFhYVFAYGJzI2NjU0JiYjIgYGFRQWFpI0AR40/uI0AR40qFRdJSleT1BeKSVdVTo6Exg6NTQ7GBM6bxMCuhP9RhMCuhP9qzp2WlZwODhwVlp2OkMpWEZFUiQkUkVGWCkAAAUAMv+RAd8C5QADAAcACwAbACsAAFcnARcBJwEXJSc3FwMiJiY1NDY2MzIWFhUUBgYnMjY2NTQmJiMiBgYVFBYWkjQBHjT+4jQBHjT+9BXaGntUXSUpXk9QXiklXVU6OhMYOjU0OxgTOm8TAroT/UYTAroTAzRjQ/1UOnZaVnA4OHBWWnY6QylYRkVSJCRSRUZYKf//ADL/9gHfAs8GJgDHAAAABwMcAIUAAAADADL/9gMsAf4AJAAzADoAAEUiJiY1NDY2MzIWFzY2MzIWFQchFBYzMjY2NxcOAiMiJicGBicyNjY1NCYjIgYGFRQWFiUhNCYjIgYBCVReJSlfT0FXFxpYN2VmBf64OUkbREEXAhhFSB4+ThYWUkQ6ORM/RzQ7GRQ7AQ4BADxBP0QKOnZaVnE3Lzg6LW97O01PAwQCPwQIBSwuMCpGK1dBYlYjUEREVyncWEhKAAACAEj/IwHfAf4AEwAiAABXETMVPgIzMhYWFRQGBiMiJicVEzI2NjU0JiMiBgYHERYWSE0QMTgaQFAnLWFNHz8RazY/Gjw2GDMuDxA+3QLRJAoVDzVwWWJ1MwgD3gEXKFdHZVMMEQn+sgIIAAACAEj/IwHeAs0AEwAjAABXETMVPgIzMhYWFRQGBiMiJicVEzI2NjU0JiYjIgYGBxEWFkhNETA3GURRIypkVhY7FGBBQhYUMSsYNC4PFTrdA6rxCA8LMm9bY3U0BQLaARcrWERBUCYJDQb+pAIEAAIAMf8jAccB/gARAB8AAEU1BgYjIiYmNTQ2NjMyFhYXEQMyNjcRJiYjIgYGFRQWAXkWTyZEUyYtaFgTPEEZ0SZJFBM2EUBFGjbd9AoXNHBYY3YzAwUC/S8BGRMJAV0CAytYRVxaAAEASAAAAUsB/wANAABzETMVPgI3FQ4CBxFITRM6RiMiRjsTAfRDDR8cBk8HFxoK/pL//wBCAAABSwLlBiYA1gAAAAYDFikA//8AGQAAAUsC3AYmANYAAAAGAxkqAAACAB/+4gFLAf8AAwARAABTNzMHAxEzFT4CNxUOAgcRHylNMhtNEzpGIyJGOxP+4tDQAR4B9EMNHxwGTwcXGgr+kgABAC3/9gGnAf4AMQAAVyImJic3HgIzMjY2NTQmJicuAjU0NjYzMhYWFwcuAiMiBgYVFBYWFx4CFRQGBuQXQUAZBBk/PBIpNhwVOTY4SyQ0Uy0cQ0AXAhhAQBgeMBwUODU+SyIvVwoGCQRDAwgFDyQhGRwSCAkbNjI4QBsGCQRDBAcFDSAdFhsSCQoeNjE6RR4A//8ALf/2AacC5QYmANoAAAAGAxZYAP//AC3/9gGnAtwGJgDaAAAABgMZbgD//wAt/yYBpwH+BiYA2gAAAAcDHgCIAAD//wAt//YBpwLcBiYA2gAAAAYDGGcAAAIALf7iAacB/gADADUAAFM3MwcTIiYmJzceAjMyNjY1NCYmJy4CNTQ2NjMyFhYXBy4CIyIGBhUUFhYXHgIVFAYGaClNMjgXQUAZBBk/PBIpNhwVOTY4SyQ0Uy0cQ0AXAhhAQBgeMBwUODU+SyIvV/7i0NABFAYJBEMDCAUPJCEZHBIICRs2MjhAGwYJBEMEBwUNIB0WGxIJCh42MTpFHgABAEj/9gIdAtcAQgAARSImJic3HgIzMjY1NCYmJy4CNTQ2Njc+AjU0JiMiBgYVESMRND4CMzIWFhUUBgYHDgIVFBYWFx4CFRQGBgFVEzEvEQMSLywNSjQRLywqLxQRIxkaHAoyQSs1GE0XL0s0RVcoEiQcGBoKDickLzkZKFcKBQcDQQIFAzYzGyQfFRQhJxsZIxkLCxcdFCwjFTQx/ekCIDNHKhMePzQkMB8NCw8OCgoRFxIXKjUpRFIlAAEAGv/1AVICjQAbAABXIiYmNREjNTM1MxUzFSMVFBYWMzI2NjcXDgLsND0aR0dNnZ0JHiAKICENBQ4mJQsgT0gBBUOZmUPuNTsYAgMBQQIFBAACABr/9QFSAo0AAwAfAAB3NSEVAyImJjURIzUzNTMVMxUjFRQWFjMyNjY3Fw4CLgEHSTQ9GkdHTZ2dCR4gCiAhDQUOJiX7PT3++iBPSAEFQ5mZQ+41OxgCAwFBAgUEAAACABr/9QG+ArgAAwAfAABBNTMVAyImJjURIzUzNTMVMxUjFRQWFjMyNjY3Fw4CAXJM0jQ9GkdHTZ2dCR4gCiAhDQUOJiUBzOzs/ikgT0gBBUOZmUPuNTsYAgMBQQIFBP//ABr/JgFSAo0GJgDhAAAABgMeZQAAAgAa/uIBUgKNAAMAHwAAUzczBxMiJiY1ESM1MzUzFTMVIxUUFhYzMjY2NxcOAmApTTJIND0aR0dNnZ0JHiAKICENBQ4mJf7i0NABEyBPSAEFQ5mZQ+41OxgCAwFBAgUEAAABAEP/9gHMAfQAFQAAVyImJjURMxEUFhYzMjY3ETMRIzUGBuBARBlNDSwsLEgWTU0gSwo0blcBBf77Qk4jGAwBlP4MIxIbAP//AEP/9gHMAuUGJgDmAAAABwMWAIEAAP//AEP/9gHMAtYGJgDmAAAABwMaAIEAAP//AEP/9gHMAtwGJgDmAAAABgMYewD//wBD//YBzALIBiYA5gAAAAcDEwCPAAD//wBD//YBzALlBiYA5gAAAAYDFXMA//8AQ//2AikC/gYmAOYAAAAHAxcAnwAA//8AQ//2AcwCrAYmAOYAAAAHAx0AjAAA//8AKP/2AeMDTQYmAIEAAAAmAxhp4gAGAxxifv//ADH/9gHNA00EJgMYf+IAJgMcen4ABgCZAAD//wAy//YB3wNNBiYAxwAAACcDGACA/+IABgMcdX7//wAZ/yMBzALPBCYDHGwAAgYA/AAA//8AQ/8xAeIB9AQmAx93AAIGAOYAAP//AEP/9gHMAu0GJgDmAAAABwMbAI8AAP//AEP/9gHMAs8GJgDmAAAABwMcAIcAAAABABgAAAHKAfQABwAAcwMzEzMTMwOkjFRyJnZQjAH0/k8Bsf4MAAEAHwAAAtwB9AAOAABzAzMTMxMzEzMTMwMjAwOVdk5iEXVRdRFiTnaBaGcB9P5PAaf+WQGx/gwBg/59//8AHwAAAtwC5QYmAPYAAAAHAxYA+wAA//8AHwAAAtwC3AYmAPYAAAAHAxgA/AAA//8AHwAAAtwCyAYmAPYAAAAHAxMBAQAA//8AHwAAAtwC5QYmAPYAAAAHAxUA8AAAAAEAFgAAAa8B9AALAABzNyczFzczBxcjJwcWm5tVd3hVnZ1VeHf6+sLC+PzBwQABABn/IwHMAfQACQAAVzcjAzMTMxMzA7BBS41OeiJ7Ts7d3QH0/k8Bsf0v//8AGf8jAcwC5QYmAPwAAAAGAxZ/AP//ABn/IwHMAtwGJgD8AAAABgMYcgD//wAZ/yMBzALIBiYA/AAAAAYDE3QA//8AGf8jAcwC5QYmAPwAAAAGAxVpAAABACoAAAGdAfQACQAAczUBITUhFQEhFSoBFP7sAXP+7AEURgFoRkb+mEYA//8AKgAAAZ0C5QYmAQEAAAAGAxZXAP//ACoAAAGdAtwGJgEBAAAABgMZYgD//wAqAAABnQK4BiYBAQAAAAYDFGwAAAIANQFiAU4CkwAWACwAAEEuAic1NCYHIgYHJzY2MzIWFRUWFhcHIiY1NDY3NxcHBgYVFBYzMjY3FwYGAUkaJhcEFxoTRRoEHEMdODYFEAjEJi8xMWoBYRYSEhEZOxUBF0QBYgIKFBKeFxEBBQIxBwksOIkHBwIzMykqKwMGLwcBERQTFA8IKRAVAAIANQFjAUkCkwALABcAAFMiJjU0NjMyFhUUBicyNjU0JiMiBhUUFsBFRkZFREVFRCUcHCUlHx8BY0tPTkhITk9LPysvMCgoMC8rAAADABb//AISAgIADAAQACQAAEUiJiY1ETcRFB4CMwUTMwMDNT4CMzMyNjY3FQYGJwcjByYGAglERxlOCBMhGv5ZIEscmw0sOB7rGzIpDA9QOw2+Fx1LBBpEQAEoAf7XGyQUCD8Bv/5BAaRBBAYFBQYDQQcKBAMGBwgAAAIAKAAAAfcBrQAWABoAAHcmJjU0PgIzMhYXByYmIyIGBhUUFhcHNSEVpygnJEBVMSVFHCsVKxouRykdH7kBzw4tWjMyVD0iFBI7DgwpRy4lQyM9R0cAAQBgAAAArQLNAAMAAHMRMxFgTQLN/TMAAwBgAAABOwLNAAMABwASAABzNTMVIxEzETM1Mh4CFRQOAq16x016BggEAgIECEdHAs39M0cFCQ0ICA4JBf//ACQAAADpA8MGJgEJAAAABwL5ABABIv//ACQAAAE7A8MGJgEKAAAABwL5ABABIv//ACT+8wDpAs0GJgEJAAAABwL5ABD9Bv//ACT+8wE7As0GJgEKAAAABwL5ABD9Bv//AAsAAAD7A2MGJgEJAAAABwMR//MA1P//AAsAAAE7A2MGJgEKAAAABwMR//MA1P//ABAAAAD9A6UGJgEJAAAABwL2//UBCP//ABAAAAE7A6UGJgEKAAAABwL2//UBCAABACgAAALFAfQAFwAAYSImJjU0PgI3Fw4CFRQeAjMhETMRAVFjhEIHCggBTAMLChczVD0BJk4uXkkYODUnBw4QOEAdJTYjEAGt/gwAAwAoAAADRQH0AAMAGwAmAABhNTMVISImJjU0PgI3Fw4CFRQeAjMhETMRMzUyHgIVFA4CAsVs/iBjhEIHCggBTAMLChczVD0BJk5sBggEAgIECEdHLl5JGDg1JwcOEDhAHSU2IxABrf4MRwUJDQgIDgkFAAAE/+wAAAE6AfQAAwANABQAHwAAczUzFSEiLgI1NDY2MxU1MwcRMxEzNTIeAhUUDgK6bP7aBggEAgMJCJAkTmwGCAQCAgQIR0cFCQ4ICw8JR0cdAcr+DEcFCQ0ICA4JBQAE/+wAAAE6AfQAAwAOABgAHwAAczUzFTE1Mh4CFRQOAiEiLgI1NDY2MxU1MwcRMxG6bAYIBAICBAj+1AYIBAIDCQiQJE5HR0cFCQ0ICA4JBQUJDggLDwlHRx0Byv4MAAAC/+wAAAC6AfQABgAQAABxNTMHETMRIyIuAjU0NjYzkCROugYIBAIDCQhHHQHK/gwFCQ4ICw8JAAL/7AAAALoB9AAGABAAAHE1MwcRMxEjIi4CNTQ2NjOQJE66BggEAgMJCEcdAcr+DAUJDggLDwn//wAo/0wCxQH0BiYBEwAAAAcCjQE8/Or//wAo/0wDRQH0BiYBFAAAAAcCjQE8/Or////s/0wBOgH0BiYBFQAAAAcCjQBY/Or////s/0wAugH0BiYBFwAAAAcCjQBY/Or//wAo/s4CxQH0BiYBEwAAAAcClAD5/77//wAo/s4DRQH0BiYBFAAAAAcClAD5/77////s/uwBOgH0BiYBFgAAAAYClBbc////7P7OAP4B9AYmARgAAAAGApQVvv///+wAAAE6AfQGBgEVAAD////sAAAAugH0BgYBFwAA//8AKAAAAsUCRwYmARMAAAAHApEBB/+f//8AKAAAA0UCRwYmARQAAAAHApEBB/+f////7AAAAToCqAYmARYAAAAGApEjAP///+wAAAD/AqgGJgEYAAAABgKRIwD//wAoAAACxQLGBiYBEwAAAAcClQD5/5///wAoAAADRQLGBiYBFAAAAAcClQD5/5/////sAAABOgMnBiYBFgAAAAYClRUA////7AAAAP4DJwYmARgAAAAGApUVAP//ACgAAALFAqsGJgETAAAABwL1AOUAMP//ACgAAANFAqsGJgEUAAAABwL1AOUAMP///+wAAAE6AwwGJgEVAAAABwL1AAEAkf///+wAAAEJAwwGJgEYAAAABwL1AAEAkQACACj+wgIIAfQAAwAqAABFNTMVByImJjU0NjYzMzU0JiMiBgcnNjYzMhYWFREjIgYVFBYzMjY3FwYGAVJDgElrOTlrSqVSUxpiNgkpYi5MbTvyU01NUhIvIg0ZOqdPT5ctWD4+Vy3jQUEJCEAKDy9aQf7WPz08PwQEQwUHAAAEACj+wgKIAfQAAwAOADUAOQAARTUzFTc1Mh4CFRQOAgEiJiY1NDY2MzM1NCYjIgYHJzY2MzIWFhURIyIGFRQWMzI2NxcGBhM1MxUBUkPfBggEAgIECP6bSWs5OWtKpVJTGmI2CSliLkxtO/JTTU1SEi8iDRk61mynT0+nRwUJDQgIDgkF/sItWD4+Vy3jQUEJCEAKDy9aQf7WPz08PwQEQwUHAT5HR////+z/TAJvAfQGJgE5AAAABwKNAMD86v///+z/TAHvAfQGJgE6AAAABwKNAMD86gAEACj+wgIIAfQAAwAHAAsAMgAARTMVIzczFSMnMxUjByImJjU0NjYzMzU0JiMiBgcnNjYzMhYWFREjIgYVFBYzMjY3FwYGAUotLSkxMVcyMgdJazk5a0qlUlMaYjYJKWIuTG078lNNTVISLyINGTqJNok5OTnPLVg+Plct40FBCQhACg8vWkH+1j89PD8EBEMFBwAABgAo/sICiAH0AAMABwALABYAPQBBAABFMxUjNzMVIyczFSMlNTIeAhUUDgIBIiYmNTQ2NjMzNTQmIyIGByc2NjMyFhYVESMiBhUUFjMyNjcXBgYTNTMVAUotLSkxMVcyMgFYBggEAgIECP6bSWs5OWtKpVJTGmI2CSliLkxtO/JTTU1SEi8iDRk61myJNok5OTlvRwUJDQgIDgkF/sItWD4+Vy3jQUEJCEAKDy9aQf7WPz08PwQEQwUHAT5HRwD////s/s4CbwH0BiYBOQAAAAYClH2+////7P7OAe8B9AYmAToAAAAGApR9vgACACj+wgIIAfQAFwAoAABFFwYGIyImJjU0NjYzMxUjIgYVFBYzMjYBJzY2MzIWFhURIxE0JiMiBgGqDC9PI0lrOTlrSqWlU01NUhlI/u4JKWIuTG07TVJTGmLqPwoLLVg+PlctRz89PD8GAoxACg8vWkH+1gEqQUEJAAQAKP7CAogB9AADABsALAA3AABhNTMVBxcGBiMiJiY1NDY2MzMVIyIGFRQWMzI2ASc2NjMyFhYVESMRNCYjIgYBNTIeAhUUDgICCGzKDC9PI0lrOTlrSqWlU01NUhlI/u4JKWIuTG07TVJTGmIB2gYIBAICBAhHR+o/CgstWD4+Vy1HPz08PwYCjEAKDy9aQf7WASpBQQn+XUcFCQ0ICA4JBQAABP/sAAACbwH0AAMADQAhACwAAGE1MxUhIi4CNTQ2NjMVNSEHNTQmIyIGByc2NjMyFhYVETM1Mh4CFRQOAgHvbP2lBggEAgMJCAG5GFFTGmI2CSliLkxtO2wGCAQCAgQIR0cFCQ4ICw8JR0cV+EFBCQhACg8vWkH+1kcFCQ0ICA4JBQAAAv/sAAAB7wH0ABMAHQAAcTUhBzU0JiMiBgcnNjYzMhYWFREhIi4CNTQ2NjMBuRhRUxpiNgkpYi5MbTv+EQYIBAIDCQhHFfhBQQkIQAoPL1pB/tYFCQ4ICw8JAP//ACj+wgIIApcGJgE3AAAABwKNANn/2///ACj+wgKIApcGJgE4AAAABwKNANn/2////+wAAAJvApMGJgE5AAAABwKNAMD/1////+wAAAHvApMGJgE6AAAABwKNAMD/1wABACgAAAGrAfQAEAAAczUhBzU0JiYjIzUzMhYWFRUoAXVAIk1BUVFQcjxHOdpKViVHMnVl6AADACgAAAIrAfQAAwAUAB8AAGE1MxUhNSEHNTQmJiMjNTMyFhYVFTM1Mh4CFRQOAgGrbP4RAXVAIk1BUVFQcjxsBggEAgIECEdHRznaSlYlRzJ1ZehHBQkNCAgOCQX//wAoAAABqwKoBiYBPwAAAAYCjWDs//8AKAAAAisCqAYmAUAAAAAGAo1g7P//ACgAAAGrAwwGJgE/AAAABwL1AEEAkf//ACgAAAIrAwwGJgFAAAAABwL1AEEAkQAB/9H/IwDAAfQAEAAAVyImJzcWFjMyNjURMxEUBgYJDR0OCQ4YCS86Ti9S3QMBRwEDRz8CBP38PV0zAAAD/9H/IwFAAfQAAwAUAB8AAHM1MxUFIiYnNxYWMzI2NREzERQGBjc1Mh4CFRQOAqyA/t0NHQ4JDhgJLzpOL1LtBggEAgIECEdH3QMBRwEDRz8CBP38PV0z3UcFCQ0ICA4JBQD////R/yMAwAKoBiYBRQAAAAYCjV7s////0f8jAUACqAYmAUYAAAAGAo1e7P///9H/IwEPAwwGJgFFAAAABwL1AAcAkf///9H/IwFAAwwGJgFGAAAABwL1AAcAkf///9H/IwEEAycGJgFFAAAABgKVGwD////R/yMBQAMnBiYBRgAAAAYClRsAAAMAKP8IBHMB9AAcACoAPwAARSImJjU0PgI3Fw4CFRQWFjMyNjY1ETMRFAYGNzUzMjY2NTUzFRQGBiMzIiYnNxYWMzMHNTQmJic3HgIVEQFBT4BKBwsOBk0LEQkzXDw8Vi5OSXrDcCIkDk4hRzrTIkEfMxclE7IeCA0ITAcOCfg6aEMVRVVXJwxFdVMULkcpJkQuAan+V0ZkNfhHFDw68fFOXCcaHDUTESDvEkJTKg0jVk0Y/uoABQAo/wgE8wH0AAMAIAAuAEMATgAAYTUzFQUiJiY1ND4CNxcOAhUUFhYzMjY2NREzERQGBjc1MzI2NjU1MxUUBgYjMyImJzcWFjMzBzU0JiYnNx4CFREzNTIeAhUUDgIEc2z8Yk+ASgcLDgZNCxEJM1w8PFYuTkl6w3AiJA5OIUc60yJBHzMXJROyHggNCEwHDglsBggEAgIECEdH+DpoQxVFVVcnDEV1UxQuRykmRC4Bqf5XRmQ1+EcUPDrx8U5cJxocNRMRIO8SQlMqDSNWTRj+6kcFCQ0ICA4JBQAABv/sAAADcAH0AAMADQAiACkANwBCAABhNTMVISIuAjU0NjYzBSImJzcWFjMzBzU0JiYnNx4CFREhNTMHETMRMTUzMjY2NTUzFRQGBiMhNTIeAhUUDgIC8Gz8pAYIBAIDCQgCDiJBHjMXJBOyHgcNCUwHDgr9EJIUTXEiIw5OIUY6AiAGCAQCAgQIR0cFCQ4ICw8JRxocNRMRIO8SQlMqDSNWTRj+6kcUAV3+cEcUPDrx8U5cJ0cFCQ0ICA4JBQAABP/sAAAC8AH0ABQAGwApADMAAGEiJic3FhYzMwc1NCYmJzceAhURITUzBxEzETE1MzI2NjU1MxUUBgYjISIuAjU0NjYzAg4iQR4zFyQTsh4HDQlMBw4K/RCSFE1xIiMOTiFGOv7EBggEAgMJCBocNRMRIO8SQlMqDSNWTRj+6kcUAV3+cEcUPDrx8U5cJwUJDggLDwn//wAo/wgEcwMnBiYBTQAAAAcClQK7AAD//wAo/wgE8wMnBiYBTgAAAAcClQK7AAD////sAAADcAMnBiYBTwAAAAcClQE4AAD////sAAAC8AMnBiYBUAAAAAcClQE4AAAAAgAo/wgEWwH0ABwAOAAARSImJjU0PgI3Fw4CFRQWFjMyNjY1ETMRFAYGNzUhBzU0JiYjIg4DByc+BDMyHgIVFQFBT4BKBwsOBk0LEQkzXDw8Vi5OSXrDAgdII0U0LEtANy4TGhkzOENQMkdbMxT4OmhDFUVVVycMRXVTFC5HKSZELgIN/fNGZDX4R0HrP1MqHS85OhhHHz43KhkwT1oq8QAABAAo/wgE3AH0AAMAIAA8AEcAAGE1MxUFIiYmNTQ+AjcXDgIVFBYWMzI2NjURMxEUBgY3NSEHNTQmJiMiDgMHJz4EMzIeAhUVMzUyHgIVFA4CBFtt/HlPgEoHCw4GTQsRCTNcPDxWLk5JesMCB0gjRTQsS0A3LhMaGTM4Q1AyR1szFG0GCAQCAgQIR0f4OmhDFUVVVycMRXVTFC5HKSZELgIN/fNGZDX4R0HrP1MqHS85OhhHHz43KhkwT1oq8UcFCQ0ICA4JBQAF/+wAAANpAfQAAwANACkALQA4AABhNTMVISIuAjU0NjYzFTUhBzU0JiYjIg4DByc+BDMyHgIVFSURMxEFNTIeAhUUDgIC6Wz8qwYIBAIDCQgC40gjRTQsS0A3LhMZGTM4Q1AyR1szFP2lTgJ5BggEAgIECEdHBQkOCAsPCUdHQes/UyodLzk6GEcfPjcqGTBPWirxRwGt/lNHRwUJDQgIDgkFAAP/7AAAAukB9AAbAB8AKQAAcTUhBzU0JiYjIg4DByc+BDMyHgIVFSURMxEHIi4CNTQ2NjMC40gjRTQsS0A3LhMZGTM4Q1AyR1szFP2lTtwGCAQCAwkIR0HrP1MqHS85OhhHHz43KhkwT1oq8UcBrf5TRwUJDggLDwn//wAo/wgEWwKnBiYBVQAAAAcCjQL+/+v//wAo/wgE3AKnBiYBVgAAAAcCjQL+/+v////sAAADaQKnBiYBVwAAAAcCjQGL/+v////sAAAC6QKnBiYBWAAAAAcCjQGL/+sAAgAUAAACsALNABoAHgAAczUhBzU0JiYjIg4DByc+AzMyHgIVFSURMxEUApdII0U0LEtANy4TGh9ATGA+R1szFP2mTkdB6z9TKh0vOToYRydMPiYwT1oq8UcChv16AAQAFAAAAzECzQADAB4AIgAtAABhNTMVITUhBzU0JiYjIg4DByc+AzMyHgIVFSURMxEFNTIeAhUUDgICsG389wKXSCNFNCxLQDcuExofQExgPkdbMxT9pk4CeQYIBAICBAhHR0dB6z9TKh0vOToYRydMPiYwT1oq8UcChv16R0cFCQ0ICA4JBQAF/+wAAAMBAs0AAwAeACIALAA3AABhNTMVITUhBzU0JiYjIg4DByc+AzMyHgIVFSURMxEHIi4CNTQ2NjMFNTIeAhUUDgICgWz9EwKXSCNFNCxLQDcuExofQExgPkdbMxT9pk6QBggEAgMJCALtBggEAgIECEdHR0HrP1MqHS85OhhHJ0w+JjBPWirxRwKG/XpHBQkOCAsPCUdHBQkNCAgOCQUA////7AAAApwCzQQmAV3sAAAGAzAAAP//ABQAAAKwAs0GJgFdAAAABwKNAVP/7P//ABQAAAMxAs0GJgFeAAAABwKNAVP/7P///+wAAAMBAs0GJgFfAAAABwKNAT//7P///+wAAAKcAs0EJgFd7AAAJgMwAAAABwKNAT//7AACACj+wgHhAfQAFwAuAABBIiYmNTQ2NjMzFSMiBhUUFjMyNjcXBgYDJiY1ND4CMzIWFwcmJiMiBgYVFBYXARVJazk5a0rLy1NNTVIZSDQML097NjkoRmA3HUMfGxkzFzZTMCwo/sItWD4+Vy1HPz08PwYHPwoLAUEud0M5YUgnDAtDCQoyVzk0WyMAAAIAKP7CAosB9ABJAFQAAEUXBgYjIiYmNTQ2Njc3PgQ1NRcmJiMiBgc3FRQeAzMzFSMiLgM1NT4CMzIWFhcVFA4CBw4DBw4CFRQWMzI2JTUyHgIVFA4CAaoML08jSWs5IkAtHydQSjoiKjlxNTVwOSomQ1xuPH5+TohuTyorWFcoKVZYKzBNWioKISMbAxgqG01SGEkBAQYIBAICBAjpQAoLLVg+MFI9Eg0QKDE7RSg8Px4eHh4/PCRST0EnRzJTY2MpPBceDw8eFzw7X0o4FAQPEAsCCyQ3KD1AB/BHBQkNCAgOCQUAA//sAAACkAH0ADEAOwBGAABxNTMyPgM1NRcmJiMiBgc3FRQeAzMzFSMiLgM1NT4CMzIWFhcVFA4DIyMiLgI1NDY2MwU1Mh4CFRQOAoY8blxEJio6cDU1cDkqJkNcbjyAgE6Ibk8qK1hXKClWWCsqT26IToYGCAQCAwkIAnwGCAQCAgQIRydBT1IkPD8eHh4ePzwkUk9BJ0cyU2NjKTwXHg8PHhc8KWNjUzIFCQ4ICw8JR0cFCQ0ICA4JBQAD/+wAAAH6AfQAFgAaACQAAHcmJjU0PgIzMhYXByYmIyIGBhUUFhcFNSEVISIuAjU0NjYz2TY5KEZgNx1DHxsZMxc1VC8rKf70Afr+BgYIBAIDCQgDLndDOWFIJwwLQwkKMlc5NFsjOUdHBQkOCAsPCf//ACj+wgHhAqgGJgFlAAAABwKNAPP/7P//ACj+wgKLAqgGJgFmAAAABwKNAQP/7P///+wAAAKQAqgGJgFnAAAABwKNAQX/7P///+wAAAH6AqgGJgFoAAAABwKNAQ//7P//ADYAAAOzAqgGJgF1AAAABwKNArj/7P//ADYAAAQzAqgGJgF2AAAABwKNArj/7P///+wAAAKTAqgGJgF3AAAABwKNARj/7P///+wAAAITAqgGJgF4AAAABwKNARj/7P//ADYAAAOzAycGJgF1AAAABwKVAnUAAP//ADYAAAQzAycGJgF2AAAABwKVAnUAAP///+wAAAKTAycGJgF3AAAABwKVANUAAP///+wAAAITAycGJgF4AAAABwKVANUAAAABADYAAAOzAfQAKwAAYSImJjU0PgI3Fw4CFRQeAjMhBxEXIyIGBhUUFhYzFSImJjU0NjYzMxEBX2OEQgcKCAFMAwsKFzNUPQI6NCmqOj8YGD86V2EnJ2FXzy5eSRg4NScHDhA4QB0lNiMQLQG1IhxNSkpNHDMrZVZWbzX+DAADADYAAAQzAfQAAwAvADoAAGE1MxUhIiYmNTQ+AjcXDgIVFB4CMyEHERcjIgYGFRQWFjMVIiYmNTQ2NjMzETM1Mh4CFRQOAgOzbP1AY4RCBwoIAUwDCwoXM1Q9Ajo0Kao6PxgYPzpXYScnYVfPbAYIBAICBAhHRy5eSRg4NScHDhA4QB0lNiMQLQG1IhxNSkpNHDMrZVZWbzX+DEcFCQ0ICA4JBQAABP/sAAACkwH0AAMADQAnADIAAGE1MxUhIi4CNTQ2NjMVNSEHERcjIgYGFRQWFjMVIiYmNTQ2NjMzETM1Mh4CFRQOAgITbP2BBggEAgMJCAH5NCmqOj8YGD86V2EnJ2FXz2wGCAQCAgQIR0cFCQ4ICw8JR0ctAbUiHE1KSk0cMytlVlZvNf4MRwUJDQgIDgkFAAAC/+wAAAITAfQAGQAjAABxNSEHERcjIgYGFRQWFjMVIiYmNTQ2NjMzESEiLgI1NDY2MwH5NCmqOj8YGD86V2EnJ2FXz/3tBggEAgMJCEctAbUiHE1KSk0cMytlVlZvNf4MBQkOCAsPCQAAAQAo/vYDEwH0ADMAAEEiJiY1ND4CNxcOAhUUFhYzMzI2NjURFyMiBgYVFBYWMzMVIyImJjU0NjYzMxEUBgYjAS9JeEYIDA4GTQsSCS5TN+g3TSopqjo/GBg/OoGBWGAnJ2BYz0dzQv72NmA/FUlXWiUMRHNUFy9CIyI9KgIJIhxNSkpNHEc1b1ZWbzX90kVdLgADACj+9gOTAfQAAwA3AEIAAGE1MxUBIiYmNTQ+AjcXDgIVFBYWMzMyNjY1ERcjIgYGFRQWFjMzFSMiJiY1NDY2MzMRFAYGIwE1Mh4CFRQOAgMTbP2wSXhGCAwOBk0LEgkuUzfoN00qKao6PxgYPzqBgVhgJydgWM9Hc0IBaAYIBAICBAhHR/72NmA/FUlXWiUMRHNUFy9CIyI9KgIJIhxNSkpNHEc1b1ZWbzX90kVdLgEKRwUJDQgIDgkF//8AKP72AxMCqAYmAXkAAAAHApEB4wAA//8AKP72A5MCqAYmAXoAAAAHApEB4wAA////7AAAApMCqAYmAXcAAAAHApEA4wAA////7AAAAhMCqAYmAXgAAAAHApEA4wAAAAEAKAAAAsUCzQAYAABhIiYmNTQ+AjcXDgIVFB4CMyEHETMRAVFjhEIHCggBTAMLChczVD0BSiROLl5JGDg1JwcOEDhAHSU2IxAdAqP9MwAAAwAoAAADRQLNAAMAHAAnAABhNTMVISImJjU0PgI3Fw4CFRQeAjMhBxEzETM1Mh4CFRQOAgLFbP4gY4RCBwoIAUwDCwoXM1Q9AUokTmwGCAQCAgQIR0cuXkkYODUnBw4QOEAdJTYjEB0Co/0zRwUJDQgIDgkF//8AKAAAAsUCzQYmAX8AAAAHAvkBAP9t//8AKAAAA0UCzQYmAYAAAAAHAvkBAP9tAAT/7AAAAqYC1AADAA0AKwA2AABhNTMVISIuAjU0NjYzFTUhBzU0JiYjIyc3PgI3Fw4CBwcnMzIeAhUVMzUyHgIVFA4CAiZs/W4GCAQCAwkIAfQcHTkr2jkrDBomHUEdJBkLMhTpP1EtEmwGCAQCAgQIR0cFCQ4ICw8JR0cZsjZHI1ZTFi48KycsOioVYB8rRlEl4EcFCQ0ICA4JBQAAAv/sAAACJgLUAB0AJwAAcTUhBzU0JiYjIyc3PgI3Fw4CBwcnMzIeAhUVISIuAjU0NjYzAfQcHTkr2jkrDBomHUEdJBkLMhTpP1EtEv3aBggEAgMJCEcZsjZHI1ZTFi48KycsOioVYB8rRlEl4AUJDggLDwkAAAEAKAAAAsUC1AAuAABhIiYmNTQ+AjcXDgMVFB4CMyE1NCYmIyMnNz4CNxcOAgcHMzIeAhUVAVFjhEIGCAkDTAMJBwUXM1Q9ASYdOSvbOCsMGiYdQB0kGAsjxj9RLRIuXkkSMTMuDw4SLC4qDyU2IxCZNkcjVlMWLjwrJyw6KhVBK0ZRJeAAAwAoAAADRQLUAAMAMgA9AABhNTMVISImJjU0PgI3Fw4DFRQeAjMhNTQmJiMjJzc+AjcXDgIHBzMyHgIVFTM1Mh4CFRQOAgLFbP4gY4RCBggJA0wDCQcFFzNUPQEmHTkr2zgrDBomHUAdJBgLI8Y/US0SbAYIBAICBAhHRy5eSRIxMy4PDhIsLioPJTYjEJk2RyNWUxYuPCsnLDoqFUErRlEl4EcFCQ0ICA4JBQD////sAAACpgLUBgYBgwAA////7AAAAiYC1AYGAYQAAAACACgAAALFAwMACgA5AABTJz4CNxcOAxMiJiY1ND4CNxcOAxUUHgIzITU0JiYjIyc3PgI3Fw4CBwczMh4CFRXNIhYiKB8uFSEfInBjhEIGCAkDTAMJBwUXM1Q9ASYdOSvbOCsMGiYdQB0kGAsjxj9RLRIB9TMrQUItHCA0NT794C5eSRIxMy4PDhIsLioPJTYjEJk2RyNWUxYuPCsnLDoqFUErRlEl4AAEACgAAANFAwMACgA5AEQASAAAUyc+AjcXDgMTIiYmNTQ+AjcXDgMVFB4CMyE1NCYmIyMnNz4CNxcOAgcHMzIeAhUVMzUyHgIVFA4CIzUzFc0iFiIoHy4VIR8icGOEQgYICQNMAwkHBRczVD0BJh05K9s4KwwaJh1AHSQYCyPGP1EtEmwGCAQCAgQIcmwB9TMrQUItHCA0NT794C5eSRIxMy4PDhIsLioPJTYjEJk2RyNWUxYuPCsnLDoqFUErRlEl4EcFCQ0ICA4JBUdHAAX/7AAAAtgDAwADAA4ALAA3AEEAAGE1MxUBJz4CNxcOAwM1IQc1NCYmIyMnNz4CNxcOAgcHJzMyHgIVFTM1Mh4CFRQOAiEiLgI1NDY2MwJYbP2RIhYiKB8uFSEfImkCJhwdOSvaOSsMGiYdQR0kGQsyFOk/US0SbAYIBAICBAj9NgYIBAIDCQhHRwH1MytBQi0cIDQ1Pv3gRxmyNkcjVlMWLjwrJyw6KhVgHytGUSXgRwUJDQgIDgkFBQkOCAsPCQAAA//sAAACWAMDAAoAKAAyAABTJz4CNxcOAwM1IQc1NCYmIyMnNz4CNxcOAgcHJzMyHgIVFSEiLgI1NDY2M1UiFiIoHy4VIR8iaQImHB05K9o5KwwaJh1BHSQZCzIU6T9RLRL9qAYIBAIDCQgB9TMrQUItHCA0NT794EcZsjZHI1ZTFi48KycsOioVYB8rRlEl4AUJDggLDwkAAAEAKP8IAk8CzQAcAABFIiYmNTQ+AjcXDgIVFBYWMzI2NjURMxEUBgYBQU+ASgcLDgZNCxEJM1w8PFYuTkl6+DpoQxVFVVcnDEV1UxQuRykmRC4C5v0aRmQ1AAMAKP8IAs8CzQADACAAKwAAYTUzFQUiJiY1ND4CNxcOAhUUFhYzMjY2NREzERQGBiU1Mh4CFRQOAgJPbP6GT4BKBwsOBk0LEQkzXDw8Vi5OSXoBLwYIBAICBAhHR/g6aEMVRVVXJwxFdVMULkcpJkQuAub9GkZkNfhHBQkNCAgOCQUAAAX/7AAAAUcCzQADAA0AEQAVACAAAHM1MxUhIi4CNTQ2NjMXETMRIzUzFTM1Mh4CFRQOAsds/s0GCAQCAwkIeU7HeboGCAQCAgQIR0cFCQ4ICw8JRwLN/TNHR0cFCQ0ICA4JBQAD/+wAAADHAs0AAwAHABEAAHMRMxEjNTMVIyIuAjU0NjYzeU7HeXkGCAQCAwkIAs39M0dHBQkOCAsPCQABACj+tAInAfQAPgAAUyYmNTQ2NjM6AzMHNTQmJiMiBgc3DgIVFBYWFwcuAjU0NjY3NjYzMh4DFRUqAyMiDgIVFBYXQQoPLVU7EUJWXCk6IE1CKlMXLwYMBwcKA0oECwkJDQYWYDoyUT0pFCphXUkRECYjFg4J/rQ5ZiRBXTIz4UZQIgwKMBhJVCorUjwMFQ1AWjMxXUwXCRIRJjtVOPUJGzcuJmI7AAADACj+tAKnAfQAAwBCAE0AAGE1MxUBJiY1NDY2MzoDMwc1NCYmIyIGBzcOAhUUFhYXBy4CNTQ2Njc2NjMyHgMVFSoDIyIOAhUUFhcBNTIeAhUUDgICJ2z9rgoPLVU7EUJWXCk6IE1CKlMXLwYMBwcKA0oECwkJDQYWYDoyUT0pFCphXUkRECYjFg4JAgYGCAQCAgQIR0f+tDlmJEFdMjPhRlAiDAowGElUKitSPAwVDUBaMzFdTBcJEhEmO1U49QkbNy4mYjsBTEcFCQ0ICA4JBQAE/+wAAAK3AfQAAwANADMAPgAAYTUzFSEiLgI1NDY2MxU1IQc1NCYmIyIGBzcOAhUUFhYXBy4CNTQ2Njc2NjMyFhYVFTM1Mh4CFRQOAgI3bP1dBggEAgMJCAIjOiBNQipTFy8GDAgICgNKBAsJCQ0GFmA6VHE4bAYIBAICBAhHRwUJDggLDwlHRynXRlAiDAowGElUKitSPAwVDUBaMzFdTBcJEjJvXvVHBQkNCAgOCQUAAv/sAAACNwH0ACUALwAAcTUhBzU0JiYjIgYHNw4CFRQWFhcHLgI1NDY2NzY2MzIWFhUVISIuAjU0NjYzAiM6IE1CKlMXLwYMCAgKA0oECwkJDQYWYDpUcTj9yQYIBAIDCQhHKddGUCIMCjAYSVQqK1I8DBUNQFozMV1MFwkSMm9e9QUJDggLDwn//wAo/wgCTwJOBiYBmQAAAAcCjQEC/5L//wAo/wgCzwJOBiYBnAAAAAcCjQEC/5L////sAAABOgKoBiYBFQAAAAYCjVjs////7AAAALoCqAYmARcAAAAGAo1Y7AABACj/CAJPAfQAHAAARSImJjU0PgI3Fw4CFRQWFjMyNjY1ETMRFAYGAUFPgEoHCw4GTQsRCTNcPDxWLk5Jevg6aEMVRVVXJwxFdVMULkcpJkQuAg3980ZkNf///+wAAAE6AfQGBgEWAAD////sAAAAugH0BgYBFwAAAAMAKP8IAs8B9AADACAAKwAAYTUzFQUiJiY1ND4CNxcOAhUUFhYzMjY2NREzERQGBiU1Mh4CFRQOAgJPbP6GT4BKBwsOBk0LEQkzXDw8Vi5OSXoBLwYIBAICBAhHR/g6aEMVRVVXJwxFdVMULkcpJkQuAg3980ZkNfhHBQkNCAgOCQUAAAIAKAAAAiAB9AAKABcAAHM1NDY2MzIWFhUVJSchBzU0JiYjIgYGFSg4cVNUcDj+VikBriggTUJCTCDwYHIyMnJg8CUiIstIUyIiU0gAAAIAKAAAAlYB9AAYACMAAGEiJiY1NDY2MzMRIxEXIyIGBhUUFhYzIRUxNTIeAhUUDgIBB1dhJydhV89OKKk6PxgYPzoBOwYIBAICBAg1b1ZWbzX+NAGnIhxNSkpNHEdHBQkNCAgOCQUABf/s/wkCqAH0ACUASABMAFcAYQAAcTUhBzU0JiYjIgYHNw4CFRQWFhcHLgI1NDY2NzY2MzIWFhUVByImJy4CNTQ2NjcXDgIVFBYWFycWFjMyNjY1NTMVFAYGNzUzFTE1Mh4CFRQOAiEiLgI1NDY2MwIoTSBMQS1SGC8GCwgICgNKBAwJCQ4FFmA7VHA4/TpgFgUOCQkMBEYDCAYGCwY0F1kuRUsdTThwqGwGCAQCAgQI/WYGCAQCAwkIR0f1RVAjDAowGElVKitRPAwVDUFZMjJeSxcJEjJvXvX3CwYPLzwgIDgpCB0IJi0TFC4sESwHCBIoIZycO0gf90dHRwUJDQgIDgkFBQkOCAsPCQAAA//sAAAC0AIfABcALQA3AABxNSEHNTQmJiMiBgYHJz4CMzIeAhUVJTU0NjYzMhYWFRUjNTQmJiMiBgYVFQciLgI1NDY2MwK0MTp1WCVSUCILF1FiMD94Xzj9pzBUNDVTL04cLx4dMB3FBggEAgMJCEcqql54OggMBjsGEw4iToVjx0dQMFIyMlIwUFAfMR0dMR9QRwUJDggLDwn//wAoAAACIAH0BgYBnQAAAAIAKAAAAlYB9AATAB4AAHM1NDY2MzMRJzMVIxEXIyIGBhUVITUyHgIVFA4CKCliVM8Tf7ofoDo/GAHMBggEAgIECPpabjL+QBNHAdAjHE1K+kcFCQ0ICA4JBQAAA//s/sQCVgBHABsAJgAwAABBBgYjIi4CJxcjNTMeAzMyNjY3BxEzFSM3FzUyHgIVFA4CISIuAjU0NjYzAdYlQhlCWTQYASWTvQIQIzorDBojGTC5jyNsBggEAgIECP24BggEAgMJCP7NBQQlU4ZhI0dlfUIYAQQCRwF8RyMjRwUJDQgIDgkFBQkOCAsPCQAAA//s/tQAugH0AAMADQAUAABTNzMHAyIuAjU0NjYzFTUzBxEzER4yRClrBggEAgMJCJAkTv7U0NABLAUJDggLDwlHRx0Byv4MAP//ACgAAAIgAwIGJgGdAAAABwL5AK0AYf//ACgAAAJWAwIGJgGiAAAABwL5AJoAYf///+z+xAJWAc4GJgGjAAAABwL5AKv/LQAF/+z+1AD2AvEAAwANABQAKQAtAABTNzMHAyIuAjU0NjYzFTUzBxEzEQMmJjU0NjYzMhYXByYmIyIGFRQWFwc1MxUeMkQpawYIBAIDCQiQJE5VEBEdMBwQIAwaCA8IFxsLC2PF/tTQ0AEsBQkOCAsPCUdHHQHK/gwCPRQmFR0uGgkILQUDGhUNGA4cNTUAAgAoAAACxwIfABcALQAAczUhBzU0JiYjIgYGByc+AjMyHgIVFSU1NDY2MzIWFhUVIzU0JiYjIgYGFRUoAoIxOnRYJVNQIgoXUWIwP3hfOP2nMFQ0NVIwThwwHR0wHUcqql54OggMBjsGEw4iToVjx0dQMFIyMlIwUFAfMR0dMR9QAAQAKAAAA0cCHwADABsAMQA8AABhNTMVITUhBzU0JiYjIgYGByc+AjMyHgIVFSU1NDY2MzIWFhUVIzU0JiYjIgYGFRUFNTIeAhUUDgICx2z89QKCMTp0WCVTUCIKF1FiMD94Xzj9pzBUNDVSME4cMB0dMB0CdwYIBAICBAhHR0cqql54OggMBjsGEw4iToVjx0dQMFIyMlIwUFAfMR0dMR9QR0cFCQ0ICA4JBQAG/+wAAANHAh8AAwAbADEAPABAAEoAAHE1MxUxNSEHNTQmJiMiBgYHJz4CMzIeAhUVJTU0NjYzMhYWFRUjNTQmJiMiBgYVFQU1Mh4CFRQOAiM1MxUhIi4CNTQ2NjMoAoIxOnRYJVNQIgoXUWIwP3hfOP2nMFQ0NVIwThwwHR0wHQJ3BggEAgIECHJs/M0GCAQCAwkIR0dHKqpeeDoIDAY7BhMOIk6FY8dHUDBSMjJSMFBQHzEdHTEfUEdHBQkNCAgOCQVHRwUJDggLDwkA////7AAAAtACHwYGAaAAAP//ACgAAAIgAqgGJgGdAAAABwKRALQAAP//ACgAAAJWAqgGJgGeAAAABwKRAKEAAP//ACgAAAIgAqgGJgGdAAAABwKRALQAAP//ACgAAAJWAqgGJgGiAAAABwKRAKEAAAABACj/IwHWAfQAJQAAVyImJzcWFjMyNjURFyMiBgYVFBYWMzMVIyImJjU0NjYzMxEUBgbpI08vDDVHGVNMKKk6PxgYPzqBgVdhJydhV885at0LCj8HBj88AeIaHE1KSk0cRzVvVlZvNf3yPlgtAAMAKP8jAlYB9AADACkANAAAYTUzFQUiJic3FhYzMjY1ERcjIgYGFRQWFjMzFSMiJiY1NDY2MzMRFAYGJTUyHgIVFA4CAdZs/qcjTy8MNUcZU0woqTo/GBg/OoGBV2EnJ2FXzzlqAQ8GCAQCAgQIR0fdCwo/BwY/PAHiGhxNSkpNHEc1b1ZWbzX98j5YLd1HBQkNCAgOCQX//wAo/yMB1gMCBiYBsQAAAAcC+QCZAGH//wAo/yMCVgMCBiYBsgAAAAcC+QCZAGEAAQAo/wgDPgH0ADsAAEUiLgI1NDY2NxcGBhUUFhYzITI2NTQmJicuAzU0NjYzMhYXByYmIyIGBhUUHgIXHgMVFAYGIwE7OmRLKgcLB00LDTJZOgEbTE8ZPzozUjofM2BEIlhPCUZeHy48HRQqPiovSjUcNmdL+CE7UjEUQlMrC0NuFy1FJ1NVKS8gEQ8cJjwwPlEoCg1BCAkXLyYfJhkTDA0fLUUzRWo8AAADACj/CAOIALsAHAAnADIAAEUiLgI1NDY2NxcGBhUUFhYzITI2NTUzFRQGBiM3IiYnNx4CMzMVMTUyHgIVFA4CATs6ZEsqBwsHTQsNMlk6ARtMT002Z0thIkUiLA4aIBW9BggEAgIECPghO1IxFEJTKwtDbhctRSdUUSEiRWo8+A4WOwkLBEdHBQkNCAgOCQUA//8AKP5SAz4B9AYmAbUAAAAHApEBQ/wE//8AKP5SA4gAuwYmAbYAAAAHApEBQ/wE////7P9MAToB9AYmARYAAAAHApEAI/z+////7P9MAP8B9AYmARgAAAAHApEAI/z+//8ACv8IAz4B9AYmAbUAAAAHAvn/9v8U//8ACv8IA4gBtQYmAbYAAAAHAvn/9v8U////7AAAAToDAgYmARUAAAAGAvkcYf///+wAAAD1AwIGJgEXAAAABgL5HGH//wAo/wgDPgH0BgYBtQAA//8AKP8IA4gAuwYGAbYAAP///+z/TAE6AfQGJgEWAAAABwKRACP8/v///+z/TAD/AfQGJgEYAAAABwKRACP8/gABACj/IAKlAV8AHAAARSImNTU3ITI2NjU1MxUUDgIjITcVFB4CMyEVAR96fUABP0BOI00dPWBE/q8gFis/KQE54FxdOTUgRzp3dzdWPB8eRSIsGQtHAAIAKP8gAtYARwARABwAAEUiJjU1NyEVITcVFB4CMyEVNzUyHgIVFA4CAR96fUACWv2UIBYrPykBOWoGCAQCAgQI4FxdOTVHHkUiLBkLR+BHBQkNCAgOCQUA//8AJf8gAqUBYQYmAcMAAAAHAvkAEf7A//8AJf8gAtYBYQYmAcQAAAAHAvkAEf7AAAP/7AAAAQ4ARwADAA4AGAAAcTUzFTE1Mh4CFRQOAiEiLgI1NDY2M/oGCAQCAgQI/wAGCAQCAwkIR0dHBQkNCAgOCQUFCQ4ICw8JAAACACgAAAIzAs0ABgAKAABzNSEHETMRJREzESgB6SxO/pVNRy0Cs/0zRwH4/ggABAAoAAACswLNAAMACgAOABkAAGE1MxUhNSEHETMRJREzEQU1Mh4CFRQOAgIzbP2JAeksTv6VTQGKBggEAgIECEdHRy0Cs/0zRwH4/ghHRwUJDQgIDgkF//8AKAAAAjMDNgYmAcgAAAAHAvkAeACV//8AKAAAArMDNgYmAckAAAAHAvkAeACV//8AKP7zAjMCzQYmAcgAAAAHAvkAeP0G//8AKP7zArMCzQYmAckAAAAHAvkAeP0G//8AKAAAAjMC1gYmAcgAAAAGAxFbR///ACgAAAKzAtYGJgHJAAAABgMRW0f//wAoAAACMwMYBiYByAAAAAYC9l17////0f8jAmYB9AYmAioAAAAHAo0BhPzq////0f8jAmYCqAYmAioAAAAnAo0BhPzqAAYCjV7s//8AKP8IA/UCTgYmAi0AAAAHAo0DE/zq//8AKP8IBGsB9AYmAi8AAAAHAo0Difzq//8AKP5SBGsB9AYmAi8AAAAnAo0DifzqAAcCkQFD/AT//wAK/wgEawH0BiYCLwAAACcCjQOJ/OoABwL5//b/FP//ACj/CAOwAs0EJwGQAukAAAAGAbYAAAAIACj/CAQwAs0AAwANABEAFQAgAD0ASABTAABhNTMVISIuAjU0NjYzFxEzESM1MxUzNTIeAhUUDgIFIi4CNTQ2NjcXBgYVFBYWMyEyNjU1MxUUBgYjNyImJzceAjMzFTM1Mh4CFRQOAgOwbP7NBggEAgMJCHlOx3kSBggEAgIECP3BOmRLKgcLB00LDTJZOgEbTE9NNmdLYSJFIiwOGiAVvagGCAQCAgQIR0cFCQ4ICw8JRwLN/TNHR0cFCQ0ICA4JBfghO1IxFEJTKwtDbhctRSdUUSEiRWo8+A4WOwkLBEdHBQkNCAgOCQUA//8AKAAAArMDGAYmAckAAAAGAvZde////9H+zgJmAfQGJgIrAAAABwKUAUH/vv///9H+zgJmAqgGJgIrAAAAJgKNXuwABwKUAUH/vv//ACj+zgP1Ak4GJgIuAAAABwKUAtD/vv//ACj+zgRrAfQGJgIwAAAABwKUA0b/vv//ACj+UgRrAfQGJgIwAAAAJwKRAUP8BAAHApQDRv++//8ACv7OBGsB9AYmAjAAAAAnAvn/9v8UAAcClANG/77////R/yMCZgKoBiYCKwAAAAcCkQFPAAD////R/yMCZgKoBiYCKwAAACYCjV7sAAcCkQFPAAD//wAo/wgD9QKoBiYCLgAAAAcCkQLeAAD//wAo/wgEawKoBiYCLwAAAAcCkQMQAAD//wAo/lIEawKoBiYCLwAAACcCkQMQAAAABwKRAUP8BP//AAr/CARrAqgGJgIvAAAAJwKRAxAAAAAHAvn/9v8U////0f8jAmYDJwYmAisAAAAHApUBQQAA////0f8jAmYDJwYmAisAAAAmAo1e7AAHApUBQQAA//8AKP8IA/UDJwYmAi4AAAAHApUC0AAA//8AKP8IBGsDJwYmAi8AAAAHApUDAgAA//8AKP5SBGsDJwYmAi8AAAAnApUDAgAAAAcCkQFD/AT//wAK/wgEawMnBiYCLwAAACcClQMCAAAABwL5//b/FAAF/9H/IwQKAfQAFAAYABwAKgA7AABhIiYnNxYWMzMHNTQmJic3HgIVEQE1MxURETMRMTUzMjY2NTUzFRQGBiMFIiYnNxYWMzI2NREzERQGBgMpIkEfNBYlE7IeBw0JTAcOCfy22E5wIiQOTiFHOv2zDR0OCQ4YCS86Ti9SGhw1ExEg7xJCUyoNI1ZNGP7qAUpISP62AfT+DEcUPDrx8U5cJ90DAUcBA0c/AgT9/D1dMwAAB//R/yMEiwH0AAMADgAfADQAOAA8AEoAAGE1MxUxNTIeAhUUDgIFIiYnNxYWMzI2NREzERQGBiUiJic3FhYzMwc1NCYmJzceAhURATUzFRERMxExNTMyNjY1NTMVFAYGIwQKbQYIBAICBAj7jA0dDgkOGAkvOk4vUgLqIkEfNBYlE7IeBw0JTAcOCfy22E5wIiQOTiFHOkdHRwUJDQgIDgkF3QMBRwEDRz8CBP38PV0z3RocNRMRIO8SQlMqDSNWTRj+6gFKSEj+tgH0/gxHFDw68fFOXCcABQAo/wgGAgH0ADUAOQA9AEsAYAAARSIuAjU0NjY3FwYGFRQWFjMhMjY1NCYmJy4DNTQ2NjMHIgYGFRQeAhceAxUUBgYjAzchFRERMxExNTMyNjY1NTMVFAYGIzMiJic3FhYzMwc1NCYmJzceAhURATs6ZEsqBwsHTQsNMlk6ARtMTxk/OjNSOh8zYEQDLjwdFCo+Ki9KNRw2Z0sBAwE4TnAiJA5OIUc60yJBHzQWJROyHggNCEwHDgn4ITtSMRRCUysLQ24XLUUnU1UpLyARDxwmPDA+UShHFy8mHyYZEwwNHy1FM0VqPAKlR0f+UwH0/gxHFDw68fFOXCcaHDUTESDvEkJTKg0jVk0Y/uoABwAo/wgGgwH0AAMAOQA9AEEATwBkAG8AAGE1MxUFIi4CNTQ2NjcXBgYVFBYWMyEyNjU0JiYnLgM1NDY2MwciBgYVFB4CFx4DFRQGBiMDNyEVEREzETE1MzI2NjU1MxUUBgYjMyImJzcWFjMzBzU0JiYnNx4CFREzNTIeAhUUDgIGAm36zDpkSyoHCwdNCw0yWToBG0xPGT86M1I6HzNgRAMuPB0UKj4qL0o1HDZnSwEDAThOcCIkDk4hRzrTIkEfNBYlE7IeCA0ITAcOCW0GCAQCAgQIR0f4ITtSMRRCUysLQ24XLUUnU1UpLyARDxwmPDA+UShHFy8mHyYZEwwNHy1FM0VqPAKlR0f+UwH0/gxHFDw68fFOXCcaHDUTESDvEkJTKg0jVk0Y/upHBQkNCAgOCQUA//8AKP56BgIB9AYmAe4AAAAHApEBQ/ws//8AKP56BoMB9AYmAe8AAAAHApEBQ/ws////0f8jBAoCqAYmAewAAAAGAo1e7P///9H/IwSLAqgGJgHtAAAABgKNXuz//wAo/wgFmQJOBiYB9gAAAAcCjQEC/5L//wAo/wgGGQJOBiYB9wAAAAcCjQEC/5IABQAo/wgFmQH0ABQAGAAcACoARwAAYSImJzcWFjMzBzU0JiYnNx4CFREBNTMVEREzETE1MzI2NjU1MxUUBgYjBSImJjU0PgI3Fw4CFRQWFjMyNjY1ETMRFAYGBLgiQR80FiUTsh4HDQlMBw4J/LbYTnAiJA5OIUc6/VxPgEoHCw4GTQsRCTNcPDxWLk5JehocNRMRIO8SQlMqDSNWTRj+6gFKSEj+tgH0/gxHFDw68fFOXCf4OmhDFUVVVycMRXVTFC5HKSZELgIN/fNGZDUAAAcAKP8IBhkB9AADACAANQA5AD0ASwBWAABhNTMVBSImJjU0PgI3Fw4CFRQWFjMyNjY1ETMRFAYGJSImJzcWFjMzBzU0JiYnNx4CFREBNTMVEREzETE1MzI2NjU1MxUUBgYjITUyHgIVFA4CBZls+zxPgEoHCw4GTQsRCTNcPDxWLk5JegMsIkEfNBYlE7IeBw0JTAcOCfy22E5wIiQOTiFHOgIgBggEAgIECEdH+DpoQxVFVVcnDEV1UxQuRykmRC4CDf3zRmQ1+BocNRMRIO8SQlMqDSNWTRj+6gFKSEj+tgH0/gxHFDw68fFOXCdHBQkNCAgOCQX//wAK/wgGAgH0BiYB7gAAAAcC+f/2/xT//wAK/wgGgwH0BiYB7wAAAAcC+f/2/xT////R/yMECgMnBiYB7AAAAAcClQJTAAD////R/yMEiwMnBiYB7QAAAAcClQJTAAD////R/yMECgMnBiYB7AAAACcClQJTAAAABgKNXuz////R/yMEiwMnBiYB7QAAACcClQJTAAAABgKNXuz//wAo/wgFmQMnBiYB9gAAACcCjQEC/5IABwKVA+IAAP//ACj/CAYZAycGJgH3AAAAJwKNAQL/kgAHApUD4gAA//8AKP8IBgIDJwYmAe4AAAAHApUESwAA//8AKP8IBoMDJwYmAe8AAAAHApUESwAA//8AKP56BgIDJwYmAe4AAAAnApUESwAAAAcCkQFD/Cz//wAo/noGgwMnBiYB7wAAACcClQRLAAAABwKRAUP8LP//AAr/CAYCAycGJgHuAAAAJwKVBEsAAAAHAvn/9v8U//8ACv8IBoMDJwYmAe8AAAAnApUESwAAAAcC+f/2/xQABP/R/yMD8wH0ABsAHwAjADQAAGE1IQc1NCYmIyIOAwcnPgQzMh4CFRUBNTMVEREzEQUiJic3FhYzMjY1ETMRFAYGAeYCB0giRTUrTEA3LhMZGTM4Q1AyR1szFPzN2E7+Iw0dDgkOGAkvOk4vUkdB6z9TKh0vOToYRx8+NyoZME9aKvEBSkhI/rYB9P4M3QMBRwEDRz8CBP38PV0zAAAG/9H/IwRzAfQAAwAOAB8AOwA/AEMAAGE1MxUxNTIeAhUUDgIFIiYnNxYWMzI2NREzERQGBiU1IQc1NCYmIyIOAwcnPgQzMh4CFRUBNTMVEREzEQPzbAYIBAICBAj7pA0dDgkOGAkvOk4vUgGnAgdIIkU1K0xANy4TGRkzOENQMkdbMxT8zdhOR0dHBQkNCAgOCQXdAwFHAQNHPwIE/fw9XTPdR0HrP1MqHS85OhhHHz43KhkwT1oq8QFKSEj+tgH0/gz////R/yMD8wKXBiYCBgAAAAYCjV7b////0f8jBHMClwYmAgcAAAAGAo1e2///ACj/CAWCAk4GJgIMAAAABwKNAQL/kv//ACj/CAYCAk4GJgINAAAABwKNAQL/kgAEACj/CAWCAfQAGwAfACMAQAAAYTUhBzU0JiYjIg4DByc+BDMyHgIVFQE1MxURETMRASImJjU0PgI3Fw4CFRQWFjMyNjY1ETMRFAYGAycCVUgjRTQsS0A3LhMZGTM4Q1AyR1szFPzN2E79zE+ASgcLDgZNCxEJM1w8PFYuTkl6R0HrP1MqHS85OhhHHz43KhkwT1oq8QFKSEj+/QGt/lP+wTpoQxVFVVcnDEV1UxQuRykmRC4CDf3zRmQ1AAYAKP8IBgIB9AADAA4AKwBHAEsATwAAYTUzFTE1Mh4CFRQOAgUiJiY1ND4CNxcOAhUUFhYzMjY2NREzERQGBiU1IQc1NCYmIyIOAwcnPgQzMh4CFRUBNTMVEREzEQWCbAYIBAICBAj7TU+ASgcLDgZNCxEJM1w8PFYuTkl6AZsCVUgjRTQsS0A3LhMZGTM4Q1AyR1szFPzN2E5HR0cFCQ0ICA4JBfg6aEMVRVVXJwxFdVMULkcpJkQuAg3980ZkNfhHQes/UyodLzk6GEcfPjcqGTBPWirxAUpISP79Aa3+UwAEACj/CAXrAfQANQA5AD0AWQAARSIuAjU0NjY3FwYGFRQWFjMhMjY1NCYmJy4DNTQ2NjMHIgYGFRQeAhceAxUUBgYjAzchFRERMxExNSEHNTQmJiMiDgMHJz4EMzIeAhUVATs6ZEsqBwsHTQsNMlk6ARtMTxk/OjNSOh8zYEQDLjwdFCo+Ki9KNRw2Z0sBAwE4TgIHSCNFNCxLQDcuExkZMzhDUDJHWzMU+CE7UjEUQlMrC0NuFy1FJ1NVKS8gEQ8cJjwwPlEoRxcvJh8mGRMMDR8tRTNFajwCpUdH/lMB9P4MR0HrP1MqHS85OhhHHz43KhkwT1oq8QAABgAo/wgGawH0AAMAOQA9AEEAXQBoAABhNTMVBSIuAjU0NjY3FwYGFRQWFjMhMjY1NCYmJy4DNTQ2NjMHIgYGFRQeAhceAxUUBgYjAzchFRERMxExNSEHNTQmJiMiDgMHJz4EMzIeAhUVMzUyHgIVFA4CBets+uQ6ZEsqBwsHTQsNMlk6ARtMTxk/OjNSOh8zYEQDLjwdFCo+Ki9KNRw2Z0sBAwE4TgIHSCNFNCxLQDcuExkZMzhDUDJHWzMUbAYIBAICBAhHR/ghO1IxFEJTKwtDbhctRSdTVSkvIBEPHCY8MD5RKEcXLyYfJhkTDA0fLUUzRWo8AqVHR/5TAfT+DEdB6z9TKh0vOToYRx8+NyoZME9aKvFHBQkNCAgOCQX//wAo/noF6wH0BiYCDgAAAAcCkQFD/Cz//wAo/noGawH0BiYCDwAAAAcCkQFD/Cz//wAK/wgF6wH0BiYCDgAAAAcC+f/2/xT//wAK/wgGawH0BiYCDwAAAAcC+f/2/xT////R/yMD8wKXBiYCBgAAAAcCjQKV/9v////R/yMEcwKXBiYCBwAAAAcCjQKV/9v////R/yMD8wKXBiYCBgAAACcCjQKV/9sABgKNXtv////R/yMEcwKXBiYCBwAAACcCjQKV/9sABgKNXtv//wAo/wgFggKoBiYCDAAAACcCjQEC/5IABwKNBCX/7P//ACj/CAYCAqgGJgINAAAAJwKNAQL/kgAHAo0EJf/s//8AKP8IBesClwYmAg4AAAAHAo0Ejf/b//8AKP8IBmsClwYmAg8AAAAHAo0Ejf/b//8AKP56BesClwYmAg4AAAAnAo0Ejf/bAAcCkQFD/Cz//wAo/noGawKXBiYCDwAAACcCkQFD/CwABwKNBI3/2///AAr/CAXrApcGJgIOAAAAJwKNBI3/2wAHAvn/9v8U//8ACv8IBmsClwYmAg8AAAAnAo0Ejf/bAAcC+f/2/xT//wAo/lIDsALNBCcBkALpAAAAJgG2AAAABwKRAUP8BP//ACj+UgQwAs0GJgHYAAAABwKRAUP8BP//AAr/CAOwAs0EJwGQAukAAAAmAbYAAAAHAvn/9v8U//8ACv8IBDACzQYmAdgAAAAHAvn/9v8U////0f8jAmYCqAYmAioAAAAHAo0BhP/s////0f8jAmYCqAYmAioAAAAnAo0BhP/sAAYCjV7s//8AKP8IA/UCqAYmAi0AAAAHAo0DE//s//8AKP8IBGsClwYmAi8AAAAHAo0Dif/b//8AKP5SBGsClwYmAi8AAAAnAo0Dif/bAAcCkQFD/AT//wAK/wgEawKXBiYCLwAAACcCjQOJ/9sABwL5//b/FAAE/9H/IwJmAfQABgAKABsAJgAAYREzESczFQE1MxUBIiYnNxYWMzI2NREzERQGBiU1Mh4CFRQOAgGYTiSQ/m7Y/nENHQ4JDhgJLzpOL1ICEwYIBAICBAgB9P42HUcBSkhI/dkDAUcBA0c/AgT9/D1dM91HBQkNCAgOCQUABP/R/yMCZgH0AAYACgAbACYAAGERMxEnMxUBNTMVASImJzcWFjMyNjURMxEUBgYlNTIeAhUUDgIBmE4kkP5u2P5xDR0OCQ4YCS86Ti9SAhMGCAQCAgQIAfT+Nh1HAUpISP3ZAwFHAQNHPwIE/fw9XTPdRwUJDQgIDgkF////0f8jAmYCqAYmAioAAAAGAo1e7AAFACj/CAP1Ak4ABgAKACcAKwA2AABhETMRJzMVATUzFQEiJiY1ND4CNxcOAhUUFhYzMjY2NREzERQGBgM1MxUBNTIeAhUUDgIDJ04kkP5u2P4aT4BKBwsOBk0LEQkzXDw8Vi5OSXp2TgJ9BggEAgIECAH0/jYdRwFKSEj9vjpoQxVFVVcnDEV1UxQuRykmRC4CDf3zRmQ1AuxaWv4MRwUJDQgIDgkFAAAFACj/CAP1Ak4ABgAKACcAKwA2AABhETMRJzMVATUzFQEiJiY1ND4CNxcOAhUUFhYzMjY2NREzERQGBgM1MxUBNTIeAhUUDgIDJ04kkP5u2P4aT4BKBwsOBk0LEQkzXDw8Vi5OSXp2TgJ9BggEAgIECAH0/jYdRwFKSEj9vjpoQxVFVVcnDEV1UxQuRykmRC4CDf3zRmQ1AuxaWv4MRwUJDQgIDgkFAAAEACj/CARrAfQANQA8AEAASwAARSIuAjU0NjY3FwYGFRQWFjMhMjY1NCYmJy4DNTQ2NjMHIgYGFRQeAhceAxUUBgYjJREzESczFQE3IRUTNTIeAhUUDgIBOzpkSyoHCwdNCw0yWToBG0xPGT86M1I6HzNgRAMuPB0UKj4qL0o1HDZnSwFHTiSQ/f4DAUW6BggEAgIECPghO1IxFEJTKwtDbhctRSdTVSkvIBEPHCY8MD5RKEcXLyYfJhkTDA0fLUUzRWo8+AH0/jYdRwGtR0f+U0cFCQ0ICA4JBQAABAAo/wgEawH0ADQAOwA/AEoAAEUiLgI1NDY2NxcGBhUUFhYzITI2NTQmJicuAzU0NjYzByIGFRQeAhceAxUUBgYjJREzESczFQE3IRUTNTIeAhUUDgIBOzpkSyoHCwdNCw0yWToBG0xPGT86M1I6HzNgRANFQhQqPiovSjUcNmdLAUdOJJD9/gMBRboGCAQCAgQI+CE7UjEUQlMrC0NuFy1FJ1NVKS8gEQ8cJjwwPlEoRzQ4HyYZEwwNHy1FM0VqPPgB9P42HUcBrUdH/lNHBQkNCAgOCQX////R/yMCZgH0BiYCKwAAAAcCkQFP/P7////R/yMCZgKoBiYCKwAAACYCjV7sAAcCkQFP/P7//wAo/wgD9QJOBiYCLgAAAAcCkQLe/P7//wAo/wgEawH0BiYCMAAAAAcCkQNU/P7////R/yMCZgMCBiYCKgAAAAcC+QFIAGH////R/yMCZgMCBiYCKgAAACcC+QFIAGEABgKNXuz//wAo/wgD9QMCBiYCLQAAAAcC+QLXAGH//wAo/wgEawLxBiYCLwAAAAcC+QMSAFD//wAo/lIEawLxBiYCLwAAACcC+QMSAFAABwKRAUP8BP//AAr/CARrAvEGJgIvAAAAJwL5AxIAUAAHAvn/9v8UAAkAKAAABMwCzQADAAcACwAPABoAMwA9AEEARQAAYREzESM1MxUzNTMVIREzESE1Mh4CFRQOAiEiJiY1NDY2MzMRIxEXIyIGBhUUFhYzIRUzIi4CNTQ2NjMXETMRIzUzFQKVTsd5TmwBME39dgYIBAICBAj+v1dhJydhV89OKKk6PxgYPzoBO+QGCAQCAwkIeU7HeQJ7/YVHR0dHAs39M0cFCQ0ICA4JBTVvVlZvNf40AaciHE1KSk0cRwUJDggLDwlHAs39M0dHAAAMACgAAATMA+UAAwAHAAsAGwArAC8AMwA+AFcAYQBlAGkAAGERMxEjNTMVMzUzFQMiJjU1MxUUFjMyNic3FgYjIiY3FwYWMzI2NTUzFRQGJzUzFQERMxEhNTIeAhUUDgIhIiYmNTQ2NjMzESMRFyMiBgYVFBYWMyEVMyIuAjU0NjYzFxEzESM1MxUClU7HeU5sYSEiJBAPFw8KIw0ekC4eDSMKEBYPECQiAyQBsU39dgYIBAICBAj+v1dhJydhV89OKKk6PxgYPzoBO+QGCAQCAwkIeU7HeQJ7/YVHR0dHArUxKx8fHxkyOAdFUFBFBzgyGR8fHysxsn5+/JkCzf0zRwUJDQgIDgkFNW9WVm81/jQBpyIcTUpKTRxHBQkOCAsPCUcCzf0zR0f//wAi/4UApgBtBgYCoAAAAAEAIv+GAIUANAADAABXNzMHIiFCM3qurgAAAQBQARcAqgF1AAMAAFM1MxVQWgEXXl4AAQB0AAAAwQKUAAMAAHMRMxF0TQKU/WwAAQB0AAAB6wKUAAYAAHMRIRUhNxF0AXf+sSUClEcp/YoAAAMAbwABAl8ClAARABUAJwAAQSImJzcWFjMyNjY1NTMVFAYGAREzERMiJic3FhYzMjY2NTUzFRQGBgHJK0gaOREoGhohD00iQ/51TjsjPhcvDyMWGiEPTSJDAUceGzESERMqJKWlNUwn/roCk/1tAUYVEzgNDBMqJKWlNUwnAAMAMv/wAY0CowAWAC0AMQAAQSImJjU0NjYzMhYWFwcmJiMiBhUUFjMDIiYmNTQ2NjMVIgYVFBYzMjY3Fw4CAzUzFQELQGI3N2I+FyssFhIjNhlBSEhDAj5iNzdiQENISEEZNiMSFiwrFUEBJi1WOzxVLgUJBkUICkA4OT7+gy5WOztVLkc/ODk/CgdFBQkFATZHRwACAEf//AJfApgAFQAnAABFIi4CNTQ+AzMyHgMVFA4CJzI2NjU0LgIjIg4CFRQWFgFTNGBMLBQqQFc3N1dAKhQsTGA0OVYwIDZFJCRFNiAwVgQjRmdELGhoVzU0V2hpLERnRiNHMWBFOW9aNjZbbjlEYDIAAAEAHgAAAW4ClAAGAABhERchNSERASE5/sQBUAKAM0f9bAABACQAAAJMApQACQAAcwMzEyczBxMzA/zYUchBYC/PUN8ClP2JKioCd/1sAAEAJAAAAkwClAAJAABTMxMjAxcjNwMj/HHfUM8vYEHIUQKU/WwCdyoq/YkAAQAUAAABoQKUABoAAGERFyMiBhUUFjMyNjcXBgYjIiYmNTQ2NjMzEQFTO3xYWEpIGjYZFBxEHVJiLDxyUI8CgDNHQkJEBwdFBwk8XjNAXTP9bAD//wBQARcAqgF1BgYCPwAA//8AdAAAAMEClAYGAkAAAP//AHQAAAHrApQGBgJBAAD//wBvAAECXwKUBgYCQgAAAAMAdAAAAnAClAAVABkALgAAQSIuAjU1MxUUFjMyNjY1NTMVFAYGAREzERMmJjU0NjMyFhcHLgIjIgYVFBYzAXQ8X0IjTVhbPE0lTjxx/rFNujlFVUMYLhcNCSAfCC0yMi4BNBoxSC2goDo/HDYnZWU9Vi3+zAKU/WwBSQZFNz9JCQUzAgYELCcmKgAAAQBGAAAB1gJ4ADsAAHMiLgM1NDY2NxcOAxUUFjMyPgIzMh4CMzI2NTQuAic3HgQVFA4DIyIuAiMiDgKyEyEbEwovW0IwMEQrFBgNDxYSFQ4PFhMVDg4YM1RjMSslVVJDKAsUHCARGiMVCQEBCBMkEB4rNB9Id2w0LytHREwxMC8jLiMjLiMyMkR2ZFIgOhhEVWVyPyM4KxwPHCYcHCYcAAMAQgAAAZ0CowAWACAAJAAAQSImJjU0NjYzMhYWFwcmJiMiBhUUFjMDNDY2MxUiBgYVEzUzFQEbQGI3N2I+FyssFhIkNhhBSUhE2UiAVD5eM4xDASYtVjs8VS4FCQZFCApAODk+/pNypFdHR4NcASZHRwD//wAkAAACTAKUBgYCRgAA//8AJAAAAkwClAYGAkcAAP//ABQAAAGhApQGBgJIAAAAAQBkAAACBAKYABkAAHMRNDY2MzIWFzY2MxUiBgYHLgIjIgYGFRFkJUEpFywTJmA1N1IzCgUVHhMUHg8B0DNSLxQRGh9HIzIXEikdIDIb/jAAAAEAGgAAAZIClAAGAABzExcDJyEVGsxKthQBLAKUFf2zFUcAAAIAJv/2AgkCnwASACYAAEUiLgI1ND4CMzIeAhUUBgYnMj4CNTQuAiMiDgIVFB4CARg5WT8hID9ZOTtaPSA6a0wnOygUEyc7KSg8JxQVKTsKIEuAX2WIUCIiUIdmfpA8Rxg6ZUxTbD8aGj5tVExlORgAAAEAaQAAAYYClAAGAABhEQcnNzMRATaoJdJLAjtwPYz9bAABAEUAAAHrAp4AHAAAczU3PgI1NCYjIgYGByc+AjMyFhUUBgYHByEVRb4pPCBHRxpAOxUGFT5JI2lpHz0vrQFIRMcrRUMmQTEHCQVCBgwJVF0xTksur0YAAQA+//YB7gKfADMAAEUiJiYnNx4CMzI2NTQmJicjNTMyNjY1NCYjIgYGByc+AjMyFhYVFA4CBx4CFRQGBgEWJlJIGAcXREwiSEUkPSWFhRk3Jj1IIUU9FAcUP0okT10pGCIgCCIzHS1gCgkMBkEECgc/Pi00GAFFHDUlODEHCQVABg0JJUw7JjUjFAUMIT01Q1gsAAEAKAAAAgkClAAOAABhNSE1EzMDMzUzFTMVIxUBZv7Cu1i/6lBTU4A+Adb+M8zMR4AAAQA///cB+AKUACUAAEUiJiYnNx4CMzI2NTQmJiMiBgYHJxMhFSEHPgIzMhYWFRQGBgEaJVJLGQkZRksgRE8iPikePDIQNhIBgf7BEhEyOhxBXjQ1YwkKDQZABAsHTkoyORgMEgkLAVdI0wgSDSdVR0xmNAACADH/9gIFAp4AIAAuAABFIiYmNTQ+AjMyFhYXBy4CIyIGBz4DMzIWFRQGBicyNjU0JiMiBgYHHgIBHlJpMiREYDsfRD4VCBM7QR9VWgEJIy8yF21wNmdKSE1NRBs8NhIBHkQKUpprWoBRJgYIBEACBQR0bAIMDgpkaUZiMkdMR0RCDBEIRW9AAAABAE3/9gHoApQABwAAVycTNSE1IRXqS/f+twGbChcCJBtIaAADAB//9gIQAp8AIQAxAD4AAEUiLgI1NDY2Ny4CNTQ2NjMyFhYVFAYGBx4CFRQOAicyNjY1NCYmJyMGBhUUFhYDMzY2NTQmIyIGFRQWARYyWUUnHTMhIi0XOmpIR2w9FzAmIzYeJ0VbMzBKKh4zIWkyOCpJCWkyNlFIRlEwChEpRTMzQCsTEig5KDlMJiZMOio4JxEQKj0vNkkrE0kWNy8mLRsJDjg2LDUWATkRMy07MjE7LTQAAAIAKf/2Af0CngAfAC0AAFciJiYnNx4CMzI2Nw4CIyImNTQ2NjMyFhYVFA4CAzI2NjcuAiMiBhUUFvceRD4WCBQ6Qh5ZWQEZPDsZaHA4Z0ZUaTIkQ2EtGTw6FAEfRDlET0gKBggEQQIGBG9zCRILYmhEYjVTmmlggk4iAUoMEQdHbT9QREQ/AP//ABX/9gEDAUIGBwKBAAD+Iv//AB4AAADCATgGBwKCAAD+Iv//AB4AAADvAUIGBwKDAAD+Iv//AB7/9gD5AUIGBwKEAAD+Iv//ABgAAAD/ATgGBwKFAAD+Iv//ACb/+AD7ATgGBwKGAAD+Iv//ABz/9gD/AUIGBwKHAAD+Iv//AB3/9wDtATgGBwKIAAD+Iv//ABb/9gECAUIGBwKJAAD+Iv//ABn/9gD/AUIGBwKKAAD+Iv//ABUBcAEDArwGBgKBAJz//wAeAXoAwgKyBgYCggCc//8AHgF6AO8CvAYGAoMAnP//AB4BcAD5ArwGBgKEAJz//wAYAXoA/wKyBgYChQCc//8AJgFyAPsCsgYGAoYAnP//ABwBcAD/ArwGBgKHAJz//wAdAXEA7QKyBgYCiACc//8AFgFwAQICvAYGAokAnP//ABkBcAD/ArwGBgKKAJwAAf8gAAMA0AKUAAMAAGcnARe4KAGIKAMZAnga//8AHv+GAgsDFgQmAoIAAAAnAnMBGAAAAAcCgwEc/aj//wAe/4YCBQMWBCYCggAAACcCcwEYAAAABwKFAQb9qP//AB7/hgIFAyAEJgKEAAAAJwJzARgAAAAHAoUBBv2o//8AFf+SAQMA3gYHAoEAAP2+//8AHv+cAMIA1AYHAoIAAP2+//8AHv+cAO8A3gYHAoMAAP2+//8AHv+SAPkA3gYHAoQAAP2+//8AGP+cAP8A1AYHAoUAAP2+//8AJv+UAPsA1AYHAoYAAP2+//8AHP+SAP8A3gYHAocAAP2+//8AHf+TAO0A1AYHAogAAP2+//8AFv+SAQIA3gYHAokAAP2+//8AGf+SAP8A3gYHAooAAP2+AAIAFQHUAQMDIAAPAB8AAFMiJiY1NDY2MzIWFhUUBgYnMjY2NTQmJiMiBgYVFBYWjCU1HRw1JSc1HB01JREWDAsWExEXCwwYAdQeST8/SB8fSD8/SR48Ei4qKC4UFC4oKi4SAAABAB4B3gDCAxYABgAAUzUHJzczEYBDH2Y+Ad7vLTBG/sgAAQAeAd4A7wMgABkAAFM1NzY2NTQmIyIGByc2NjMyFhUUBgYHBzMVHlcXGxoWEDISAxQ8GDUvDRsVPn4B3jhXFiUWExEGAzwEBy0vFyQhEzs8AAEAHgHUAPkDIAAoAABTIiYnNxYWMzI2NTQmIyM1MzI2NTQmIyIGByc2NjMyFhUUBgcWFhUUBosXQhQEEjsRHRkZFEJBDhcXGhI0EAQVORY3NRcQFxc2AdQHAzoDBRMWFxI3GBQRDgUCOwMFJywfJAcHICM0MQABABgB3gD/AxYADgAAUzUjNTczBzM3MxUzFSMVpIxDSUhIBjsaGgHeMDfRzVlZOzAAAAEAJgHWAPsDFgAhAABTIiYmJzcWFjMyNjU0JiMiBgcnNzMVIwc2NjMyFhYVFAYGkREpJA0FETgWFxcWEA8cCDQKvIYGCiAQGyoXGC8B1gQGAzUDBhkYGRIJBQazOkYFCRIqJSQxGAAAAgAcAdQA/wMgAB0AKgAAUyImNTQ2NjMyFhYXByYmIyIGBzI2NzY2MzIWFRQGJzI2NTQmIyIGBgcWFpE8ORo3Kw4hIQsEEDITHhwBAQMCCB4ONjA8NBkVFRcMFw8BAhYB1FJOPEwkAwUCOAIFIiYBAQMJNTI0PDseFhoXCAgBKCwAAAEAHQHVAO0DFgAHAABTJzc1IzUzFYRHZYXQAdUN4BNBTgADABYB1AECAyAAHQAqADcAAFMiJiY1NDY2NyYmNTQ2NjMyFhYVFAYHHgIVFAYGJzI2NTQmJyMGBhUUFjczNjY1NCYjIgYVFBaMJDUdDBUOFBYZMiYmMhoUFw8VCx00JRkaEhQaEhQbCxoTEBYaGRcRAdQSKiMXHhQHCSAfHSUTEyYdHCMJBRMdFiQsEzgVFhQWBgYXFRUUjQcUEBISEhIQEwACABkB1AD/AyAAGgAmAABTIiYmJzcWFjMyNjUGBiMiJjU0NjMyFhUUBgYnMjY3JiYjIgYVFBaDDyQgCwUOMBQhHQwjDTA1PjE9Oho3JgweCgEXGhYZGAHUBAYCNgIEJSEECDcxNTlTVDhKI6wJBCwsGhgWHQAAAQAUAmIAYgK8AAMAAFM1MxUUTgJiWlr//wAU/6wAYgAGBgcCjQAA/Ur//wAUAkUAYgM1BiYCjQDjAAYCjQB5//8AFP8+AGIALgYnAo0AAPzcAAcCjQAA/XIAAgAFAk4A3AKoAAMABwAAUzUzFTM1MxUFTjtOAk5aWlpa//8ABv+sAN0ABgQHApEAAf1eAAMAEgG7AOkClAADAAcACwAAUzMVIzczFSMHMxUjEk5OiU5OQUhIApRaWloqVQADABL/EADp/+kAAwAHAAsAAFczFSM3MxUjBzMVIxJOTolOTkFISBdaWloqVQAAAwASAk4A6QMnAAMABwALAABTNTMVBzUzFTM1MxVaSJBOO04C0lVVhFpaWloA//8AH/9EAPYAHQQHApUADfz2AAEAQwAAAS4AdQADAABzNTMVQ+t1dQABADEAAAC1AOgAAwAAdwcjN7UtV0To6OgAAAIARgAAAMsCMAADAAcAAFMHIzcTFSM1yy1YRRhUAjDo6P5FdXUAAgAnAAEBmQK+ACMAJwAAZSM1NCYnLgI1NDY2MzIWFhcHLgIjIgYVFBYWFx4CFRQGFyM1MwEdQSwsJygOLVpDGT08FgYVODgVQz8OJiQbKRgJBlRUyiMhNSUhMTgrOkcgCg4HPwULByw0HCcpHxcqKxgTINRz//8ANgFyAXYCwQYGAqoAAP//ACL/hQCmAG0GBgKgAAAAAQAc/4MA0ALuABUAAFcuAzU0PgI3Mw4DFRQeAheFESUfFBQfJRFLDyIcEhIcIg99ImBzejs7f3lpJSlue3o1NHZ0ZiYAAAEAGv+DAM4C7gAVAABXIz4DNTQuAiczHgMVFA4CZUsPIhwSEhwiD0sRJR8UFB8lfSZmdHY0NXp7biklaXl/Ozt6c2AAAQBDAAAAmAB1AAMAAHM1MxVDVXV1AAEAIv+FAKYAbQADAABXNzMHIi1XRHvo6AAAAgBDAAAAmAG1AAMABwAAUzUzFQM1MxVDVVVVAUB1df7AdXUAAgAv/4UAtAG1AAMABwAAVzczBwM1MxUvLVhFGFR76OgBu3V1AAADAEMAAAKVAHUAAwAHAAsAAGE1MxUhNTMVMzUzFQJAVf2uValVdXV1dXV1AAIAUgAAAKcCswADAAcAAHcDMwMHNTMVWQZTBk5V5gHN/jPmc3MAAgBI/0EAnQH0AAMABwAAUxMjEzcVIzWWBlMGTlUBDv4zAc3mc3MAAAIAJAABAZYCvgAjACcAAHcmJjU0NjY3PgI1NCYjIgYGByc+AjMyFhYVFAYGBwYGFRUHNTMVoAQKGCoaJCYOP0MUOTgVBhY8PhhDWi0OKCcsLExUygsgExgrKhcfKSccNCwHCwU/Bw4KIEc6KzgxISU1ISPJc3MAAAIAJf83AZcB9AAjACcAAEEWFhUUBgYHDgIVFBYzMjY2NxcOAiMiJiY1NDY2NzY2NTU3FSM1ARsFCRgpGyQmDj9DFTg4FQYWPD0ZQ1otDignLCxMVAErCiAUGCsqFx8pJxw0LAcLBT8HDgogRzorODIgJTUhI8lzcwD//wBEAOIAmQFXBAcCnwABAOIAAQBvAGoBaQGHAAMAAHcRMxFv+moBHf7jAAABADYBcgF2AsEADgAAUycHJzcnNxc3FwczFSMX6SlrH2tpH2opMiiCgygBcn5PKU9NK05+EX40fQAAAgAYAAACGAKaABsAHwAAczUjNTM1IzUzNTMVMzUzFTMVIxUzFSMVIzUjFTUzNSOGbm5ubkaYRm5ubm5GmJiYrEO3QrKysrJCt0OsrKzvtwABACD/8QGAAsUAAwAAVycBF2ZGARpGDxkCuxoAAQAe//ABmQLDAAMAAEUBNwEBU/7LRQE2EAK1Hv1LAAABAEMA7wFyATcAAwAAdzUhFUMBL+9ISAABAEMA7wFyATcAAwAAdzUhFUMBL+9ISAABAEIA6QI2AS4AAwAAdzUhFUIB9OlFRQABAEIA6QQqAS4AAwAAdzUhFUID6OlFRQABAGb/YQIS/6UAAwAAVzUhFWYBrJ9ERAABADL/gwDmAu4AFQAAVy4DNTQ+AjczDgMVFB4CF5sRJR8UFB8lEUsPIhwSEhwiD30iYHN6Ozt/eWklKW57ejU0dnRmJgAAAQAk/4MA2ALuABUAAFcjPgM1NC4CJzMeAxUUDgJvSw8iHBISHCIPSxElHxQUHyV9JmZ0djQ1entuKSVpeX87O3pzYAABABf/gAE5AvMAOgAARS4DNTQ2NzY2NTQmJzU2NjU0JicmJjU0PgI3Fw4CFRQWFxYWFRQGBgceAhUUBgcGBhUUFhYXATczSCwUAwECATM5OjICAQEDFC1IMwEtMRMDAQECEi0qKi0SAgEBAxIxLYACFipALREmEg8aCCo1ED8ONCsKHRATJg8uQSoVAkMCHDEiDSISEB8LKjUhDAwiNioKGQ0SIhAhMh0DAAEAJ/+AAUkC8wA6AABXJz4CNTQmJyYmNTQ2NjcuAjU0Njc2NjU0JiYnNx4DFRQGBwYGFRQWFxUGBhUUFhcWFhUUDgIpAS4wEgICAQISLikpLhICAQICEzAuATNILRQCAgECMjo5MwIBAgIULEiAQwMdMiEQIhINGQoqNiIMDCE1KgsfEBIiDSIxHAJDAhUqQS4PJhMQHQorNA4/EDUqCBoPEiYRLUAqFgAAAQBO/4UBIgLtAAcAAFcRMxUjETMVTtSFhXsDaEb9JEYAAAEAKP+FAPwC7QAHAABXIzUzESM1M/zUhYXUe0YC3EYAAQAj/5IAtwCWAAMAAHcDIxO3MmJMlv78AQQAAAIAFP+TAS0AcAADAAcAAHcHIzczByM3kitTQdgrU0Fw3d3d3QAAAgAyAeUBSwLCAAMABwAAQQcjNyMHIzcBSytTQV4rU0ECwt3d3d0AAAIANQHnAVUCxAADAAcAAFM3MwczNzMHNStTQWUrU0EB593d3d0AAQAyAeUAsALCAAMAAFMHIzewK1NBAsLd3QABADUB5gCzAsMAAwAAUzczBzUrU0EB5t3dAAIALQBBAdsBpwAGAA0AAGUnNTcVBxcHJzU3FQcXAdu/v3t777+/fHxBmD6QUVxoUZg+kFFcaAAAAgBCAEEB8QGnAAYADQAAZTU3JzUXFQU1Nyc1FxUBMnx8v/5RfHzAQVFoXFGQPphRaFxRkD4AAQAtAEEA7AGnAAYAAHcnNTcVBxfsv798fEGYPpBRXGgAAAEAQgBFAQEBqwAGAAB3NTcnNRcVQnx8v0VRaF1QkD4AAgBCAdQBNgKzAAMABwAAUyczByMnMwfrA04F6wROBQHU39/f3wABAEIB1ACRArMAAwAAUyczB0UDTwYB1N/fAAEAJ/8VAboCsgAqAABXIiYmJzceAjMyNjURIzUzNTQ+AjMyFhYXByYmIyIGBhUVMxUjERQGBooPJSMMAQgjJgomJD4+Chw2Kw8lJQ0CDjAWGCEQkJAeQOsDBAFDAQICMT8BpEM0Kko4IAMEAkEBAhcyJ0lD/ltFTyEAAwBZ/+0B0gKqAAMABwALAABXJxMXAzUzFQE1MxXLMs8yIlr+h1kTDwKuEP3EXl4BkV5eAAIAM/81A6UC0wBPAGQAAEUiLgI1ND4CMzIWFhUVFA4DIyImJicOAiMiLgM1NDY2MzIWFzUzFRQeAjMyPgI1NTQuAiMiDgIVFB4CMzI2NjcXDgIDMjY2Ny4CNTUmJiMiBgYVFB4CAfhvqXM6PHWobJa+WRAeKzcgJDIcBBQ8QBwaNC0iFCRYThpDFU4EDh8aFiMZDSdUhV5ejV4uLFuOYhAzNxUDFDY1NBU1MxMCBQITOxc4OxYSHiTLLGm0h3uwbzRcuowNTGpCJA4UHAwMHBMLHjhZQVR0OxEJEL9TYjAPDi1eTw5bg1UpLWCUaG6XXSkDBAJFAgQDAQsOFQoVOD4eigcNK1U/OUcnDgADACr/9gKeAr4AKAAzAEIAAEUiJiY1NDY2Ny4CNTQ2NjMyFhYVFA4CBxc+AjcXDgIHFwcnBgYnMjY3Jw4CFRQWEz4CNTQmIyIGFRQeAgEhXmwtIUU0GRkIKU84O04mEiU6KJQGDAoBSwMPEgqALnkibU44VxjRKjUZS18rNRgtMy4zBQ4eCjRfQjtNMREdLi4dLEIlJUUvJDYrJhOTEDo/FwEjT0YYeDRvNzlGKy3QDSU4KkhMAVoTJS8jLC4tLxIdHSMAAQAjAAACJwKzABIAAHMRIyImJjU0NjYzIRUjESMRIxHkBzVVMDFUNgFJR0VyAUIvUzY3Uy9E/ZECb/2RAAACADP/aAG8AosAQABUAABXIiYmJzceBDMyNjU0JiYnLgI1NDY3LgI1NDY2MzIWFhcHLgIjIgYVFBYWFx4CFRQGBx4CFRQOAhM2NjU0JiYnJiYnBgYVFBYXHgL1F0BAGAcOIiUjIAw7Ph4/MjhLJScUDhQKLVc9GDw7FQMYPDcSQDkePzE3RiMbEAwQCBgwSDAJEBkyJxwwDgsWNDoVJSCYBggDQQIEAwMCLzEgIBIKCx86MSVIEQsdKh03RyMGCARBAwcEKy8hJBMKCh43MiJKGAoaJRsrQCkVASoONhkfIhIHBQsGDTIXLSQKBAkJAAADADsAoQJLAsQADwAsAD0AAGUiJiY1NDY2MzIWFhUUBgYnIiYmNTQ2NjMyFhcHJiYjIgYGFRQWMzI2NxcGBgcyNjY1NC4CIyIGBhUUFhYBQkx3RER4TE53Q0N3SywzFhY0LRcrCgMNKREZGggYIxEpDQMLLBtAYzkhPFAvP2M5OWOhSXxMTXxJSn1LTHxJcyJHNzRFIwcENwIFFSshMTQFAjYECEc+aD8vVD8kPmk/P2g+AAAEADsAoQJLAsQADwAiADAAOQAAZSImJjU0NjYzMhYWFRQGBicyNjY1NC4CIyIOAhUUHgInETMyFhUUBgcXIycjFTUzMjY1NCYjIwFCTHdERHdMT3dDQ3dPQGM5ITxQLy9QOyEhO1A/cDU8FR03PzI5ORoYHSAuoUl8TE18SUp9S0x8SSw+aD8vVD8kJD9ULy9TPyRNAS8qNiUrDHNqapoYGhsYAAIAWwFLAlkCdwAMABQAAEERMxc3MxEjNQcjJxUnNSM1MxUjFQFBSUJFSDVBLEDOTshBAUsBLM7O/tTez8/eAfc0NPcAAgCKAaMBpgK+AAsAFwAAQSImNTQ2MzIWFRQGJzI2NTQmIyIGFRQWARg/T08/P09PPykzMykpMTEBo01AP09PP0BNMTMpKTMzKSkzAAEATf8jAJsCzQADAABXETMRTU7dA6r8VgAAAgBP/yMAnQLNAAMABwAAUxEzEQMRMxFPTk5OAVcBdv6K/cwBef6HAAEAIv+0Ab0CswALAABXAyM1MzUzFTMVIwPNBaamTqenBUwB+0W/v0X+BQAAAQA3/7QB0gKzABMAAFc1IzUzNSM1MzUzFTMVIxUzFSMV3aampqZOpqanp0zAQ/hFv79F+EPAAAADAB3/9gICAp8AAwAHACwAAFM1IRUFNSEVByIuAjU0PgIzMhYWFwcuAiMiDgIVFB4CMzI2NxcOAh0BrP5UAax+Sl81FRU1X0oiRDwVAxY8QBk3QyUNDSREOChgIgMYPUIBeT8/nT8/5i1WflJUgFYsBwoFQAQIBSFDZ0ZFZkIhCwZBBQoGAAEAZP+vAb4CRgAkAABFNS4CNTQ2Njc1MxUWFhcHLgIjIgYVFBYWMzI2NjcXBgYHFQEWO1AnKE86RBc6EwMOMTERSTsYPTUSLiwQAxM7F1F1AyhbTkpeLgN1dwEIBD4CAwJDUDU/GwIEAT8DBwF3AAAGADkAHQH3AdsADwATACMAJwArAC8AAGUuAjU0NjYzMhYWFRQGBgcnNxc3MjY2NTQmJiMiBgYVFBYWJyc3FxMnNxcnJzcXARgyUzExUzIyUzExU9s2ZTZEHzMfHzMfHzMfHzNbZTZl7WU2ZWU2ZTZGATFSMjJTMTFTMjJSMSo2ZTYJHzMfHzMfHzMfHzMftWU2Zf6nZTZl7TZlNgADAET/hAHuAx8AAwAHADoAAFcTFwMTJxMzAyImJic3HgIzMjY2NTQmJicuAjU0NjYzMhYWFwcuAiMiBgYVFBYWFx4DFRQGBso5Mzg+MzgzWhxMTBwHHElIGS49HxxANUVaLTVfQRxKRxoHHEhDFC4/ICBGOTJILhY0X3wBvgn+SwHjCAGw/NgHCgQ/AwgFHDktJCsZCw8nSD5ATyQHCQRAAwgFFy8kKiwZDQsbJzorSVopAAABAFAAAAHiAp4AIgAAczUzESM1MzU0PgIzMhYWFwcuAiMiBgYVFTMVIxEzNxcHUFRDQxIkOCcUMjARAhEtLhEfIw6pqZhMDVFFARlENzxNKxEGBwQ/AgUDFzk0MkT+5xBDEgAAAQAWAAACGgKUABgAAHM1IzUzNScjNTMDMxMTMwMzFSMHFTMVIxXxt7cHsYmsWaqnWqqGrQi2tqFEQhNDARf+9QEL/ulDE0JEoQABACD/8QGAAsUAAwAAVycBF2ZGARpGDxkCuxoAAQA3ABQB+QHgAAsAAHc1IzUzNTMVMxUjFfO8vEi+vhTDSMHBSMMAAAEAQgDXAe4BHwADAAB3NSEVQgGs10hIAAEARgApAeoBzQALAAB3JzcnNxc3FwcXByd5M6KhMp+gMqKiM58pMqCfMqGiM5+gMqEAAwA3AB4B+QHYAAMABwALAAB3NSEVBTUzFQM1MxU3AcL+909PT9dISLlmZgFUZmYAAgBAAHoB8AF8AAMABwAAUzUhFQU1IRVAAbD+UAGwATRISLpISAADAED/4wHwAhcAAwAHAAsAAFcnExcFNSEVBTUhFcY/7D/+jgGw/lABsB0ZAhsZykhIukhIAAABAFIADQHyAecABgAAdzUlJTUFFVIBT/6xAaANUp2aUcpEAAABAD0ADQHdAecABgAAZSU1JRUFBQHd/mABoP6xAU8NzETKUZqdAAIARwAJAe4B8gAGAAoAAHc1JSU1BRURITUhRwFM/rQBp/5ZAaeHT2tjTpBH/u5HAAIAQQAJAegB8gAGAAoAAGUlNSUVDQI1IRUB6P5ZAaf+tAFM/lkBp4eUR5BOY2vNR0cAAgA3ACUB+QHoAAsADwAAdzUjNTM1MxUzFSMVBTUhFfO8vEi+vv78AcKnfUd9fUd9gkdHAAIAQABTAe8BkQAbADcAAEEiLgIjIgYGByc+AjMyHgIzMjY2NxcOAgciLgIjIgYGByc+AjMyHgIzMjY2NxcOAgF+FDg8Mw8PJyYNCw4oLBMVNjo0EQ0mJQ4KDSYqFBQ4PDMPDycmDQsOKCwTFTY6NBENJiUOCg0mKgEOEhgSDxUKQAwYERIYEg8WCUALGRG7EhgSDxUKQAwYERIYEg8WCUALGREAAQBDAMIB7wFFABsAAGUiLgIjIgYGByc+AjMyHgIzMjY2NxcOAgF+Ezk7Mw4PJyUOCg4nLBMUNzkzEQ4lJQ4KDSYqwhIYEg8VCkAMGBESGBIPFglACxkRAAEAQQB1Ae0BVwAFAABlNSE1IRUBpf6cAax1m0fiAAEAOAE/AfcClAAGAABTEzMTIwMDOLpFwFSOigE/AVX+qwEI/vgABAAeAHkCEgHPAA0AGwArADsAAGUiJiYnPgIzMhYVFAYhIiY1NDYzMhYWFw4CJzI2NjcuAiMiBgYVFBYWMzI2NjU0JiYjIgYGBx4CAZQmNScSEic2Jz4+Pv7IQD4+Pig1JxIUJzIgGh0VDQsWHhoWGgsMGv8WGQwLGhYZHxUMDBUfeSZNODlMJllSUllZUlJZJkw5Q0oeRhctIRkuHhgtIB0uGhgtICAtGB4uGRkuHgABAF3/RAHTAwwAIAAAVyImJic3FhYzMjY1ETQ2NjMyFhYXByYmIyIGBhURFAYGtQ0hHwsDDCgQKSEePS4QIiAKAwwpFBghECA9vAMEAkIBAzA/AkdNWSUDBANBAgIYOjP9uURQIQABAC7/9wICAp8AKwAAVzUzLgM1NDY2MzIWFhUUDgIHMxUjNT4DNTQmJiMiBgYVFB4CFxUueBIlIRQnYVZXYCcUISYSecURIyATFDs9PTwTEyAkEAlFG0tWWChjg0FBg2MoWFZLG0U7H09VUB9TbDU1bFMfUFVPHzsAAAIANQAAAfsClAAFAAkAAHM1EzMTFyUhAyM1nYycAf6KASWGGjwCWP2nO0UCCwABAB7/XAISAvIACwAAVxEjNSEVIxEjESMRY0UB9EZQyaQDT0dH/LEDT/yxAAEAK/9cAgMC8gAOAABXNQEBNSEVIRUTFQMVIRUrAQn+9wHY/nz+/gGEpGcBcAFZZkcW/ro5/qYYSAACAAT/eAI4AwoABwALAABXAzMTMxMzAwE1MxXDllN+C99Q9v7Cd4gCRv3+A078bgH/R0f//wBD/0cBzAH0BCYA5gAAAAcArf/7/0cAAgAt//cB9QLXAB0AKgAARSImNTQ2NjMyFhYXJiYjIgYGByc+AjMyFhYVFAYnMjY3LgIjIgYVFBYBDWp2Ml9CHT03EQRJWRo8NRIEEzhDIFFpMmx8TkYBEDM7HERERglybkNgNQoNB4l5DhQKPgsXEEuigbu3RYaLBg4JUkFKUQAFABz/7QIVAqoAAwATACMAMwBDAABXJxMXASImJjU0NjYzMhYWFRQGBicyNjY1NCYmIyIGBhUUFhYBIiYmNTQ2NjMyFhYVFAYGJzI2NjU0JiYjIgYGFRQWFssyzzL+8CIxGxsxIiIxGxsxIhIVCQkVEhIVCQkVAS8iMhsbMiIiMRsbMSISFQkJFRISFQoKFRMPAq4Q/uwfPzAwPR0dPTAwPx81FCgdHSYTEyYdHSgU/jsfPzAwPR0dPTEwPx40FCgdHiYSEiYdHSkUAAAHACL/7QMgAqoADwAfACMAMwBDAFMAYwAARSImJjU0NjYzMhYWFRQGBicyNjY1NCYmIyIGBhUUFhYFJxMXASImJjU0NjYzMhYWFRQGBicyNjY1NCYmIyIGBhUUFhYBIiYmNTQ2NjMyFhYVFAYGJzI2NjU0JiYjIgYGFRQWFgKyIjEbGzEiIjEbGzEiEhUJCRUSEhUJCRX+MTLPMv7wIjEbGzEiIjEbGzEiEhUJCRUSEhUJCRUBLyIyGxsyIiIxGxsxIhIVCQkVEhIVCgoVCh8/MDA9HR09MTA/HjQUKB0eJhISJh0dKRQ9DwKuEP7sHz8wMD0dHT0wMD8fNRQoHR0mExMmHR0oFP47Hz8wMD0dHT0xMD8eNBQoHR4mEhImHR0pFAAAAgA1AAAB+wKUAAUACwAAcwMTMxMDJzMTAyMD3aiod6enRxaHhxaHAUkBS/61/rdFAQQBBv76AAADABsBvQEIAnsAEAAUABgAAFM0NjYzMhYWFSM0JiMiBgYVBzUzFSc1MxU4HDAcHS8cNhwWDhwSSe3QNgHwHSwaGiwdFBwNFQ4zMzMzi4sAAAIAGwIHAQgCnQAPABMAAFM0NjYzMhYWFSM0JiMiBhUHNTMVOBwwHB0vHDYcFhUdU+0COh0tGRktHRQcHBQzMzMAAAEAFAHWADgCVAADAABTNTMVFCQB1n5+//8AFAHzADgCcQYGAvcAHQACABQB7QDZAqEAFAAYAABTJiY1NDY2MzIWFwcmJiMiBhUUFhcHNTMVSBARHTAcECAMGggPCBcbCwtjxQHtFCYVHS4aCQgtBQMaFQ0YDhw1NQD//wAU/2wA2QAgBgcC+QAA/X///wAMAe0A2gNeBiYC+QAAAAcDBv/4ALj//wAcAe0BCwNeBCYC+RgAAgcDAwAAALj//wAUAe0A2gL6BiYC+QAAAAcDBQABALj//wAUAe0A2QNSBiYC+QAAACcDBQAAALgABwMFAAABEP//ABQB7QDZA4QGJgL5AAAABwMQABUBHP//ABT+/wDZACAGJwL5AAD9fwAHAwUAAPzh//8AFP66ANkAIAYnAvkAAP1/ACcDBQAA/PQABwMFAAD8nP//ABQCCgDZAoYGJgMFAOwABgMFAEQABAAcAh4BCwKmAAMABwAWABoAAFMHJzcHNTMVMyY2MzIWFgcnNiYjIgYXBzUzFVgjGSMKQwkNHDEhIgcJIwsQGRkPC2fFAigKWQpjJCQ9SyI9KQc0KSkzCCQkAP//ABT/tgDZADIGJwMFAAD98AAHAwUAAP2YAAEAFAIeANkCQgADAABTNTMVFMUCHiQkAAIAFAIeAOICpgAOABIAAFMmNjMyFhYHJzYmIyIGFwc1MxVYDRwxISIHCSMLEBkZDwtnxQIePUsiPSkHNCkpMwgkJAD//wAU//oA2QAeBgcDBQAA/dwAAv/5Aa0A8wJCAA8AHwAAUyImNTUzFRQWMzI2JzcWBiMiJjcXBhYzMjY1NTMVFAanISIkEA8XDwojDR6QLh4NIwoQFg8QJCIBrTErHx8fGTI4B0VQUEUHODIZHx8fKzH////5Aa0A8wLbBiYDCAAAACYDBf5BAAcDBf/+AJn////3Aa0A8wLnBiYDCAAAAAYDA9tB////+QD3APMCQgYmAwgAAAAnAwX///8xAAcDBf///tn////5Aa0A8wKDBiYDCAAAAAYDBf9B////+QGtAPMC5wYmAwgAAAAGAwb2Qf////oCHgD0AwsGJgMFAAAABwMIAAEAyf////kBrQDzAt0GJgMIAAAABwL3AE8AiQACAAoBugC5AmgADwAbAABTIiYmNTQ2NjMyFhYVFAYGJzI2NTQmIyIGFRQWYhgoGBgoGBgoFxcoGBUeHhUWHh4BuhcoFxknGBgnGRcoFyQeFBYeHhYUHgAAAQAYAjkBCAKPABEAAFMnNzMWFjMyNjcXDgIjIiYnNx8sMwoiEBEfChsJHCQXFioPAjkaPAwMCwsXEBoPDw8AAAEAFAF4AM8B9QAbAABTIiYmNTQ2NxcGBhUUFjMyNjU0Jic3FhYVFAYGchMsHwIDIwEDIBoaHwICIwQBHysBeA4hHAUdEAYLGQgRFhYRDBUJCBAdBRwhDgACAAoCbAEeAsgAAwAHAABTNTMVITUzFdNL/uxLAmxcXFxcAAABAFACXwCeArgAAwAAUzUzFVBOAl9ZWQAB//4CTgDzAuUAAwAAUyc3F93fG9oCTlRDYwAAAQAZAk4BDQLlAAMAAFMnNxcuFdoaAk40Y0MAAAIAAAJFAYoC/gADAAcAAFMnNxcFJzcX9zWPOf6sNpA5AkUsjS2MLIwsAAH/7QJPARkC3AAGAABDNzMXIycHE3s0fU1JSAJPjY1WVgAB/+8CTwEbAtwABgAAUyczFzczB2p7TUlJTX0CT41WVo0AAf/vAkoBGQLWABAAAFMiJiYnMxYWMzI2NzMOA4QtQiQCPwItJygtAT8BFiY2AkomQCYlLi8kHTMmFgAAAgASAhwA4wLtAAwAGgAAUyImNTQ2NjMyFhUUBicyNjY1NCYjIgYGFRQWey08HC8eLDw8LBAYDh8XDxkPIAIcPC0dLxw8LC08MQ8ZEBcgDxkPGCAAAf/jAmMBIALPABkAAFMiLgIjIgYHJz4CMzIeAjMyNjcXDgLJDyYnIwwNLBASCx8iDxAmJyILDCsPEgodIQJjDhIOGwwxCxgRDhEOGQ0yCxgQAAH/8gJvAQYCrAADAABDNSEVDgEUAm89PQAAAQAp/yYA3gABABcAAFciJic3FhYzMjY1NCYjIzUzFTIWFhUUBoAYMQ4DCSwMFRcXFSkqJTIZNNoEAzEBAREUEw5fMQ0iIDArAAABAL7/MQFrAAgAFgAARSImJjU0NjY3Fw4CFRQWMzI2NxcGBgEdHysVGSYTPxUgEhUUCR0KChMszxkmFRgwKxAIEyYjDxAVBQE8AwYAAv/pAyYBAAOCAAMABwAAUzUzFSE1MxW1S/7pSwMmXFxcXAAAAQBQAx8AngN4AAMAAFM1MxVQTgMfWVkAAQAKAwgA/gOkAAMAAFMnNxfn3RraAwhXRWQAAAEADAMIAQADpAADAABTJzcXIxfaGgMIOGRFAAAC/9kC8AFjA5gAAwAHAABTJzcXBSc3F9Q1iTv+qzWKOgLwIIcjgyCHJAABADQDFgGEA50ABgAAUzczFyMnBzSGRIZXUFEDFoeHT08AAf/dAxYBLAOdAAYAAFMnMxc3MwdjhldRUFeGAxaHTk6HAAH/6wMRASgDlgAPAABTIiYmJzMWFjMyNjczDgKJL0UoAkgCMSMkMgFIAihFAxEiPCciKCgiJzwiAAACAA0CoAD8A3UADAAaAABTIiY1NDY2MzIWFRQGJzI2NjU0JiMiBgYVFBaFNEQfNyIyRUUyExsPIB0THA8hAqA4MiIwGTgzMjg1DRgQGhsMGBEZHAAB/+IDIQE2A5sAGQAAUyIuAiMiBgcnPgIzMh4CMzI2NxcOAuASLjAoCw0sEBILHiIPEy8uJwwLKhASCR0hAyEQFhAhDzoNGhMQFRAeDzoMGhIAAf/qAyoBIwNnAAMAAEM1IRUWATkDKj09AP//ACIB3ACmAsQGBwKgAAACVwABACECDQClAvUAAwAAUwcjN6UtV0QC9ejoAAH/z/8hAJMB9AANAABHJz4DNREzERQOAhMeJS8bC0oRJz/fOhUjJTEkAef+GDBFMysAAQAW/uIAjP+yAAMAAFM3MwcWKU0y/uLQ0AAB/+wAAAAAAEcACQAAcSIuAjU0NjYzBggEAgMJCAUJDggLDwkAAAQAOP+LAlwDIAADAAcAFwAnAABBNxcHASc3FxciJiY1NDY2MzIWFhUUBgYnMjY2NTQmJiMiBgYVFBYWAa5RPEv+qjtPPGBsdy8wd2trdzAvd2xPUh4fUk5OUh8eUgJzrRmh/SUcqBo/UJ1zc6BVVKFzdp1NRzx9YF2BQ0OAXl19PwAFADj/iwJcA6QAAwAHAAsAGwArAABBNxcHASc3FwMnNxcDIiYmNTQ2NjMyFhYVFAYGJzI2NjU0JiYjIgYGFRQWFgGuUTxL/qo7TzwDF9oaemx3LzB3a2t3MC93bE9SHh9STk5SHx5SAnOtGaH9JRyoGgLTOGRF/JdQnXNzoFVUoXN2nU1HPH1gXYFDQ4BeXX0/AAMARP+EAe4DHwADAAcAOgAAVzcXBxMnNzMDIiYmJzceAjMyNjY1NCYmJy4CNTQ2NjMyFhYXBy4CIyIGBhUUFhYXHgMVFAYGyhUzFGIzFDNaHExMHAccSUgZLj0fHEA1RVotNV9BHEpHGgccSEMULj8gIEY5MkguFjRffKUJnAL7CJj82AcKBD8DCAUcOS0kKxkLDydIPkBPJAcJBEADCAUXLyQqLBkNCxsnOitJWikABAAy/5EB3wJeAAMABwAXACcAAEEnNxcBJzcXFyImJjU0NjYzMhYWFRQGBicyNjY1NCYmIyIGBhUUFhYBeTQ3NP7iNEA0NlRdJSleT1BeKSVdVTo6Exg6NTQ7GBM6AcQThxP9RhOcEzc6dlpWcDg4cFZadjpDKVhGRVIkJFJFRlgpAAUAMv+RAd8C5QADAAcACwAbACsAAEEnNxcBJzcXAyc3FwMiJiY1NDY2MzIWFhUUBgYnMjY2NTQmJiMiBgYVFBYWAXk0NzT+4jRANC4V2hp7VF0lKV5PUF4pJV1VOjoTGDo1NDsYEzoBxBOHE/1GE5wTAiE0Y0P9VDp2WlZwODhwVlp2OkMpWEZFUiQkUkVGWCk=
    `
  }

}
