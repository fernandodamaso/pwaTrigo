import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { GcomwebService } from "src/app/services/gcomweb.service";
import { GlobalService } from "src/app/services/global.service";
import { UIAlertService } from "src/app/services/uialert.service";

@Component({
  selector: "app-confirm-register",
  templateUrl: "./confirm-register.component.html",
  styleUrls: ["./confirm-register.component.scss"],
})
export class ConfirmRegisterComponent implements OnInit {
  registerData;
  codigo_confirmacao = "";
  codigo_origem = "";
  reSend = false;
  buttonsEnabled = {
    EMAIL: this.global.confirmEmail,
    SMS: this.global.confirmPhone,
  };

  constructor(private modalCtrl: ModalController, private service: GcomwebService, private global: GlobalService, private UIAlertService: UIAlertService) {}
  ngOnInit(): void {
    if (this.global.confirmEmail || this.global.confirmPhone) {
      if (this.global.confirmEmail && !this.global.confirmPhone) {
        this.selectButton("EMAIL");
      } else if (this.global.confirmPhone && !this.global.confirmEmail) {
        this.selectButton("SMS");
      }
    }
  }

  mountData(
    nome_completo: string,
    cpfcnpj: string,
    senha: string,
    data_nascimento: string,
    email1: string,
    ddd: number,
    numero: number,
    facebookId: string,
    googleId: string,
    appleId: string,
    aceitaTermosFidelidade: boolean,
    IdOracle: number,
    aceitaEmail: boolean,
    aceitaSms: boolean,
    app: string,
    appLocation: string
  ) {
    return {
      id_marca: this.global.getBrand(),
      operacao: "PRIMEIRO_ACESSO",
      nome_completo: nome_completo,
      cpf_cnpj: cpfcnpj,
      data_nascimento: data_nascimento,
      email1: email1.toLowerCase(),
      aceitaTermosFidelidade: aceitaTermosFidelidade,
      IdOracle: IdOracle,
      ic_aceita_sms: aceitaSms ? "S" : "N",
      ic_aceita_email: aceitaEmail ? "S" : "N",
      telefones: [
        {
          ic_tipo: "M",
          ddd: ddd,
          numero: numero,
          dc_tipo: "Celular",
        },
      ],
    };
  }

  async sendEmail(dataClient) {
    await this.service.sendCodeConfirmEmail(dataClient);
  }

  async sendSMS() {
    await this.service.sendCodeConfirmPhone(this.registerData.ddd, this.registerData.cel, this.global.getBrand());
  }

  reSendCode() {
    if (this.reSend) {
      return this.UIAlertService.presentAlert("Ops!", "", "Você já solicitou um novo código, aguarde alguns minutos e tente novamente.", null);
    }
    if (this.codigo_origem === "EMAIL") {
      const dataClient = this.mountData(
        this.registerData.first_name + " " + this.registerData.last_name,
        this.registerData.cpf_cnpj,
        this.registerData.password,
        this.registerData.data_nascimento,
        this.registerData.email,
        this.registerData.ddd,
        this.registerData.cel,
        this.registerData.facebook_id,
        this.registerData.google_id,
        this.registerData.apple_id,
        this.registerData.aceita_termos_fidelidade,
        this.registerData.id_oracle,
        this.registerData.aceita_email,
        this.registerData.aceitaSms,
        this.registerData.app,
        "PWA_REGISTER"
      );
      this.sendEmail(dataClient);
    } else {
      this.sendSMS();
    }
    this.reSend = true;
    this.UIAlertService.presentAlert(
      "Código de confirmação",
      "",
      `Foi reenviado o código para o ${this.codigo_origem === "EMAIL" ? "seu endereço de e-mail. Por favor, confira sua caixa de entrada e a pasta de spam" : "Telefone"}.`,
      null
    );
    setTimeout(() => {
      this.reSend = false;
    }, 180000);
    return;
  }

  selectButton(buttonSelected: string) {
    this.codigo_origem = buttonSelected;

    if (buttonSelected === "EMAIL") {
      const dataClient = this.mountData(
        this.registerData.first_name + " " + this.registerData.last_name,
        this.registerData.cpf_cnpj,
        this.registerData.password,
        this.registerData.data_nascimento,
        this.registerData.email,
        this.registerData.ddd,
        this.registerData.cel,
        this.registerData.facebook_id,
        this.registerData.google_id,
        this.registerData.apple_id,
        this.registerData.aceita_termos_fidelidade,
        this.registerData.id_oracle,
        this.registerData.aceita_email,
        this.registerData.aceitaSms,
        this.registerData.app,
        "PWA_REGISTER"
      );
      this.sendEmail(dataClient);
    } else {
      this.sendSMS();
    }
  }

  async verifyCode() {
    if (this.codigo_confirmacao.length < 6) {
      return this.UIAlertService.presentAlert("Ops!", "", "O código que você inseriu deve conter 6 caracteres.", null);
    }
    if (this.codigo_origem === "EMAIL") {
      this.service
        .verifyCodeConfirmEmail(this.codigo_confirmacao, this.codigo_origem, this.registerData.email)
        .then((result: any) => {
          if (result.data && result.data !== null) {
            this.dismiss("success");
          } else {
            this.UIAlertService.presentAlert("Ops!", "", `${result.message}`, null);
          }
        })
        .catch((error) => {
          this.UIAlertService.presentAlert("Ops!", "", "Ocorreu um erro ao verificar o código, tente novamente.", null);
        });
    } else {
      await this.service
        .verifyCodeConfirmPhone(this.registerData.ddd, this.registerData.cel, this.global.getBrand(), this.codigo_confirmacao)
        .then((result: any) => {
          if (result.status === "ok") {
            this.dismiss("success");
          } else {
            this.UIAlertService.presentAlert("Ops!", "", `${result.message}`, null);
          }
        })
        .catch((error) => {
          this.UIAlertService.presentAlert("Ops!", "", "Ocorreu um erro ao verificar o código, tente novamente.", null);
        });
    }
    // this.dismiss('confirm')})
  }

  dismiss(action) {
    this.modalCtrl.dismiss({
      return: action,
    });
  }
}
