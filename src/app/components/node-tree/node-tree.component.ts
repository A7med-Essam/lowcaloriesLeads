import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-node-tree',
  templateUrl: './node-tree.component.html',
  styleUrls: ['./node-tree.component.scss'],
})
export class NodeTreeComponent implements OnInit {
  selectedNodes!: TreeNode[];
  data: TreeNode[] = [
    {
      expanded: true,
      type: 'person',
      data: {
        name: 'Data Analytics',
        title: 'Options',
        has_children: true,
      },
      children: [],
    },
  ];

  constructor(
    private _AppService: AppService,
    private _AnalysisService: AnalysisService
  ) {}

  isLoading: boolean = false;
  ngOnInit(): void {
    this.toggleSidebarPin();
    this.getAnalytics();
  }

  getAnalytics() {
    this.isLoading = true;
    this._AnalysisService.getDataAnalyticOption().subscribe({
      next: (res) => {
        this.data[0].children?.push(...this.transformToTreeNode(res.data));
        this.isLoading = false;
      },
    });
  }

  transformToTreeNode(data: any): TreeNode[] {
    const treeNodee: TreeNode[] = [];

    data.forEach((entry: any) => {
      const node = {
        expanded: entry.has_children,
        type: 'person',
        data: {
          name: entry.name,
          title: entry.label,
          id: entry.id,
          has_children: entry.has_children,
        },
      };
      treeNodee.push(node);
    });

    return treeNodee;
  }

  toggleSidebarPin() {
    this._AppService.toggleSidebarPin();
  }

  onNodeSelect(event: any) {
    if (event.node.data.title != 'Options') {
      if (event.node.data.has_children) {
        this.getChildren(event.node.data.id).subscribe((children) => {
          event.node.children = children;
        });
      }
    }
  }

  getChildren(id: any): Observable<any[]> {
    this.isLoading = true;
    return this._AnalysisService.getAnalyticsChildrenById(id).pipe(
      tap((res) => {
        this.isLoading = false;
      }),
      map((res) => this.transformToTreeNode(res.data))
    );
  }
}
