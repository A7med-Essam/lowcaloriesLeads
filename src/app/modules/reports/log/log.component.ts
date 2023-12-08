import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { CallsService } from 'src/app/services/calls.service';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { RefundService } from 'src/app/services/refund.service';
import { ReportsService } from 'src/app/services/reports.service';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisService } from 'src/app/services/analysis.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
})
export class LogComponent implements OnInit {
  constructor(
    private _ReportsService: ReportsService,
    private _SurveyService: SurveyService,
    private _MessageService: MessageService,
    private _ComplaintsService: ComplaintsService,
    private _AgentTargetService: AgentTargetService,
    private _RefundService: RefundService,
    private _DislikeService: DislikeService,
    private _CallsService: CallsService,
    private _SubscriptionsService: SubscriptionsService,
    private _AnalysisService: AnalysisService
  ) {}

  selectedDate: any;
  selectedAgent: any;
  selectedTeam: any;
  detailsModal: boolean = false;

  ngOnInit(): void {
    this.getAgents();
    this.getFormAnalytics();
  }

  analyticOptions: any;
  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data;
    });
  }

  logs: any;
  isLoadingLogs: boolean = false;
  getAgentLog() {
    if (!this.isLoadingLogs) {
      if (this.selectedDate || this.selectedAgent) {
        this.isLoadingLogs = true;
        this.selectedDate[1] ?? (this.selectedDate[1] = new Date());
        let data = {
          agent_id: this.selectedAgent,
          from: this.selectedDate[0],
          to: this.selectedDate[1],
        };
        this._ReportsService.getAgentLogs(data).subscribe((res) => {
          this.isLoadingLogs = false;
          this.logs = res.data;
          this.columns.forEach((e) => {
            if (res.data[e.name].data.length) {
              Object.keys(res.data).forEach((key) => {
                if (e.name == key) {
                  this.selectedColumns.push(e.name);
                }
              });
            }
          });
          this.columns = this.columns.map((m) => {
            if (res.data[m.name].data.length) {
              m.status = true;
            } else {
              m.status = false;
            }
            return m;
          });
        });
      }
    }
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = this.agents_clone = res.data;
      },
    });
  }

  // ======================================================= EXPORTS =======================================================
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

  export(data: any, type: string) {
    const ids = data.map((obj: any) => obj.id);
    switch (type.toLowerCase()) {
      case 'leads':
        this._SurveyService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'complaints':
        this._ComplaintsService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'targets':
        this._AgentTargetService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'clinic':
        this._SubscriptionsService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'paymentlink':
        this._SubscriptionsService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'refunds':
        this._RefundService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'dislikes':
        this._DislikeService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'calls':
        this._CallsService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'paymentbranch':
        this._SubscriptionsService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      case 'dataanalytics':
        this._AnalysisService.exportByIds(ids).subscribe({
          next: (res) => {
            this.handleExportSuccess(res.data);
          },
        });
        break;
      // default:
      //   alert();
      //   break
    }
  }

  // =================================================================== FILTER ===================================================================
  selectedColumns: any[] = [];

  columns: any[] = [
    { name: 'leads', status: false },
    { name: 'targets', status: false },
    { name: 'calls', status: false },
    { name: 'refunds', status: false },
    { name: 'issues', status: false },
    { name: 'Dislikes', status: false },
    { name: 'dataAnalytics', status: false },
    // { name: 'paymentLinks', status: false },
    // { name: 'paymentBranches', status: false },
    // { name: 'Clinic', status: false },
  ];

  // =================================================================== PRINT ===================================================================
  printCall(call: any) {
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Calls Report', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - UAE', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
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

  printAllCalls(log: any) {
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
    doc.text('Low Calories Restaurant - UAE', 500, 25);
    doc.text('3rd Settelment, New Cairo', 500, 35);
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

    const convertedData = log.map((obj: any) => [
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

  printTarget(target: any) {
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customer Service Target', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - UAE', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 04-5973939', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

    autoTable(doc, { startY: 55 });

    var columns = [
      { title: 'Date', dataKey: target.date },
      { title: 'Agent', dataKey: target.agent.name },
      { title: 'Team', dataKey: target.team },
      { title: 'client_cid', dataKey: target.client_cid },
      { title: 'client_name', dataKey: target.client_name },
      { title: 'client_number', dataKey: target.client_number },
      { title: 'type', dataKey: target.type },
      { title: 'client_type', dataKey: target.customer_type },
      { title: 'Branch', dataKey: target.branch },
      { title: 'invoice_number', dataKey: target.invoice_number },
      { title: 'amount_paid', dataKey: target.amount_paid },
      // { title: 'status', dataKey: target.status?.toUpperCase() },
      { title: 'paid_by', dataKey: target.paid_by },
    ];

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

    doc.save('target.pdf');
  }

  printAllTargets(log: any) {
    const doc = new jsPDF();
    doc.internal.pageSize.width = 420;
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

    doc.setTextColor(50);
    doc.setFontSize(14);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customer Service Target', 10, 45);
    doc.text('Prepared By: Low Calories Technical Team', 10, 55);
    doc.text('Requested By: Mohamed Fawzy', 10, 65);
    doc.text('Low Calories Restaurant - UAE', 320, 25);
    doc.text('3rd Settelment, New Cairo', 320, 35);
    doc.text('Phone: 04-5973939', 320, 45);
    doc.text('Email: info@thelowcalories.com', 320, 55);
    doc.text('Website: thelowcalories.com', 320, 65);

    const headers = [
      'Date',
      'Agent',
      'Team',
      'client_CID',
      'client_name',
      'client_number',
      'Type',
      'client_Type',
      'Branch',
      'Invoice_number',
      'amount_paid',
      // 'Status',
      'Paid_by',
    ];
    const convertedData = log.map((obj: any) => [
      obj.date,
      obj.agent.name,
      obj.team,
      obj.client_cid,
      obj.client_name,
      obj.client_number,
      obj.type,
      obj.customer_type,
      obj.branch,
      obj.invoice_number,
      obj.amount_paid,
      // obj.status.toUpperCase(),
      obj.paid_by,
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

    doc.save('All_Targets.pdf');
  }

  printRefund(refund: any) {
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Refund Requests Report', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - UAE', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 04-5973939', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

    autoTable(doc, { startY: 55 });

    var columns = [
      { title: 'Date', dataKey: refund.created_at.substring(0, 10) },
      { title: 'Name', dataKey: refund.name },
      { title: 'Email', dataKey: refund.email },
      { title: 'Mobile', dataKey: refund.mobile },
      { title: 'Branch', dataKey: refund.branch },
      { title: 'delivery_branch', dataKey: refund.delivery_branch },
      { title: 'subscription_plan', dataKey: refund.subscription_plan },
      { title: 'remaining_days', dataKey: refund.remaining_days },
      { title: 'payment_method', dataKey: refund.payment_method },
      { title: 'cid', dataKey: refund.cid },
      { title: 'address', dataKey: refund.address },
      { title: 'bank_name', dataKey: refund.bank_name },
      { title: 'iban', dataKey: refund.iban },
      { title: 'account_hold_name', dataKey: refund.account_hold_name },
      { title: 'bank_account_number', dataKey: refund.bank_account_number },
      { title: 'amount_paid', dataKey: refund.amount_paid },
      { title: 'agent_name', dataKey: refund.agent_name },
      { title: 'reason', dataKey: refund.reason },
    ];

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

    doc.save('refund.pdf');
  }

  printAllRefunds(log: any) {
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
    doc.text('Low Calories Restaurant - UAE', 500, 25);
    doc.text('3rd Settelment, New Cairo', 500, 35);
    doc.text('Phone: 04-5973939', 500, 45);
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
      // 'original_amount_paid',
      // 'amount_usd',
      // 'total_amount_refund',
      'agent_name',
      'amount_paid',
      'reason',
    ];
    const convertedData = log.map((obj: any) => [
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
      obj.agent_name,
      obj.amount_paid,
      obj.reason,
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

    doc.save('All_Refunds.pdf');
  }

  printComplaint(complaint: any) {
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customers Complaints Report', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - UAE', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 04-5973939', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

    autoTable(doc, { startY: 55 });

    var columns = [
      { title: 'Date', dataKey: complaint.date },
      { title: 'customer_name', dataKey: complaint.c_name },
      { title: 'customer_mobile', dataKey: complaint.c_mobile },
      { title: 'cid', dataKey: complaint.cid },
      { title: 'agent_name', dataKey: complaint.agent_name },
      { title: 'status', dataKey: complaint.status },
      { title: 'branch', dataKey: complaint.branch },
      { title: 'action', dataKey: complaint.action },
      { title: 'issue_details', dataKey: complaint.issue_details },
    ];

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

  printAllComplaint(log: any) {
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
    doc.text('Low Calories Restaurant - UAE', 320, 25);
    doc.text('3rd Settelment, New Cairo', 320, 35);
    doc.text('Phone: 04-5973939', 320, 45);
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

    const convertedData = log.map((obj: any) => [
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
      doc.text('Thelowcalories.com', 20, doc.internal.pageSize.getHeight() - 5);
    }
    doc.save('All_Complaints.pdf');
  }

  printDislike(dislike: any) {
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customers Dislike Report', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - UAE', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 04-5973939', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

    autoTable(doc, { startY: 55 });

    var columns = [
      { title: 'Date', dataKey: dislike.created_at.substring(0, 10) },
      { title: 'Name', dataKey: dislike.name },
      { title: 'Email', dataKey: dislike.email },
      { title: 'Mobile', dataKey: dislike.mobile },
      { title: 'Branch', dataKey: dislike.branch },
      { title: 'sent_by', dataKey: dislike.sent_by },
      { title: 'reasons', dataKey: dislike.reasons },
      { title: 'cid', dataKey: dislike.cid },
      { title: 'dislike_meals', dataKey: dislike.dislike_meals },
      { title: 'created_by', dataKey: dislike.agent.name },
    ];

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

    doc.save('dislike.pdf');
  }

  printAllDislikes(log: any) {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    doc.internal.pageSize.width = 420;
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

    doc.setTextColor(50);
    doc.setFontSize(14);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customers Dislike Report', 10, 45);
    doc.text('Prepared By: Low Calories Technical Team', 10, 55);
    doc.text('Requested By: Mohamed Fawzy', 10, 65);
    doc.text('Low Calories Restaurant - UAE', 320, 25);
    doc.text('3rd Settelment, New Cairo', 320, 35);
    doc.text('Phone: 04-5973939', 320, 45);
    doc.text('Email: info@thelowcalories.com', 320, 55);
    doc.text('Website: thelowcalories.com', 320, 65);

    const headers = [
      'date',
      'cid',
      'name',
      'email',
      'mobile',
      'sent_by',
      'branch',
      'reasons',
      'dislike_meals',
      'created_by',
    ];
    const convertedData = log.map((obj: any) => [
      new Date(obj.created_at).toLocaleDateString('en-CA'),
      obj.cid,
      obj.name,
      obj.email,
      obj.mobile,
      obj.sent_by,
      obj.branch,
      obj.reasons,
      obj.dislike_meals,
      obj.agent.name,
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

    doc.save('All_Dislikes.pdf');
  }
  // =================================================================== SHOW DETAILS ===================================================================
  currentRow: any;
  showRow(log: any) {
    this.currentRow = this.removeObjectValues(log);
    this.detailsModal = true;
    this.files = [];
  }

  removeObjectValues(obj: any) {
    for (const key in obj) {
      if (
        typeof obj[key] === 'object' &&
        key != 'emirate' &&
        key != 'data_options'
      ) {
        delete obj[key];
      }
    }
    return obj;
  }

  // =================================================================== SHOW FILES ===================================================================

  files: any[] = [];
  getCallFiles(id: number) {
    this._CallsService.getFiles(id).subscribe((res) => {
      this.files = res.data.call_files;
    });
  }

  // ======================================================= filter by team =================================================
  agents_clone: any[] = [];
  handleAgent(value: string) {
    this.agents = this.agents_clone;
    this.agents = this.agents.filter((agent) => agent.team === value);
  }
}
