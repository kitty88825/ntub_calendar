import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-official-change',
  templateUrl: './official-change.component.html',
  styleUrls: ['./official-change.component.scss']
})
export class OfficialChangeComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  add() {
    Swal.fire({
      text: '新增成功',
      icon: 'success'
    });
    this.router.navigate(['/official-calendar']);
  }

}
