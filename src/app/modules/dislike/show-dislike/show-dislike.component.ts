import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Checkbox } from 'primeng/checkbox';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-show-dislike',
  templateUrl: './show-dislike.component.html',
  styleUrls: ['./show-dislike.component.scss'],
})
export class ShowDislikeComponent implements OnInit {

  userId:number = 0;
  role:string = ''
  constructor(
    private _Router: Router,
    private _DislikeService: DislikeService,
    private _LocalService:LocalService
  ) {
    this.userId = this._LocalService.getJsonValue("userInfo_oldLowCalories").id
    this.role = this._LocalService.getJsonValue("userInfo_oldLowCalories").role
  }

  branches: any[] = [];
  meals: any[] = [];
  dislikes: any[] = [];
  PaginationInfo: any;

  ngOnInit(): void {
    this.getDislikes();
    this.getAgentBranches();
    this.getMeals();
    this.getAllTargets();
  }

  getDislikes(page: number = 1) {
    if (this.filterStatus) {
      this.filter();
    } else {
      this._DislikeService.getDislikes(page)
      .subscribe({
        next: (res) => {
          res.data.data.map((e:any) => {
            e.mobile = e.mobile.filter((item:any) => item !== null)
          });
          this.dislikes = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(dislike: any) {
    if (dislike) {
      this._DislikeService.dislikeDetails.next(dislike);
      this._Router.navigate(['dislike/details']);
    }
  }

  paginate(e: any) {
    this.getDislikes(e.first / e.rows + 1);
  }
  
  updateRow(dislike: any) {
    if (dislike) {
      this._DislikeService.dislikeDetails.next(dislike);
      this._Router.navigate(['dislike/update']);
    }
  }

  // *******************************
  // FILTERS
  // *******************************

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  getMeals() {
    this._DislikeService.getMeals().subscribe({
      next: (res) => (this.meals = res.data),
    });
  }
  // ===========================

  filterModal: boolean = false;
  appliedFilters: any = null;
  filterStatus: boolean = false;

  filter_selectedEmail: any = null;
  filter_selectedName: any = null;
  filter_selectedBranch: any = null;
  filter_selectedSentBy: any = null;
  filter_selectedDates: any = null;
  filter_selectedReason: any = null;
  filter_selectedMeal: any = null;
  filter_selectedMobile: any = null;
  filter_selectedCid:any = null

  filter() {
    let FILTER: any = {
      date:
        this.filter_selectedDates && this.filter_selectedDates[1] == null
          ? new Date(this.filter_selectedDates[0]).toLocaleDateString()
          : null,
      from:
        this.filter_selectedDates && this.filter_selectedDates[1] != null
          ? new Date(this.filter_selectedDates[0]).toLocaleDateString()
          : null,
      to:
        this.filter_selectedDates && this.filter_selectedDates[1] != null
          ? new Date(this.filter_selectedDates[1]).toLocaleDateString()
          : null,
      name: this.filter_selectedName || null,
      branch: this.filter_selectedBranch || null,
      email: this.filter_selectedEmail || null,
      sent_by: this.filter_selectedSentBy || null,
      reason: this.filter_selectedReason || null,
      dislike_meal: this.filter_selectedMeal || null,
      mobile: this.filter_selectedMobile || null,
      cid: this.filter_selectedCid || null,
    };
    Object.keys(FILTER).forEach((k) => FILTER[k] == null && delete FILTER[k]);
    this.filterStatus = true;
    this._DislikeService.filterDislikes(FILTER).subscribe((res) => {
      this.dislikes = res.data;
      this.PaginationInfo = [];
    });
  }

  resetFilter() {
    this.filterModal = false;
    this.filterStatus = false;
    this.filter_selectedEmail = null;
    this.filter_selectedName = null;
    this.filter_selectedBranch = null;
    this.filter_selectedSentBy = null;
    this.filter_selectedDates = null;
    this.filter_selectedReason = null;
    this.filter_selectedMeal = null;
    this.filter_selectedMobile = null;
    this.filter_selectedCid = null;
    this.getDislikes();
  }

  resetFields(){
    this.filter_selectedEmail = null;
    this.filter_selectedName = null;
    this.filter_selectedBranch = null;
    this.filter_selectedSentBy = null;
    this.filter_selectedDates = null;
    this.filter_selectedReason = null;
    this.filter_selectedMeal = null;
    this.filter_selectedMobile = null;
    this.filter_selectedCid = null;
  }

  export(){
    this._DislikeService.exportDislike().subscribe({
      next:res=>{
        const link = document.createElement('a');
        link.href = res.data;
        link.target = "_blank"
        link.click();
      }
    })
  }

    // ****************************************************filter columns************************************************************************
    filterColumns: boolean = false;
    selectedColumns: any[] = [];
    specificRows: number[] = [];
    columns: any[] = [
      { name: 'id', status: false },
      { name: 'name', status: true },
      { name: 'cid', status: true },
      { name: 'email', status: true },
      { name: 'mobile', status: true },
      { name: 'branch', status: true },
      { name: 'agent_id', status: false },
      { name: 'sent_by', status: false },
      { name: 'dislike_meals', status: false },
      { name: 'reasons', status: false },
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

    // **************************************************** exportAsPDF ************************************************************************

    allDislikes: any[] = [];
    getAllTargets() {
      this._DislikeService.getAllDislikes().subscribe((res) => {
        this.allDislikes = res.data;
      });
    }

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
        'date',
        'name',
        'email',
        'mobile',
        'sent_by',
        'branch',
        'reasons',
        'dislike_meals',
      ];
      let filteredArray = this.allDislikes.filter((item:any) => this.specificRows.includes(item.id));
      filteredArray.length == 0 && (filteredArray = this.allDislikes)
      const convertedData = filteredArray.map((obj: any) => [
        new Date(obj.created_at).toLocaleDateString("en-CA"),
        obj.name,
        obj.email,
        obj.mobile,
        obj.sent_by,
        obj.branch,
        obj.reasons,
        obj.dislike_meals,
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
}
