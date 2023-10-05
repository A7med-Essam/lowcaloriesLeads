import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MailService } from 'src/app/services/mail.service';

@Component({
  selector: 'app-show-head-mails',
  templateUrl: './show-head-mails.component.html',
  styleUrls: ['./show-head-mails.component.scss'],
  providers: [ConfirmationService],
})
export class ShowHeadMailsComponent implements OnInit {
  users: any[] = [];
  models: string[] = [
    'leads',
    'targets',
    'refunds',
    'complains',
    'calls',
    'daily',
    'monthly',
    'dislikes'
  ];
  currentModels: string[] = [];
  currentUserId: string = '';
  updateModal: boolean = false;
  createModal: boolean = false;

  newModels: string[] = [];
  newEmail: string = '';
  newManager: string = '0';
  constructor(
    private _MailService: MailService,
    private confirmationService: ConfirmationService,
    private _MessageService: MessageService
  ) {}
  ngOnInit(): void {
    this.getHeadMails();
  }

  getHeadMails() {
    this._MailService.getHeadMails().subscribe({
      next: (res) => {
        this.users = res?.data;
      },
    });
  }

  update(id: string, models: string[]) {
    this._MailService.updateHeadModels({ head_mail_id:id, models }).subscribe({
      next: (res) => {
        if (res.status == 1) {
          this.updateModal = false;
          this._MessageService.add({
            severity: 'success',
            summary: 'MailService',
            detail: 'Model Updated Successfully',
          });
          this.getHeadMails();
        }
      },
    });
  }

  create(email: string, manager: string, models: string[]) {
    let data;
    if (manager == '1') {
      data = { email, manager };
    } else {
      data = { email, manager, models };
    }
    this._MailService.addHeadEmail(data).subscribe({
      next: (res) => {
        if (res.status == 1) {
          this.createModal = false;
          this._MessageService.add({
            severity: 'success',
            summary: 'MailService',
            detail: 'Model Updated Successfully',
          });
          this.getHeadMails();
        }
      },
    });
  }

  displayModal(id: string, models: any[]) {
    this.updateModal = true;
    this.currentUserId = id;
    this.currentModels = models.map((item) => item.model);
  }

  confirm(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }

  deleteRow(id: number) {
    this._MailService.deleteEmail(id).subscribe((res) => {
      this.getHeadMails();
    });
  }
}
