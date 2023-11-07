import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { GuardService } from 'src/app/services/guard.service';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-show-upload',
  templateUrl: './show-upload.component.html',
  styleUrls: ['./show-upload.component.scss'],
  providers: [ConfirmationService],
})
export class ShowUploadComponent implements OnInit {
  constructor(
    private _UploadService: UploadService,
    private _GuardService: GuardService,
    private confirmationService: ConfirmationService,
  ) {}


  createPermission: boolean = false;
  deletePermission: boolean = false;

  getPermission() {
    this.createPermission =
      this._GuardService.getPermissionStatus('create_docs');
    this.deletePermission =
      this._GuardService.getPermissionStatus('delete_docs');
  }

  files: any[] = [];

  ngOnInit(): void {
    this.getPermission();
    this.getFiles();
  }

  getFiles() {
    this._UploadService.getFiles().subscribe({
      next: (res) => {
        this.files = res.data;
      },
    });
  }

  deleteRow(id: number) {
    if (this.deletePermission) {
      this._UploadService.deleteFile(id).subscribe(res=>{
        this.getFiles()
      })
    }
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
