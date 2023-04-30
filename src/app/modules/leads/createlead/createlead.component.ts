import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SurveyService } from 'src/services/survey.service';

@Component({
  selector: 'app-createlead',
  templateUrl: './createlead.component.html',
  styleUrls: ['./createlead.component.scss'],
})
export class CreateleadComponent implements OnInit {
  selectedCustomerName: any;
  selectedCustomerMobile: any;
  selectedCustomerEmail: any;
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _MessageService: MessageService
  ) {}

  ngOnInit() {
    this.getAgents()
  }


  createLead() {
    let lead: any = {
      customer_name: this.selectedCustomerName,
      customer_email: this.selectedCustomerEmail,
      customer_mobile: this.selectedCustomerMobile,
      user_ids:[
        this.getAgentByLeadCount().id
      ]
    };

    this._SurveyService.createLead(lead).subscribe({
      next: (res) => {
        this.selectedCustomerEmail = null
        this.selectedCustomerMobile = null
        this.selectedCustomerName = null
        this._MessageService.add({
          severity: 'success',
          summary: 'Notification',
          detail: res.message,
        });
      }
    });
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  getAgentByLeadCount(){
    return this.agents.reduce((prev,current) => prev.open_lead_counts < current.open_lead_counts ? prev:current)
  }
}
