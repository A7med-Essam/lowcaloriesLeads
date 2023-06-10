import { Location } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';

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
    private _MessageService:MessageService
  ) {}

  // goBack(): void {
  //   this._Location.back();
  // }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'h-side');
  }

  ngOnInit(): void {
    this.getInsertForm();
    this.getAgentBranches();
    this.renderer.addClass(document.body, 'h-side');
    this.getTargetOptions();
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        date: new Date(form.value.date).toLocaleDateString('en-CA'),
        agent_id: this._LocalService.getJsonValue('userInfo_oldLowCalories').id,
      });
      this._AgentTargetService.addTarget(form.value).subscribe((res) => {
        // this._Router.navigate(['agent'], {
        //   relativeTo: this._ActivatedRoute.parent?.parent,
        // });
        this._MessageService.add({
          severity: 'success',
          summary: 'Target',
          detail: 'Target Added Successfully',
        });
        this.insertForm.reset();
      });
    }
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      client_number: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[\\d]{10}$'),
      ]),
      client_cid: new FormControl(null, [Validators.required]),
      branch: new FormControl(null, [Validators.required]),
      customer_type: new FormControl(null, [Validators.required]),
      paid_by: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      invoice_number: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      date: new FormControl(null, [Validators.required]),
      team: new FormControl(null, [Validators.required]),
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
        this.customer_types = res.data.customer_types;
        this.paid_by = res.data.payment_types;
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
      this._AgentTargetService.getSubDetails(this.insertForm.value.client_number).subscribe(res=>{
        if (res.status) {
          this.insertForm.patchValue({
            invoice_number: res.data.invoice_no,
            date: new Date(res.data.delivery_starting_day),
            // type: res.data.type,
            // paid_by: res.data.paid_by,
          });
        }
      })
      this._AgentTargetService
        .getCustomerCIDS(this.insertForm.value.client_number)
        .subscribe((res) => {
          this.cids = res.map((item: any) => item.cid);
          this.insertForm.patchValue({
            client_cid: null,
          });
        });
    }
  }

  onNumberChange(e:any){
    this._AgentTargetService.getSubDetails(e.value).subscribe(res=>{
      if (res.status) {
        this.insertForm.patchValue({
          invoice_number: res.data.invoice_no,
          date: new Date(res.data.delivery_starting_day),
          // type: res.data.type,
          // paid_by: res.data.paid_by,
        });
      }
    })
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
}
