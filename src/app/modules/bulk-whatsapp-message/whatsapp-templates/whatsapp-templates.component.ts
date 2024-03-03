import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import {
  IUpdateWhatsAppMessages,
  IWhatsAppSenderMessages,
  SendBulkWhatsappService,
} from 'src/app/services/sendBulkWhatsapp.service';

@Component({
  selector: 'app-whatsapp-templates',
  templateUrl: './whatsapp-templates.component.html',
  styleUrls: ['./whatsapp-templates.component.scss'],
})
export class WhatsappTemplatesComponent implements OnInit {
  templates: IWhatsAppSenderMessages[] = [];
  updatedTemplate: string = '';
  createModal: boolean = false;
  constructor(
    private _SendBulkWhatsappService: SendBulkWhatsappService,
    private _ConfirmationService:ConfirmationService,
    private _MessageService: MessageService
  ) {}
  clonedTemp: { [s: string]: IWhatsAppSenderMessages } = {};
  ngOnInit(): void {
    this.getTemps();
  }

  confirm(id: any) {
    this._ConfirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }

  getTemps() {
    this._SendBulkWhatsappService.getWhatsAppSenderMessages().subscribe({
      next: (res) => {
        this.templates = res.data;
      },
    });
  }

  onRowEditInit(templates: IWhatsAppSenderMessages) {
    this.clonedTemp[templates.id as string] = { ...templates };
  }

  onRowEditSave(templates: IWhatsAppSenderMessages, index: number) {
    if (templates.case == '' || templates.message == '') {
      this._MessageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Invalid Template',
      });
      this.templates[index] = this.clonedTemp[templates.id as string];
      delete this.clonedTemp[templates.id as string];
    } else {
      delete this.clonedTemp[templates.id as string];
      this._MessageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Templates is updated',
      });
      this.updateRow(this.templates[index]);
    }
  }

  onRowEditCancel(templates: IWhatsAppSenderMessages, index: number) {
    this.templates[index] = this.clonedTemp[templates.id as string];
    delete this.clonedTemp[templates.id as string];
  }

  updateRow(row: IWhatsAppSenderMessages) {
    const data = {
      case: row.case,
      message: row.message,
      message_id:row.id
    };
    this._SendBulkWhatsappService.updateWhatsAppSenderMessages(data).subscribe({
      next: (res) => {
        this.getTemps();
      },
    });
  }

  deleteRow(message_id: number) {
    this._SendBulkWhatsappService
      .deleteWhatsAppSenderMessages(message_id)
      .subscribe({
        next: (res) => {
          this.getTemps();
        },
      });
  }

  newMessage:string = '';
  newCase:string = '';
  createRow(){
    if (this.newCase == '' || this.newMessage == '') {
      this._MessageService.add({
        severity: 'warn',
        summary: 'Empty Inputs!',
        detail: 'Invalid Template',
      });
    }else{
      const data = {
        case: this.newCase,
        message: this.newMessage
      };
      this._SendBulkWhatsappService.createWhatsAppSenderMessages(data).subscribe({
        next: (res) => {
          this.getTemps();
          this.createModal = false;
        },
      });
    }
  }
}
