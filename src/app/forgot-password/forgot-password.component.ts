import { Component, OnInit } from "@angular/core";
import { GcomwebService } from "../services/gcomweb.service";
import { UIAlertService } from "../services/uialert.service";
import { ModalController } from "@ionic/angular";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {

  constructor(private gcomwebservice: GcomwebService, private UIAlertService: UIAlertService, private modalCtrl: ModalController, private authService: AuthService) {}

  public email;
  public verifyCode;
  public cliente;
  public requestVerifyCode;
  public newPassword;
  public newPassword2;

  ngOnInit() {}

  sendVerifyCode() {
    if (this.email == null || this.email == "") {
      // this.UIAlertService.presentToast('Favor preencher o e-mail de cadastro para receber o código de verificação',5000,'warning')
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher o e-mail de cadastro para receber o código de verificação", null);
      return;
    }

    this.UIAlertService.presentLoading();
    this.gcomwebservice
      .sendVerifyCode(this.email)
      .then((results: any) => {
        if (results.status == "ok") {
          this.requestVerifyCode = true;
        } else {
          this.UIAlertService.presentAlert("Ops!", "", results.message, null);
        }

        this.UIAlertService.dismissLoading();
      })
      .catch((error: any) => {
        this.UIAlertService.presentAlert("Ops!", "", error.message, null);

        this.UIAlertService.dismissLoading();
      });
  }

  checkVerifyCode() {
    if (this.verifyCode == null || this.verifyCode == "") {
      // this.UIAlertService.presentToast('Favor preencher o código de verificação para redefinir sua senha.',5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher o código de verificação para redefinir sua senha.", null);
      return;
    }

    this.gcomwebservice
      .checkVerifyCode(this.email, this.verifyCode.toUpperCase())
      .then((results: any) => {
        if (results.status == "ok") {
          this.cliente = results.data;
        } else {
          this.UIAlertService.presentAlert("Ops!", "", results.message, null);
        }
      })
      .catch((error: any) => {
        this.UIAlertService.presentAlert("Ops!", "", error.message, null);
      });
  }

  async resetPassword() {
    if (this.newPassword == null || this.newPassword.trim() == "") {
      // this.UIAlertService.presentToast('Favor digitar a nova senha para continuar.',5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor digitar a nova senha para continuar.", null);

      return;
    }

    if (this.newPassword2 == null || this.newPassword2.trim() == "") {
      // this.UIAlertService.presentToast('Favor confirmar a nova senha para continuar.',5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor confirmar a nova senha para continuar.", null);
      return;
    }

    if (this.newPassword != this.newPassword2) {
      // this.UIAlertService.presentToast('A confirmação da senha não coincide com a senha. Favor tentar novamente.',5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "A confirmação da senha não coincide com a senha. Favor tentar novamente.", null);
      this.newPassword2 = "";
      return;
    }
    this.cliente.senha = await this.authService.encrypt(this.newPassword);

    this.gcomwebservice
      .resetPassword(this.cliente)
      .then((results: any) => {
        if (results.status == "ok") {
          this.UIAlertService.presentToast("Senha alterada com sucesso.", 5000, "primary");
          this.dismiss();
        } else {
          this.UIAlertService.presentAlert("Ops!", "", results.message, null);
        }
      })
      .catch((error: any) => {
        this.UIAlertService.presentAlert("Ops!", "", error.message, null);
      });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      return: "cancel",
    });
  }
}
