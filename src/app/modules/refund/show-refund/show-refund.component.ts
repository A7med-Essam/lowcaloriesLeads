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
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-show-refund',
  templateUrl: './show-refund.component.html',
  styleUrls: ['./show-refund.component.scss']
})
export class ShowRefundComponent implements OnInit {

  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _RefundService: RefundService,
    private _DislikeService: DislikeService
  ) {}

  exportAsPDF() {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    doc.internal.pageSize.width = 600;
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

    doc.setTextColor(50);
    doc.setFontSize(14);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Refund Requests Report', 10, 45);
    doc.text('Prepared By: Low Calories Technical Team', 10, 55);
    doc.text('Requested By: Mohamed Fawzy', 10, 65);
    doc.text('Low Calories Restaurant - Egypt', 500, 25);
    doc.text('3rd Settelment, New Cairo', 500, 35);
    doc.text('Phone: 201116202225', 500, 45);
    doc.text('Email: info@thelowcalories.com', 500, 55);
    doc.text('Website: thelowcalories.com', 500, 65);

    const headers = [
      'Date',
      'name',
      'email',
      'mobile',
      'branch',
      'delivery_branch',
      'subscription_plan',
      'remaining_days',
      'payment_method',
      'cid',
      'address',
      'bank_name',
      'iban',
      'account_hold_name',
      'bank_account_number',
      'original_amount_paid',
      'amount_usd',
      'total_amount_refund',
      'agent_id',
    ];
    const convertedData = this.allRefunds.map((obj: any) => [
      obj.created_at.substring(0, 10),
      obj.name,
      obj.email,
      obj.mobile,
      obj.branch,
      obj.delivery_branch,
      obj.subscription_plan,
      obj.remaining_days,
      obj.payment_method,
      obj.cid,
      obj.address,
      obj.bank_name,
      obj.iban,
      obj.account_hold_name,
      obj.bank_account_number,
      obj.original_amount_paid,
      obj.amount_usd,
      obj.total_amount_refund,
      obj.agent_id,
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

    doc.save('example.pdf');
  }

  refunds: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this.getRefunds();
    this.createFilterForm();
    this.getAgents();
    this.getAgentBranches();
    this.getAllRefunds();
  }

  allRefunds: any[] = [];
  getAllRefunds() {
    this._RefundService.getAllRefunds().subscribe((res) => {
      this.allRefunds = res.data;
    });
  }

  getRefunds(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters();
    } else {
      this._RefundService.getRefunds(page).subscribe({
        next: (res) => {
          this.refunds = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(refund: any) {
    if (refund) {
      this._RefundService.refund.next(refund);
      this._Router.navigate(['refund/details']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getRefunds(e.first / e.rows + 1);
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;

  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      agent_id: new FormControl(null),
      name: new FormControl(null),
      email: new FormControl(null),
      mobile: new FormControl(null),
      branch: new FormControl(null),
      delivery_branch: new FormControl(null),
      subscription_plan: new FormControl(null),
      remaining_days: new FormControl(null),
      payment_method: new FormControl(null),
      cid: new FormControl(null),
      address: new FormControl(null),
      bank_name: new FormControl(null),
      iban: new FormControl(null),
      bank_account_number: new FormControl(null),
      account_hold_name: new FormControl(null),
      original_amount_paid: new FormControl(null),
      amount_usd: new FormControl(null),
      total_amount_refund: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    // if (form.value.branch) {
    //   form.patchValue({
    //     branch: form.value.branch.name,
    //   });
    // }

    // if (form.value.date) {
    //   if (form.value.date[1]) {
    //     form.patchValue({
    //       from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
    //       to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
    //       date: null,
    //     });
    //   } else {
    //     form.patchValue({
    //       date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
    //     });
    //   }
    // }
    this.appliedFilters = form.value;
    this._RefundService.filterRefund(1, form.value).subscribe((res) => {
      this.refunds = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      this.resetFields();
    });
  }

  getOldFilters() {
    this._RefundService
      .filterRefund(1, this.appliedFilters)
      .subscribe((res) => {
        this.refunds = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getRefunds();
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ****************************************************export************************************************************************

  export() {
    this._RefundService.RefundExport().subscribe({
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

}
