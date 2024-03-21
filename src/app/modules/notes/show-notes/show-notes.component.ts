import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { AnalysisService } from 'src/app/services/analysis.service';
import { GuardService } from 'src/app/services/guard.service';
import { NotesService } from 'src/app/services/notes.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-notes',
  templateUrl: './show-notes.component.html',
  styleUrls: ['./show-notes.component.scss'],
  providers: [ConfirmationService],
})
export class ShowNotesComponent implements OnInit {
  selectedDate: any;
  selectedAgent: any;
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
  currentRow: any;

  constructor(
    private _AnalysisService: AnalysisService,
    private _SurveyService: SurveyService,
    private confirmationService: ConfirmationService,
    private _NotesService: NotesService,
    private _GuardService: GuardService
  ) {}

  ngOnInit(): void {
    this.getNotes();
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
      from: this.selectedDate?.[0] ? this.selectedDate?.[0] : null,
      to: this.selectedDate?.[1] ? this.selectedDate?.[1] : null,
      agent_id: this.selectedAgent || null,
      mobile: this.selectedMobile || null,
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
    this.selectedTeam = null;
    this.selectedMobile = null;
    this.getNotes();
  }

  updateRow() {
    this.isLoading = true;
    const data = {
      mobile: this.currentMobile,
      note: this.currentNote,
      sticky_id: this.currentRow.id,
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
