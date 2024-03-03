import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Checkbox } from 'primeng/checkbox';
import { GuardService } from 'src/app/services/guard.service';
import { TableCheckbox } from 'primeng/table';
import { Subject } from 'rxjs';
import { GiftcodeService } from 'src/app/services/giftcode.service';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-show-giftcode',
  templateUrl: './show-giftcode.component.html',
  styleUrls: ['./show-giftcode.component.scss'],
})
export class ShowGiftcodeComponent implements OnInit, OnDestroy {
  giftCodes: any[] = [];
  PaginationInfo: any;
  private unsubscribe$ = new Subject<void>();
  createPermission: boolean = false;
  updatePermission: boolean = false;
  flag: string[] = ['Branches', 'Head Office'];
  status: string[] = ['active', 'notActive'];

  constructor(
    private _Router: Router,
    private _GuardService: GuardService,
    private _GiftcodeService: GiftcodeService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getPermission() {
    this.createPermission =
      this._GuardService.getPermissionStatus('create_giftcode');
    this.updatePermission =
      this._GuardService.getPermissionStatus('update_giftcode');
  }

  ngOnInit(): void {
    this._GiftcodeService.giftcode_filter
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.appliedFilters = res;
        }
      });
    this.createFilterForm();
    this.getPermission();
    this.getGiftCodes();
  }

  getGiftCodes(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._GiftcodeService.getGiftCodes(page).subscribe({
        next: (res) => {
          this.giftCodes = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(code: any) {
    if (code) {
      this._GiftcodeService.giftcode.next(code);
      this._Router.navigate(['giftcode/details']);
    }
  }

  displayUpdate(code: any) {
    if (code) {
      this._GiftcodeService.giftcode.next(code);
      this._Router.navigate(['giftcode/update']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getGiftCodes(e.first / e.rows + 1);
  }

  // ****************************************************filter columns************************************************************************
  filterColumns: boolean = false;
  selectedColumns: any[] = [];
  specificRows: number[] = [];
  columns: any[] = [
    { name: 'id', status: false },
    { name: 'code', status: true },
    { name: 'type', status: true },
    { name: 'flag', status: true },
    { name: 'status', status: true },
    { name: 'percentage', status: true },
    { name: 'value', status: true },
    { name: 'no_of_use', status: true },
    { name: 'expired_at', status: true },
    { name: 'gender', status: false },
    { name: 'created_at', status: true },
    { name: 'updated_at', status: false },
    { name: 'version', status: true },
    { name: 'user_uses', status: true },
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
      this.specificRows = this.giftCodes.map((obj: any) => obj.id);
    } else {
      this.specificRows = [];
    }
  }

  // ========================================================sort========================================================
  sort(event: any) {
    const sortField = event.sortField;
    const sortOrder = event.sortOrder === 1 ? 1 : -1;
    this.giftCodes?.sort((a: any, b: any) => {
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
  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;
  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      code: new FormControl(null),
      flag: new FormControl(null),
      status: new FormControl(null),
      percentage: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
    this.appliedFilters = form.value;
    this._GiftcodeService.giftcode_filter.next(this.appliedFilters);
    this._GiftcodeService.filterGiftCodes(1, form.value).subscribe((res) => {
      this.giftCodes = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
    });
  }

  getOldFilters(page: number) {
    this._GiftcodeService
      .filterGiftCodes(page, this.appliedFilters)
      .subscribe((res) => {
        this.giftCodes = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getGiftCodes();
    this._GiftcodeService.giftcode_filter.next(null);
  }

  resetFields() {
    this.filterForm.reset();
  }
}
