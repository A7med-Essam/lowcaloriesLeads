import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AgentTargetService,
  ITarget,
} from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RefundService } from 'src/app/services/refund.service';
import { Checkbox } from 'primeng/checkbox';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-show-refund',
  templateUrl: './show-refund.component.html',
  styleUrls: ['./show-refund.component.scss']
})
export class ShowRefundComponent implements OnInit {
  role:string = ''
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _RefundService: RefundService,
    private _DislikeService: DislikeService,
    private _LocalService:LocalService
  ) {
    this.role = this._LocalService.getJsonValue("userInfo_oldLowCalories").role
  }

  exportAsPDF() {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    doc.internal.pageSize.width = 600;
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

    doc.setTextColor(50);
    doc.setFontSize(14);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Refund Requests Report', 10, 45);
    doc.text('Prepared By: Low Calories Technical Team', 10, 55);
    doc.text('Requested By: Mohamed Fawzy', 10, 65);
    doc.text('Low Calories Restaurant - Egypt', 500, 25);
    doc.text('3rd Settelment, New Cairo', 500, 35);
    doc.text('Phone: 201116202225', 500, 45);
    doc.text('Email: info@thelowcalories.com', 500, 55);
    doc.text('Website: thelowcalories.com', 500, 65);

    const headers = [
      'Date',
      'name',
      'email',
      'mobile',
      'branch',
      'delivery_branch',
      'subscription_plan',
      'remaining_days',
      'payment_method',
      'cid',
      'address',
      'bank_name',
      'iban',
      'account_hold_name',
      'bank_account_number',
      // 'original_amount_paid',
      // 'amount_usd',
      // 'total_amount_refund',
      'agent_name',
      'amount_paid',
      'reason',
    ];
    let filteredArray = this.allRefunds.filter((item:any) => this.specificRows.includes(item.id));
    (filteredArray.length == 0 && this.appliedFilters==null) && (filteredArray = this.allRefunds);
    (filteredArray.length == 0 && this.appliedFilters!=null) && (filteredArray = this.refunds);
    const convertedData = filteredArray.map((obj: any) => [
      obj.created_at.substring(0, 10),
      obj.name,
      obj.email,
      obj.mobile,
      obj.branch,
      obj.delivery_branch,
      obj.subscription_plan,
      obj.remaining_days,
      obj.payment_method,
      obj.cid,
      obj.address,
      obj.bank_name,
      obj.iban,
      obj.account_hold_name,
      obj.bank_account_number,
      obj.agent_name,
      obj.amount_paid,
      obj.reason,
    ]);
    autoTable(doc, { startY: 70 });
    autoTable(doc, {
      head: [headers],
      body: convertedData,
    });

    // Set the line color and width
    doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
    doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

    // Draw a line at the bottom of the page

    // Get the total number of pages
    const totalPages = doc.internal.pages;

    // Iterate over each page and add the footer
    for (let i = 1; i <= totalPages.length; i++) {
      doc.internal.pageSize.width = 600;
      doc.line(
        20,
        doc.internal.pageSize.height - 20,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 20
      );
      // Set the current page as active
      doc.setPage(i);
      // Set the position and alignment of the footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        'Thelowcalories.com',
        20,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save('example.pdf');
  }

  refunds: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this.createUploadingForm()
    this.getRefunds();
    this.createFilterForm();
    this.getAgents();
    this.getAgentBranches();
    this.getAllRefunds();
    this.getReasons();
    this.createReportForm();
  }

  allRefunds: any[] = [];
  getAllRefunds() {
    this._RefundService.getAllRefunds().subscribe((res) => {
      this.allRefunds = res.data;
    });
  }

  getRefunds(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._RefundService.getRefunds(page).subscribe({
        next: (res) => {
          this.refunds = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(refund: any) {
    if (refund) {
      this._RefundService.refund.next(refund);
      this._Router.navigate(['refund/details']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getRefunds(e.first / e.rows + 1);
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;

  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      agent_id: new FormControl(null),
      // name: new FormControl(null),
      // email: new FormControl(null),
      mobile: new FormControl(null),
      branch: new FormControl(null),
      delivery_branch: new FormControl(null),
      // subscription_plan: new FormControl(null),
      // remaining_days: new FormControl(null),
      // payment_method: new FormControl(null),
      cid: new FormControl(null),
      reason: new FormControl(null),
      // address: new FormControl(null),
      // bank_name: new FormControl(null),
      // iban: new FormControl(null),
      // bank_account_number: new FormControl(null),
      // account_hold_name: new FormControl(null),
    });
  }

  reasons:any[]=[]
  getReasons() {
    this._DislikeService.getReasons().subscribe({
      next: (res) => (this.reasons = res.data),
    });
  }

  insertRow(form: FormGroup) {
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }

    this.appliedFilters = form.value;
    this._RefundService.filterRefund(1, form.value).subscribe((res) => {
      this.refunds = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      // this.resetFields();
    });
  }

  getOldFilters(page:number) {
    this._RefundService
      .filterRefund(page, this.appliedFilters)
      .subscribe((res) => {
        this.refunds = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getRefunds();
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ****************************************************export************************************************************************

  export() {
    this._RefundService.RefundExport().subscribe({
      next: (res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      },
    });
  }

  // ****************************************************filter options************************************************************************

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  branches: any[] = [];
  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  // ****************************************************filter columns************************************************************************
  filterColumns: boolean = false;
  selectedColumns: any[] = [];
  specificRows: number[] = [];
  columns: any[] = [
    { name: 'id', status: false },
    { name: 'account_hold_name', status: false },
    { name: 'address', status: false },
    { name: 'agent_id', status: false },
    { name: 'agent_name', status: true },
    { name: 'amount_paid', status: true },
    { name: 'bank_account_number', status: false },
    { name: 'bank_name', status: true },
    { name: 'branch', status: false },
    { name: 'cid', status: true },
    { name: 'created_at', status: false },
    { name: 'delivery_branch', status: false },
    { name: 'email', status: false },
    { name: 'iban', status: false },
    { name: 'mobile', status: true },
    { name: 'name', status: true },
    { name: 'payment_method', status: false },
    { name: 'reason', status: false },
    { name: 'remaining_days', status: false },
    { name: 'subscription_plan', status: false },
  ];
  
  getFilterColumns() {
    this.columns.forEach((element) => {
      element.status = false;
    });

    this.selectedColumns.forEach((e) => {
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].name == e) {
          this.columns[i].status = true;
        }
      }
    });
  }

  selectAllColumns(checkboxContainer: HTMLElement, currentCheckbox: Checkbox) {
    setTimeout(() => {
      if (!currentCheckbox.checked()) {
        this.selectedColumns = [];
      } else {
        let checkboxes: HTMLLabelElement[] = [];
        this.selectedColumns = [];
        for (let i = 0; i < checkboxContainer.children.length; i++) {
          checkboxes.push(checkboxContainer.children[i].children[1] as any);
        }
        this.columns.forEach((e) => {
          this.selectedColumns.push(e.name);
        });
      }
    }, 1);
  }

  getSpecificRows(input: HTMLInputElement) {
    if (input.checked) {
      this.specificRows.push(Number(input.value));
    } else {
      const index = this.specificRows.indexOf(Number(input.value));
      if (index > -1) {
        this.specificRows.splice(index, 1);
      }
    }
  }

  // ****************************************************print row************************************************************************
  print(refund:any){
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
      doc.text('Issue Subject:Refund Requests Report', 10, 40);
      doc.text('Prepared By: Low Calories Technical Team', 10, 45);
      doc.text('Requested By: Mohamed Fawzy', 10, 50);
      doc.text('Low Calories Restaurant - Egypt', 150, 30);
      doc.text('3rd Settelment, New Cairo', 150, 35);
      doc.text('Phone: 201116202225', 150, 40);
      doc.text('Email: info@thelowcalories.com', 150, 45);
      doc.text('Website: thelowcalories.com', 150, 50);
  
      autoTable(doc, { startY: 55 });

      var columns = [
        {title: "Date", dataKey:refund.created_at.substring(0, 10)},
        {title: "Name", dataKey:refund.name}, 
        {title: "Email", dataKey:refund.email},
        {title: "Mobile", dataKey:refund.mobile},
        {title: "Branch", dataKey:refund.branch},
        {title: "delivery_branch", dataKey:refund.delivery_branch},
        {title: "subscription_plan", dataKey:refund.subscription_plan},
        {title: "remaining_days", dataKey:refund.remaining_days},
        {title: "payment_method", dataKey:refund.payment_method},
        {title: "cid", dataKey:refund.cid},
        {title: "address", dataKey:refund.address},
        {title: "bank_name", dataKey:refund.bank_name},          
        {title: "iban", dataKey:refund.iban},          
        {title: "account_hold_name", dataKey:refund.account_hold_name},  
        {title: "bank_account_number", dataKey:refund.bank_account_number},  
        {title: "amount_paid", dataKey:refund.amount_paid},          
        {title: "agent_name", dataKey:refund.agent_name},          
        {title: "reason", dataKey:refund.reason},          
    ];

    // doc.text(140, 40, "Report");
    autoTable(doc,{body:columns,});
  
      // Set the line color and width
      doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
      doc.setLineWidth(0.5); // Line width in mm (adjust as needed)
  
      // Draw a line at the bottom of the page
  
      // Get the total number of pages
      const totalPages = doc.internal.pages;
  
      // Iterate over each page and add the footer
      for (let i = 1; i <= totalPages.length; i++) {
        doc.line(
          20,
          doc.internal.pageSize.height - 20,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 20
        );
        // Set the current page as active
        doc.setPage(i);
        // Set the position and alignment of the footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          'Thelowcalories.com',
          20,
          doc.internal.pageSize.getHeight() - 10
        );
      }
  
      doc.save('refund.pdf');
  }


  // ****************************************************Report************************************************************************

  reportModal:boolean = false;
  reportForm!: FormGroup;

  createReportForm() {
    this.reportForm = new FormGroup({
      refund_request_id: new FormControl(null, [Validators.required]),
      type: new FormControl('image', [Validators.required]),
      file: new FormControl(null, [Validators.required]),
      notes: new FormControl(null),
    });
  }

  uploadingStatus:boolean = false
  insertReport(form:FormGroup){
    if (form.valid) {
      this.uploadingStatus = true
      this._RefundService.uploadAccountingRefundDetails(form.value).subscribe(res=>{
        this.refunds = this.refunds.map((e:any)=> {
          if (e.id == res.data.id) {
            e = res.data
          }
          return e
        })
        this.uploadingStatus = false
        this.getAllRefunds();
        this.getRefunds();
        this.reportModal = false
      })
    }
  }

  displayReportModal(id:number){
    this.reportForm.patchValue({
      refund_request_id: id,
    });
    this.reportModal = true;
  }

  getUploadedFile(event: any) {
    if (event.target.files && event.target.files.length) {
      const files = event.target.files;
      const readFile = (file: any) => {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = (event: any) => resolve(event.target.result);
          fileReader.onerror = (error) => reject(error);
          fileReader.readAsDataURL(file);
        });
      };

      const readFiles = async () => {
        try {
          const base64Strings = await Promise.all(
            Array.from(files).map(readFile)
          );
          this.reportForm.patchValue({
            file: base64Strings[0],
          });

        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }
    // ****************************************************upload Modal************************************************************************
    uploadModal: boolean = false;

    getSample() {
      this._RefundService.getSample().subscribe((res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      });
    }
  
    getFormData(object: any) {
      const formData = new FormData();
      Object.keys(object).forEach((key) => formData.append(key, object[key]));
      return formData;
    }
  
    onFileSelected(event: any) {
      const file: File = event.target.files[0];
      if (file) {
        let f: File = this.getFormData({ file: file }) as any;
        this._RefundService.uploadFile(f).subscribe({
          next: (res) => {
            this.uploadModal = false;
            this.getRefunds();
            this.getAllRefunds();
          },
        });
        this.uploadModal = false;
      }
    }

       // ****************************************************upload File Modal************************************************************************
       uploadFilesModal:boolean = false;
       uploadForm!: FormGroup;
       
       displayUploadFilesModal(id:number){
         this.uploadForm.patchValue({
           refund_id: id,
         });
         this.uploadFilesModal = true;
       }
       
       getUploadedFile2(event: any) {
         if (event.target.files && event.target.files.length) {
           const files = event.target.files;
           const readFile = (file: any) => {
             return new Promise((resolve, reject) => {
               const fileReader = new FileReader();
               fileReader.onload = (event: any) => resolve(event.target.result);
               fileReader.onerror = (error) => reject(error);
               fileReader.readAsDataURL(file);
             });
           };
     
           const readFiles = async () => {
             try {
               const base64Strings = await Promise.all(
                 Array.from(files).map(readFile)
               );
               const fileTypes = base64Strings.map((base64String: any) => {
                const type = base64String.split(',')[0].split(':')[1].split(';')[0];
                return { [type]: base64String };
              });
               this.uploadForm.patchValue({
                 files: fileTypes,
               });
     
             } catch (error) {
               console.error(error);
             }
           };
     
           readFiles();
         }
       }
   
       createUploadingForm() {
         this.uploadForm = new FormGroup({
           refund_id: new FormControl(null, [Validators.required]),
           files: new FormControl(null, [Validators.required]),
         });
       }
   
       insertRefundFiles(form:FormGroup){
         if (form.valid) {
           this.uploadingStatus = true
           this._RefundService.uploadRefundFiles(form.value).subscribe(res=>{
             this.uploadingStatus = false
             this.uploadFilesModal = false
           })
         }
       }
}
