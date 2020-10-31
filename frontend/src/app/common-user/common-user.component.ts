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
  oldMasterSelected = false;
  newMasterSelected = false;
  addMasterSelected = false;
  hasCommonUser = false;

  constructor(
    private formBuilder: FormBuilder,
    private userCommonService: UserCommonService
  ) { }

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

          data.forEach(commonUser => {
            this.allMeetings.push({ title: commonUser.title, id: commonUser, participant: commonUser.participant, isChecked: false });
          });

          this.lookMeetName = this.allMeetings[0].title;

          this.allMeetings.forEach(meet => {
            if (this.lookMeetName === meet.title) {
              meet.isChecked = true;
              this.participants = meet.participant;

              this.participants.forEach(participant => {
                this.allParticipants.push({ id: meet.id, participants: participant, isChecked: false });
              });
            }
          });
        }
      }, error => {
        Swal.fire({
          text: '獲取資料失敗',
          icon: 'error'
        });
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
        this.allMeetings.forEach(meet => {
          if (meet.title === this.lookMeetName) {
            this.deleteId = meet.id.id;
          }
        });
        console.log(this.deleteId);
        this.userCommonService.deleteCommonUser(this.deleteId).subscribe(
          data => {
            Swal.fire({
              icon: 'success',
              text: '刪除成功！',
              confirmButtonColor: '#3085d6',
              confirmButtonText: '確定',
            }).then((res) => {
              window.location.reload();
            });
          }, error => {
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
    this.participants = [];
    this.look = true;
    this.new = false;
    this.oldInvalidEmails = [];

    this.allMeetings.forEach(meet => {
      meet.isChecked = false;
    });
    this.allMeetings[info].isChecked = true;
    this.lookMeetName = this.allMeetings[info].title;
    this.allMeetings.forEach(meet => {
      if (this.lookMeetName === meet.title) {
        this.participants = meet.participant;
        this.participants.forEach(participant => {
          this.allParticipants.push({
            id: meet.id,
            participants: participant,
            isChecked: false
          });
        });
      }
    });
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
    if (this.meetName.length === 0) {
      Swal.fire({
        icon: 'error',
        text: '請輸入會議名稱',
      });
    } else {
      this.newInvalidEmails.forEach(email => {
        this.formData.append('emails', email.email);
      });
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
        this.oldInvalidEmails.forEach(email => {
          this.formData.append('emails', email.email);
        });
        this.allParticipants.forEach(all => {
          this.formData.append('emails', all.participants);
        });
        this.allMeetings.forEach(meet => {
          if (meet.title === this.lookMeetName) {
            this.userCommonService.patchCommonUser(meet.id.id, this.formData).subscribe(
              data => {
                Swal.fire({
                  icon: 'success',
                  text: '更新成功！',
                }).then((res) => {
                  window.location.reload();
                });
              }, error => {
                Swal.fire({
                  icon: 'error',
                  text: '更新失敗！',
                }).then((res) => {
                  window.location.reload();
                });
              }
            );
          }
        });
      }
    });
  }

  changeSelection() {
    let addCount = 0;
    let allCount = 0;
    let oldCount = 0;

    this.allParticipants.forEach(all => {
      if (all.isChecked === true) {
        allCount++;
      }
    });

    if (this.allParticipants.length === allCount && this.allParticipants.length !== 0) {
      this.oldMasterSelected = true;
    } else {
      this.oldMasterSelected = false;
    }

    this.oldInvalidEmails.forEach(email => {
      if (email.isChecked === true) {
        oldCount++;
      }
    });

    if (this.oldInvalidEmails.length === oldCount && this.oldInvalidEmails.length !== 0) {
      this.newMasterSelected = true;
    } else {
      this.newMasterSelected = false;
    }

    this.newInvalidEmails.forEach(email => {
      if (email.isChecked === true) {
        addCount++;
      }
    });

    if (this.newInvalidEmails.length === addCount && this.newInvalidEmails.length !== 0) {
      this.addMasterSelected = true;
    } else {
      this.addMasterSelected = false;
    }
  }

  oldCheckUncheckAll() {
    this.allParticipants.forEach(all => {
      all.isChecked = this.oldMasterSelected;
    });
    this.changeSelection();
  }

  newCheckUncheckAll() {
    this.oldInvalidEmails.forEach(email => {
      email.isChecked = this.newMasterSelected;
    });
    this.changeSelection();
  }

  addCheckUncheckAll() {
    this.newInvalidEmails.forEach(email => {
      email.isChecked = this.addMasterSelected;
    });
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
