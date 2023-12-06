import { Component, OnInit } from '@angular/core';
import { AnalysisService } from 'src/app/services/analysis.service';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/api';

@Component({
  selector: 'app-manage-analysis',
  templateUrl: './manage-analysis.component.html',
  styleUrls: ['./manage-analysis.component.scss'],
})
export class ManageAnalysisComponent implements OnInit {
  items: MenuItem[] = [];
  createModal: boolean = false;
  createNodeModal: boolean = false;
  updateModal: boolean = false;
  createLabelModal: boolean = false;
  selectedNode: any[] = [];
  reasons: any[] = [];
  analytics: any = [];
  analytics_clone: any[] = [];

  constructor(
    private _AnalysisService: AnalysisService,
    private _ConfirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getAnalytics();
    // this.getSuggestDataOptions();
  }

  getAnalytics() {
    this._AnalysisService.getDataAnalyticOption().subscribe({
      next: (res) => {
        this.analytics = this.analytics_clone = res.data;
        const deepClone = JSON.parse(JSON.stringify(this.analytics_clone));
        this.toggleNameAndLabel(deepClone);
      },
    });
  }

  resetClone() {
    this._AnalysisService.getDataAnalyticOption().subscribe({
      next: (res) => {
        this.analytics_clone = res.data;
        const deepClone = JSON.parse(JSON.stringify(this.analytics));
        this.toggleNameAndLabel(deepClone);
      },
    });
  }

  getSuggestDataOptions() {
    this._AnalysisService.suggestDataOptions().subscribe({
      next: (res) => {
        // this.reasons = this.reasons_clone = [...new Set(res.data)];
        const outputArray = Object.entries(res.data).map(
          ([id, name], index) => ({
            id: index + 1,
            name,
          })
        );
        this.reasons = outputArray;
      },
    });
  }

  getChildren(analysis: any): void {
    this.items.push({
      items: this.analytics,
      label: analysis.name,
      id: analysis.id,
    });
    this.analytics = analysis.children;
    this.items = [...this.items];
  }

  deleteRow(analysis: any): void {
    const index = this.analytics.indexOf(analysis);
    if (index !== -1) {
      this.analytics.splice(index, 1);
      this._AnalysisService
        .deleteDataAnalyticOption(analysis.id)
        .subscribe((res) => {
          this.resetClone();
        });
    }
  }

  getIndex(item: any): void {
    const index = this.items.findIndex(
      (breadcrumbItem) => breadcrumbItem === item
    );
    if (index !== -1) {
      this.items = this.items.slice(0, index + 1);
      if (this.items.length && index) {
        this.analytics = this.items[this.items.length - 1].items;
        this.items = this.items.slice(0, index);
      } else {
        this.items = [];
        this.analytics = this.analytics_clone;
      }
    }
  }
  creatingStatus: boolean = false;
  create(selectedAnalytics: any) {
    // this.creatingStatus = true;
    // let data: any = {
    //   names: selectedAnalytics,
    //   parent_id: this.items.length
    //     ? this.items[this.items.length - 1].id
    //     : null,
    //   label:
    //     this.analytics && this.analytics.length ? this.analytics[0].label : '0',
    // };
    // this.addNewDataAnalyticOption(data);
  }

  addNewDataAnalyticOption(data: any) {
    this._AnalysisService.addNewDataAnalyticOption(data).subscribe((res) => {
      if (res.status == 1) {
        this.creatingStatus = false;
        // this.getSuggestDataOptions();
        this.createModal = false;
        this.resetClone();
        this.selectedNode = [];
        if (this.analytics == undefined) {
          this.analytics = [];
        }
        this.analytics.push(...res.data);
        this.items.map((m) => {
          if (m.id == res.data[0]?.parent_id) {
            m?.items?.map((i: any) => {
              if (i.id == res.data[0]?.parent_id) {
                i.has_children = true;
                i.children = res.data;
              }
            });
          }
        });
        this.resetClone();
      }
    });
  }

  confirm(row: any) {
    this._ConfirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(row);
      },
    });
  }

  createLabel(label: string) {
    const ids = this.analytics.map((a: any) => a.id);
    const data = { ids, label };
    this._AnalysisService.addLabelForDataOption(data).subscribe((res) => {
      this.createLabelModal = false;
      this.analytics = this.analytics.map((a: any) => {
        a.label = label;
        return a;
      });
    });
  }

  get itemsAsSelectItems(): SelectItem[] {
    return this.reasons.map(
      (item, id) => ({ label: item.name, value: id } as SelectItem)
    );
  }

  currentRow: any;
  updateRow(row: any) {
    this.currentRow = row;
    this.updateModal = true;
    this.selectedName = row.name;
  }

  selectedName: string = '';
  UpdateName() {
    if (this.selectedName != '') {
      const data = {
        data_analytic_option_id: this.currentRow.id,
        name: this.selectedName,
      };
      this._AnalysisService.updateAnalyticName(data).subscribe((res) => {
        this.updateModal = false;
        this.getAnalytics();
      });
    }
  }

  dropDownAnalytics: any[] = [];
  toggleNameAndLabel(node: any[]) {
    node.forEach((element) => {
      [element.name, element.label] = [element.label, element.name];
      if (element.children && element.children.length > 0) {
        this.toggleNameAndLabel(element.children);
      }
    });
    this.dropDownAnalytics = node;
  }

  node: any;
  nodeSelect(e: any) {
    this.node = e.node;
  }

  selectedNames: any[] = [];
  createNode() {
    if (this.selectedNames.length) {
      this.creatingStatus = true;
      let data: any = {
        names: this.selectedNames,
        parent_id: this.items.length
          ? this.items[this.items.length - 1].id
          : null,
        label:
          this.analytics && this.analytics.length
            ? this.analytics[0].label
            : '0',
      };
      this.addNewDataAnalyticOption(data);
      this.createNodeModal = false;
      this.selectedNames = [];
    }
  }

  createNodeChildren() {
    this.creatingStatus = true;
    let data: any = {
      parent_id: this.items.length
      ? this.items[this.items.length - 1].id
      : null,
      copy_id: this.node.id,
      label: 'N/A',
    };
    this.addNewDataAnalyticOption(data);
    this.createModal = false;
  }
}
