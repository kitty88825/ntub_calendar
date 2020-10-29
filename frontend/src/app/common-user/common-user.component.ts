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
  hasCommonUser = false;

  constructor(
    private formBuilder: FormBuilder,
    private userCommonService: UserCommonService
  ) {
    this.oldMasterSelected = false;
    this.newMasterSelected = false;
    this.addMasterSelected = false;
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

        if (data.length === 0) {
          this.hasCommonUser = false;
        } else if (data.length > 0) {
          this.hasCommonUser = true;
        }

        if (data.length > 0) {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < data.length; i++) {
            this.allMeetings.push({
              title: data[i].title,
              id: data[i].id, participant: data[i].participant, isChecked: false
            });
          }

          this.lookMeetName = this.allMeetings[0].title;
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.allMeetings.length; i++) {
            if (this.lookMeetName === this.allMeetings[i].title) {
              this.allMeetings[i].isChecked = true;
              this.participants = this.allMeetings[i].participant;
              // tslint:disable-next-line: prefer-for-of
              for (let j = 0; j < this.participants.length; j++) {
                this.allParticipants.push({
                  id: this.allMeetings[i].id,
                  participants: this.participants[j],
                  isChecked: false
                });
              }
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
    this.look = false;
    this.new = true;
    this.allMeetings.forEach(meet => {
      meet.isChecked = false;
    });
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
    this.oldMasterSelected = false;
    this.newMasterSelected = false;
    this.allParticipants = [];
    this.participants = null;
    this.look = true;
    this.new = false;
    this.allMeetings.forEach(meet => {
      meet.isChecked = false;
    });
    this.allMeetings[info].isChecked = true;
    this.lookMeetName = this.allMeetings[info].title;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allMeetings.length; i++) {
      if (this.lookMeetName === this.allMeetings[i].title) {
        this.participants = this.allMeetings[i].participant;
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < this.participants.length; j++) {
          this.allParticipants.push({
            id: this.allMeetings[i].id,
            participants: this.participants[j],
            isChecked: false
          });
        }
      }
    }
    console.log(this.allParticipants);
  }

  oldSend(value) {
    this.newMasterSelected = false;
    if (value.toAddress.length !== 0) {
      const emails = this.oldSendEmailForm.value.toAddress.split(',');
      this.oldInvalidEmails.push({ email: emails, isChecked: false });
    }
    this.oldSendEmailForm.reset();
  }

  newSend(value) {
    if (value.toAddress.length !== 0) {
      const emails = this.newSendEmailForm.value.toAddress.split(',');
      this.newInvalidEmails.push({ email: emails, isChecked: false });
    }
    this.newSendEmailForm.reset();
  }

  submit() {
    console.log(this.newInvalidEmails);
    if (this.meetName.length === 0) {
      Swal.fire({
        icon: 'error',
        text: '請輸入會議名稱',
      });
    } else {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.newInvalidEmails.length; i++) {
        this.formData.append('emails', this.newInvalidEmails[i].email);
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
          this.formData.append('emails', this.oldInvalidEmails[j].email);
          console.log(this.oldInvalidEmails[j].email);
        }
        this.allParticipants.forEach(all => {
          this.formData.append('emails', all.participants);
          console.log(all.participants);
        });
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
    let addCount = 0;
    let allCount = 0;
    let oldCount = 0;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.allParticipants.length; i++) {
      if (this.allParticipants[i].isChecked === true) {
        allCount++;
      }
    }
    if (this.allParticipants.length === allCount && this.allParticipants.length !== 0) {
      this.oldMasterSelected = true;
    } else {
      this.oldMasterSelected = false;
    }

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oldInvalidEmails.length; i++) {
      if (this.oldInvalidEmails[i].isChecked === true) {
        oldCount++;
      }
    }
    if (this.oldInvalidEmails.length === oldCount && this.oldInvalidEmails.length !== 0) {
      this.newMasterSelected = true;
    } else {
      this.newMasterSelected = false;
    }

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.newInvalidEmails.length; i++) {
      if (this.newInvalidEmails[i].isChecked === true) {
        addCount++;
      }
    }

    if (this.newInvalidEmails.length === addCount && this.newInvalidEmails.length !== 0) {
      this.addMasterSelected = true;
    } else {
      this.addMasterSelected = false;
    }
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

  deleteAdd() {
    this.newInvalidEmails = this.newInvalidEmails.filter(deleteEmail => {
      return deleteEmail.isChecked === false;
    });
  }

  deleteOld() {
    this.allParticipants = this.allParticipants.filter(deleteEmail => {
      return deleteEmail.isChecked === false;
    });
  }

  deleteNew() {
    this.oldInvalidEmails = this.oldInvalidEmails.filter(deleteEmail => {
      return deleteEmail.isChecked === false;
    });
  }

}
