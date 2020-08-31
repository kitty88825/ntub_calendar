import { UserCommonService } from './../services/user-common.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-common-user',
  templateUrl: './common-user.component.html',
  styleUrls: ['./common-user.component.scss']
})
export class CommonUserComponent implements OnInit {
  isCollapsed = false;
  isOpened = false;
  meetName = '';
  look = true;
  new = !this.look;
  lookMeetName = '';
  formData = new FormData();
  oldSendEmailForm: FormGroup;
  newSendEmailForm: FormGroup;
  emailPattern = /^\w+([-+.']\w+)*@ntub.edu.tw(, ?\w+([-+.']\w+)*@ntub.edu.tw)*$/;
  oldInvalidEmails = [];
  newInvalidEmails = [];
  uploadForm: FormGroup;
  allMeetings = [];
  participants;
  deleteId;
  allParticipants = [];
  unSelectedItemsList = [];
  oldMasterSelected: boolean;
  newMasterSelected: boolean;
  addMasterSelected: boolean;
  isAlert = true;

  constructor(
    private formBuilder: FormBuilder,
    private userCommonService: UserCommonService
  ) {
    this.oldMasterSelected = true;
    this.newMasterSelected = true;
    this.addMasterSelected = true;
  }

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });

    this.oldSendEmailForm = this.formBuilder.group({
      toAddress: ['', Validators.pattern(this.emailPattern)]
    });

    this.newSendEmailForm = this.formBuilder.group({
      toAddress: ['', Validators.pattern(this.emailPattern)]
    });

    this.userCommonService.getCommonUsers().subscribe(
      data => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.allMeetings.push({
            title: data[i].title,
            id: data[i].id, participant: data[i].participant
          });
        }

        this.lookMeetName = this.allMeetings[0].title;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.allMeetings.length; i++) {
          if (this.lookMeetName === this.allMeetings[i].title) {
            this.participants = this.allMeetings[i].participant;
            // tslint:disable-next-line: prefer-for-of
            for (let j = 0; j < this.participants.length; j++) {
              this.allParticipants.push({
                id: this.allMeetings[i].id,
                participants: this.participants[j],
                isChecked: true
              });
            }
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  addMeetName() {
    this.formData.delete('emails');
    if (this.meetName.length === 0) {
      Swal.fire({
        icon: 'error',
        text: '請輸入新會議名稱',
      });
    } else if (this.meetName.length > 0) {
      this.look = false;
      this.new = true;
    }
  }

  deleteOrigin() {
    Swal.fire({
      icon: 'warning',
      text: '是否確定刪除「' + this.lookMeetName + '」?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.allMeetings.length; i++) {
          if (this.allMeetings[i].title === this.lookMeetName) {
            this.deleteId = this.allMeetings[i].id;
          }
        }
        this.userCommonService.deleteCommonUser(this.deleteId).subscribe(
          data => {
            console.log(data);
            Swal.fire({
              icon: 'success',
              text: '刪除成功！',
              confirmButtonColor: '#3085d6',
              confirmButtonText: '確定',
            }).then((res) => {
              window.location.reload();
            });
          },
          error => {
            console.log(error);
            Swal.fire({
              icon: 'error',
              text: '刪除失敗！',
              confirmButtonColor: '#3085d6',
              confirmButtonText: '確定',
            }).then((res) => {
              window.location.reload();
            });
          }
        );
      }
    });
  }

  change(info) {
    this.oldMasterSelected = true;
    this.newMasterSelected = true;
    this.allParticipants = [];
    this.formData.delete('emails');
    this.meetName = '';
    this.participants = null;
    this.look = true;
    this.new = false;
    this.lookMeetName = info.target.value;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allMeetings.length; i++) {
      if (this.lookMeetName === this.allMeetings[i].title) {
        this.participants = this.allMeetings[i].participant;
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < this.participants.length; j++) {
          this.allParticipants.push({
            id: this.allMeetings[i].id,
            participants: this.participants[j],
            isChecked: true
          });
        }
      }
    }
    console.log(this.allParticipants);
  }

  oldSend(value) {
    if (value.toAddress.length !== 0) {
      const emails = this.oldSendEmailForm.value.toAddress.split(',');
      console.log(emails);
      this.oldInvalidEmails.push({ email: emails, isChecked: true });
      console.log(this.oldInvalidEmails);
    }
    this.oldSendEmailForm.reset();
  }

  newSend(value) {
    if (value.toAddress.length !== 0) {
      const emails = this.newSendEmailForm.value.toAddress.split(',');
      console.log(emails);
      this.newInvalidEmails.push({ email: emails, isChecked: true });
      console.log(this.newInvalidEmails);
    }
    this.newSendEmailForm.reset();
  }

  submit() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.newInvalidEmails.length; i++) {
      if (this.newInvalidEmails[i].isChecked === true) {
        this.formData.append('emails', this.newInvalidEmails[i].email);
      }
    }
    this.formData.append('title', this.meetName);
    this.userCommonService.postCommonUser(this.formData).subscribe(
      data => {
        Swal.fire({
          icon: 'success',
          text: '新增成功',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        }).then((result) => {
          window.location.reload();
        });
      }, error => {
        Swal.fire({
          icon: 'error',
          text: '新增失敗',
        });
        console.log(error);
      }
    );
  }

  edit() {
    Swal.fire({
      icon: 'warning',
      text: '是否確定更新「' + this.lookMeetName + '」?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.value) {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < this.oldInvalidEmails.length; j++) {
          if (this.oldInvalidEmails[j].isChecked === true) {
            this.formData.append('emails', this.oldInvalidEmails[j].email);
          }
        }
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.allMeetings.length; i++) {
          if (this.allMeetings[i].title === this.lookMeetName) {
            this.userCommonService.patchCommonUser(this.allMeetings[i].id, this.formData).subscribe(
              data => {
                Swal.fire({
                  icon: 'success',
                  text: '更新成功！',
                }).then((res) => {
                  window.location.reload();
                });

              },
              error => {
                console.log(error);
              }
            );
          }
        }
      }
    });
  }

  changeSelection() {
    this.fetchSelectedItems();
    this.fetchCheckedIDs();

    this.oldMasterSelected = this.allParticipants.every(function (item: any) {
      return item.isChecked === true;
    });

    this.newMasterSelected = this.oldInvalidEmails.every(function (item: any) {
      return item.isChecked === true;
    });

    this.addMasterSelected = this.newInvalidEmails.every(function (item: any) {
      return item.isChecked === true;
    });
  }

  fetchSelectedItems() {
    this.unSelectedItemsList = this.allParticipants.filter((value, index) => {
      return value.isChecked;
    });
  }

  fetchCheckedIDs() {
    this.formData.delete('remove_emails');
    this.allParticipants.forEach((value, index) => {
      if (value.isChecked === false) {
        this.formData.append('remove_emails', value.participants);
      }
    });

  }

  oldCheckUncheckAll() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allParticipants.length; i++) {
      this.allParticipants[i].isChecked = this.oldMasterSelected;
    }

    this.changeSelection();
  }

  newCheckUncheckAll() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oldInvalidEmails.length; i++) {
      this.oldInvalidEmails[i].isChecked = this.newMasterSelected;
    }

    this.changeSelection();
  }

  addCheckUncheckAll() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.newInvalidEmails.length; i++) {
      this.newInvalidEmails[i].isChecked = this.addMasterSelected;
    }

    this.changeSelection();
  }

  alert() {
    this.isAlert = false;
  }

}
