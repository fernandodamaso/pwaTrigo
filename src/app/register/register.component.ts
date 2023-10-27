import { Component, OnInit } from "@angular/core";
import { UIAlertService } from "../services/uialert.service";
import { GcomwebService } from "../services/gcomweb.service";
import { Storage } from "@ionic/storage";
import { Platform, ModalController, NavParams } from "@ionic/angular";
import { UseTermsComponent } from "../use-terms/use-terms.component";
import { PrivacyTermsComponent } from "../privacy-terms/privacy-terms.component";
import { GlobalService } from "../services/global.service";
import * as EmailValidator from "email-validator";
import { TermsAndPrivacyPolicyService } from "../services/terms-and-privacy-policy.service";
import { DatePipe } from "@angular/common";
import { AuthService } from "../services/auth.service";
import { EProvider } from "../login/EProvider";
import { Router } from "@angular/router";

import { IDataRegister } from "../models/IDataRegister";
import { IRegisterResult } from "../models/IRegisterResult";
import { ConfirmRegisterComponent } from "./confirm-register/confirm-register.component";

// import { IDataRegister } from './IDataRegister';

// declare function register(provider, userId, email, nome, telefone): any;
declare function signup(provider, userId, email, nome, telefone, path, method): any;

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  public firstname: string;
  public lastname: string;
  public email: string;
  public email2: string;
  public CPFCPNJ: string = "";
  public isCPFCPNJInformed: boolean;
  public celular: string;
  public celular2: string;
  public datanascimento: string = "";
  public senha: string;
  public senha2: string;
  public primeiroAcesso: boolean;
  public id_cliente;
  public IdOracle;
  public screenWidth;
  public termsAgreed;
  public facebook;
  public google_id: string;
  public apple_id: string;
  public facebook_id: string;
  public data_hoje;
  public optin = false;
  public loyaltyMode;
  public loyaltyCompany;
  public processingRegister = false;
  public aceitaEmail: boolean = true;
  public aceitaSms: boolean = true;
  public isMGM: boolean = false;
  public EmailOrPhoneConfirmed: boolean = false;
  public optInEmail: string = "Quero receber cupons, promoções e novidades em primeira mão por E-mail.";
  public optInSms: string = "Quero receber cupons, promoções e novidades em primeira mão por SMS.";
  DECIMAL_SEPARATOR = ".";
  GROUP_SEPARATOR = ",";
  pureResult: any;
  maskedId: any;
  val: any;
  v: any;

  public haveTermsCookiesAndPrivacyPolicy: boolean = false;
  public requireEmailConfirmation: boolean = true;
  public requirePhoneConfirmation: boolean = true;

  constructor(
    private UIAlertService: UIAlertService,
    private gcomwebService: GcomwebService,
    private storage: Storage,
    private platform: Platform,
    private modalCtrl: ModalController,
    private global: GlobalService,
    private navParams: NavParams,
    protected datePipe: DatePipe,
    private termsService: TermsAndPrivacyPolicyService,
    private authService: AuthService,
    private router: Router
  ) {
    platform.ready().then((readySource) => {
      this.screenWidth = platform.width();
    });

    if (this.global["privacyPolicy"]) this.haveTermsCookiesAndPrivacyPolicy = true;

    if (this.global["requireEmailConfirmation"] != undefined) this.requireEmailConfirmation = this.global["requireEmailConfirmation"];

    if (this.global["requirePhoneConfirmation"] != undefined) this.requirePhoneConfirmation = this.global["requirePhoneConfirmation"];

    if (this.global.optInEmail) this.optInEmail = this.global.optInEmail;
    if (this.global.optInSms) this.optInSms = this.global.optInSms;
  }

  public brandId;
  public typeInputPass = "password";

  onCleanEmail() {
    if (!this.email) this.dismiss("closed");
  }

  switchVisibilityPass() {
    this.typeInputPass = this.typeInputPass == "password" ? "text" : "password";
  }

  openUseTermsCookiesPrivacyPolicy() {
    this.termsService.presentModalTermsAndPolicy();
  }

  async presentModalUseTerms() {
    const modal = await this.modalCtrl.create({
      component: UseTermsComponent,
      cssClass: this.screenWidth >= 1024 ? "terms-modal-css" : "",
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
  }

  async presentModalConfirmEmailOrPhone(registerData) {
    const modal = await this.modalCtrl.create({
      component: ConfirmRegisterComponent,
      showBackdrop: true,
      cssClass: this.screenWidth >= 1024 ? "confirmRegister-modal-css" : "",
      componentProps: {
        registerData: registerData,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    return data;
  }

  async presentModalPrivacyTerms() {
    const modal = await this.modalCtrl.create({
      component: PrivacyTermsComponent,
      cssClass: this.screenWidth >= 1024 ? "terms-modal-css" : "",
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
  }

  ionViewDidEnter() {
    // this.menu.swipeEnable(false);
    this.brandId = this.global.getBrand();

    this.loyaltyMode = this.global.loyaltyMode;
    this.loyaltyCompany = this.global.loyaltyCompany;
  }

  ionViewWillLeave() {
    // this.menu.swipeEnable(true);
  }

  formatphone(fieldSeq) {
    this.EmailOrPhoneConfirmed = false;
    // const pattern = /[0-9]/;
    // let inputChar = String.fromCharCode(ev.charCode);

    // if (!pattern.test(inputChar)) {
    //   // invalid character, prevent input
    //   event.preventDefault();
    //   return;
    // }

    var valString;

    if (fieldSeq == 1) valString = this.celular.replace(/ /g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\-/g, "");
    else if (fieldSeq == 2) valString = this.celular2.replace(/ /g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\-/g, "");

    if (valString.length > 0) {
      valString = "(" + valString;
    }

    if (valString.length > 3) {
      valString = valString.substring(0, 3) + ") " + valString.substring(3, valString.length);
    }

    if (valString.length > 10) {
      valString = valString.substring(0, 10) + "-" + valString.substring(10, valString.length);
    }

    valString = valString.substring(0, 15);

    if (fieldSeq == 1) this.celular = valString;
    else if (fieldSeq == 2) this.celular2 = valString;
  }

  verifyphone(valString, fieldSeq) {
    if (valString == null || valString == undefined || valString == "") {
      if (fieldSeq == 1) this.celular = "";
      else if (fieldSeq == 2) this.celular2 = "";
    }

    if (valString.toString().length < 15) {
      // this.UIAlertService.presentToast('Número de celular inválido. Digite o número completo com o DDD', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Número de celular inválido. Digite o número completo com o DDD", null);
      if (fieldSeq == 1) this.celular = "";
      else if (fieldSeq == 2) this.celular2 = "";
    } else if (valString.toString().length > 15) {
      // this.UIAlertService.presentToast('Número de celular inválido com número(s) a mais. Digite novamente. ', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Número de celular inválido com número(s) a mais. Digite novamente.", null);
      if (fieldSeq == 1) this.celular = "";
      else if (fieldSeq == 2) this.celular2 = "";
    }
  }

  format(valString) {
    if (!valString) {
      this.UIAlertService.presentAlert("Ops!", "", "CPF inválido, por favor digite um CPF válido", null);
      return "";
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    this.pureResult = parts;
    if (parts[0].length == 11) {
      if (!this.isCpfValid(parts[0])) {
        // this.UIAlertService.presentToast('CPF/CPNJ inválido, favor digitar novamente', 2000, 'warning');
        this.UIAlertService.presentAlert("Ops!", "", "CPF/CPNJ inválido, favor digitar novamente", null);
        return "";
      }

      this.maskedId = this.cpf_mask(parts[0]);
      return this.maskedId;
    } else if (parts[0].length == 14) {
      this.maskedId = this.cnpj(parts[0]);
      return this.maskedId;
    } else {
      // this.UIAlertService.presentToast('CPF/CPNJ inválido, favor digitar novamente', 2000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "CPF/CPNJ inválido, favor digitar novamente", null);
      return "";
    }
  }

  unFormat(val) {
    if (!val) {
      return "";
    }
    val = val.replace(/\D/g, "");

    if (this.GROUP_SEPARATOR === ",") {
      return val.replace(/,/g, "");
    } else {
      return val.replace(/\./g, "");
    }
  }

  isCpfValid(cpf) {
    if (cpf) {
      let numbers, digits, sum, i, result, equalDigits;
      equalDigits = 1;
      if (cpf.length < 11) {
        return false;
      }

      for (i = 0; i < cpf.length - 1; i++) {
        if (cpf.charAt(i) !== cpf.charAt(i + 1)) {
          equalDigits = 0;
          break;
        }
      }

      if (!equalDigits) {
        numbers = cpf.substring(0, 9);
        digits = cpf.substring(9);
        sum = 0;
        for (i = 10; i > 1; i--) {
          sum += numbers.charAt(10 - i) * i;
        }

        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

        if (result !== Number(digits.charAt(0))) {
          return false;
        }
        numbers = cpf.substring(0, 10);
        sum = 0;

        for (i = 11; i > 1; i--) {
          sum += numbers.charAt(11 - i) * i;
        }
        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

        if (result !== Number(digits.charAt(1))) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    }
  }

  cpf_mask(v) {
    v = v.replace(/\D/g, ""); //Remove tudo o que não é dígito
    v = v.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
    v = v.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
    //de novo (para o segundo bloco de números)
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); //Coloca um hífen entre o terceiro e o quarto dígitos
    return v;
  }

  cnpj(v) {
    v = v.replace(/\D/g, ""); //Remove tudo o que não é dígito
    v = v.replace(/^(\d{2})(\d)/, "$1.$2"); //Coloca ponto entre o segundo e o terceiro dígitos
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3"); //Coloca ponto entre o quinto e o sexto dígitos
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2"); //Coloca uma barra entre o oitavo e o nono dígitos
    v = v.replace(/(\d{4})(\d)/, "$1-$2"); //Coloca um hífen depois do bloco de quatro dígitos
    return v;
  }

  ngOnInit() {
    this.brandId = this.global.getBrand();

    if (this.navParams.get("email") != null && this.navParams.get("email") != "") {
      this.optin = true;
      this.email = this.navParams.get("email");
      this.firstname = this.navParams.get("firstname") || "";
      this.lastname = this.navParams.get("lastname") || "";
      this.facebook_id = this.navParams.get("facebook_id");
      let provider: EProvider = this.navParams.get("provider");
      this.google_id = provider == EProvider.GOOGLE ? this.navParams.get("id_in_provider") : "";
      this.apple_id = provider == EProvider.APPLE ? this.navParams.get("id_in_provider") : "";
      this.facebook_id = provider == EProvider.FACEBOOK ? this.navParams.get("id_in_provider") : "";

      this.email2 = this.navParams.get("email");

      this.gcomwebService.getUncompletedUser(this.email, "").then((results: any) => {
        if (results.data != null) {
          this.firstname = this.firstname || results.data.nome_completo.split(" ")[0];
          this.lastname = this.lastname || results.data.nome_completo.split(" ").slice(1).join(" ");
          this.CPFCPNJ = this.format(results.data.cpf);

          if (this.CPFCPNJ == null || parseInt(this.CPFCPNJ) == 0) this.isCPFCPNJInformed = false;
          else this.isCPFCPNJInformed = true;

          if (results.data.telefones.length > 0) {
            this.celular = results.data.telefones[0].ddd.toString() + results.data.telefones[0].numero;
            this.celular2 = results.data.telefones[0].ddd.toString() + results.data.telefones[0].numero;
            this.formatphone(1);
            this.formatphone(2);
          }

          if (results.data.data_nascimento != null && results.data.data_nascimento != "") {
            this.datanascimento = results.data.data_nascimento.substring(0, 2) + "/" + results.data.data_nascimento.substring(3, 5) + "/" + results.data.data_nascimento.substring(6, 10);
          }

          this.senha = results.data.senha;
          this.senha2 = results.data.senha;
          this.id_cliente = results.data.id_cliente;
          // this.facebook = user.facebook;
        } else {
          this.UIAlertService.presentAlert("Ops!", "", results.message, ["OK"]);
        }
      });
    } else {
      this.storage.get("user" + this.global.storageId()).then((user) => {
        this.firstname = user.nome_completo.split(" ")[0];
        this.lastname = user.nome_completo.split(" ").slice(1).join(" ");
        this.email = user.email1;
        this.CPFCPNJ = this.format(user.cpf_cnpj);
        this.aceitaEmail = user.ic_aceita_email == "S";
        this.aceitaSms = user.ic_aceita_sms == "S";

        if (this.CPFCPNJ == null || parseInt(this.CPFCPNJ) == 0) this.isCPFCPNJInformed = false;
        else this.isCPFCPNJInformed = true;

        if (user.telefones.length > 0) {
          this.celular = user.telefones[0].ddd.toString() + user.telefones[0].numero;
          this.celular2 = user.telefones[0].ddd.toString() + user.telefones[0].numero;
          this.formatphone(1);
          this.formatphone(2);
        }

        // Comentei essa regra que foi adicionada, porque está formatando errado a data
        // var datanas = new Date(user.data_nascimento);
        // let dataAtualFormatada = (this.adicionaZero(datanas.getFullYear().toString()) + "-" + (this.adicionaZero(datanas.getMonth()+1).toString()) + "-" + this.adicionaZero(datanas.getDate()));

        this.datanascimento = user.data_nascimento.substring(0, 2) + "/" + user.data_nascimento.substring(3, 5) + "/" + user.data_nascimento.substring(6, 10);

        this.senha = user.senha;
        this.senha2 = user.senha;
        this.id_cliente = user.id_cliente;
        this.facebook = user.facebook;
        this.IdOracle = user.IdOracle;
      });
    }
    if (this.CPFCPNJ == undefined) {
      this.primeiroAcesso = true;
    } else {
      this.primeiroAcesso = false;
    }

    if (!!this.navParams.get("emailInput")) {
      setTimeout(() => {
        this.email = this.navParams.get("emailInput");
        this.email2 = this.navParams.get("emailInput");
      }, 500);
    }
  }

  adicionaZero(numero) {
    if (numero <= 9) return "0" + numero;
    else return numero;
  }
  checkoptin() {
    this.processingRegister = true;

    //this.checkdatemobile();

    if (this.loyaltyMode == "CASHBACK" && this.loyaltyCompany == "GCOM" && !this.optin && this.email != null && this.email != "") {
      this.gcomwebService.getUncompletedUser(this.email, "").then((results: any) => {
        if (results.data != null) {
          this.optin = true;
          this.IdOracle = results.data.id_cliente;
        }

        this.register();
      });
    } else {
      this.register();
    }
  }

  register() {
    this.processingRegister = true;
    // this.global.loadBrand()
    if (this.firstname == null || this.lastname == null || this.firstname == "" || this.lastname == "") {
      // this.UIAlertService.presentToast('Favor preenher seu Nome Completo', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher seu Nome Completo", null);
      this.processingRegister = false;
      return;
    }

    if (this.email == null || this.email == "") {
      // this.UIAlertService.presentToast('Favor preenher seu E-mail', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher seu E-mail", null);
      this.processingRegister = false;
      return;
    }

    if (!EmailValidator.validate(this.email)) {
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher seu E-mail", null);
      this.processingRegister = false;
      return;
    }

    if (this.email.indexOf("@") == -1 || this.email.substring(this.email.indexOf("@")).indexOf(".") == -1) {
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher seu E-mail", null);
      this.processingRegister = false;
      return;
    }
    if (!this.CPFCPNJ || this.CPFCPNJ.length != 14) {
      // this.UIAlertService.presentToast('Favor preenher seu CPF/CNPJ', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher seu CPF/CNPJ", null);
      this.processingRegister = false;
      return;
    }

    if (this.celular == null || this.celular == "") {
      // this.UIAlertService.presentToast('Favor preenher seu número de Celular', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher seu número de Celular", null);
      this.processingRegister = false;
      return;
    }

    if (this.datanascimento == null) {
      // this.UIAlertService.presentToast('Favor preenher sua Data de Nascimento', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher sua Data de Nascimento", null);
      this.processingRegister = false;
      return;
    }

    if (this.datanascimento.length < 10) {
      // this.UIAlertService.presentToast('Favor preenher sua Data de Nascimento', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor digitar uma Data de Nascimento válida. A data deve estar no seguinte formato: dd/mm/aaaa", null);
      this.processingRegister = false;
      return;
    }

    if (this.celular.length < 15) {
      // this.UIAlertService.presentToast('Favor digitar o número celular com DDD.', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor digitar o número celular com DDD.", null);
      this.processingRegister = false;
      return;
    }

    if (this.id_cliente == null && !(this.apple_id || this.facebook_id || this.google_id) && (this.senha == null || this.senha == "")) {
      // this.UIAlertService.presentToast('Favor preenher sua senha', 5000, 'warning');
      this.UIAlertService.presentAlert("Ops!", "", "Favor preencher sua senha", null);
      this.processingRegister = false;
      return;
    }

    var ddd = Number(this.celular.replace(/ /g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\-/g, "").substring(0, 2));
    var cel = Number(this.celular.replace(/ /g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\-/g, "").substring(2));

    if (this.id_cliente == null && !this.termsAgreed) {
      this.UIAlertService.presentAlert("Ops!", "", "Favor ler e concordar com os Termos de Uso e Políticas de Privacidade para se registrar.", null);
      this.processingRegister = false;
      return;
    }

    if (this.id_cliente == null) {
      this.UIAlertService.presentLoading();

      this.gcomwebService.getUncompletedUser("", String(ddd) + String(cel)).then(async (results: any) => {
        var IdOracle = 0;
        if (results.data != null) {
          this.optin = true;
          IdOracle = results.data.id_cliente;
        }

        //controle passado para func registerFunc callback

        // if(window.location.href.includes("convite-cadastro")){

        //   this.cadastroMGM(results,ddd,cel)
        //   return
        // }

        const registerData: IDataRegister = {
          first_name: this.firstname,
          last_name: this.lastname,
          cpf_cnpj: this.CPFCPNJ,
          password: this.senha,
          data_nascimento: this.datanascimento,
          email: this.email,
          ddd: ddd,
          cel: cel,
          facebook_id: this.facebook_id,
          google_id: this.google_id,
          apple_id: this.apple_id,
          id_oracle: this.IdOracle,
          aceita_email: this.aceitaEmail,
          aceitaSms: this.aceitaSms,
          aceita_termos_fidelidade: this.termsAgreed,
          app: "PWA",
        };

        if (!this.EmailOrPhoneConfirmed && (this.global.confirmEmail || this.global.confirmPhone)) {
          await this.presentModalConfirmEmailOrPhone(registerData)
            .then(async (res) => {
              if (res?.return === "success") {
                this.EmailOrPhoneConfirmed = true;
                this.sendRegisterUser(registerData);
              } else {
                this.UIAlertService.dismissLoading();
                this.processingRegister = false;
                return;
              }
            })
            .catch((err) => {
              this.UIAlertService.dismissLoading();
              this.processingRegister = false;
              return;
            });
        } else {
          this.sendRegisterUser(registerData);
        }
        //let x : IRegisterResult = await Function.call(this.navParams.get("registerFunc"), registerData)
      });
    } else {
      this.updateUser();
    }
  }

  async sendRegisterUser(registerData) {
    let y: IRegisterResult = await this.navParams.get("registerFunc")(registerData, this.gcomwebService);

    if (y.success) {
      this.UIAlertService.presentToast("Cadastro feito com sucesso!", 5000, "primary");

      if (this.global.googleAnalytics == true || this.global.enhancedCommerce == true) {
        var provider = "Gcom";

        if (this.google_id != null && this.google_id != "0") provider = "google";

        if (this.apple_id != null && this.apple_id != "0") provider = "apple";

        signup(provider, registerData.id_oracle, registerData.email, registerData.first_name + registerData.last_name, registerData.ddd + registerData.cel, this.router.url, provider);
      }

      this.dismiss("ok");
    } else {
      this.UIAlertService.presentAlert("Ops!", "", y.error, ["OK"]);
    }

    this.UIAlertService.dismissLoading();
    this.processingRegister = false;
  }

  updateUser() {
    var ddd = Number(this.celular.replace(/ /g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\-/g, "").substring(0, 2));
    var cel = Number(this.celular.replace(/ /g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\-/g, "").substring(2));
    var loading;
    this.UIAlertService.presentLoading();
    this.gcomwebService
      .updateProfile(
        this.id_cliente,
        this.firstname + " " + this.lastname,
        this.unFormat(this.CPFCPNJ),
        this.datanascimento,
        this.email,
        ddd,
        cel,
        this.optin ? this.senha : "",
        true,
        this.IdOracle,
        this.aceitaEmail,
        this.aceitaSms
      )
      .then(async (results: any) => {
        if (results.status == "ok") {
          const user = await this.authService.getUserInfo(true);

          if (user) {
            this.UIAlertService.presentToast("Cadastro alterado com sucesso", 5000, "primary");
            this.dismiss("ok");
          } else {
            this.UIAlertService.presentAlert("Atenção", "", "Tivemos um problema para recarregar seus dados, por favor, faça login novamente!", null);
          }
        } else if (results.status == "error") {
          this.UIAlertService.presentAlert("Ops!", "", results.message, ["OK"]);
        }
      })
      .catch((error: any) => {
        this.UIAlertService.presentAlert("Ops!", "", error.message, ["OK"]);
      })
      .finally(() => {
        this.processingRegister = false;
        this.UIAlertService.dismissLoading();
      });
  }

  dismiss(action) {
    this.modalCtrl.dismiss({
      return: action,
      email: this.email,
      senha: this.senha,
    });
  }

  soLetra(ev) {
    if ((ev.keyCode >= 65 && ev.keyCode <= 90) || (ev.keyCode >= 97 && ev.keyCode <= 122) || ev.keyCode == 32 || ev.keyCode == 46) {
      return true;
    } else {
      return false;
    }
  }

  blurNome() {
    this.firstname = this.firstname.replace(/[^a-zA-Z\s]+/g, "");
  }

  blurSobrenome() {
    this.lastname = this.lastname.replace(/[^a-zA-Z\s]+/g, "");
  }

  soNumero(ev) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(ev.charCode);

    if (!pattern.test(inputChar)) {
      ev.preventDefault();
    }
  }

  soNumeroCPF(ev) {
    if (ev.target.value.length >= 14) ev.preventDefault();

    this.soNumero(ev);
  }

  openUseTerms() {
    this.presentModalUseTerms();
  }

  openPrivacyTerms() {
    this.presentModalPrivacyTerms();
  }

  onFocusOut(x) {
    // Formato da data
    if (x.target.value.length < 10) {
      this.UIAlertService.presentAlert("Ops!", "", "Data incompleta.", null);
      (<HTMLInputElement>document.getElementById("data_nascimento")).value = "";
      return;
    }
    if (x.target.value != "" + x.target.value.substring(0, 2) + "/" + x.target.value.substring(3, 5) + "/" + x.target.value.substring(6, 10)) {
      this.UIAlertService.presentAlert("Ops!", "", "Formato de data inválido.", null);
      (<HTMLInputElement>document.getElementById("data_nascimento")).value = "";
      return;
    }

    // Validação de dia e mês
    if (parseInt(x.target.value.substring(0, 2)) < 1 || parseInt(x.target.value.substring(0, 2)) > 31) {
      this.UIAlertService.presentAlert("Ops!", "", "Dia inválido.", null);
      (<HTMLInputElement>document.getElementById("data_nascimento")).value = "";
      return;
    }
    // Fevereiro acima de 28 dias.
    if (parseInt(x.target.value.substring(0, 2)) > 28 && x.target.value.substring(3, 5) == "02") {
      this.UIAlertService.presentAlert("Ops!", "", "Dia inválido.", null);
      (<HTMLInputElement>document.getElementById("data_nascimento")).value = "";
      return;
    }
    //Meses com menos de 31 dias
    if (
      parseInt(x.target.value.substring(0, 2)) > 30 &&
      (x.target.value.substring(3, 5) == "04" || x.target.value.substring(3, 5) == "06" || x.target.value.substring(3, 5) == "09" || x.target.value.substring(3, 5) == "11")
    ) {
      this.UIAlertService.presentAlert("Ops!", "", "Dia inválido.", null);
      (<HTMLInputElement>document.getElementById("data_nascimento")).value = "";
      return;
    }
    //Mes
    if (parseInt(x.target.value.substring(3, 5)) > 12) {
      this.UIAlertService.presentAlert("Ops!", "", "Mês inválido.", null);
      (<HTMLInputElement>document.getElementById("data_nascimento")).value = "";
      return;
    }

    //Verifica ano.
    var anoHoje = new Date().getFullYear();
    var anoInput = parseInt(x.target.value.substring(6, 10));
    if (anoHoje - anoInput > 100 || anoHoje - anoInput < 5) {
      this.UIAlertService.presentAlert("Ops!", "", "Ano inválido.", null);
      (<HTMLInputElement>document.getElementById("data_nascimento")).value = "";
      return;
    }
  }

  checkdatemobile() {
    var anoHoje = new Date().getFullYear();
    if (document.querySelector("ion-datetime")) {
      var dataInputUsuario = document.querySelector("ion-datetime").value;
      var dataPipe = new DatePipe("pt-BR");

      if (dataInputUsuario.length < 10) {
        this.UIAlertService.presentAlert("Ops!", "", "Data incompleta.", null);
        return;
      }

      var mesInput = parseInt(dataInputUsuario.substring(5, 7));
      if (mesInput > 12 || mesInput < 1) {
        this.UIAlertService.presentAlert("Ops!", "", "Formato de mês inválido.", null);
        return;
      }

      this.data_hoje = dataPipe.transform(dataInputUsuario, "yyyy/MM/dd");
      var anoInput = parseInt(this.data_hoje.substring(0, 4));
      if (anoHoje - anoInput <= 100 && anoHoje - anoInput > 5) {
        //this.datanascimento = this.data_hoje
      } else {
        this.UIAlertService.presentAlert("Ops!", "", "Data inválida.", null);
        return;
      }
    } else {
      return;
    }
  }

  keyPressNumbers(event) {
    var charCode = event.which ? event.which : event.keyCode;
    // Only Numbers 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  onKeyDown(event) {
    var charCode = event.which ? event.which : event.keyCode;

    if (charCode != 8) {
      if (this.datanascimento.length == 2) this.datanascimento = this.datanascimento + "/";
      else if (this.datanascimento.length == 5) this.datanascimento = this.datanascimento + "/";
      event.target.value = this.datanascimento;
    }
  }

  onKeyDownCPF(event) {
    var charCode = event.which ? event.which : event.keyCode;
    if (event.keyCode == 8) {
      if (event.target.value.lastIndexOf("-") >= 0) {
        if (event.target.value.lastIndexOf("-") == event.target.value.length - 2) event.target.value = event.target.value.substring(0, event.target.value.lastIndexOf("-") + 1);
      }

      if (event.target.value.lastIndexOf(".") >= 0) {
        if (event.target.value.lastIndexOf(".") == event.target.value.length - 2) event.target.value = event.target.value.substring(0, event.target.value.lastIndexOf(".") + 1);
      }
    }

    if (charCode != 8) {
      if (this.CPFCPNJ.length == 3 || this.CPFCPNJ.length == 7) this.CPFCPNJ = this.CPFCPNJ + ".";
      else if (this.CPFCPNJ.length == 11) this.CPFCPNJ = this.CPFCPNJ + "-";
      event.target.value = this.CPFCPNJ;
    }
  }

  cadastroMGM(results, ddd, cel) {
    let id = window.location.href;
    var id_uncrypt = atob(id.split("/")[4]);
    var id_config_uncrypt = atob(id.split("/")[5]);
    this.gcomwebService.registerMGM(
      this.firstname + " " + this.lastname,
      this.unFormat(this.CPFCPNJ),
      this.senha,
      this.datanascimento,
      this.email,
      ddd,
      cel,
      this.facebook_id,
      this.google_id,
      this.apple_id,
      true,
      this.IdOracle,
      this.aceitaEmail,
      this.aceitaSms,
      "PWA",
      id_uncrypt,
      id_config_uncrypt
    );

    if (true) {
      this.UIAlertService.presentToast("Cadastro feito com sucesso!", 5000, "primary");
      if (this.global.googleAnalytics == true) {
        var celular = "";
        if (results.data.telefones.length > 0) {
          celular = String(results.data.telefones[0].ddd) + String(results.data.telefones[0].numero);
        }
      }
      this.dismiss("ok");
    } else if (results.status == "error") {
      this.UIAlertService.presentAlert("Ops!", "", results.message, ["OK"]);
    }
    this.UIAlertService.dismissLoading();
    this.processingRegister = false;
    this.updateUser();
  }

  bloquearColar(event: ClipboardEvent) {
    event.preventDefault(); // Isso cancela a ação de colar
  }
}
