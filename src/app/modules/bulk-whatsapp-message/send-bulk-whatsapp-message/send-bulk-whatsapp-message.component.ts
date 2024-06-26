import { Component, OnInit } from '@angular/core';
import {
  IWhatsAppSenderMessages,
  SendBulkWhatsappService,
} from 'src/app/services/sendBulkWhatsapp.service';
import { MessageService } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';
import { BehaviorSubject } from 'rxjs';

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

    this.isSending.subscribe((res) => {
      if (res) {
        this.serviceTimer = setTimeout(() => {
          this.checkJobService();
          // this.serviceDelay = 1;
        }, 1000 * this.serviceDelay);
      }
    });
  }

  checkJobService() {
    this._sendWhatsappServices.checkWhatsAppServices().subscribe((res) => {
      this.isSending.next(res.data);
      // if (!res.data) {
      //   clearTimeout(this.serviceTimer);
      // }
    });
  }
  stopWhatsAppBulkServices() {
    this._sendWhatsappServices.stopWhatsAppBulkServices().subscribe((res) => {
      this.isSending.next(false);
    });
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
  uploadFile(e: Event) {
    this.onFileChange(e);
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
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
          const [base64Strings] = await Promise.all(
            Array.from(files).map(readFile)
          );
          this.fileName = base64Strings;
        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }
  selectedSender: any;
  fileName: any = null;
  isSending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  serviceDelay: number = 0;
  serviceTimer: any;
  sendBulk() {
    if (!this.isSending.value) {
      if (this.selectedTemplate) {
        this.isLoading = true;
        const nums = this.numbers.map((res) => res.value);
        this._sendWhatsappServices
          .sendBulkMessage({
            message: this.selectedTemplate.message,
            numbers: nums,
            sender_id: this.selectedSender,
            file: this.fileName,
            delayInSeconds: this.delayInSeconds,
            delayInDate: this.delayInDate,
          })
          .subscribe((res) => {
            if (res.status == 1) {
              this.serviceDelay = res.data;
              this.isSending.next(true);
              this._MessageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Messages sent',
              });
            }
            this.isLoading = false;
          });
      } else {
        this._MessageService.add({
          severity: 'warn',
          summary: 'Message is required!',
          detail: 'Please select a message',
        });
      }
    } else {
      this._MessageService.add({
        severity: 'warn',
        summary: 'Service is busy',
        detail: 'Please wait...',
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

  selectedSenderType: string = senderTypeEnum.now;
  senderTypeModal: boolean = false;
  delayInSeconds: number = 0;
  delayInDate: string = '';
  scheduleTime: Date = new Date();
  today: Date = new Date();
  changeSenderType() {
    switch (this.selectedSenderType) {
      case senderTypeEnum.schedule:
        this.senderTypeModal = true;
        break;
    }
  }
  onSelectedScheduleTime(event: any) {
    this.scheduleTime = event;
    this.getScheduleTime();
  }
  public get SenderTypes(): senderTypeEnum[] {
    return Object.values(senderTypeEnum);
  }

  getScheduleTime() {
    const today = new Date();
    const diff = this.scheduleTime.getTime() - today.getTime();
    this.delayInSeconds = Math.floor(diff / 1000);
    const ScheduleDate = new Date(this.scheduleTime);
    ScheduleDate.setHours(ScheduleDate.getHours() + 2);
    const selectedScheduleDate = ScheduleDate.toISOString().split('T');
    this.delayInDate = `${selectedScheduleDate[0]} ${
      selectedScheduleDate[1].split('.')[0]
    }`;
  }
}

enum whatsappOptionsEnum {
  file = 'file',
  lastDays = 'lastDays',
  query = 'query',
}

enum senderTypeEnum {
  now = 'now',
  schedule = 'schedule',
}
