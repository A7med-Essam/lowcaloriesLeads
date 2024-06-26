import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { CallsService, ICalls } from 'src/app/services/calls.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Dropdown } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';
import { Router } from '@angular/router';
import { GuardService } from 'src/app/services/guard.service';
import { TableCheckbox } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-assign-call',
  templateUrl: './assign-call.component.html',
  styleUrls: ['./assign-call.component.scss'],
})
export class AssignCallComponent implements OnInit, OnDestroy {
  constructor(
    private _CallsService: CallsService,
    private _SurveyService: SurveyService,
    private _MessageService: MessageService,
    private _FormBuilder: FormBuilder,
    private _DislikeService: DislikeService,
    private _Router: Router,
    private _GuardService: GuardService,
    private _LocalService:LocalService
  ) {}
  printPermission: boolean = false;
  exportPermission: boolean = false;
  getPermission() {
    this.printPermission =
      this._GuardService.getPermissionStatus('print_calls');
    this.exportPermission =
      this._GuardService.getPermissionStatus('export_calls');
  }

  calls: ICalls[] = [];
  PaginationInfo: any;
  interval: any;
  callStatus: any[] = [
    { name: 'Uploaded Calls', value: 'true' },
    { name: 'Not Uploaded Calls', value: 'false' },
  ];

  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    const filterTab = this._LocalService.getJsonValue('calls_filter');
    if (filterTab) {
      this._CallsService.call_filter.next(filterTab)
    }
    this._CallsService.call_filter
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.appliedFilters = res;
        }
      });
    this.getPermission();
    this.getAllCalls();
    this.getCalls();
    this.setAdminForm();
    this.createFilterForm();
    this.getAgentBranches();
    setTimeout(() => {
      this.getAgents();
    }, 500);
    this.interval = setInterval(() => {
      this.getAgents();
    }, 20000);
  }

  allCalls: any[] = [];
  getAllCalls() {
    this._CallsService.getAllCalls().subscribe((res) => {
      this.allCalls = res.data;
    });
  }

  getCalls(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._CallsService.getCalls(page).subscribe({
        next: (res) => {
          this.calls = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getCalls(e.first / e.rows + 1);
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        res.data.forEach((e: any) => {
          if (e.status == 'Online') {
            e.name = `${e.name} - Online 🟢`;
          } else {
            e.name = `${e.name} - Offline 🔴`;
          }
        });
        this.agents = res.data;
      },
    });
  }

  // ===============================================================Assign=====================================================================
  currentRowId: number = 0;
  assignModal: boolean = false;
  assignModal2: boolean = false;
  displayAssignedUsersModal(id: number) {
    this.currentRowId = id;
    this.assignModal = true;
  }

  assignUsers(users: FormGroup) {
    this._CallsService
      .assignCalls({
        call_id: this.currentRowId,
        user_ids: users.value.user_ids.filter(Number),
      })
      .subscribe({
        next: (res: any) => {
          if (res.status == 1) {
            this.assignModal = false;
            this.calls = this.calls.map((c) => {
              if (c.id == res.data.id) {
                return (c = res.data);
              }
              return c;
            });
            this.getAllCalls();
            this.getCalls();
            this._MessageService.add({
              severity: 'success',
              summary: 'Assigned',
              detail: res.message,
            });
          }
        },
      });
  }
  AssignForm: FormGroup = new FormGroup({});
  setAdminForm() {
    this.AssignForm = this._FormBuilder.group({
      user_ids: new FormArray([]),
    });
  }
  @ViewChild('AssignUsersForm') AssignUsersForm!: HTMLFormElement;

  getAssignedUsers(call: ICalls) {
    this.resetAssignForm();
    const usersId =
      this.AssignUsersForm.nativeElement.querySelectorAll('input');
    const callUsers = call.call_users;
    const formArray: FormArray = this.AssignForm.get('user_ids') as FormArray;
    if (callUsers.length) {
      this.assignModal = true;
      for (let i = 0; i < usersId.length; i++) {
        for (let j = 0; j < callUsers.length; j++) {
          if (Number(usersId[i].value) == callUsers[j].user_id) {
            if (!formArray.value.includes(callUsers[j].user_id.toString())) {
              usersId[i].checked = true;
              formArray.push(new FormControl(usersId[i].value));
            }
          }
        }
      }
    }
  }

  resetAssignForm() {
    this.AssignForm.reset();
    this.AssignUsersForm.nativeElement
      .querySelectorAll('input')
      .forEach((u: any) => (u.checked = false));
  }

  onCheckChange(event: any, status: string = 'edit') {
    const formArray: FormArray = this.AssignForm.get('user_ids') as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    } else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: any) => {
        if (ctrl.value == event.target.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  // ===============================================================Assign Multi=====================================================================
  assignAgent(e: Dropdown) {
    if (e.value && this.specificRows.length) {
      this._CallsService
        .assignMultiCalls({ call_ids: this.specificRows, user_id: e.value })
        .subscribe((res) => {
          if (res.status == 1) {
            this.getCalls();
            this.getAllCalls();
            this.assignModal2 = false;
            this._MessageService.add({
              severity: 'success',
              summary: 'Assigned',
              detail: res.message,
            });
            this.specificRows = [];
          }
        });
    }
  }

  // ****************************************************export************************************************************************

  export() {
    if (this.exportPermission) {
      let exportObservable;
      if (this.specificRows.length > 0) {
        exportObservable = this._CallsService.exportByIds(this.specificRows);
      } else if (this.appliedFilters) {
        const ids = this.calls.map((obj: any) => obj.id);
        exportObservable = this._CallsService.exportByIds(ids);
      } else {
        exportObservable = this._CallsService.exportAll();
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
      detail: 'Calls Exported Successfully',
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
    { name: 'cid', status: true },
    { name: 'Remaining_days', status: true },
    { name: 'branch', status: false },
    { name: 'customer_name', status: true },
    { name: 'customer_phone', status: false },
    { name: 'customer_mobile', status: false },
    { name: 'plan', status: false },
    { name: 'date', status: false },
    { name: 'note', status: false },
    { name: 'agent_uploaded', status: true },
    { name: 'created_at', status: false },
    { name: 'assigned_agent', status: true },
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
      this.specificRows = this.calls.map((obj: any) => obj.id);
    } else {
      this.specificRows = [];
    }
  }

  // ****************************************************print row************************************************************************
  print(call: any) {
    if (this.printPermission) {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
      doc.text('Issue Subject:Calls Report', 10, 40);
      doc.text('Prepared By: Low Calories Technical Team', 10, 45);
      doc.text('Requested By: Mohamed Fawzy', 10, 50);
      doc.text('Low Calories Restaurant - UAE', 150, 35);
      // doc.text('3rd Settelment, New Cairo', 150, 35);
      doc.text('Phone: 04-5973939', 150, 40);
      doc.text('Email: info@thelowcalories.com', 150, 45);
      doc.text('Website: thelowcalories.com', 150, 50);

      autoTable(doc, { startY: 55 });

      var columns = [
        { title: 'cid', dataKey: call.cid },
        { title: 'Remaining Days', dataKey: call.subscription_id },
        { title: 'branch', dataKey: call.branch },
        { title: 'customer_name', dataKey: call.customer_name },
        { title: 'customer_phone', dataKey: call.customer_mobile },
        { title: 'customer_mobile', dataKey: call.customer_phone },
        { title: 'plan', dataKey: call.plan },
        { title: 'date', dataKey: call.date },
        { title: 'note', dataKey: call.note },
        {
          title: 'assigned_users',
          dataKey: call.call_users?.map((obj: any) => obj.user.name),
        },
        { title: 'agent_uploaded', dataKey: call.agent_uploaded_name },
        { title: 'created_at', dataKey: call.created_at.substring(0, 10) },
      ].filter((obj: any) => {
        for (const prop in obj) {
          if (
            obj[prop] === null ||
            obj[prop] === '' ||
            (Array.isArray(obj[prop]) && obj[prop].length === 0)
          ) {
            return false;
          }
        }
        return true;
      });

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

      doc.save('calls.pdf');
    }
  }

  exportAsPDF() {
    if (this.printPermission) {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      doc.internal.pageSize.width = 600;
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

      doc.setTextColor(50);
      doc.setFontSize(14);
      doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
      doc.text('Issue Subject:Calls Report', 10, 45);
      doc.text('Prepared By: Low Calories Technical Team', 10, 55);
      doc.text('Requested By: Mohamed Fawzy', 10, 65);
      doc.text('Low Calories Restaurant - UAE', 500, 35);
      // doc.text('3rd Settelment, New Cairo', 500, 35);
      doc.text('Phone: 04-5973939', 500, 45);
      doc.text('Email: info@thelowcalories.com', 500, 55);
      doc.text('Website: thelowcalories.com', 500, 65);

      const headers = [
        'cid',
        'Remaining Days',
        'branch',
        'customer_name',
        'customer_phone',
        'customer_mobile',
        'plan',
        'date',
        'note',
        'assigned_users',
        'agent_uploaded',
        'created_at',
      ];
      let filteredArray = this.allCalls.filter((item: any) =>
        this.specificRows.includes(item.id)
      );
      filteredArray.length == 0 &&
        this.appliedFilters == null &&
        (filteredArray = this.allCalls);
      filteredArray.length == 0 &&
        this.appliedFilters != null &&
        (filteredArray = this.calls);
      const convertedData = filteredArray.map((obj: any) => [
        obj.cid,
        obj.subscription_id,
        obj.branch,
        obj.customer_name,
        obj.customer_mobile,
        obj.customer_phone,
        obj.plan,
        obj.date,
        obj.note,
        obj.call_users?.map((obj: any) => obj.user.name),
        obj.agent_uploaded_name,
        obj.created_at.substring(0, 10),
      ]);
      autoTable(doc, { startY: 65 });
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
        doc.internal.pageSize.width = 600;
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

      doc.save('calls.pdf');
    }
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;
  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      date: new FormControl(null),
      cid: new FormControl(null),
      subscription_id: new FormControl(null),
      branch: new FormControl(null),
      customer_name: new FormControl(null),
      mobile: new FormControl(null),
      customer_phone: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
      assigned_id: new FormControl(null),
      plan: new FormControl(null),
      uploaded: new FormControl(null),
      agent_uploaded_id: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
          date: null,
        });
      } else {
        form.patchValue({
          date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
        });
      }
    }

    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }

    this.appliedFilters = form.value;
    this._CallsService.call_filter.next(this.appliedFilters);
    this._CallsService.filterCalls(1, form.value).subscribe((res) => {
      this.calls = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      this.filterForm.patchValue({
        date: null,
        from: null,
        to: null,
      });
    });
  }

  getOldFilters(page: number) {
    this._CallsService
      .filterCalls(page, this.appliedFilters)
      .subscribe((res) => {
        this.calls = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getCalls();
    this._CallsService.call_filter.next(null);
  }

  resetFields() {
    this.filterForm.reset();
  }

  branches: any[] = [];
  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  showRow(call: any) {
    if (call) {
      localStorage.setItem('prevPage', 'assign');
      this._CallsService.call.next(call);
      this._Router.navigate(['calls/details']);
    }
  }

  // ========================================================sort========================================================
  sort(event: any) {
    const sortField = event.sortField;
    const sortOrder = event.sortOrder === 1 ? 1 : -1;
    this.calls?.sort((a: any, b: any) => {
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
