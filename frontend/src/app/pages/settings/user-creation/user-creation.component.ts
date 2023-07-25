import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.component.html',
  styleUrls: ['./user-creation.component.scss'],
})
export class UserCreationComponent implements OnInit {
  constructor(private userService: UserService, private toastCtrl: ToastController) {}

  public userForm: FormGroup;
  public contractForms: FormGroup[] = [];

  ngOnInit() {
    this.userForm = new FormGroup({
      lastname: new FormControl('', Validators.required),
      firstname: new FormControl('', Validators.required),
      mail: new FormControl('', Validators.required),
      status: new FormControl('interne', Validators.required),
      company: new FormControl('')
    });
    this.addContractForm();
  }

  public save(): void {
    this.userForm.markAllAsTouched();

    if (!this.userForm.valid) {
      return;
    }

    this.userService
      .createUser(this.userForm.value)
      .subscribe(async (res: { message: string }) => {
        const toast = await this.toastCtrl.create({
          message: res.message,
          color: 'success',
          duration: 1500,
          position: 'bottom',
        });

        toast.present();
      });
  }

  public addContractForm(): void {
    this.contractForms.push(new FormGroup({
      label: new FormControl(''),
      area: new FormControl(''),
      territory: new FormControl(''),
      contracts: new FormControl(''),
      profile: new FormControl(''),
    }))
  }
}
