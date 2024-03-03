import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SendBulkWhatsappService } from 'src/app/services/sendBulkWhatsapp.service';

@Component({
  selector: 'app-execute-query-module',
  templateUrl: './execute-query-module.component.html',
  styleUrls: ['./execute-query-module.component.scss'],
})
export class ExecuteQueryModuleComponent implements OnInit {
  constructor(
    private _sendWhatsappServices: SendBulkWhatsappService,
    private _MessageService: MessageService
  ) {}
  queries: any[] = [];
  numbers: any[] = [];
  isLoading: boolean = false;
  uploadModal: boolean = false;
  clonedTemp: { [s: string]: { value: string } } = {};
  sqlData: any[] = [];

  captionColumns: any[] = [];
  getQueries() {
    this._sendWhatsappServices.getQueryService().subscribe((res) => {
      this.queries = res.data;
    });
  }
  ngOnInit(): void {
    this.getQueries();
  }

  checkQuery(query: any) {
    query.params.forEach((param: any) => {
      let date = param.value;
      if (param.type == 'date') {
        date = param.value.toLocaleDateString('en-CA');
      }
      const regex = new RegExp(param.name.replace(/\$/g, '\\$'), 'g');
      query.query_string = query.query_string.replace(regex, `'${date}'`);
    });
    this.getBulkWhatsappNumbers({
      queryString: query.query_string,
      model: 'query',
    });
  }
  convertToObj(arr: string[]) {
    return arr.map((str) => ({
      value: str,
    }));
  }
  // sqlQueryServices
  getBulkWhatsappNumbers(data: any) {
    this.isLoading = true;
    this._sendWhatsappServices
      .sqlQueryServices({ query_string: data['queryString'] })
      .subscribe({
        next: (res) => {
          this.uploadModal = false;
          this.isLoading = false;
          this.sqlData = res.data;
          if (this.sqlData.length > 0) {
            this.captionColumns = Object.keys(this.sqlData[0]);
          }
          this._MessageService.add({
            severity: 'success',
            summary: 'SQL Query',
            detail: 'Query Executed Successfully',
          });
          // this.numbers = this.convertToObj(res.data);
        },
        error: (err) => {
          this.uploadModal = false;
          this.isLoading = false;
          this._MessageService.add({
            severity: 'error',
            summary: 'SQL Query',
            detail: 'Query Executed Failed',
          });
        },
      });
  }
}
