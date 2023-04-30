import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto'
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private _SurveyService:SurveyService
  ) { }

  ngOnInit(): void {
    this.createChart();
    this.createChart2();
    this.createChart3();
    this.allReminderLeads();
  }

  public chart: any;
  public chart2: any;
  public chart3: any;

  getDate(day: number) {
    let date = new Date().setDate(new Date().getDate() - day);
    let currentDate = new Date(date).toLocaleDateString();
    return currentDate;
  }

  createChart() {
    this.chart = new Chart("MyChart", {
      type: "bar", //this denotes tha type of chart
      data: {
        labels: [
          this.getDate(7),
          this.getDate(6),
          this.getDate(5),
          this.getDate(4),
          this.getDate(3),
          this.getDate(2),
          this.getDate(1),
          this.getDate(0),
        ],
        datasets: [
          {
            label: "Sales",
            data: [467, 576, 772, 279, 92, 74, 273, 376],
            backgroundColor: "#66C4DE",
          },
          {
            label: "Profit",
            data: [342, 342, 696, 227, 57, 20, 238, 341],
            backgroundColor: "#ccc",
          },
        ],
      },
      options: {
        aspectRatio: 3.2,
      },
    });
  }

  createChart2() {
    this.chart2 = new Chart("MyChart2", {
      type: "line", 

      data: {
        labels: ["January", "February", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Facebook",
            data: [10, 10, 20, 80, 5, 16],
            backgroundColor: "#909090",
            borderColor: "#51BCDA",
            fill: false,
            // lineTension: 0.5,
          },
          {
            label: "Instagram",
            data: [20, 30, 40, 30, 20, 90],
            backgroundColor: "#909090",
            borderColor: "#dba291",
            fill: false,
            // lineTension: 0.5,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }

  createChart3() {
    this.chart3 = new Chart("MyChart3", {
      type: "doughnut", //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ["Sales", "Marketing", "Customer Service"],
        datasets: [
          {
            label: "Most Successfull Department",
            data: [10, 15, 6],
            backgroundColor: ["#6BD098", "#51CBCE", "#ccc"],
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }


  totalLeads:number = 0
  reminded:number = 0
  oldLeads:number = 0
  leadsMessages:number = 0
  allReminderLeads(){
    this._SurveyService.allReminderLeads().subscribe({
      next:res=>{
        res.data.forEach((e:any) => {
          if (new Date(e.remind_date) <= new Date() && e.reminded == false) {
            this.updateReminderLead(e.id,e.remind_date)
          }
        });
        this.totalLeads = res.data.length
        this.reminded = res.data.filter((d:any) => d.reminded == false).length
        this.oldLeads = res.data.filter((d:any) => d.reminded == true).length
        this.leadsMessages = res.data.filter((d:any) => d.remind_data != null).length
      }
    })
  }


  updateReminderLead(id:number,date:string,) {
    const lead = {
      lead_id: id,
      remind_date: new Date(date).toLocaleDateString(
        "en-CA"
      ),
      reminded: true,
    };
    this._SurveyService.addReminderLead(lead).subscribe({
      next: (res) => {
        console.log(res);
      },
    });
  }

}
