import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private toastCtrl: ToastController,
    private modalController: ModalController
  ) { }

  @Input("user") user: User;

  public userForm: FormGroup;
  public contractForms: FormGroup[] = [];

  ngOnInit() {
    this.userForm = new FormGroup({
      lastname: new FormControl(this.user?.lastName, Validators.required),
      firstname: new FormControl(this.user?.firstName, Validators.required),
      mail: new FormControl(this.user?.email, Validators.required),
      status: new FormControl(this.user?.status ?? 'interne', Validators.required),
      company: new FormControl(this.user?.company)
    });
    this.addContractForm();

    // TODO: Si utilisateur, on désactive tous les champs du formulaire
    if (this.user) {
      this.userForm.disable();
      console.log(this.contractForms);
      this.contractForms.forEach((form) => form.disable());
    }
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
        this.modalController.dismiss(true);
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
