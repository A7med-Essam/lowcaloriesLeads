import { Component, OnInit } from '@angular/core';
import { DislikeService } from 'src/app/services/dislike.service';

@Component({
  selector: 'app-reasons',
  templateUrl: './reasons.component.html',
  styleUrls: ['./reasons.component.scss'],
})
export class ReasonsComponent implements OnInit {
  reasons: any[] = [];
  constructor(
    private _DislikeService: DislikeService,
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
}
