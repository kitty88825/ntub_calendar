import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-official-add',
  templateUrl: './official-add.component.html',
  styleUrls: ['./official-add.component.scss']
})
export class OfficialAddComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  add() {
    Swal.fire({
      text: '修改成功',
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '返回首頁',
      cancelButtonText: '再添一筆'
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/official-calendar']);
      }
    });
  }

}
