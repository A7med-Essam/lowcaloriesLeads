import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MailService } from 'src/app/services/mail.service';

@Component({
  selector: 'app-show-head-mails',
  templateUrl: './show-head-mails.component.html',
  styleUrls: ['./show-head-mails.component.scss'],
})
export class ShowHeadMailsComponent implements OnInit {
  users: any[] = [];
  models: string[] = ['leads' , 'targets' , 'refunds', 'complains' , 'calls','daily','monthly'];
  currentModels: string[] = [];
  updateModal: boolean = false;
  currentEmail: string = '';
  constructor(
    private _MailService: MailService,
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

  update(models: string[]) {
    this._MailService
      .updateHeadModels({ email: this.currentEmail, models })
      .subscribe({
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

  displayModal(email: string,models:string[]) {
    this.updateModal = true;
    this.currentEmail = email;
    this.currentModels = models
  }
}
