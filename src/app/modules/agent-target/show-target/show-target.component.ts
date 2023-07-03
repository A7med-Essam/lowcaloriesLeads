import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AgentTargetService,
  ITarget,
} from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'app-show-target',
  templateUrl: './show-target.component.html',
  styleUrls: ['./show-target.component.scss'],
})
export class ShowTargetComponent implements OnInit {
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _AgentTargetService: AgentTargetService,
    private _DislikeService: DislikeService
  ) {}

  exportAsPDF() {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    doc.internal.pageSize.width = 420;
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);

    doc.setTextColor(50);
    doc.setFontSize(14);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customer Service Target', 10, 45);
    doc.text('Prepared By: Low Calories Technical Team', 10, 55);
    doc.text('Requested By: Mohamed Fawzy', 10, 65);
    doc.text('Low Calories Restaurant - Egypt', 320, 25);
    doc.text('3rd Settelment, New Cairo', 320, 35);
    doc.text('Phone: 201116202225', 320, 45);
    doc.text('Email: info@thelowcalories.com', 320, 55);
    doc.text('Website: thelowcalories.com', 320, 65);

    const headers = [
      'Date',
      'Agent',
      'Team',
      'Branch',
      'customer_CID',
      'customer_number',
      'customer_Type',
      'Invoice_number',
      'Status',
      'Paid_by',
      'Type',
    ];
    let filteredArray = this.allTargets.filter((item: any) =>
      this.specificRows.includes(item.id)
    );
    filteredArray.length == 0 &&
      this.appliedFilters == null &&
      (filteredArray = this.allTargets);
    filteredArray.length == 0 &&
      this.appliedFilters != null &&
      (filteredArray = this.targets);
    const convertedData = filteredArray.map((obj: any) => [
      obj.date,
      obj.agent.name,
      obj.team,
      obj.branch,
      obj.client_cid,
      obj.client_number,
      obj.customer_type,
      obj.invoice_number,
      obj.status.toUpperCase(),
      obj.paid_by,
      obj.type,
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
      doc.internal.pageSize.width = 420;
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

  targets: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this.getTargets();
    this.createFilterForm();
    this.getAgents();
    this.getAgentBranches();
    this.getTargetOptions();
    this.getAllTargets();
  }

  allTargets: any[] = [];
  getAllTargets() {
    this._AgentTargetService.getAllTargets().subscribe((res) => {
      this.allTargets = res.data;
    });
  }

  getTargets(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._AgentTargetService.getTargets(page).subscribe({
        next: (res) => {
          this.targets = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(target: ITarget) {
    if (target) {
      this._AgentTargetService.target.next(target);
      this._Router.navigate(['target/details']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getTargets(e.first / e.rows + 1);
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;

  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      team: new FormControl(null),
      client_number: new FormControl(null),
      client_cid: new FormControl(null),
      branch: new FormControl(null),
      paid_by: new FormControl(null),
      status: new FormControl(null),
      date: new FormControl(null),
      customer_types: new FormControl(null),
      agent_id: new FormControl(null),
      invoice_number: new FormControl(null),
      type: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    if (form.value.branch) {
      form.patchValue({
        branch: form.value.branch.name,
      });
    }

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
    this.appliedFilters = form.value;
    this._AgentTargetService.filterTargets(1, form.value).subscribe((res) => {
      this.targets = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      this.filterForm.patchValue({
        date: null,
        from: null,
        to: null,
      });
      // this.resetFields();
    });
  }

  getOldFilters(page: number) {
    this._AgentTargetService
      .filterTargets(page, this.appliedFilters)
      .subscribe((res) => {
        this.targets = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getTargets();
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ****************************************************export************************************************************************

  export() {
    this._AgentTargetService.exportTarget().subscribe({
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

  customer_types: any[] = [];
  types: any[] = [];
  paid_by: any[] = [];
  status: any[] = [];
  teams: any[] = [];
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

  // ****************************************************filter columns************************************************************************
  filterColumns: boolean = false;
  selectedColumns: any[] = [];
  specificRows: number[] = [];
  columns: any[] = [
    { name: 'id', status: false },
    { name: 'team', status: false },
    { name: 'type', status: false },
    { name: 'agent_id', status: false },
    { name: 'agent_name', status: false },
    { name: 'date', status: true },
    { name: 'client_number', status: true },
    { name: 'client_cid', status: false },
    { name: 'branch', status: true },
    { name: 'customer_type', status: false },
    { name: 'paid_by', status: true },
    { name: 'status', status: false },
    { name: 'invoice_number', status: false },
    { name: 'created_at', status: false },
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
  print(target: any) {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customer Service Target', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - Egypt', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 201116202225', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

    autoTable(doc, { startY: 55 });

    var columns = [
      { title: 'Date', dataKey: target.date },
      { title: 'agent_name', dataKey: target.agent.name },
      { title: 'Team', dataKey: target.team },
      { title: 'Branch', dataKey: target.branch },
      { title: 'customer_cid', dataKey: target.client_cid },
      { title: 'customer_number', dataKey: target.client_number },
      { title: 'customer_type', dataKey: target.customer_type },
      { title: 'invoice_number', dataKey: target.invoice_number },
      { title: 'paid_by', dataKey: target.paid_by },
      { title: 'type', dataKey: target.type },
      { title: 'status', dataKey: target.status.toUpperCase() },
    ];

    // doc.text(140, 40, "Report");
    autoTable(doc, { body: columns });

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

    doc.save('target.pdf');
  }

    // ****************************************************upload Modal************************************************************************
    uploadModal: boolean = false;

    getSample() {
      this._AgentTargetService.getSample().subscribe((res) => {
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
        this._AgentTargetService.uploadFile(f).subscribe({
          next: (res) => {
            this.uploadModal = false;
            this.getTargets();
            this.getAllTargets();
          },
        });
        this.uploadModal = false;
      }
    }
}
