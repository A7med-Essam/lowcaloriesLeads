import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GuardService } from 'src/app/services/guard.service';
import {
  Subscriptions,
  SubscriptionsService,
} from 'src/app/services/subscriptions.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { TableCheckbox } from 'primeng/table';
import { PaymentlinkService } from 'src/app/services/paymentlink.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-subscription',
  templateUrl: './show-subscription.component.html',
  styleUrls: ['./show-subscription.component.scss'],
})
export class ShowSubscriptionComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  subscriptions: Subscriptions[] = [];
  allSubscriptions: any[] = [];
  printPermission: boolean = false;
  exportPermission: boolean = false;
  currentPage: number = 1;
  PaginationInfo: any;

  constructor(
    private _SubscriptionsService: SubscriptionsService,
    private _GuardService: GuardService,
    private _Router: Router,
    private _MessageService: MessageService,
    private _PaymentlinkService:PaymentlinkService,
    private _SurveyService:SurveyService
  ) {}

  ngOnInit(): void {
    this._SubscriptionsService.subscription_filter
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.appliedFilters = res;
        }
      });
    this.getSubscriptions();
    this.getPaymentDetails();
    this.getAgents();
    this.getPermission();
    this.createFilterForm();
  }

  getPermission() {
    this.printPermission =
      this._GuardService.getPermissionStatus('print_subscription');
    this.exportPermission = this._GuardService.getPermissionStatus(
      'export_subscription'
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getAllSubscriptions() {
    this._SubscriptionsService.getAllSubscriptions().subscribe((res) => {
      this.allSubscriptions = res.data;
    });
  }

  getSubscriptions(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._SubscriptionsService.getSubscriptions(page).subscribe((res) => {
        this.subscriptions = res.data.data;
        this.PaginationInfo = res.data;
      });
    }
  }

  showRow(sub: any) {
    if (sub) {
      this._SubscriptionsService.subscription.next(sub);
      this._Router.navigate(['subscriptions/details']);
    }
  }

  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getSubscriptions(e.first / e.rows + 1);
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'not complete':
        return 'danger';
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  }
  // ****************************************************PDF************************************************************************

  // exportAsPDF() {
  //   if (this.printPermission) {
  //     // Default export is a4 paper, portrait, using millimeters for units
  //     const doc = new jsPDF();
  //     doc.internal.pageSize.width = 600;
  //     const imageFile = '../../../../assets/images/logo.png';
  //     doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

  //     doc.setTextColor(50);
  //     doc.setFontSize(14);
  //     doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
  //     doc.text('Issue Subject:Subscription Requests Report', 10, 45);
  //     doc.text('Prepared By: Low Calories Technical Team', 10, 55);
  //     doc.text('Requested By: Mohamed Fawzy', 10, 65);
  //     doc.text('Low Calories Restaurant - Egypt', 500, 25);
  //     doc.text('3rd Settelment, New Cairo', 500, 35);
  //     doc.text('Phone: 201116202225', 500, 45);
  //     doc.text('Email: info@thelowcalories.com', 500, 55);
  //     doc.text('Website: thelowcalories.com', 500, 65);

  //     const headers = [
  //       'Date',
  //       'name',
  //       'email',
  //       'mobile',
  //       'branch',
  //       'delivery_branch',
  //       'subscription_plan',
  //       'remaining_days',
  //       'payment_method',
  //       'cid',
  //       'address',
  //       'bank_name',
  //       'iban',
  //       'account_hold_name',
  //       'bank_account_number',
  //       'agent_name',
  //       'amount_paid',
  //       'reason',
  //     ];
  //     let filteredArray = this.allSubscriptions.filter((item: any) =>
  //       this.specificRows.includes(item.id)
  //     );
  //     filteredArray.length == 0 &&
  //       this.appliedFilters == null &&
  //       (filteredArray = this.allSubscriptions);
  //     filteredArray.length == 0 &&
  //       this.appliedFilters != null &&
  //       (filteredArray = this.subscriptions);
  //     const convertedData = filteredArray.map((obj: any) => [
  //       obj.created_at.substring(0, 10),
  //       obj.name,
  //       obj.email,
  //       obj.mobile,
  //       obj.branch,
  //       obj.delivery_branch,
  //       obj.subscription_plan,
  //       obj.remaining_days,
  //       obj.payment_method,
  //       obj.cid,
  //       obj.address,
  //       obj.bank_name,
  //       obj.iban,
  //       obj.account_hold_name,
  //       obj.bank_account_number,
  //       obj.agent_name,
  //       obj.amount_paid,
  //       obj.reason,
  //     ]);
  //     autoTable(doc, { startY: 70 });
  //     autoTable(doc, {
  //       head: [headers],
  //       body: convertedData,
  //     });

  //     // Set the line color and width
  //     doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
  //     doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

  //     // Draw a line at the bottom of the page

  //     // Get the total number of pages
  //     const totalPages = doc.internal.pages;

  //     // Iterate over each page and add the footer
  //     for (let i = 1; i <= totalPages.length; i++) {
  //       doc.internal.pageSize.width = 600;
  //       doc.line(
  //         20,
  //         doc.internal.pageSize.height - 20,
  //         doc.internal.pageSize.width - 20,
  //         doc.internal.pageSize.height - 20
  //       );
  //       // Set the current page as active
  //       doc.setPage(i);
  //       // Set the position and alignment of the footer
  //       doc.setFontSize(10);
  //       doc.setTextColor(150);
  //       doc.text(
  //         'Thelowcalories.com',
  //         20,
  //         doc.internal.pageSize.getHeight() - 10
  //       );
  //     }

  //     doc.save('All_Subscription.pdf');
  //   }
  // }

  print(sub: any) {
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

      autoTable(doc, { startY: 50 });

      let columns:any[] = [];
      for (const key in sub) {
        if (sub.hasOwnProperty(key) && key !== 'subscription_days') {
          const columnObj = { title: key, dataKey: sub[key] };
          if (columnObj.title && columnObj.dataKey) {
            columns.push(columnObj);
          }
        }
      }


      // doc.text(140, 40, "Report");
      autoTable(doc, { body: columns });

      // Set the line color and width
      doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
      doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

      // Draw a line at the bottom of the page

      // Get the total number of pages
      const totalPages = doc.internal.pages;

      // Iterate over each page and add the footer
      for (let i = 1; i <= totalPages.length; i++) {
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
          10,
          doc.internal.pageSize.getHeight() - 5
        );
      }

      doc.save('Subscription.pdf');
    }
  }
  // ****************************************************filter************************************************************************

  appliedFilters: any = null;
  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      Invoice_no: new FormControl(null),
      version: new FormControl(null),
      code_ids: new FormControl(null),
      delivery_starting_day: new FormControl(null),
      plan: new FormControl(null),
      emirate: new FormControl(null),
      Mobile_no: new FormControl(null),
      program_id: new FormControl(null),
      discount: new FormControl(null),
      code: new FormControl(null),
      mode: new FormControl(null),
      branch_id: new FormControl(null),
      agent_id: new FormControl(null),
      company: new FormControl(null),
      date: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
    });
  }

  filter(form: FormGroup) {
    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
          date: null,
        });
      } else {
        form.patchValue({
          date: null,
        });
      }
    }
    if(form.value.delivery_starting_day){
      form.patchValue({
        delivery_starting_day: new Date(form.value.delivery_starting_day).toLocaleDateString('en-CA'),
      });
    }
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    this.appliedFilters = form.value;
    this._SubscriptionsService.subscription_filter.next(this.appliedFilters);
    this._SubscriptionsService
      .filterSubscriptions(1, form.value)
      .subscribe((res) => {
        this.subscriptions = res.data.data;
        this.PaginationInfo = res.data;
      });
  }

  getOldFilters(page: number) {
    this._SubscriptionsService
      .filterSubscriptions(page, this.appliedFilters)
      .subscribe((res) => {
        this.subscriptions = res.data.data;
        this.PaginationInfo = res.data;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterForm.reset();
    this.getSubscriptions();
    this._SubscriptionsService.subscription_filter.next(null);
  }

  resetFields() {
    this.filterForm.reset();
  }
  // ****************************************************filter Options************************************************************************
  versions: any[] = [
    { label: "Version 1", value: 'v1' },
    { label: "Version 3", value: 'v3' },
  ];
  modes: any[] = [
    { label: "Pending", value: 0 },
    { label: "Not Completed", value: 1 },
    { label: "Completed", value: 2 },
  ];
  companies: any[] = [
    { label: "Low Calories", value: 'lc' },
    { label: "Chef Gourmet", value: 'ch' },
  ];
  payments: any[] = [
    { label: "Web", value: 'web' },
    { label: "Mobile", value: 'mobile' },
    { label: "Online", value: 'online' },
    { label: "Payment Link", value: '50' },
    { label: "Cash", value: '51' },
    { label: "Credit Card", value: '52' },
    { label: "EXCHANGE", value: '53' },
    { label: "NUTRAION Online", value: '60' },
    { label: "NUTRAION Clinic", value: '61' },
    { label: "C & C & E", value: '51-52-53' },
  ];

  giftCodes:any[]=[]
  emirates:any[]=[]
  branches:any[]=[]
  getPaymentDetails() {
    this._PaymentlinkService.getPaymentDetails().subscribe((res) => {
      if (res.status == 1) {
        this.giftCodes = res.data.GiftCodes;
        this.branches = res.data.branches;
        this.emirates = res.data.emirates;
        this.giftCodes = this.giftCodes.map( c => {
          return {
            code:`${c.code} (${c.percentage}%)`,
            id:c.id,
            percentage:c.percentage
          }
        })
      }
    });
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }
  // ****************************************************export************************************************************************

  export() {
    if (this.exportPermission) {
      let exportObservable;
      if (this.specificRows.length > 0) {
        exportObservable = this._SubscriptionsService.exportByIds(
          this.specificRows
        );
      } else if (this.appliedFilters) {
        const ids = this.subscriptions.map((obj: any) => obj.id);
        exportObservable = this._SubscriptionsService.exportByIds(ids);
      } else {
        exportObservable = this._SubscriptionsService.exportAll();
      }
      exportObservable.subscribe({
        next: (res) => {
          this.handleExportSuccess(res.data);
        },
      });
    }
  }

  private handleExportSuccess(data: any) {
    this._MessageService.add({
      severity: 'success',
      summary: 'Export Excel',
      detail: 'Subscriptions Exported Successfully',
    });

    const link = document.createElement('a');
    link.target = '_blank';
    link.href = data;
    link.click();
  }

  // ****************************************************filter columns************************************************************************
  filterColumns: boolean = false;
  selectedColumns: any[] = [];
  specificRows: number[] = [];
  columns: any[] = [
    { name: 'id', status: false },
    { name: 'version', status: false },
    { name: 'deleted', status: false },
    { name: 'sub_from', status: true },
    { name: 'status', status: true },
    { name: 'order_id', status: false },
    { name: 'user_id', status: false },
    { name: 'program_id', status: false },
    { name: 'plan_id', status: false },
    { name: 'custom', status: false },
    { name: 'option_id', status: false },
    { name: 'location_id', status: false },
    { name: 'erp_location', status: false },
    { name: 'code_id', status: false },
    { name: 'code', status: false },
    { name: 'price', status: true },
    { name: 'vat', status: true },
    { name: 'cutlery', status: true },
    { name: 'bag', status: true },
    { name: 'total_price', status: true },
    { name: 'delivery_starting_day', status: true },
    { name: 'days_of_week', status: false },
    { name: 'dislike', status: false },
    { name: 'dis_like_user', status: false },
    { name: 'note', status: false },
    { name: 'order_notes', status: false },
    { name: 'subscriptions_note', status: true },
    { name: 'full_plan_name', status: false },
    { name: 'invoice_no', status: true },
    { name: 'mastercard_session_id', status: false },
    { name: 'mastercard_session_version', status: false },
    { name: 'mastercard_successIndicator', status: false },
    { name: 'mastercard_result_session_version', status: false },
    { name: 'mastercard_resultIndicator', status: false },
    { name: 'mode', status: false },
    { name: 'branch', status: false },
    { name: 'branch_paid_on_id', status: false },
    { name: 'branch_invoice_image', status: false },
    { name: 'agent_id', status: false },
    { name: 'updated_text', status: false },
    { name: 'created_date', status: false },
    { name: 'created_time', status: false },
  ];

  getFilterColumns() {
    this.columns.forEach((element) => {
      element.status = false;
    });

    this.selectedColumns.forEach((e) => {
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].name == e) {
          this.columns[i].status = true;
        }
      }
    });
  }

  selectAllColumns(checkboxContainer: HTMLElement, currentCheckbox: Checkbox) {
    setTimeout(() => {
      if (!currentCheckbox.checked()) {
        this.selectedColumns = [];
      } else {
        let checkboxes: HTMLLabelElement[] = [];
        this.selectedColumns = [];
        for (let i = 0; i < checkboxContainer.children.length; i++) {
          checkboxes.push(checkboxContainer.children[i].children[1] as any);
        }
        this.columns.forEach((e) => {
          this.selectedColumns.push(e.name);
        });
      }
    }, 1);
  }

  getSpecificRows(input: TableCheckbox) {
    if (input.checked) {
      this.specificRows.push(Number(input.value.id));
    } else {
      const index = this.specificRows.indexOf(Number(input.value.id));
      if (index > -1) {
        this.specificRows.splice(index, 1);
      }
    }
  }

  selectAllRows(input: any): void {
    if (input.checked) {
      this.specificRows = this.subscriptions.map((obj: any) => obj.id);
    } else {
      this.specificRows = [];
    }
  }

  // ****************************************************SORT************************************************************************
  sort(event: any) {
    const sortField = event.sortField;
    const sortOrder = event.sortOrder === 1 ? 1 : -1;
    this.subscriptions?.sort((a: any, b: any) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (
        typeof aValue === 'string' &&
        Date.parse(aValue) &&
        typeof bValue === 'string' &&
        Date.parse(bValue)
      ) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return (aDate.getTime() - bDate.getTime()) * sortOrder;
      } else if (
        !isNaN(parseFloat(aValue)) &&
        typeof parseFloat(aValue) === 'number' &&
        !isNaN(parseFloat(bValue)) &&
        typeof parseFloat(bValue) === 'number'
      ) {
        return (aValue - bValue) * sortOrder;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * sortOrder;
      } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
        return (aValue.length - bValue.length) * sortOrder;
      } else {
        return 0;
      }
    });
  }
}
