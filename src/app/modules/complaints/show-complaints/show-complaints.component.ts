import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { Checkbox } from 'primeng/checkbox';
import { GuardService } from 'src/app/services/guard.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableCheckbox } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-show-complaints',
  templateUrl: './show-complaints.component.html',
  styleUrls: ['./show-complaints.component.scss'],
})
export class ShowComplaintsComponent implements OnInit, OnDestroy {
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _DislikeService: DislikeService,
    private _ComplaintsService: ComplaintsService,
    private _GuardService: GuardService,
    private _MessageService: MessageService,
    private _LocalService: LocalService,
    private _ConfirmationService: ConfirmationService
  ) {}
  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  printPermission: boolean = false;
  exportPermission: boolean = false;
  createPermission: boolean = false;
  downloadSamplePermission: boolean = false;
  uploadFilesPermission: boolean = false;
  updatePermission: boolean = false;
  fullUpdatePermission: boolean = false;
  deletePermission: boolean = false;
  isSuperAdmin: boolean = false;

  getPermission() {
    this.printPermission =
      this._GuardService.getPermissionStatus('print_complaints');
    this.exportPermission =
      this._GuardService.getPermissionStatus('export_complaints');
    this.createPermission =
      this._GuardService.getPermissionStatus('create_complaints');
    this.updatePermission =
      this._GuardService.getPermissionStatus('update_complaints');
    this.fullUpdatePermission = this._GuardService.getPermissionStatus(
      'fullupdate_complaints'
    );
    this.downloadSamplePermission = this._GuardService.getPermissionStatus(
      'downloadSample_complaints'
    );
    this.uploadFilesPermission = this._GuardService.getPermissionStatus(
      'uploadFiles_complaints'
    );
    this.deletePermission =
      this._GuardService.getPermissionStatus('delete_complaints');

    this.isSuperAdmin = this._GuardService.isSuperAdmin();
  }

  displayUploadModal() {
    if (this.downloadSamplePermission) {
      this.uploadModal = true;
    }
  }

  fullUpdateRow(row: any) {
    if (this.fullUpdatePermission) {
      this._ComplaintsService.complaint.next(row);
      this._Router.navigate(['complaints/update']);
    }
  }

  exportAsPDF() {
    if (this.printPermission) {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      doc.internal.pageSize.width = 420;

      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

      doc.setTextColor(50);
      doc.setFontSize(14);
      doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
      doc.text('Issue Subject:Customers Complaints Report', 10, 45);
      doc.text('Prepared By: Low Calories Technical Team', 10, 55);
      doc.text('Requested By: Mohamed Fawzy', 10, 65);
      doc.text('Low Calories Restaurant - UAE', 320, 35);
      // doc.text('3rd Settelment, New Cairo', 320, 35);
      doc.text('Phone: 04-5973939', 320, 45);
      doc.text('Email: info@thelowcalories.com', 320, 55);
      doc.text('Website: thelowcalories.com', 320, 65);

      const headers = [
        // 'Date',
        'customer_name',
        'customer_mobile',
        'CID',
        'Agent_name',
        'Status',
        'Branch',
        'Action',
        'issue_details',
        'feedback_type',
        'order_type',
        'issue_category',
      ];
      if (this.isSuperAdmin) {
        headers.push('Date');
      }
      let filteredArray = this.allComplaints.filter((item: any) =>
        this.specificRows.includes(item.id)
      );
      filteredArray.length == 0 &&
        this.appliedFilters == null &&
        (filteredArray = this.allComplaints);
      filteredArray.length == 0 &&
        this.appliedFilters != null &&
        (filteredArray = this.complaints);
      let convertedData;

      if (this.isSuperAdmin) {
        convertedData = filteredArray.map((obj: any) => [
          obj.c_name,
          obj.c_mobile,
          obj.cid,
          obj.agent_name,
          obj.status,
          obj.branch,
          obj.action,
          obj.issue_details,
          obj.feedback_type,
          obj.order_type,
          obj.issue_category,
          obj.date,
        ]);
      } else {
        convertedData = filteredArray.map((obj: any) => [
          obj.c_name,
          obj.c_mobile,
          obj.cid,
          obj.agent_name,
          obj.status,
          obj.branch,
          obj.action,
          obj.issue_details,
          obj.feedback_type,
          obj.order_type,
          obj.issue_category,
        ]);
      }

      autoTable(doc, { startY: 70 });
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
          doc.internal.pageSize.height - 10,
          doc.internal.pageSize.width - 20,
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
      doc.save('All_Complaints.pdf');
    }
  }

  complaints: any[] = [];
  PaginationInfo: any;

  ngOnInit(): void {
    const filterTab = this._LocalService.getJsonValue('complaints_filter');
    if (filterTab) {
      this._ComplaintsService.complaints_filter.next(filterTab);
    }
    this._ComplaintsService.complaints_filter
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.appliedFilters = res;
        }
      });
    this.getPermission();
    this.createUploadingForm();
    this.createFilterForm();
    this.getComplaints();
    this.getAgents();
    this.getAgentBranches();
    this.getAllComplaints();

    if (this.isSuperAdmin) {
      this.columns.push(
        { name: 'created_at', status: false },
        { name: 'date', status: false }
      );
    }
  }

  allComplaints: any[] = [];
  getAllComplaints() {
    this._ComplaintsService.getAllComplaints().subscribe((res) => {
      this.allComplaints = res.data;
    });
  }

  getComplaints(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._ComplaintsService.getComplaints(page).subscribe({
        next: (res) => {
          this.complaints = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(complaint: any) {
    if (complaint) {
      this._ComplaintsService.complaint.next(complaint);
      this._Router.navigate(['complaints/details']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getComplaints(e.first / e.rows + 1);
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;

  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      c_name: new FormControl(null),
      c_mobile: new FormControl(null),
      cid: new FormControl(null),
      agent_name: new FormControl(null),
      status: new FormControl(null),
      branch: new FormControl(null),
      date: new FormControl(null),
      fromDate: new FormControl(null),
      toDate: new FormControl(null),
      feedback_type: new FormControl(null),
      order_type: new FormControl(null),
      issue_category: new FormControl(null),
    });
  }

  applyFilter(form: FormGroup) {
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          fromDate: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          toDate: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
          date: null,
        });
      } else {
        form.patchValue({
          date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
        });
      }
    }
    this.appliedFilters = form.value;
    this._ComplaintsService.complaints_filter.next(this.appliedFilters);
    this._ComplaintsService.filterComplaints(1, form.value).subscribe((res) => {
      this.complaints = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      // this.resetFields();
    });
  }

  getOldFilters(page: number) {
    this._ComplaintsService
      .filterComplaints(page, this.appliedFilters)
      .subscribe((res) => {
        this.complaints = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getComplaints();
    this._ComplaintsService.complaints_filter.next(null);
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ****************************************************export************************************************************************

  export() {
    if (this.exportPermission) {
      let exportObservable;
      if (this.specificRows.length > 0) {
        exportObservable = this._ComplaintsService.exportByIds(
          this.specificRows
        );
      } else if (this.appliedFilters) {
        const ids = this.complaints.map((obj: any) => obj.id);
        exportObservable = this._ComplaintsService.exportByIds(ids);
      } else {
        exportObservable = this._ComplaintsService.exportAll();
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
      detail: 'Complaints Exported Successfully',
    });

    const link = document.createElement('a');
    link.target = '_blank';
    link.href = data;
    link.click();
  }

  // ****************************************************filter options************************************************************************

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  branches: any[] = [];
  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  status: string[] = ['Open', 'Closed'];

  // ****************************************************update************************************************************************

  updateRow(status: string, reason: string) {
    if (this.updatePermission) {
      this._ComplaintsService
        .updateIssueStatus({
          id: this.currentEditRow.id,
          status: status.toLowerCase(),
          reason,
          issue_details: this.currentEditRow.issue_details,
          action: this.currentEditRow.action,
          branch: this.currentEditRow.branch,
          feedback_type: this.currentEditRow.feedback_type,
          order_type: this.currentEditRow.order_type,
          issue_category: this.currentEditRow.issue_category,
        })
        .subscribe((res) => {
          this.getAllComplaints();
          this.currentEditReason = null;
          this.getComplaints();
          this.updateModal = false;
          this.complaints = this.complaints.map((e) => {
            if (e.id == res.data.id) {
              e = res.data;
            }
            return e;
          });
        });
    }
  }

  updateModal: boolean = false;
  currentEditRow: any;
  currentEditStatus: any;
  currentEditReason: any;
  displayUpdateModal(issue: any) {
    if (this.updatePermission) {
      this.currentEditRow = issue;
      this.currentEditStatus =
        issue.status.charAt(0).toUpperCase() + issue.status.slice(1);
      this.updateModal = true;
    }
  }

  // ****************************************************filter columns************************************************************************
  filterColumns: boolean = false;
  selectedColumns: any[] = [];
  specificRows: number[] = [];
  columns: any[] = [
    { name: 'id', status: false },
    { name: 'action', status: false },
    { name: 'agent_name', status: true },
    { name: 'branch', status: false },
    { name: 'c_mobile', status: true },
    { name: 'c_name', status: true },
    { name: 'cid', status: true },
    { name: 'issue_details', status: false },
    { name: 'status', status: false },
    { name: 'feedback_type', status: false },
    { name: 'order_type', status: false },
    { name: 'issue_category', status: false },
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
      this.specificRows = this.complaints.map((obj: any) => obj.id);
    } else {
      this.specificRows = [];
    }
  }

  // ****************************************************print row************************************************************************
  print(complaint: any) {
    if (this.printPermission) {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
      doc.text('Issue Subject:Customers Complaints Report', 10, 40);
      doc.text('Prepared By: Low Calories Technical Team', 10, 45);
      doc.text('Requested By: Mohamed Fawzy', 10, 50);
      doc.text('Low Calories Restaurant - UAE', 150, 35);
      // doc.text('3rd Settelment, New Cairo', 150, 35);
      doc.text('Phone: 04-5973939', 150, 40);
      doc.text('Email: info@thelowcalories.com', 150, 45);
      doc.text('Website: thelowcalories.com', 150, 50);

      autoTable(doc, { startY: 55 });

      var columns = [
        // { title: 'Date', dataKey: complaint.date },
        { title: 'customer_name', dataKey: complaint.c_name },
        { title: 'customer_mobile', dataKey: complaint.c_mobile },
        { title: 'cid', dataKey: complaint.cid },
        { title: 'agent_name', dataKey: complaint.agent_name },
        { title: 'status', dataKey: complaint.status },
        { title: 'branch', dataKey: complaint.branch },
        { title: 'action', dataKey: complaint.action },
        { title: 'issue_details', dataKey: complaint.issue_details },
        { title: 'feedback_type', dataKey: complaint?.feedback_type },
        { title: 'order_type', dataKey: complaint?.order_type },
        { title: 'issue_category', dataKey: complaint?.issue_category },
      ];

      if (this.isSuperAdmin) {
        columns.push({ title: 'Date', dataKey: complaint.date });
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

      doc.save('complaint.pdf');
    }
  }

  // ****************************************************upload Modal************************************************************************
  uploadModal: boolean = false;

  getSample() {
    if (this.downloadSamplePermission) {
      this._ComplaintsService.getSample().subscribe((res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      });
    }
  }

  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }

  onFileSelected(event: any) {
    if (this.downloadSamplePermission) {
      const file: File = event.target.files[0];
      if (file) {
        let f: File = this.getFormData({ file: file }) as any;
        this._ComplaintsService.uploadFile(f).subscribe({
          next: (res) => {
            this.uploadModal = false;
            this.getComplaints();
            this.getAllComplaints();
          },
        });
        this.uploadModal = false;
      }
    }
  }

  // ****************************************************upload File Modal************************************************************************
  uploadFilesModal: boolean = false;
  uploadingStatus: boolean = false;
  uploadForm!: FormGroup;

  displayUploadFilesModal(id: number) {
    if (this.uploadFilesPermission) {
      this.uploadForm.patchValue({
        issue_id: id,
      });
      this.uploadFilesModal = true;
    }
  }

  getUploadedFile(event: any) {
    if (
      event.target.files &&
      event.target.files.length &&
      this.uploadFilesPermission
    ) {
      const files = event.target.files;
      const readFile = (file: any) => {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = (event: any) => resolve(event.target.result);
          fileReader.onerror = (error) => reject(error);
          fileReader.readAsDataURL(file);
        });
      };

      const readFiles = async () => {
        try {
          const base64Strings = await Promise.all(
            Array.from(files).map(readFile)
          );
          const fileTypes = base64Strings.map((base64String: any) => {
            const type = base64String.split(',')[0].split(':')[1].split(';')[0];
            return { [type]: base64String };
          });
          this.uploadForm.patchValue({
            files: fileTypes,
          });
        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }

  createUploadingForm() {
    this.uploadForm = new FormGroup({
      issue_id: new FormControl(null, [Validators.required]),
      files: new FormControl(null, [Validators.required]),
    });
  }

  uploadFiles(form: FormGroup) {
    if (form.valid && this.uploadFilesPermission) {
      this.uploadingStatus = true;
      this._ComplaintsService.uploadIssueFiles(form.value).subscribe((res) => {
        this.uploadingStatus = false;
        this.uploadFilesModal = false;
      });
    }
  }
  // ========================================================sort========================================================
  sort(event: any) {
    const sortField = event.sortField;
    const sortOrder = event.sortOrder === 1 ? 1 : -1;
    this.complaints?.sort((a: any, b: any) => {
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

  // ===============================================================Delete======================================================================

  deleteRow(id: number) {
    if (this.deletePermission) {
      this._ComplaintsService.deleteIssue(id).subscribe((res) => {
        this.getComplaints();
      });
    }
  }

  confirm(id: any) {
    if (this.deletePermission) {
      this._ConfirmationService.confirm({
        message: 'Are you sure that you want to perform this action?',
        accept: () => {
          this.deleteRow(id);
        },
      });
    }
  }

  // ===============================================================new columns======================================================================
  feedback_type: any[] = [
    'Call Center',
    'In Store',
    'Nutritionist',
    'Social Media',
    'Others',
  ];
  order_type: any[] = ['Dine In', 'Take Away', 'Subscription', 'Talabat'];
  issue_category: any[] = [
    'Food Quality',
    'Service Issues',
    'Cleanliness and Hygiene',
    'Order Accuracy',
    'Ambiance and Atmosphere',
    'Billing and Pricing',
    'Allergies and Dietary Restrictions',
    'Communication Problems',
    'Management and Staff Responsiveness',
    'Online and Takeout Issues',
    'Others',
  ];
}
