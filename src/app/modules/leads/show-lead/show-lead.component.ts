import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyService } from 'src/services/survey.service';

@Component({
  selector: 'app-show-lead',
  templateUrl: './show-lead.component.html',
  styleUrls: ['./show-lead.component.scss']
})
export class ShowLeadComponent implements OnInit {

  constructor(
    private _SurveyService:SurveyService,
    private _Router:Router
  ) { }

  leads:any;
  PaginationInfo:any;

  ngOnInit(): void {
    this.getLeads()
  }

  getLeads(page:number = 1){
    this._SurveyService.getLeads(page).subscribe({
      next:res=>{
        this.leads = res?.data?.data
        this.PaginationInfo = res.data
      }
    })
  }

  showRow(id:number){
    if (id) {
      this._SurveyService.leadId.next(id)
      this._Router.navigate(['leads/details'])
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getLeads(e.first / e.rows + 1);
  }
}
