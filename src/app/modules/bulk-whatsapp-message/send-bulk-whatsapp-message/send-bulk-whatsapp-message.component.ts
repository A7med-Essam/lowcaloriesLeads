import { Component, OnInit } from '@angular/core';
import {
  IWhatsAppSenderMessages,
  SendBulkWhatsappService,
} from 'src/app/services/sendBulkWhatsapp.service';
import { MessageService } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-send-bulk-whatsapp-message',
  templateUrl: './send-bulk-whatsapp-message.component.html',
  styleUrls: ['./send-bulk-whatsapp-message.component.scss'],
})
export class SendBulkWhatsappMessageComponent implements OnInit {
  constructor(
    private _sendWhatsappServices: SendBulkWhatsappService,
    private _MessageService: MessageService
  ) {}
  queries: any[] = [];

  getQueries() {
    this._sendWhatsappServices.getQueryRequest().subscribe((res) => {
      this.queries = res.data;
    });
  }
  ngOnInit(): void {
    this.getTemps();
    this.getQueries();
    this.getSenders();
  }

  templates: IWhatsAppSenderMessages[] = [];
  selectedTemplate: IWhatsAppSenderMessages | null = null;
  numbers: any[] = [];
  isLoading: boolean = false;
  uploadModal: boolean = false;
  clonedTemp: { [s: string]: { value: string } } = {};

  whatsappFilterOptions: string[] = [
    whatsappOptionsEnum.file,
    whatsappOptionsEnum.lastDays,
    whatsappOptionsEnum.query,
  ];

  getTemps() {
    this._sendWhatsappServices.getWhatsAppSenderMessages().subscribe({
      next: (res) => {
        this.templates = res.data;
      },
    });
  }

  senders: any[] = [];

  getSenders() {
    this._sendWhatsappServices.getSenders().subscribe({
      next: (res) => {
        this.senders = res.data;
      },
    });
  }

  onOptionsChange(value: string) {
    this.numbers = [];
    if (value == whatsappOptionsEnum.file) {
      this.uploadModal = true;
    } else if (value == whatsappOptionsEnum.query) {
      // handle query
    } else {
      // handle lastDays
    }
  }

  onCalendarClose(c: Calendar) {
    if (c.value != undefined && c.value[1]) {
      const data = {
        date_from: c.value[0],
        date_to: c.value[1],
        model: 'lastDays',
      };
      this.getBulkWhatsappNumbers(data);
    }
  }

  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      let f: File = this.getFormData({ file: file, model: 'file' }) as any;
      this.getBulkWhatsappNumbers(f);
      this.uploadModal = false;
    }
  }

  getBulkWhatsappNumbers(data: any) {
    this.isLoading = true;
    this._sendWhatsappServices.getBulkWhatsappNumbers(data).subscribe({
      next: (res) => {
        this.uploadModal = false;
        this.isLoading = false;
        this.numbers = this.convertToObj(res.data);
      },
      error: (err) => {
        this.uploadModal = false;
        this.isLoading = false;
      },
    });
  }

  convertToObj(arr: string[]) {
    return arr.map((str) => ({
      value: str,
    }));
  }

  onRowEditInit(number: { value: string }) {
    this.clonedTemp[number.value.toString()] = { ...number };
  }

  onRowEditSave(templates: { value: string }, index: number) {
    if (templates.value == '') {
      this._MessageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Invalid Number',
      });

      this.numbers[index] = { value: Object.keys(this.clonedTemp)[0] };
      this.clonedTemp = {};
    } else {
      this.clonedTemp = {};
      this._MessageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Number is updated',
      });
    }
  }

  onRowEditCancel(number: { value: string }, index: number) {
    this.numbers[index] = { value: Object.keys(this.clonedTemp)[0] };
    this.clonedTemp = {};
  }
  selectedSender:any;
  sendBulk() {
    if (this.selectedTemplate) {
      this.isLoading = true;
      const nums = this.numbers.map((res) => res.value);
      this._sendWhatsappServices
        .sendBulkMessage({
          message: this.selectedTemplate.message,
          numbers: nums,
          sender_id:this.selectedSender
        })
        .subscribe((res) => {
          this._MessageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Messages sent',
          });
          this.isLoading = false;
        });
    } else {
      this._MessageService.add({
        severity: 'warn',
        summary: 'Message is required!',
        detail: 'Please select a message',
      });
    }
  }

  deleteRow(index: number) {
    this.numbers.splice(index, 1);
  }

  checkQuery(query: any) {
    query.params.forEach((param: any) => {
      let date = param.value;
      if (param.type == 'date') {
        date = param.value.toLocaleDateString('en-CA');
      }
      const regex = new RegExp(param.name.replace(/\$/g, '\\$'), 'g');
      query.query_string = query.query_string.replace(regex, `'${date}'`);
    });
    this.getBulkWhatsappNumbers({
      queryString: query.query_string,
      model: 'query',
    });
  }
}

enum whatsappOptionsEnum {
  file = 'file',
  lastDays = 'lastDays',
  query = 'query',
}
