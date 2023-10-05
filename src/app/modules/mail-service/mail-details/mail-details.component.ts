import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';
import { MailService } from 'src/app/services/mail.service';

@Component({
  selector: 'app-mail-details',
  templateUrl: './mail-details.component.html',
  styleUrls: ['./mail-details.component.scss']
})
export class MailDetailsComponent implements OnInit {
  users: any[] = [];
  branches: any[] = [];
  currentBranches: number[] = [];
  updateModal: boolean = false;
  constructor(
    private _MailService: MailService,
    private _MessageService: MessageService,
    private _ActivatedRoute:ActivatedRoute,
    private _DislikeService:DislikeService
  ) {}

  id:number = Number(this._ActivatedRoute.snapshot.paramMap.get('id'));
  ngOnInit(): void {
    this.getHeadMails(this.id);
    this.getAgentBranches();
  }

  getHeadMails(id:number) {
    this._MailService.getHeadMailDetails(id).subscribe({
      next: (res) => {
        this.users = res?.data;
      },
    });
  }

  update(branches: number[]) {
    this._MailService.updateHeadDetails({ head_mail_model_id:this.current_model_id, branches }).subscribe({
      next: (res) => {
        if (res.status == 1) {
          this.updateModal = false;
          this._MessageService.add({
            severity: 'success',
            summary: 'MailService',
            detail: 'Branches Updated Successfully',
          });
          this.getHeadMails(this.id);
        }
      },
    });
  }

  getAgentBranches() {
    this._DislikeService
      .getAgentBranches()
      .subscribe((res) => (this.branches = res.data));
  }

  current_model_id:number = 0;
  displayModal(branches: any[],id:number) {
    this.current_model_id = id
    this.updateModal = true;
    this.currentBranches = branches.map((item) => item.agent_branch_id);
  }

}
