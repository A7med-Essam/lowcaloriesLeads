import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-franchisee',
  templateUrl: './franchisee.component.html',
  styleUrls: ['./franchisee.component.scss'],
})
export class FranchiseeComponent implements OnInit {
  agents: any[] = [];
  constructor(private _UsersService: UsersService, private _Router: Router) {}

  ngOnInit(): void {
    this.getAgents();
  }

  getAgents() {
    this._UsersService.getAgents().subscribe((res: any) => {
      this.agents = res.data;
    });
  }

  showRow(id: number) {
    this._Router.navigate(['franchise/contracts/' + id]);
  }
}
