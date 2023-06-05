import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComplaintsService } from 'src/app/services/complaints.service';

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
      'client_name',
      'client_mobile',
      'CID',
      'Agent_name',
      'Status',
      'Branch',
      'Action',
      'issue_details',
    ];
    const convertedData = this.allComplaints.map((obj: any) => [
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
      this.getOldFilters();
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
      this.resetFields();
    });
  }

  getOldFilters() {
    this._ComplaintsService
      .filterComplaints(1, this.appliedFilters)
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

  updateRow(status:string){
    this._ComplaintsService.updateIssueStatus({id:this.currentEditRow.id,status:status.toLowerCase()}).subscribe(res=>{
      this.getAllComplaints();
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
  displayUpdateModal(issue:any){
    this.currentEditRow = issue
    this.currentEditStatus = issue.status.charAt(0).toUpperCase() + issue.status.slice(1);
    this.updateModal = true;
  }
}
