import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';
import { AuthService } from 'src/app/services/auth.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isSuperAdmin: boolean = true;
  private unsubscribe$ = new Subject<void>();

  constructor(
    // private _SurveyService:SurveyService,
    private _AnalysisService: AnalysisService,
    private _AuthService: AuthService,
    private _SurveyService: SurveyService
  ) {}
  staticsForm: FormGroup = new FormGroup({
    date: new FormControl(null),
    from: new FormControl(null),
    to: new FormControl(null),
    agent_id: new FormControl(null),
    mobile: new FormControl(null),
    customer_name: new FormControl(null),
  });
  ngOnInit(): void {
    this._AuthService.currentUser
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any) => {
        this.isSuperAdmin = data.role_name === 'super_admin';
        if (this.isSuperAdmin) {
          this.getAgents();
          this.getLabels();
          this._AnalysisService
          .getStatics([{label:"from",name:new Date()},{label:"to",name:new Date()}])
          .subscribe((res) => {
            if (this.chart) {
              this.chart.destroy();
            }
            this.statics = res.data;
            this.statics[0].name = "Analytics"
            this.statics[0].label = "Analytics Count"
            this.displayChart = true;
            setTimeout(() => {
              this.createChart(this.statics);
            }, 1);
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  displayChart: boolean = false;
  public isLoading: boolean = false;
  public chart: any;
  public chart2: any;
  public chart3: any;

  generateColorArrays(loopCount: number) {
    const backgroundColors = [];
    const borderColors = [];

    for (let i = 0; i < loopCount; i++) {
      // Generate random RGB values for each color
      const red = Math.floor(Math.random() * 256);
      const green = Math.floor(Math.random() * 256);
      const blue = Math.floor(Math.random() * 256);

      // Add rgba format for backgroundColor
      backgroundColors.push(`rgba(${red}, ${green}, ${blue}, 0.2)`);

      // Add rgb format for borderColor
      borderColors.push(`rgb(${red}, ${green}, ${blue})`);
    }

    return {
      backgroundColor: backgroundColors,
      borderColor: borderColors,
    };
  }

  createChart(values: any[]) {
    const data: any = {
      labels: values.map((e: any) => e.label),
      datasets: [
        {
          label: '',
          data: values.map((e: any) => e.count),
          backgroundColor: this.generateColorArrays(values.length)
            .backgroundColor,
          borderWidth: 1,
        },
      ],
    };
    this.chart = new Chart('MyChart', {
      type: 'doughnut',
      data,
      options: { aspectRatio: 3.2 },
    });
  }

  createChart2() {
    this.chart2 = new Chart('MyChart2', {
      type: 'line',

      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
          {
            label: 'Facebook',
            data: [10, 10, 20, 80, 5, 16],
            backgroundColor: '#909090',
            borderColor: '#51BCDA',
            fill: false,
            // lineTension: 0.5,
          },
          {
            label: 'Instagram',
            data: [20, 30, 40, 30, 20, 90],
            backgroundColor: '#909090',
            borderColor: '#dba291',
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
    this.chart3 = new Chart('MyChart3', {
      type: 'doughnut', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ['Sales', 'Marketing', 'Customer Service'],
        datasets: [
          {
            label: 'Most Successfull Department',
            data: [10, 15, 6],
            backgroundColor: ['#6BD098', '#51CBCE', '#ccc'],
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }

  totalLeads: number = 0;
  reminded: number = 0;
  oldLeads: number = 0;
  leadsMessages: number = 0;
  // allReminderLeads(){
  //   this._SurveyService.allReminderLeads().subscribe({
  //     next:res=>{
  //       res.data.forEach((e:any) => {
  //         if (new Date(e.remind_date) <= new Date() && e.reminded == false) {
  //           this.updateReminderLead(e.id,e.remind_date)
  //         }
  //       });
  //       this.totalLeads = res.data.length
  //       this.reminded = res.data.filter((d:any) => d.reminded == false).length
  //       this.oldLeads = res.data.filter((d:any) => d.reminded == true).length
  //       this.leadsMessages = res.data.filter((d:any) => d.remind_data != null).length
  //     }
  //   })
  // }

  // updateReminderLead(id:number,date:string,) {
  //   const lead = {
  //     lead_id: id,
  //     remind_date: new Date(date).toLocaleDateString(
  //       "en-CA"
  //     ),
  //     reminded: true,
  //   };
  //   this._SurveyService.addReminderLead(lead).subscribe({
  //     next: (res) => {
  //     },
  //   });
  // }

  labels!: ILabel;
  getLabels() {
    this.isLoading = true;
    this._AnalysisService.getAllLabels().subscribe((res) => {
      res.data.forEach((e: string) => {
        this.staticsForm.addControl(e, new FormControl(null));
      });
      const arrayOfObjects = res.data.reduce((acc: any, key: any) => {
        acc[key] = [];
        return acc;
      }, {});
      this.isLoading = false;
      this.labels = arrayOfObjects;
    });
  }

  loadDropDown(label: any) {
    if (this.labels[label].length == 0) {
      this.isLoading = true;
      this._AnalysisService.getLabelOptions(label).subscribe((res) => {
        this.labels[label] = res.data;
        this.isLoading = false;
      });
    }
  }

  statics: any;
  getStatics(form: FormGroup) {
    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
          date: null,
        });
      } else {
        form.patchValue({
          date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
        });
      }
    }
    const filtered: any = {};
    for (let key in form.value) {
      if (form.value[key]) {
        filtered[key] = form.value[key];
      }
    }
    const arrayOfValues = Object.values(filtered).map((item) => item);
    if (arrayOfValues.length) {
      this._AnalysisService
        .getStatics({ statics: arrayOfValues })
        .subscribe((res) => {
          if (this.chart) {
            this.chart.destroy();
          }
          this.statics = res.data;
          this.displayChart = true;
          setTimeout(() => {
            this.createChart(res.data);
          }, 1);
        });
    }
  }

  reset() {
    this.staticsForm.reset();
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }
}

interface ILabel {
  [key: string]: ILabelOptions[];
}
interface ILabelOptions {
  label: string;
  name: string;
  has_children: boolean;
}
