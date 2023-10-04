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
import {
  GiftCode,
  PaymentlinkService,
} from 'src/app/services/paymentlink.service';
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
  updatePermission: boolean = false;
  currentPage: number = 1;
  PaginationInfo: any;

  constructor(
    private _SubscriptionsService: SubscriptionsService,
    private _GuardService: GuardService,
    private _Router: Router,
    private _MessageService: MessageService,
    private _PaymentlinkService: PaymentlinkService,
    private _SurveyService: SurveyService
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
    this.updatePermission = this._GuardService.getPermissionStatus(
      'update_subscription'
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
        this.subscriptions = this.transformObjects(res.data.data);
        this.PaginationInfo = res.data;
      });
    }
  }

  transformObjects(arr: any) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].gift_code) {
        arr[i].codes = arr[i].gift_code;
        delete arr[i].gift_code;
      }
    }
    return arr;
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

  getSeverity(status: number) {
    switch (status) {
      case 0: //pending
        return 'danger';
      case 1: //not complete
        return 'warning';
      case 2: //completed
        return 'success';
      default:
        return 'info';
    }
  }

  getMode(status: number) {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Not Complete';
      case 2:
        return 'Completed';
      default:
        return '';
    }
  }
  // ****************************************************PDF************************************************************************
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
      doc.text('Low Calories Restaurant - UAE', 150, 30);
      doc.text('3rd Settelment, New Cairo', 150, 35);
      doc.text('Phone: 04-5973939', 150, 40);
      doc.text('Email: info@thelowcalories.com', 150, 45);
      doc.text('Website: thelowcalories.com', 150, 50);

      autoTable(doc, { startY: 50 });

      let columns: any[] = [
        { title: 'invoice_no', dataKey: sub?.invoice_no },
        { title: 'subscribed from', dataKey: sub?.sub_from },
        { title: 'Agent', dataKey: sub?.agent?.name },
        {
          title: 'Client Name',
          dataKey: sub?.user?.first_name + ' ' + sub?.user?.last_name,
        },
        { title: 'Mobile', dataKey: sub?.user?.phone_number },
        { title: 'Mode', dataKey: this.getMode(sub?.mode) },
        { title: 'Emirate', dataKey: sub?.location?.emirate?.en_name },
        { title: 'Start Date', dataKey: sub?.delivery_starting_day },
        { title: 'Plan', dataKey: sub?.subscriptions_note },
        { title: 'Area', dataKey: sub?.location?.area_id },
        { title: 'Total Price', dataKey: sub?.total_price },
        { title: 'Code', dataKey: sub?.codes?.code },
        { title: 'Discount', dataKey: sub?.codes?.percentage + '%' },
      ];

      columns = columns.filter(
        (item) => item.dataKey !== null && item.dataKey !== undefined
      );

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
    if (form.value.delivery_starting_day) {
      form.patchValue({
        delivery_starting_day: new Date(
          form.value.delivery_starting_day
        ).toLocaleDateString('en-CA'),
      });
    }
    if (form.value.emirate) {
      form.patchValue({
        emirate: form.value.emirate.split(' - ')[0],
      });
    }
    if (form.value.code) {
      form.patchValue({
        code: `${form.value.code.code
          .replace(/\(\d+\s[A-Z]{3}\)/g, '')
          .replace(/\(\d+%?\)/g, '')
          .trim()} $-$${form.value.code.version}`,
      });
    }

    if (form.value.discount) {
      let splitedString = form.value.discount.split('% =>');
      form.patchValue({
        discount: `${
          splitedString.length == 1
            ? form.value.discount.split('AED =>')[0]
            : splitedString[0]
        } $-$${
          splitedString.length == 1
            ? form.value.discount.split('AED =>')[1].trim()
            : splitedString[1].trim()
        }`,
      });
    }

    // if (form.value.discount) {
    //   form.patchValue({
    //     discount: form.value.discount.replace(/[^\d.-]/g, '')
    //   });
    // }
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
        this.filterForm.get('code')?.reset();
        this.subscriptions = this.transformObjects(res.data.data);
        this.PaginationInfo = res.data;
      });
  }

  getOldFilters(page: number) {
    this._SubscriptionsService
      .filterSubscriptions(page, this.appliedFilters)
      .subscribe((res) => {
        this.subscriptions = this.transformObjects(res.data.data);
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
    { label: 'Version 1', value: 'v1' },
    { label: 'Version 3', value: 'v3' },
    { label: 'Version 4', value: 'v4' },
  ];
  modes: any[] = [
    { label: 'Pending', value: 0 },
    { label: 'Not Completed', value: 1 },
    { label: 'Completed', value: 2 },
  ];
  companies: any[] = [
    { label: 'Low Calories', value: 'lc' },
    { label: 'Chef Gourmet', value: 'ch' },
  ];
  payments: any[] = [
    { label: 'Web', value: 'web' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Online', value: 'online' },
    { label: 'Payment Link', value: '50' },
    { label: 'Cash', value: '51' },
    { label: 'Credit Card', value: '52' },
    { label: 'EXCHANGE', value: '53' },
    { label: 'NUTRAION Online', value: '60' },
    { label: 'NUTRAION Clinic', value: '61' },
    { label: 'C & C & E', value: '51-52-53' },
  ];

  giftCodes: any[] = [];
  emirates: any[] = [];
  branches: any[] = [];
  getPaymentDetails() {
    this._PaymentlinkService.getPaymentDetails().subscribe((res) => {
      if (res.status == 1) {
        this.branches = res.data.branches;
        this.emirates = res.data.emirates.map((c) => {
          return {
            id: c.id,
            en_name: `${c.en_name} - (${c.type})`,
            ar_name: c.ar_name,
            inbody_price: c.inbody_price,
            type: c.type,
          };
        });

        this.giftCodes = res.data.allGiftCodes.map((c) => {
          return {
            label: c.label,
            items: c.items.map((code: any) => {
              return {
                code:
                  code.type == 'value'
                    ? `${code.code} (${code.value} AED)`
                    : `${code.code} (${code.percentage}%)`,
                id: code.id,
                percentage: code.percentage,
                value: code.value,
                type: code.type,
                version: code.version,
              };
            }),
          };
        });
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

  getUniquePercentages(inputArray: any[]) {
    let outputArray: any[] = [];
    inputArray.forEach((group) => {
      const versionItems: any[] = [];
      const codes: any[] = [];

      group.items.forEach((item: any) => {
        versionItems.push({
          type: item.type,
          version: item.version,
          code_name:
            item.type == 'value'
              ? item.value.toString()
              : item.percentage.toString(),
        });
        codes.push({
          id: item.id,
          percentage: item.percentage,
          value: item.value,
          type: item.type,
          version: item.version,
        });
      });

      outputArray.push({
        label: group.label,
        items: [
          ...new Set(
            versionItems.map((item) => {
              if (item.type == 'value') {
                return item.code_name + 'AED =>' + ` ${item.version}`;
              } else {
                return item.code_name + '% =>' + ` ${item.version}`;
              }
            })
          ),
        ],
        codes,
      });
    });
    return outputArray;
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
    {
      name: 'invoice_no',
      status: true,
      key: 'invoice_no',
      sortKey: 'invoice_no',
    },
    {
      name: 'subscribed from',
      status: true,
      key: 'sub_from',
      sortKey: 'sub_from',
    },
    { name: 'Agent', status: true, key: 'agent', sortKey: 'agent[name]' },
    {
      name: 'Client Name',
      status: true,
      key: 'user',
      sortKey: 'user[first_name]',
    },
    {
      name: 'Mobile',
      status: true,
      key: 'user',
      sortKey: 'user[phone_number]',
    },
    { name: 'Mode', status: true, key: 'mode', sortKey: 'mode' },
    {
      name: 'Emirate',
      status: true,
      key: 'location',
      sortKey: 'location[area_id]',
    },
    {
      name: 'Start Date',
      status: true,
      key: 'delivery_starting_day',
      sortKey: 'delivery_starting_day',
    },
    {
      name: 'Plan',
      status: true,
      key: 'subscriptions_note',
      sortKey: 'subscriptions_note',
    },
    {
      name: 'Area',
      status: true,
      key: 'location',
      sortKey: 'location[area_id]',
    },
    {
      name: 'Total Price',
      status: true,
      key: 'total_price',
      sortKey: 'total_price',
    },
    { name: 'Code', status: true, key: 'codes', sortKey: 'codes[code]' },
    {
      name: 'Discount',
      status: true,
      key: 'codes',
      sortKey: 'codes[percentage]',
    },
    { name: 'Version', status: false, key: 'version', sortKey: 'version' },
    { name: 'Price', status: false, key: 'price', sortKey: 'price' },
    { name: 'Bag', status: false, key: 'bag', sortKey: 'bag' },
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
    const hasBrackets = this.hasBrackets(sortField);
    this.subscriptions?.sort((a: any, b: any) => {
      const getValue = (obj: any, key: string) => {
        if (hasBrackets) {
          const [keyWithoutBrackets] = key.match(/\[(.*?)\]/) || [];
          return obj?.[key.replace(/\s*\[.*?\]/, '')]?.[
            keyWithoutBrackets?.replace(/\[|\]/g, '')
          ];
        } else {
          return obj?.[key];
        }
      };

      const aValue = getValue(a, sortField);
      const bValue = getValue(b, sortField);
      if (aValue === null || aValue === undefined) {
        return sortOrder;
      }
      if (bValue === null || bValue === undefined) {
        return -sortOrder;
      }
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

  hasBrackets(input: string) {
    return /\[.*?\]/.test(input);
  }
  // ****************************************************UPDATE************************************************************************
  updateModal: boolean = false;
  currentEditRow: any;
  displayUpdateModal(sub: any) {
    if (this.updatePermission) {
      this.currentEditRow = sub;
      this.updateModal = true;
    }
  }
  updateRow(input: HTMLInputElement) {
    if (this.updatePermission) {
      const data = {
        cid: input.value,
        subscription_id: this.currentEditRow.id,
      };
      this._SubscriptionsService.addCidForInvoice(data).subscribe((res) => {
        this.currentEditRow = null;
        this.updateModal = false;
        this.subscriptions = this.subscriptions.map((e) => {
          if (e.id == res.data.subscription_id) {
            e.cids = res.data;
          }
          return e;
        });
        this.getSubscriptions();
      });
    }
  }
}
