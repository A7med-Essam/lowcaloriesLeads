import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SendBulkWhatsappService } from 'src/app/services/sendBulkWhatsapp.service';
@Component({
  selector: 'app-whatsapp-query',
  templateUrl: './whatsapp-query.component.html',
  styleUrls: ['./whatsapp-query.component.scss'],
})
export class WhatsappQueryComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  createModal: boolean = false;
  queries: any[] = [];
  queryForm: FormGroup = this._FormBuilder.group({
    query_name: ['', Validators.required],
    query_string: ['', Validators.required],
    params: this._FormBuilder.array([]),
  });
  total!: number;
  pagination: any = {
    first: 1,
    rows: 15,
  };

  constructor(
    private _FormBuilder: FormBuilder,
    private _SendBulkWhatsappService: SendBulkWhatsappService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isDuplicated: boolean = false;
  ngOnInit(): void {
    this.getQueries();
    this.queryForm
      .get('query_string')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.isDuplicated = false;
        const regex = /\$\w+/g;
        if (value.match(regex)) {
          this.params.clear();
          const variables = value.match(regex);
          variables.forEach((variable: string) => {
            this.addParam(variable);
          });
          if (this.hasDuplicateName(this.params.value)) {
            this.params.clear();
            this.isDuplicated = true;
          } else {
            this.isDuplicated = false;
          }
        }
      });
  }

  hasDuplicateName(array: any[]) {
    const encounteredNames = new Set();
    for (const obj of array) {
      if (encounteredNames.has(obj.name)) {
        return true;
      }
      encounteredNames.add(obj.name);
    }
    return false;
  }

  get params(): FormArray {
    return this.queryForm.get('params') as FormArray;
  }

  addParam(name: string) {
    this.params.push(this._FormBuilder.group({ name, type: 'string' }));
  }

  insertQuery(form: FormGroup) {
    if (form.valid) {
      this._SendBulkWhatsappService.addQueryRequest(form.value).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.createModal = false;
            this.getQueries();
            this.queryForm.reset();
          }
        },
      });
    }
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
    this._SendBulkWhatsappService.deleteQuery(id).subscribe((res) => {
      this.getQueries();
    });
  }
  page = 1;
  getQueries() {
    this._SendBulkWhatsappService
      .getQueryRequest(this.page, this.pagination.rows)
      .subscribe((res) => {
        this.queries = res.data.data;
        this.total = res.data.total;
        this.pagination.rows = res.data.per_page;
      });
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pagination.rows = event.rows;
    this.getQueries();
  }
}
