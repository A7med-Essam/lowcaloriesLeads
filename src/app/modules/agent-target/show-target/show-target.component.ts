import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AgentTargetService,
  ITarget,
} from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-show-target',
  templateUrl: './show-target.component.html',
  styleUrls: ['./show-target.component.scss'],
})
export class ShowTargetComponent implements OnInit {
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _AgentTargetService: AgentTargetService,
    private _DislikeService: DislikeService
  ) {}

  exportAsPDF() {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

    doc.setTextColor(50);
    doc.setFontSize(14);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customer Service Target', 10, 45);
    doc.text('Prepared By: Low Calories Technical Team', 10, 55);
    doc.text('Requested By: Mohamed Fawzy', 10, 65);
    doc.text('Low Calories Restaurant - Egypt', 320, 25);
    doc.text('3rd Settelment, New Cairo', 320, 35);
    doc.text('Phone: 201116202225', 320, 45);
    doc.text('Email: info@thelowcalories.com', 320, 55);
    doc.text('Website: thelowcalories.com', 320, 65);

    // Get the total number of pages
    const totalPages = doc.internal.pages;

    // Iterate over each page and add the footer
    for (let i = 1; i <= totalPages.length; i++) {
      // Set the current page as active
      doc.setPage(i);
      // Set the position and alignment of the footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        'Thelowcalories.com',
        20,
        doc.internal.pageSize.getHeight() - 10,
      );
    }

    const headers = [
      'Date',
      'Agent',
      'Team',
      'Branch',
      'Client_CID',
      'Client_number',
      'Client_Type',
      'Invoice_number',
      'Status',
      'Paid',
      'Type',
    ];
    const convertedData = this.allTargets.map((obj: any) => [
      obj.date,
      obj.agent.name,
      obj.team,
      obj.branch,
      obj.client_cid,
      obj.client_number,
      obj.customer_type,
      obj.invoice_number,
      obj.status.toUpperCase(),
      obj.paid_by,
      obj.type,
    ]);
    doc.internal.pageSize.width = 420;
    autoTable(doc, { startY: 70 });
    autoTable(doc, {
      head: [headers],
      body: convertedData,
    });

    // Set the line color and width
    doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
    doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

    // Draw a line at the bottom of the page
    doc.line(
      20,
      doc.internal.pageSize.height - 20,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 20
    );
    doc.save('example.pdf');
  }

  targets: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this.getTargets();
    this.createFilterForm();
    this.getAgents();
    this.getAgentBranches();
    this.getTargetOptions();
    this.getAllTargets();
  }

  allTargets: any[] = [];
  getAllTargets() {
    this._AgentTargetService.getAllTargets().subscribe((res) => {
      this.allTargets = res.data;
    });
  }

  getTargets(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters();
    } else {
      this._AgentTargetService.getTargets(page).subscribe({
        next: (res) => {
          this.targets = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(target: ITarget) {
    if (target) {
      this._AgentTargetService.target.next(target);
      this._Router.navigate(['agent/details']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getTargets(e.first / e.rows + 1);
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;

  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      team: new FormControl(null),
      client_number: new FormControl(null),
      client_cid: new FormControl(null),
      branch: new FormControl(null),
      paid_by: new FormControl(null),
      status: new FormControl(null),
      date: new FormControl(null),
      customer_types: new FormControl(null),
      agent_id: new FormControl(null),
      invoice_number: new FormControl(null),
      type: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    if (form.value.branch) {
      form.patchValue({
        branch: form.value.branch.name,
      });
    }

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
    this.appliedFilters = form.value;
    this._AgentTargetService.filterTargets(1, form.value).subscribe((res) => {
      this.targets = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      this.resetFields();
    });
  }

  getOldFilters() {
    this._AgentTargetService
      .filterTargets(1, this.appliedFilters)
      .subscribe((res) => {
        this.targets = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getTargets();
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ****************************************************export************************************************************************

  export() {
    this._AgentTargetService.exportTarget().subscribe({
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

  customer_types: any[] = [];
  types: any[] = [];
  paid_by: any[] = [];
  status: any[] = [];
  teams: any[] = [];
  getTargetOptions() {
    this._AgentTargetService.getTargetOptions().subscribe({
      next: (res) => {
        this.customer_types = res.data.customer_types;
        this.paid_by = res.data.payment_types;
        this.teams = res.data.teams;
        this.status = res.data.status;
        this.types = res.data.type;
      },
    });
  }
}
