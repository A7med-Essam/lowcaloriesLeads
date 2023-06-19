import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'app-show-complaints',
  templateUrl: './show-complaints.component.html',
  styleUrls: ['./show-complaints.component.scss'],
})
export class ShowComplaintsComponent implements OnInit {
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _DislikeService: DislikeService,
    private _ComplaintsService: ComplaintsService
  ) {}

  exportAsPDF() {
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
    doc.text('Low Calories Restaurant - Egypt', 320, 25);
    doc.text('3rd Settelment, New Cairo', 320, 35);
    doc.text('Phone: 201116202225', 320, 45);
    doc.text('Email: info@thelowcalories.com', 320, 55);
    doc.text('Website: thelowcalories.com', 320, 65);



    const headers = [
      'Date',
      'customer_name',
      'customer_mobile',
      'CID',
      'Agent_name',
      'Status',
      'Branch',
      'Action',
      'issue_details',
    ];

    let filteredArray = this.allComplaints.filter((item:any) => this.specificRows.includes(item.id));
    filteredArray.length == 0 && (filteredArray = this.allComplaints)
    const convertedData = filteredArray.map((obj: any) => [
      obj.date,
      obj.c_name,
      obj.c_mobile,
      obj.cid,
      obj.agent_name,
      obj.status,
      obj.branch,
      obj.action,
      obj.issue_details,
    ]);

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
    doc.save('example.pdf');
  }

  complaints: any[] = [];
  PaginationInfo: any;

  ngOnInit(): void {
    this.getComplaints();
    this.createFilterForm();
    this.getAgents();
    this.getAgentBranches();
    this.getAllComplaints();
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
    this._ComplaintsService.filterComplaints(1, form.value).subscribe((res) => {
      this.complaints = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      // this.resetFields();
    });
  }

  getOldFilters(page:number) {
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
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ****************************************************export************************************************************************

  export() {
    const ids = this.complaints.map((obj: any) => obj.id);
    this._ComplaintsService.exportComplaints(ids).subscribe({
      next: (res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      },
    });
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

  updateRow(status:string,reason:string){
    this._ComplaintsService.updateIssueStatus({id:this.currentEditRow.id,status:status.toLowerCase(), reason}).subscribe(res=>{
      this.getAllComplaints();
      this.currentEditReason = null;
      this.getComplaints();
      this.updateModal = false;
      this.complaints = this.complaints.map(e=> {
        if (e.id == res.data.id) {
          e = res.data
        }
        return e
      })
    })
  }

  updateModal:boolean = false;
  currentEditRow:any;
  currentEditStatus:any;
  currentEditReason:any;
  displayUpdateModal(issue:any){
    this.currentEditRow = issue
    this.currentEditStatus = issue.status.charAt(0).toUpperCase() + issue.status.slice(1);
    this.updateModal = true;
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
    { name: 'created_at', status: false },
    { name: 'date', status: false },
    { name: 'issue_details', status: false },
    { name: 'status', status: false },
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

  getSpecificRows(input: HTMLInputElement) {
    if (input.checked) {
      this.specificRows.push(Number(input.value));
    } else {
      const index = this.specificRows.indexOf(Number(input.value));
      if (index > -1) {
        this.specificRows.splice(index, 1);
      }
    }
  }

   // ****************************************************print row************************************************************************
   print(complaint:any){
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
    doc.text('Low Calories Restaurant - Egypt', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 201116202225', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

    autoTable(doc, { startY: 55 });
 

    var columns = [
      {title: "Date", dataKey:complaint.date},
      {title: "customer_name", dataKey:complaint.c_name}, 
      {title: "customer_mobile", dataKey:complaint.c_mobile},
      {title: "cid", dataKey:complaint.cid},
      {title: "agent_name", dataKey:complaint.agent_name},
      {title: "status", dataKey:complaint.status},
      {title: "branch", dataKey:complaint.branch},
      {title: "action", dataKey:complaint.action},
      {title: "issue_details", dataKey:complaint.issue_details},
  ];

  // doc.text(140, 40, "Report");
  autoTable(doc,{body:columns,});

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
