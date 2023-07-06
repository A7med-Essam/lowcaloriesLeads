import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-show-reasons',
  templateUrl: './show-reasons.component.html',
  styleUrls: ['./show-reasons.component.scss']
})
export class ShowReasonsComponent implements OnInit {
  reasons: any[] = [];
  constructor(
    private _RefundService: RefundService,
    private confirmationService: ConfirmationService

  ) {}

  ngOnInit(): void {
    this.getReasons();
  }

  deleteRow(id: number) {
    this._RefundService.deleteReasons(id).subscribe((res) => {
      this.getReasons();
    });
  }

  getReasons() {
    this._RefundService.getReasons().subscribe((res) => {
      this.reasons = res.data;
    });
  }

  confirm(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }
}