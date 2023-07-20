import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Checkbox } from 'primeng/checkbox';
import { DislikeService } from 'src/app/services/dislike.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GuardService } from 'src/app/services/guard.service';
import { MessageService } from 'primeng/api';
import { TableCheckbox } from 'primeng/table';

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
    private _GuardService:GuardService,
    private _MessageService:MessageService
  ) {
    this.userId = _GuardService.getUser().id
    this.role = _GuardService.getUser().role_name
  }

  printPermission: boolean = false;
  exportPermission: boolean = false;
  createPermission: boolean = false;
  downloadSamplePermission: boolean = false;
  uploadFilesPermission: boolean = false;
  updatePermission: boolean = false;

  getPermission() {
    this.printPermission = this._GuardService.getPermissionStatus('print_dislike');
    this.exportPermission = this._GuardService.getPermissionStatus('export_dislike');
    this.createPermission = this._GuardService.getPermissionStatus('create_dislike');
    this.updatePermission = this._GuardService.getPermissionStatus('update_dislike');
    this.downloadSamplePermission = this._GuardService.getPermissionStatus('downloadSample_dislike');
    this.uploadFilesPermission = this._GuardService.getPermissionStatus('uploadFiles_dislike');
  }

  displayUploadModal(){
    if (this.downloadSamplePermission) {
      this.uploadModal = true
    }
  }

  branches: any[] = [];
  meals: any[] = [];
  dislikes: any[] = [];
  PaginationInfo: any;

  ngOnInit(): void {
    this.getPermission();
    this.createUploadingForm();
    this.getDislikes();
    this.getAgentBranches();
    this.getMeals();
    this.getAllDislikes();
    this.getReasons();
  }
  reasons: any[] = [];


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
  getReasons() {
    this._DislikeService.getReasons().subscribe((res) => {
      this.reasons = res.data;
    });
  }
  
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
    // ****************************************************export************************************************************************

  export() {
    if (this.exportPermission) {
      let exportObservable;
      if (this.specificRows.length > 0) {
        exportObservable = this._DislikeService.exportByIds(this.specificRows);
      } else if (this.appliedFilters) {
        const ids = this.dislikes.map((obj: any) => obj.id);
        exportObservable = this._DislikeService.exportByIds(ids);
      } else {
        exportObservable = this._DislikeService.exportAll();
      }
      exportObservable.subscribe({
        next: (res) => {
          this.handleExportSuccess(res.data);
        },
      });
    }
  }
  
  private handleExportSuccess(data: any) {
    this._MessageService.add({
      severity: 'success',
      summary: 'Export Excel',
      detail: 'Dislike Exported Successfully',
    });
  
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = data;
    link.click();
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
      { name: 'created_by', status: false },
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
  
    getSpecificRows(input: TableCheckbox) {
      if (input.checked) {
        this.specificRows.push(Number(input.value.id));
      } else {
        const index = this.specificRows.indexOf(Number(input.value.id));
        if (index > -1) {
          this.specificRows.splice(index, 1);
        }
      }
    }
  
    selectAllRows(input: any): void {
      if (input.checked) {
        this.specificRows = this.dislikes.map((obj: any) => obj.id);
      } else {
        this.specificRows = []
      }
    }

    // **************************************************** exportAsPDF ************************************************************************

    allDislikes: any[] = [];
    getAllDislikes() {
      this._DislikeService.getAllDislikes().subscribe((res) => {
        this.allDislikes = res.data;
      });
    }

    exportAsPDF() {
      if (this.printPermission) {
      // Default export is a4 paper, portrait, using millimeters for units
      const doc = new jsPDF();
      doc.internal.pageSize.width = 420;
      const imageFile = '../../../../assets/images/logo.png';
      doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
  
      doc.setTextColor(50);
      doc.setFontSize(14);
      doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
      doc.text('Issue Subject:Customers Dislike Report', 10, 45);
      doc.text('Prepared By: Low Calories Technical Team', 10, 55);
      doc.text('Requested By: Mohamed Fawzy', 10, 65);
      doc.text('Low Calories Restaurant - Egypt', 320, 25);
      doc.text('3rd Settelment, New Cairo', 320, 35);
      doc.text('Phone: 201116202225', 320, 45);
      doc.text('Email: info@thelowcalories.com', 320, 55);
      doc.text('Website: thelowcalories.com', 320, 65);
  
      const headers = [
        'date',
        'cid',
        'name',
        'email',
        'mobile',
        'sent_by',
        'branch',
        'reasons',
        'dislike_meals',
        'created_by',
      ];
      let filteredArray = this.allDislikes.filter((item:any) => this.specificRows.includes(item.id));
      (filteredArray.length == 0 && this.appliedFilters==null) && (filteredArray = this.allDislikes);
      (filteredArray.length == 0 && this.appliedFilters!=null) && (filteredArray = this.dislikes);
      const convertedData = filteredArray.map((obj: any) => [
        new Date(obj.created_at).toLocaleDateString("en-CA"),
        obj.cid,
        obj.name,
        obj.email,
        obj.mobile,
        obj.sent_by,
        obj.branch,
        obj.reasons,
        obj.dislike_meals,
        obj.agent.name,
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
  
      doc.save('All_Dislikes.pdf');
      }
    }

     // ****************************************************print row************************************************************************
  print(dislike:any){
    if (this.printPermission) {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Customers Dislike Report', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - Egypt', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 201116202225', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

  

    autoTable(doc, { startY: 55 });

    var columns = [
      {title: "Date", dataKey:dislike.created_at.substring(0, 10)}, 
      {title: "Name", dataKey:dislike.name}, 
      {title: "Email", dataKey:dislike.email},
      {title: "Mobile", dataKey:dislike.mobile},
      {title: "Branch", dataKey:dislike.branch},
      {title: "sent_by", dataKey:dislike.sent_by},
      {title: "reasons", dataKey:dislike.reasons},
      {title: "cid", dataKey:dislike.cid},
      {title: "dislike_meals", dataKey:dislike.dislike_meals},
      {title: "created_by", dataKey:dislike.agent.name},
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

    doc.save('dislike.pdf');
  }
}
    // ****************************************************upload Modal************************************************************************
    uploadModal: boolean = false;

    getSample() {
    if (this.downloadSamplePermission) {
      this._DislikeService.getSample().subscribe((res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      });
      }
    }
  
    getFormData(object: any) {
      const formData = new FormData();
      Object.keys(object).forEach((key) => formData.append(key, object[key]));
      return formData;
    }
  
    onFileSelected(event: any) {
      if (this.downloadSamplePermission) {
        const file: File = event.target.files[0];
        if (file) {
          let f: File = this.getFormData({ file: file }) as any;
          this._DislikeService.uploadFile(f).subscribe({
            next: (res) => {
              this.uploadModal = false;
              this.getDislikes();
              this.getAllDislikes();
            },
          });
          this.uploadModal = false;
        }
      }
    }

      // ****************************************************upload File Modal************************************************************************
      uploadFilesModal:boolean = false;
      uploadingStatus:boolean = false;
      uploadForm!: FormGroup;
      
      displayUploadFilesModal(id:number){
        if (this.uploadFilesPermission) {
          this.uploadForm.patchValue({
            dislike_request_id: id,
          });
          this.uploadFilesModal = true;
        }
      }
      
      getUploadedFile(event: any) {
        if (event.target.files && event.target.files.length && this.uploadFilesPermission) {
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
          dislike_request_id: new FormControl(null, [Validators.required]),
          files: new FormControl(null, [Validators.required]),
        });
      }
  
      uploadFiles(form:FormGroup){
        if (form.valid && this.uploadFilesPermission) {
          this.uploadingStatus = true
          this._DislikeService.uploadDislikeRequestFiles(form.value).subscribe(res=>{
            this.uploadingStatus = false
            this.uploadFilesModal = false
          })
        }
      }
      // ========================================================sort========================================================
      sort(event: any) {
        const sortField = event.sortField;
        const sortOrder = event.sortOrder === 1 ? 1 : -1;
        this.dislikes?.sort((a: any, b: any) => {
          const aValue = a[sortField];
          const bValue = b[sortField];
          if (typeof aValue === 'string' && Date.parse(aValue) && typeof bValue === 'string' && Date.parse(bValue)) {
            const aDate = new Date(aValue);
            const bDate = new Date(bValue);
            return (aDate.getTime() - bDate.getTime()) * sortOrder; 
          }
          else if (!isNaN(parseFloat(aValue)) && typeof parseFloat(aValue) === 'number' && !isNaN(parseFloat(bValue)) && typeof parseFloat(bValue) === 'number') {
            return (aValue - bValue) * sortOrder;
          } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue) * sortOrder;
          }
          else if (Array.isArray(aValue) && Array.isArray(bValue)) {
            return (aValue.length - bValue.length) * sortOrder;
          } 
          else {
            return 0;
          }
        });
      }
}
