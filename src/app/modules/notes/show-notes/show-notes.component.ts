import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';
import { GuardService } from 'src/app/services/guard.service';
import { LocalService } from 'src/app/services/local.service';
import { NotesService } from 'src/app/services/notes.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-notes',
  templateUrl: './show-notes.component.html',
  styleUrls: ['./show-notes.component.scss'],
  providers: [ConfirmationService],
})
export class ShowNotesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  selectedDate: any;
  selectedAgent: any;
  selectedInquiry: any;
  selectedTeam: any;
  selectedMobile: any;
  analyticOptions: any;
  PaginationInfo: any;
  currentPage: number = 1;

  agents: any[] = [];
  agents_clone: any[] = [];
  notes: any[] = [];
  isLoading: boolean = false;
  createModal: boolean = false;
  updateModal: boolean = false;

  currentNote: any;
  currentMobile: any;
  currentInquiry: any;
  currentRow: any;

  constructor(
    private _AnalysisService: AnalysisService,
    private _SurveyService: SurveyService,
    private confirmationService: ConfirmationService,
    private _NotesService: NotesService,
    private _GuardService: GuardService,
    private _LocalService: LocalService,
    private _MessageService: MessageService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    const filterTab = this._LocalService.getJsonValue('notes_filter');
    if (filterTab) {
      this._NotesService.notes_filter.next(filterTab);
    }
    this._NotesService.notes_filter
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.selectedMobile = res.mobile;
          this.filter();
        } else {
          this.getNotes();
        }
      });

    this.getInquiry();
    this.getFormAnalytics();
    this.getAgents();
    this.getPermission();
  }
  createPermission: boolean = false;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  isSuperAdmin: boolean = false;

  getPermission() {
    this.createPermission =
      this._GuardService.getPermissionStatus('create_notes');
    this.updatePermission =
      this._GuardService.getPermissionStatus('update_notes');
    this.deletePermission =
      this._GuardService.getPermissionStatus('delete_notes');
    this.isSuperAdmin = this._GuardService.isSuperAdmin();
  }

  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = this.agents_clone = res.data;
      },
    });
  }

  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getNotes(e.first / e.rows + 1);
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
    this._NotesService.deleteStickyNote(id).subscribe((res) => {
      this.getNotes();
    });
  }

  inquiry: any[] = [];
  getInquiry(page: number = 1) {
    this._NotesService.getInquiryNotes(page).subscribe({
      next: (res) => {
        this.inquiry = res?.data;
      },
    });
  }
  getNotes(page: number = 1) {
    this.isLoading = true;
    this._NotesService.getStickyNotes(page).subscribe({
      next: (res) => {
        this.notes = res?.data?.data;
        this.PaginationInfo = res.data;
        this.isLoading = false;
      },
    });
  }

  handleAgent(value: string) {
    this.agents = this.agents_clone;
    this.agents = this.agents.filter((agent) => agent?.team === value);
  }

  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data;
    });
  }

  filter() {
    this.isLoading = true;
    const data = {
      from: this.selectedDate?.[0]
        ? this.selectedDate?.[0].toLocaleDateString('en-CA')
        : null,
      to: this.selectedDate?.[1]
        ? this.selectedDate?.[1].toLocaleDateString('en-CA')
        : null,
      agent_id: this.selectedAgent || null,
      mobile: this.selectedMobile || null,
      inquiry: this.selectedInquiry || null,
    };
    this._NotesService.filterNotes(1, data).subscribe((res) => {
      this.notes = res.data.data;
      this.PaginationInfo = res.data;
      this.isLoading = false;
    });
  }

  reset() {
    this.selectedDate = null;
    this.selectedAgent = null;
    this.selectedInquiry = null;
    this.selectedTeam = null;
    this.selectedMobile = null;
    this.getNotes();
    this._NotesService.notes_filter.next(null);
  }

  updateRow() {
    this.isLoading = true;
    const data = {
      mobile: this.currentMobile,
      note: this.currentNote,
      sticky_id: this.currentRow.id,
      inquiry: this.currentInquiry,
    };
    this._NotesService.updateStickyNote(data).subscribe((res) => {
      this.getNotes();
      this.isLoading = false;
      this.updateModal = false;
      this.currentNote = '';
      this.currentMobile = '';
      this.currentRow = null;
    });
  }

  createRow() {
    this.isLoading = true;
    const data = {
      mobile: this.currentMobile,
      note: this.currentNote,
      inquiry: this.currentInquiry,
    };
    this._NotesService.addStickyNote(data).subscribe((res) => {
      this.getNotes();
      this.isLoading = false;
      this.createModal = false;
      this.currentNote = '';
      this.currentMobile = '';
      this.currentRow = null;
    });
  }

  showUpdate(row: any) {
    if (this.updatePermission) {
      this.updateModal = true;
      this.currentNote = row.note;
      this.currentMobile = row.mobile;
      this.currentInquiry = row.inquiry;
      this.currentRow = row;
    }
  }

  showCreate() {
    if (this.createPermission) {
      this.createModal = true;
    }
  }

  isExporting:boolean = false;
  export() {
    this.isExporting = true;
    this._NotesService.exportStickyNote().subscribe({
      next: (res) => {
        this.isExporting = false;
        this._MessageService.add({
          severity: 'success',
          summary: 'Export Excel',
          detail: 'Note Exported Successfully',
        });

        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      },
      error: (err) => {
        this.isExporting = false;
        this._MessageService.add({
          severity: 'error',
          summary: 'Export Excel',
          detail: 'Failed to Export Notes',
        });
      },
    });
  }

  // ========================================================sort========================================================
  sort(event: any) {
    const sortField = event.sortField;
    const sortOrder = event.sortOrder === 1 ? 1 : -1;
    this.notes?.sort((a: any, b: any) => {
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
