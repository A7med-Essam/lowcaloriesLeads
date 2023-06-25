import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-createlead',
  templateUrl: './createlead.component.html',
  styleUrls: ['./createlead.component.scss'],
})
export class CreateleadComponent implements OnInit, OnDestroy {
  selectedCustomerName: any;
  selectedCustomerMobile: any;
  selectedCustomerEmail: any;
  selectedPlatform: any;
  note: any;
  selectedAgents: any[] = [];

  constructor(
    private _SurveyService: SurveyService,
    private _MessageService: MessageService
  ) {}
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  interval: any;
  ngOnInit() {
    setTimeout(() => {
      this.getAgents();
    }, 500);
    this.interval = setInterval(() => {
      this.getAgents();
    }, 10000);
    this.getPlatforms();
  }

  fixMultieSelectFilter(e: any) {
    if (e.filterValue == 'Online') {
      e.filterValue = 'Online';
    }
  }

  createLead() {
    let lead: any = {
      customer_name: this.selectedCustomerName,
      customer_email: this.selectedCustomerEmail,
      customer_mobile: this.selectedCustomerMobile,
      user_ids: this.selectedAgents,
      platforms:this.selectedPlatform,
      notes:this.note
    };

    this._SurveyService.createLead(lead).subscribe({
      next: (res) => {
        this.selectedCustomerEmail = null;
        this.selectedCustomerMobile = null;
        this.selectedCustomerName = null;
        this.selectedPlatform = null;
        this.note = null;
        this.selectedAgents = []
        this._MessageService.add({
          severity: 'success',
          summary: 'Notification',
          detail: res.message,
        });
      },
    });
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        res.data.forEach((e: any) => {
          if (e.status == 'Online') {
            e.name = `${e.name} - Online 🟢`;
          } else {
            e.name = `${e.name} - Offline 🔴`;
          }
        });
        this.agents = res.data;
      },
    });
  }

  platforms: any[] = [];
  getPlatforms() {
    this._SurveyService.getPlatforms().subscribe({
      next: (res) => {
        this.platforms = res.data;
      },
    });
  }

  // getAgentByLeadCount(){
  //   return this.agents.reduce((prev,current) => prev.open_lead_counts < current.open_lead_counts ? prev:current)
  // }
}
