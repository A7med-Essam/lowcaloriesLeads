import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { AnalysisService } from 'src/app/services/analysis.service';
import { GuardService } from 'src/app/services/guard.service';
import { NotesService } from 'src/app/services/notes.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-inquiry-note',
  templateUrl: './inquiry-note.component.html',
  styleUrls: ['./inquiry-note.component.scss'],
  providers: [ConfirmationService],
})
export class InquiryNoteComponent implements OnInit {
  selectedDate: any;
  selectedAgent: any;
  selectedTeam: any;
  selectedMobile: any;
  analyticOptions: any;
  PaginationInfo: any;
  currentPage: number = 1;

  agents: any[] = [];
  agents_clone: any[] = [];
  inquiry: any[] = [];
  isLoading: boolean = false;
  createModal: boolean = false;
  updateModal: boolean = false;

  currentInquiryNote: any;
  currentRow: any;

  constructor(
    private confirmationService: ConfirmationService,
    private _NotesService: NotesService,
    private _GuardService: GuardService
  ) {}

  ngOnInit(): void {
    this.getInquiryNotes();
    this.getPermission();
  }
  createPermission: boolean = false;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  isSuperAdmin: boolean = false;

  getPermission() {
    this.createPermission = this._GuardService.getPermissionStatus(
      'createInquiry_notes'
    );
    this.updatePermission = this._GuardService.getPermissionStatus(
      'updateInquiry_notes'
    );
    this.deletePermission = this._GuardService.getPermissionStatus(
      'deleteInquiry_notes'
    );
    this.isSuperAdmin = this._GuardService.isSuperAdmin();
  }

  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getInquiryNotes(e.first / e.rows + 1);
  }

  confirm(id: any) {
    if (this.deletePermission) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to perform this action?',
        accept: () => {
          this.deleteRow(id);
        },
      });
    }
  }

  deleteRow(id: number) {
    this._NotesService.deleteInquiryNote(id).subscribe((res) => {
      this.getInquiryNotes();
    });
  }

  getInquiryNotes(page: number = 1) {
    this.isLoading = true;
    this._NotesService.getInquiryNotes(page).subscribe({
      next: (res) => {
        this.inquiry = res?.data;
        // this.inquiry = res?.data?.data;
        this.PaginationInfo = res.data;
        this.isLoading = false;
      },
    });
  }

  updateRow() {
    this.isLoading = true;
    const data = {
      name: this.currentInquiryNote,
      inquiry_id: this.currentRow.id,
    };
    this._NotesService.updateInquiryNote(data).subscribe((res) => {
      this.getInquiryNotes();
      this.isLoading = false;
      this.updateModal = false;
      this.currentInquiryNote = '';
      this.currentRow = null;
    });
  }

  createRow() {
    this.isLoading = true;
    const data = {
      name: this.currentInquiryNote,
    };
    this._NotesService.addInquiryNote(data).subscribe((res) => {
      this.getInquiryNotes();
      this.isLoading = false;
      this.createModal = false;
      this.currentInquiryNote = '';
      this.currentRow = null;
    });
  }

  showUpdate(row: any) {
    if (this.updatePermission) {
      this.updateModal = true;
      this.currentInquiryNote = row.name;
      this.currentRow = row;
    }
  }

  showCreate() {
    if (this.createPermission) {
      this.createModal = true;
    }
  }
  // ========================================================sort========================================================
  sort(event: any) {
    const sortField = event.sortField;
    const sortOrder = event.sortOrder === 1 ? 1 : -1;
    this.inquiry?.sort((a: any, b: any) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (
        typeof aValue === 'string' &&
        Date.parse(aValue) &&
        typeof bValue === 'string' &&
        Date.parse(bValue)
      ) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return (aDate.getTime() - bDate.getTime()) * sortOrder;
      } else if (
        !isNaN(parseFloat(aValue)) &&
        typeof parseFloat(aValue) === 'number' &&
        !isNaN(parseFloat(bValue)) &&
        typeof parseFloat(bValue) === 'number'
      ) {
        return (aValue - bValue) * sortOrder;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * sortOrder;
      } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
        return (aValue.length - bValue.length) * sortOrder;
      } else {
        return 0;
      }
    });
  }
}
