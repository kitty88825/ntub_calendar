import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-schedule',
  templateUrl: './add-schedule.component.html',
  styleUrls: ['./add-schedule.component.scss']
})
export class AddScheduleComponent implements OnInit {
  isCollapsed = true;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  logout() {
    Swal.fire({
      text: '是否確定要登出？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/login']);
      }
    });
  }

  add() {
    Swal.fire({
      text: '新增成功',
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '返回首頁',
      cancelButtonText: '再添一筆'
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/calendar']);
      }
    });
  }

}
