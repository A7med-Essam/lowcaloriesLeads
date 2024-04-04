import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SendBulkWhatsappService } from 'src/app/services/sendBulkWhatsapp.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-whatsapp-sender-show',
  templateUrl: './whatsapp-sender-show.component.html',
  styleUrls: ['./whatsapp-sender-show.component.scss'],
})
export class WhatsappSenderShowComponent implements OnInit {
  rows: any[] = [];
  constructor(
    private _SendBulkWhatsappService: SendBulkWhatsappService,
    private _ConfirmationService: ConfirmationService,
    private _MessageService: MessageService,
    private _SurveyService: SurveyService
  ) {}
  clonedSender: { [s: string]: any } = {};

  ngOnInit(): void {
    this.getAgents();
    this.getData();
  }

  getData() {
    this._SendBulkWhatsappService.getSenders().subscribe({
      next: (res) => {
        this.rows = res.data;
      },
    });
  }

  onRowEditInit(templates: any) {
    this.clonedSender[templates.id as string] = { ...templates };
  }

  onRowEditSave(templates: any, index: number) {
    if (templates.case == '' || templates.message == '') {
      this._MessageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Invalid Sender',
      });
      this.rows[index] = this.clonedSender[templates.id as string];
      delete this.clonedSender[templates.id as string];
    } else {
      delete this.clonedSender[templates.id as string];
      this._MessageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Sender is updated',
      });
      this.updateRow(this.rows[index]);
    }
  }

  onRowEditCancel(templates: any, index: number) {
    this.rows[index] = this.clonedSender[templates.id as string];
    delete this.clonedSender[templates.id as string];
  }

  updateRow(row: any) {
    const data = {
      name: row.name,
      mobile: row.mobile,
      sender_id: row.id,
      app_key: row.app_key,
      auth_key: row.auth_key,
      base_url: row.base_url,
    };
    this._SendBulkWhatsappService.updateSenders(data).subscribe({
      next: (res) => {
        this.getData();
      },
    });
  }

  confirm(id: any) {
    this._ConfirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }

  deleteRow(id: number) {
    this._SendBulkWhatsappService.deleteSenders(id).subscribe({
      next: (res) => {
        this.getData();
      },
    });
  }

  assignModal: boolean = false;
  selectedAgent: number[] = [];
  selectedSender: any = null;
  assign(data: any) {
    this.assignModal = true;
    this.selectedAgent = data.agent_ids;
    this.selectedSender = data;
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data.filter((e: any) => e.role_name != 'super_admin');
      },
    });
  }

  assignAgent() {
    this._SendBulkWhatsappService
      .updateSenders({
        ...this.selectedSender,
        sender_id: this.selectedSender.id,
        agent_ids: this.selectedAgent,
      })
      .subscribe((res) => {
        this.getData();
        this.assignModal = false;
      });
  }
}
