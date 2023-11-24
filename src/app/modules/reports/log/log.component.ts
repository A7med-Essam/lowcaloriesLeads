import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { Checkbox } from 'primeng/checkbox';
import { Dropdown } from 'primeng/dropdown';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { CallsService } from 'src/app/services/calls.service';
import { ClinicService } from 'src/app/services/clinic.service';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { PaymentlinkService } from 'src/app/services/paymentlink.service';
import { RefundService } from 'src/app/services/refund.service';
import { ReportsService } from 'src/app/services/reports.service';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';
import { SurveyService } from 'src/app/services/survey.service';

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
    private _SubscriptionsService:SubscriptionsService
  ) {}

  selectedDate: any;
  selectedAgent: any;

  ngOnInit(): void {
    this.getAgents();
  }

  logs: any;
  isLoadingLogs: boolean = false;
  getAgentLog() {
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

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
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
    { name: 'paymentLinks', status: false },
    { name: 'paymentBranches', status: false },
    { name: 'Clinic', status: false },
  ];
}
