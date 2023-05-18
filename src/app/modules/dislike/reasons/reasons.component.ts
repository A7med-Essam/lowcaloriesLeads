import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';

@Component({
  selector: 'app-reasons',
  templateUrl: './reasons.component.html',
  styleUrls: ['./reasons.component.scss'],
  providers: [ConfirmationService],

})
export class ReasonsComponent implements OnInit {
  reasons: any[] = [];
  constructor(
    private _DislikeService: DislikeService,
    private confirmationService: ConfirmationService

  ) {}

  ngOnInit(): void {
    this.getReasons();
  }

  deleteRow(id: number) {
    this._DislikeService.deleteReasons(id).subscribe((res) => {
      this.getReasons();
    });
  }

  getReasons() {
    this._DislikeService.getReasons().subscribe((res) => {
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
