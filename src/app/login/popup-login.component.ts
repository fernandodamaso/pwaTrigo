import { Component, OnInit, Input } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { UIAlertService } from "../services/uialert.service";
import { GlobalService } from "../services/global.service";
import { ModalController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { ForgotPasswordComponent } from "../forgot-password/forgot-password.component";
import { RegisterComponent } from "../register/register.component";
import * as EmailValidator from "email-validator";
import * as firebase from "firebase";
import { Router } from "@angular/router";
import { EProvider } from "../login/EProvider";
import { debug } from "console";
import { IDataRegister } from "../models/IDataRegister";
import { GcomwebService } from "../services/gcomweb.service";
import { IRegisterResult } from "../models/IRegisterResult";
import { CadastrouGanhouComponent } from "../cadastrou-ganhou/cadastrou-ganhou.component";
import { BenefitsService } from "../services/benefits.service";

declare function ecommerce_login(path, method): any;

@Component({
  selector: "app-popup-login-b",
  templateUrl: "./popup-login.component.html",
  styleUrls: ["./popup-login.component.scss"],
})
export class PopupLoginBComponent implements OnInit {
  public loginPhrase: string;

  private _tempEmail: string;

  public set tempEmail(value: string) {
    this._tempEmail = value;
    this.emailValidation = "";
  }

  public get tempEmail(): string {
    return this._tempEmail;
  }

  public emailValidation: string;

  public login_data: { email?: string; password?: string } = {};

  public userExistis: boolean = false;

  public passwordIsRequested: boolean = false;

  public emailSuggestionsList: string[] = [];

  public fastAccessCodeIsRequested: boolean = false;

  private registrationInProgress: boolean = false;

  public loadInProgress: boolean = false;

  public brandId;

  @Input() rotaMgM = false;

  @Input("logo_url")
  public logo_url: string;

  @Input("redirect_url")
  public redirect_param: string;

  @Input("register_func")
  public register_func: Function;

  constructor(
    private uiAlertService: UIAlertService,
    private storage: Storage,
    private global: GlobalService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private router: Router,
    private benefits: BenefitsService
  ) {}

  ngOnInit() {
    this.brandId = this.global.id_marca;

    if (this.brandId == 88) this.loginPhrase = "Informe seu e-mail para prosseguir";
  }

  async googleSignin() {
    const response = await firebase.default
      .auth()
      .signInWithPopup(new firebase.default.auth.GoogleAuthProvider())
      .then(async (r) => {
        await this.authService.logout();

        this.loadInProgress = true;
        let userExistis = await this.authService.userExistis(r.user.email, EProvider.GOOGLE, (r.additionalUserInfo.profile as any).id);
        this.loadInProgress = false;

        if (userExistis == null) {
          this.uiAlertService.presentAlert("Ops!", "", "Não conseguimos buscar os dados desse cadastro.", ["OK"]);
          return;
        }

        if (!userExistis.existis) {
          if (r.user.displayName != null) {
            let nameParts = r.user.displayName.split(" ");

            this.registrationInProgress = true;
            await this.openModalRegister(r.user.email, nameParts[0] || "", nameParts[1] || "", EProvider.GOOGLE, (r.additionalUserInfo.profile as any).id);
            this.registrationInProgress = false;
          } else {
            this.registrationInProgress = true;
            await this.openModalRegister(r.user.email, "", "", EProvider.GOOGLE, (r.additionalUserInfo.profile as any).id);
            this.registrationInProgress = false;
          }
        }

        this.authService.authenticate(await r.user.getIdToken()).then((u) => {
          this.loadAndStoreUserInfo("google");
        });
      });
  }

  async appleSignin() {
    const provider = new firebase.default.auth.OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");

    const response = await firebase.default
      .auth()
      .signInWithPopup(provider)
      .then(async (r) => {
        await this.authService.logout();

        this.loadInProgress = true;
        let userExistis = await this.authService.userExistis(r.user.email, EProvider.APPLE, (r.additionalUserInfo.profile as any).sub);
        this.loadInProgress = false;

        if (userExistis == null) {
          this.uiAlertService.presentAlert("Ops!", "", "Não conseguimos buscar os dados desse cadastro.", ["OK"]);
          return;
        }

        if (!userExistis.existis) {
          if (r.user.displayName != null) {
            let nameParts = r.user.displayName.split(" ");

            this.registrationInProgress = true;
            await this.openModalRegister(r.user.email, nameParts[0] || "", nameParts[1] || "", EProvider.APPLE, (r.additionalUserInfo.profile as any).sub);
            this.registrationInProgress = false;
          } else {
            this.registrationInProgress = true;
            await this.openModalRegister(r.user.email, "", "", EProvider.APPLE, (r.additionalUserInfo.profile as any).sub);
            this.registrationInProgress = false;
          }
        }

        await this.authService.authenticate(await r.user.getIdToken()).then((u) => {
          this.loadAndStoreUserInfo("apple");
        });
      });
  }

  async gcomSignin() {
    if (!this.login_data.email) {
      this.uiAlertService.presentAlert("Ops!", "", "Favor preencher o e-mail cadastrado para realizar o login.  ", null);
      return;
    }

    if (!this.login_data.password) {
      this.uiAlertService.presentAlert("Ops!", "", "Favor preencher a senha cadastrada para realizar o login.  ", null);
      return;
    }

    this.loadInProgress = true;
    await this.authService.login(this.login_data.email, this.login_data.password);

    if (!(await this.authService.userIsLogged())) {
      this.uiAlertService.presentAlert("Ops!", "", "Email ou senha inválidos.", ["OK"]);
      this.loadInProgress = false;
      return;
    }

    await this.loadAndStoreUserInfo("Gcom");
  }

  async loadAndStoreUserInfo(provider: string) {
    console.log("loadAndStoreUserInfo");

    const user = await this.authService.getUserInfo(true);

    if (!user) {
      this.uiAlertService.presentAlert("Ops!", "", "Tivemos um problema ao carregar seus dados.", ["OK"]);
      this.loadInProgress = false;
      return;
    }

    await this.storage.set("user" + this.global.storageId(), user);
    this.loadInProgress = false;

    this.uiAlertService.presentToast("Bem vindo " + user.nome_completo, 3000, "primary");
    this.modalCtrl.dismiss({ return: "ok" });

    if (this.global.googleAnalytics == true || this.global.enhancedCommerce == true) ecommerce_login(this.router.url, provider);
    //signup(provider, user.id_cliente, user.email1, user.nome_completo, user.telefones[0]?.ddd + user.telefones[0]?.numero);

    if (!!this.redirect_param) this.router.navigate([this.redirect_param]);
  }

  async emailEnter(ev) {
    if ((!(ev.key == "@") && !this.tempEmail.includes("@")) || ev.key == "Enter" || window.innerWidth <= 1024) {
      ev.target.setAttribute("list", "");
      return;
    } else ev.target.setAttribute("list", "suggestions");

    const emailParts = ev.target.value.split("@");

    const email = emailParts[0];
    let domain = emailParts[1] || null;

    const emailDomains = ["gmail.com", "hotmail.com", "yahoo.com.br", "outlook.com", "icloud.com", "bol.com.br", "uol.com.br", "live.com", "terra.com.br", "yahoo.com", "ig.com.br"];
    this.emailSuggestionsList = emailDomains.filter((d) => domain == null || d.startsWith(domain)).map((d) => email + "@" + d) || [];

    if (ev.target.value == "" || this.emailSuggestionsList.some((e) => e == ev.target.value) || window.innerWidth <= 1024) {
      this.emailSuggestionsList = [];
      ev.target.setAttribute("list", "");
    }
  }

  async emailChange(ev) {
    // if(this.tempEmail == "" || this.tempEmail == null) {
    this.login_data = {};
    this.passwordIsRequested = false;
    this.userExistis = false;
    return;
    // }
  }

  async requestPassOrRegister() {
    await this.authService.logout();
    if (this.passwordIsRequested) return;
    this.login_data.email = "";

    if (!this._tempEmail) return;
    if (!EmailValidator.validate(this._tempEmail)) {
      this.emailValidation = "E-mail inválido";
      return;
    }

    this.loadInProgress = true;
    const userExistis = await (await this.authService.userExistis(this._tempEmail)).existis;
    this.loadInProgress = false;

    if (userExistis == null) {
      this.uiAlertService.presentAlert("Ops!", "", "Não conseguimos buscar os dados desse cadastro.", ["OK"]);
      this.userExistis = userExistis;
      return;
    }

    if (this.registrationInProgress) return;

    if (!userExistis) {
      this.registrationInProgress = true;
      await this.openModalRegister(this._tempEmail, "", "", EProvider.NONE, "");
      this.registrationInProgress = false;
      this.userExistis = userExistis;
      return;
    }
    if (this.register_func && this.register_func.name == "cadastromgm") {
      this.uiAlertService.presentAlert(
        "Usuário já cadastrado",
        "",
        "Vimos que você já é um cliente cadastrado. Faça seu login pra ganhar cashback na sua compra! Ah, e aproveite pra indicar amigos e ganhar ainda mais benefícios",
        ["OK"]
      );
    }

    this.login_data.email = this._tempEmail;
    this.passwordIsRequested = true;
    this.userExistis = userExistis;
  }

  async openModalRegister(email: string, firstname: string, lastname: string, provider: EProvider, providerId: string) {
    const modal = await this.modalCtrl.create({
      component: RegisterComponent,
      cssClass: "popup-register",
      componentProps: { emailInput: email, firstname, lastname, provider, id_in_provider: providerId, registerFunc: this.register_func || this.cadastro },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data?.return != "ok" || !data?.email || !data?.senha) return;

    this.login_data.email = data.email;
    this.login_data.password = data.senha;

    setTimeout(() => {
      this.gcomSignin().then(async () => {
        if (!!this.redirect_param) this.router.navigate([this.redirect_param]);
        if (this.global.CadastrouGanhou == true) {
          let user = await this.authService.getUserInfo();
          await this.gerarCashback(user).then(async (data) => {
            if (data.data != false) {
              await this.openCadastrouGahou();
            }
          });
          //chamada api aqui benefts cashback 5 reais.
          //se a api retornar sucesso mostrar modal
          // await this.openCadastrouGahou()
        }
        return data;
      });
    }, 1000);
  }

  async openCadastrouGahou() {
    const modalCadastrou = await this.modalCtrl.create({
      component: CadastrouGanhouComponent,
      componentProps: {},
      cssClass: "cadastrou-ganhou",
      backdropDismiss: false,
    });

    await modalCadastrou.present();
    await modalCadastrou.onWillDismiss();
  }

  async gerarCashback(user: any) {
    let cashback = {
      id_oracle: user.idOracle,
      id_cliente: 0,
      id_mrc: user.id_marca,
      id_loja: user.id_shopping,
      valor_cashback: 5,
      motivo: "Cadastrou Ganhou",
      tipo: "T",
    };

    return await this.benefits.insertCashback(cashback);
  }

  async openModalForgotPassword() {
    console.log("openModalForgotPassword");

    const modal = await this.modalCtrl.create({
      component: ForgotPasswordComponent,
      componentProps: { emailInput: this._tempEmail },
      backdropDismiss: false,
    });

    await modal.present();
    await modal.onWillDismiss();
  }

  async fastAccessByEmailRequest() {
    console.log("fastAccessByEmailRequest");

    if (!this.login_data.email) return;

    this.passwordIsRequested = false;
    this.loadInProgress = true;
    this.fastAccessCodeIsRequested = true;

    try {
      const success = await this.authService.requestFastAccessEmail(this.login_data.email);
      if (!success) {
        this.uiAlertService.presentAlert("Ops!", "", "Tivemos um problema ao enviar o email de acesso rápido.", ["OK"]);
        return;
      }

      this.uiAlertService.presentAlert("Sucesso", "", "Enviamos um email com o link de acesso rápido a sua conta.", ["OK"]);
    } catch (err) {
    } finally {
      this.fastAccessCodeIsRequested = false;
      this.loadInProgress = false;
      this.passwordIsRequested = true;
    }
  }

  async cadastro(dataregister: IDataRegister, service: GcomwebService): Promise<IRegisterResult> {
    if (!dataregister.apple_id) {
      dataregister.apple_id = "";
    }

    if (!dataregister.google_id) {
      dataregister.google_id = "";
    }
    if (!dataregister.facebook_id) {
      dataregister.facebook_id = "";
    }
    if (!dataregister.id_oracle) {
      dataregister.id_oracle = 0;
    }

    let result: any = await service.register(
      dataregister.first_name + " " + dataregister.last_name,
      dataregister.cpf_cnpj,
      dataregister.password,
      dataregister.data_nascimento,
      dataregister.email,
      dataregister.ddd,
      dataregister.cel,
      dataregister.facebook_id,
      dataregister.google_id,
      dataregister.apple_id,
      dataregister.aceita_termos_fidelidade,
      dataregister.id_oracle,
      dataregister.aceita_email,
      dataregister.aceitaSms,
      dataregister.app,
      "PWA_REGISTER"
    );
    console.log(result);
    if (result.status == "ok") return { success: true, error: "" };

    return { success: false, error: result.message };
  }
}
