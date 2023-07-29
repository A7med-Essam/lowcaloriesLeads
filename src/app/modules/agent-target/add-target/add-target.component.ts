import { Location } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-add-target',
  templateUrl: './add-target.component.html',
  styleUrls: ['./add-target.component.scss'],
})
export class AddTargetComponent implements OnInit {
  insertForm!: FormGroup;
  constructor(
    // private _Router: Router,
    // private _ActivatedRoute: ActivatedRoute,
    private _DislikeService: DislikeService,
    private _LocalService: LocalService,
    private renderer: Renderer2,
    private _AgentTargetService: AgentTargetService,
    private _Location: Location,
    private _MessageService: MessageService,
    private _SurveyService:SurveyService
  ) {}

  // goBack(): void {
  //   this._Location.back();
  // }

  // ngOnDestroy(): void {
    // this.renderer.removeClass(document.body, 'h-side');
  // }

  ngOnInit(): void {
    this.getAgents()
    this.getInsertForm();
    this.getAgentBranches();
    // this.renderer.addClass(document.body, 'h-side');
    this.getTargetOptions();
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        date: new Date(form.value.date).toLocaleDateString('en-CA'),
        agent_id: this._LocalService.getJsonValue('userInfo_oldLowCalories').id,
      });
      this._AgentTargetService.addTarget(form.value).subscribe((res) => {
        if (res.status) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Target',
            detail: 'Target Added Successfully',
          });
          this.insertForm.reset();
        }
      });
    }
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      client_number: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[\\d]{10}$'),
      ]),
      client_cid: new FormControl(null),
      branch: new FormControl(null, [Validators.required]),
      customer_type: new FormControl(null, [Validators.required]),
      paid_by: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      invoice_number: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      date: new FormControl(null, [Validators.required]),
      team: new FormControl(null, [Validators.required]),
      amount_paid: new FormControl(null, [Validators.required]),
      client_name: new FormControl(null, [Validators.required]),
      agent_id: new FormControl(null),
    });
  }

  // ================================== OPTIONS =========================================

  paid_by: any[] = [];
  teams: any[] = [];
  customer_types: any[] = [];
  status: any[] = [];
  types: any[] = [];
  branches: any[] = [];

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  getTargetOptions() {
    this._AgentTargetService.getTargetOptions().subscribe({
      next: (res) => {
        this.customer_types  = res.data.customer_types;
        this.paid_by = this.paid_by_clone = res.data.payment_types;
        this.teams = res.data.teams;
        this.status = res.data.status;
        this.types = res.data.type;
      },
    });
  }

  // ================================== Client number & cid =========================================

  cids: any[] = [];
  getCustomerCID() {
    if (this.insertForm.controls.client_number.valid) {
      this._AgentTargetService
        .getCustomerCIDS(this.insertForm.value.client_number)
        .subscribe((res) => {
          this.cids = res.map((item: any) => item.cid);
          this.insertForm.patchValue({
            client_cid: null,
          });
          this.insertCustomerType(this.cids);
        });
    }
  }

  getSubDetails(e: any) {
    if (e.value) {
      this._AgentTargetService.getSubDetails(e.value).subscribe((res) => {
        this.insertCustomerType(this.cids);
        if (res.status) {
          this.insertPaid_by(res);
          this.insertStatus();
          this.insertTeam();
          this.insertForm.patchValue({
            invoice_number: res.data.invoice_no,
            date: new Date(res.data.delivery_starting_day),
            client_number:res.data.client_number,
            amount_paid:res.data.total_price,
            client_name:`${res.data.user.first_name} ${res.data.user.last_name}`
          });
          this.getCustomerCID();
        }
      });
    }
  }

  customerPhones: any[] = [];
  getCustomerPhones() {
    if (this.insertForm.controls.client_cid.valid) {
      this._DislikeService
        .getCustomerInfo(this.insertForm.value.client_cid)
        .subscribe((res) => {
          if (res.data.length) {
            this.customerPhones = this.getContactNumbers(res.data[0]);
          } else {
            this.customerPhones = [];
          }
        });
    }
  }

  getContactNumbers(customer: any) {
    const contactNumbers = [];
    if (customer.CustomerMobile) {
      contactNumbers.push(customer.CustomerMobile);
    }
    if (customer.CustomerPhone) {
      contactNumbers.push(customer.CustomerPhone);
    }
    return contactNumbers;
  }

  insertPaid_by(res: any) {
    const subFrom = res.data.sub_from.toLowerCase();
    const programId = Number(res.data.program_id);
    let paidValue;
    if (programId < 50) {
      if (subFrom.includes('web')) {
        paidValue = this.paid_by.find((e) =>
          e.name.toLowerCase().includes('web')
        );
      } else if (subFrom.includes('mobile')) {
        paidValue = this.paid_by.find((e) =>
          e.name.toLowerCase().includes('mobile')
        );
      }
    } else if (programId === 50) {
      if (subFrom.includes('link')) {
        paidValue = this.paid_by.find(
          (e) => e.name.toLowerCase() == 'payment link'
        );
      } else if (subFrom.includes('exchange')) {
        paidValue = this.paid_by.find((e) =>
          e.name.toLowerCase().includes('payment link exchange')
        );
      }
    } else {
      paidValue = this.paid_by.find((e) => Number(e.flag_id) === programId);
    }
    if (paidValue) {
      this.insertForm.patchValue({
        paid_by: paidValue.name,
      });
    }

    if (programId == 60 || programId == 61) {
      this.insertForm.patchValue({
        type: 'Clinic Reservation',
      });
    } else {
      this.insertForm.patchValue({
        type: 'Subscription',
      });
    }
  }

  insertCustomerType(cids: number[]) {
    if (cids?.length > 1) {
      this.insertForm.patchValue({
        customer_type: 'Re-New',
      });
    } else {
      this.insertForm.patchValue({
        customer_type: 'New',
      });
    }
  }

  insertStatus() {
    this.insertForm.patchValue({
      status: 'Active',
    });
  }

  insertTeam(){
    this.insertForm.patchValue({
      team: this.currentUser.team,
    });
  }

  currentUser: any;
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        const [user] = res.data.filter((e:any)=> e?.id == this._LocalService.getJsonValue('userInfo_oldLowCalories').id);
        this.currentUser = user
      },
    });
  }

  paid_by_clone:any;
  onTypeChange(e:any){
    this.paid_by = this.paid_by_clone;
    let [selectedType] = this.types.filter(item => item.name === e.value)
    this.paid_by = this.paid_by.filter(item => item.type_id === selectedType.id);
  }
}
