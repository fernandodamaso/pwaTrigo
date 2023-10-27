import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { UIAlertService } from "../services/uialert.service";
import { GlobalService } from "../services/global.service";
import { ModalController, Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { ForgotPasswordComponent } from "../forgot-password/forgot-password.component";
import { RegisterComponent } from "../register/register.component";
import { ActivatedRoute, Params, Router } from "@angular/router";
import * as EmailValidator from "email-validator";
import * as firebase from "firebase";
import { EProvider } from "./EProvider";
import { IDataRegister } from "../models/IDataRegister";
import { GcomwebService } from "../services/gcomweb.service";
import { IRegisterResult } from "../models/IRegisterResult";
import { conviteService } from "../services/convite/convite.service";
import { Convite } from "../models/Convite";
import { Observable } from "rxjs";
import { Cliente } from "../models/Cliente";

// declare function signup(provider, userId, email, nome, telefone): any;

@Component({
  selector: "app-loginmgm",
  templateUrl: "./login-mgm.page.html",
  styleUrls: ["./login-mgm.page.scss"],
})
export class loginMgmPage implements OnInit {
  resetToInitialState() {
    this.userExistis = false;
    this._tempEmail = "";
    this.emailSuggestionsList = [];
    this.emailValidation = "";
    this.passwordIsRequested = false;
    this.login_data = {};
    this.loadInProgress = false;
    this.registrationInProgress = false;
    this.fastAccessCodeIsRequested = false;
  }

  public userExistis: boolean = false;

  public loginPhrase: string;

  private _tempEmail: string;

  public emailSuggestionsList: string[];

  public set tempEmail(value: string) {
    this._tempEmail = value;
    this.emailValidation = "";
  }

  public get tempEmail(): string {
    return this._tempEmail;
  }
  public fieldBackgroundColor = "#000000";
  public emailValidation: string;

  public passwordIsRequested: boolean = false;

  public login_data: { email?: string; password?: string } = {};

  public loadInProgress: boolean = false;

  private registrationInProgress: boolean = false;

  public fastAccessCodeIsRequested: boolean = false;

  public fastAccessCode: string;

  public brandId;
  public username: string = "Desculpe, não conseguimos pegar seu indicador.";

  convite: Convite;
  convite$: Observable<Convite>;

  cliente$: Observable<Cliente>;

  constructor(
    private conviteService: conviteService,
    private uiAlertService: UIAlertService,
    private storage: Storage,
    private global: GlobalService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform,
    private gcomwebService: GcomwebService
  ) {}

  async ngOnInit(): Promise<void> {
    this.brandId = this.global.id_marca;

    this.disableCadastrouGanhouMGM();
    this.route.queryParams.subscribe((params) => {
      if (params["email"]) {
        this._tempEmail = params["email"];
        this.requestPassOrRegister();
      }
    });

    this.getUserIndicador();
  }

  async googleSignin() {
    const response = await firebase.default
      .auth()
      .signInWithPopup(new firebase.default.auth.GoogleAuthProvider())
      .then(async (r) => {
        this.loadInProgress = true;
        let userExistis = await await this.authService.userExistis(r.user.email, EProvider.GOOGLE, (r.additionalUserInfo.profile as any).id);
        this.loadInProgress = false;

        if (userExistis == null) {
          this.uiAlertService.presentAlert("Ops!", "", "Não conseguimos buscar os dados desse cadastro.", ["OK"]);
          return;
        }

        // if(userExistis.existis && !userExistis.social){
        //   this.uiAlertService.presentAlert('Ops!', '', "No momento você não pode entrar usando sua conta Google.\nPor favor, use email e senha cadastrados!", ['OK']);
        //   return;
        // }

        if (!userExistis.existis) {
          let nameParts = r.user.displayName.split(" ");

          this.registrationInProgress = true;
          await this.openModalRegister(r.user.email, nameParts[0] || "", nameParts[1] || "", EProvider.GOOGLE, (r.additionalUserInfo.profile as any).id);
          this.registrationInProgress = false;
        }

        await this.authService.logout();
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
        this.loadInProgress = true;
        let userExistis = await await this.authService.userExistis(r.user.email, EProvider.APPLE, (r.additionalUserInfo.profile as any).sub);
        this.loadInProgress = false;

        if (userExistis == null) {
          this.uiAlertService.presentAlert("Ops!", "", "Não conseguimos buscar os dados desse cadastro.", ["OK"]);
          return;
        }

        // if(userExistis.existis && !userExistis.social){
        //   this.uiAlertService.presentAlert('Ops!', '', "No momento você não pode entrar usando sua conta Apple.\nPor favor, use email e senha cadastrados!", ['OK']);
        //   return;
        // }

        if (!userExistis.existis) {
          let nameParts = r.user.displayName.split(" ");

          this.registrationInProgress = true;
          await this.openModalRegister(r.user.email, nameParts[0] || "", nameParts[1] || "", EProvider.APPLE, (r.additionalUserInfo.profile as any).sub);
          this.registrationInProgress = false;
        }

        await this.authService.logout();
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
      this.login_data.password = "";
      this.loadInProgress = false;
      return;
    }

    await this.loadAndStoreUserInfo("Gcom");
  }

  async loadAndStoreUserInfo(provider: string) {
    const user = await this.authService.getUserInfo(true);
    this.loadInProgress = false;

    this.resetToInitialState();
    if (!user) {
      this.uiAlertService.presentAlert("Ops!", "", "Tivemos um problema ao carregar seus dados.", ["OK"]);
      return;
    }

    await this.storage.set("user" + this.global.storageId(), user);

    this.uiAlertService.presentToast("Bem vindo " + user.nome_completo, 3000, "primary");
    this.router.navigate(["tabs/cardapioapp"]);

    // if (this.global.googleAnalytics == true || this.global.enhancedCommerce == true)
    //   signup(provider, user.id_cliente, user.email1, user.nome_completo, (user.telefones[0]?.ddd + user.telefones[0]?.numero));
  }

  async requestPassOrRegister() {
    console.log(this.passwordIsRequested);
    if (this.passwordIsRequested) return;
    this.login_data.email = "";

    console.log(this._tempEmail);

    if (!this._tempEmail) return;
    if (!EmailValidator.validate(this._tempEmail)) {
      this.emailValidation = "E-mail inválido";
      return;
    }

    this.loadInProgress = true;
    const userExistis = (await this.authService.userExistis(this._tempEmail)).existis;
    this.loadInProgress = false;

    if (userExistis == null) {
      this.uiAlertService.presentAlert("Ops!", "", "Não conseguimos buscar os dados desse cadastro.", ["OK"]);
      this.userExistis = userExistis;
      return;
    }

    if (this.registrationInProgress) {
      this.userExistis = userExistis;
      return;
    }

    if (!userExistis) {
      this.registrationInProgress = true;
      const data = await this.openModalRegister(this._tempEmail, "", "", EProvider.NONE, "");
      this.registrationInProgress = false;

      if (data.return == "ok") {
        await this.authService.login(data.email, data.senha);

        if (!(await this.authService.getToken())) {
          this.uiAlertService.presentAlert("Ops!", "", "tivemos um probleminha. Faça login novamente!", ["OK"]);
          this.router.navigate(["tabs/login"]);
          return;
        }

        await this.authService.getUserInfo(true);
        this.router.navigate(["tabs/cardapioapp"]);
      }
    }

    this.login_data.email = this._tempEmail;
    this.userExistis = userExistis;

    this.passwordIsRequested = userExistis;
  }

  async openModalRegister(email: string, firstname: string, lastname: string, provider: EProvider, providerId: string) {
    const modal = await this.modalCtrl.create({
      component: RegisterComponent,
      componentProps: { emailInput: email, firstname, lastname, provider, id_in_provider: providerId },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    return data;
  }

  async openModalForgotPassword() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordComponent,
    });

    await modal.present();
    await modal.onWillDismiss();
  }

  // useMyPassword(){
  //   this.fastAccessCodeIsRequested = false;
  //   this.passwordIsRequested = true
  // }

  async emailEnter(ev) {
    if (this.platform.is("iphone") || this.platform.is("ipad") || this.platform.is("ios")) return;

    if ((!(ev.key == "@") && (!this._tempEmail || !this.tempEmail.includes("@"))) || ev.key == "Enter") {
      ev.target.setAttribute("list", "");
      ev.target.focus();
      return;
    } else ev.target.setAttribute("list", "suggestions");

    const emailParts = this.tempEmail.split("@");

    const email = emailParts[0];
    let domain = emailParts[1] || null;

    const emailDomains = ["gmail.com", "hotmail.com", "yahoo.com.br", "outlook.com", "icloud.com", "bol.com.br", "uol.com.br", "live.com", "terra.com.br", "yahoo.com", "ig.com.br"];

    this.emailSuggestionsList = emailDomains.filter((d) => domain == null || d.startsWith(domain)).map((d) => email + "@" + d) || [];

    if (ev.target.value == "" || this.emailSuggestionsList.some((e) => e == ev.target.value) || window.innerWidth <= 1024) {
      this.emailSuggestionsList = [];
      ev.target.setAttribute("list", "");
    }

    setTimeout(() => {
      ev.target.focus();
    }, 300);
  }

  async fastAccessByEmailRequest() {
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
      this.passwordIsRequested = true;
      this.loadInProgress = false;
    }
  }

  // async fastAccessByEmailRequest() {
  //   if (!this.login_data.email) return;

  //   this.passwordIsRequested = false;
  //   this.loadInProgress = true;

  //   try {
  //     const response = await this.authService.requestFastAccessCodeEmail(this.login_data.email);
  //     if(!response){
  //       this.fastAccessCodeIsRequested = false;
  //       this.passwordIsRequested = true;
  //       this.uiAlertService.presentAlert('Ops!', '', "Tivemos um problema ao solicitar o código de acesso rápido.", ['OK']);
  //       return;
  //     }

  //     this.fastAccessCodeIsRequested = true;

  //   } catch (err) {
  //     this.fastAccessCodeIsRequested = false;
  //     this.passwordIsRequested = true;
  //   }finally{
  //     this.loadInProgress = false;
  //   }
  // }

  async fastAccessSignin() {
    this.loadInProgress = true;
    await this.authService.loginByAccessCode(this.fastAccessCode);

    if (!(await this.authService.userIsLogged())) {
      this.uiAlertService.presentAlert("Ops!", "", "Código de acesso inválido.", ["OK"]);
      this.loadInProgress = false;
      return;
    }

    await this.loadAndStoreUserInfo("fast-access-code");
  }

  async cadastromgm(dataregister: IDataRegister, service: GcomwebService): Promise<IRegisterResult> {
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

    let location = window.location.href;
    var id = location.split("/")[4];
    var idIndicador = id ? atob(id) : null;
    var idConfiguracaoCrypt = location.split("/")[5];
    var idConfiguracaoUncrypt = idConfiguracaoCrypt ? atob(idConfiguracaoCrypt) : null;

    let result = await service.registerMGM(
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
      idIndicador,
      idConfiguracaoUncrypt
    );
    if (result.status == "ok") return { success: true, error: "" };

    return { success: false, error: result.message };
  }

  moverJanela() {
    document.getElementById("etapas").scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  getUserIndicador() {
    let id = window.location.href;
    var id_uncrypt = atob(id.split("/")[4]);
    this.cliente$ = this.gcomwebService.getClienteById(Number(id_uncrypt));
    this.cliente$.subscribe((data) => {
      this.username = data.nome_completo;
    });
  }

  disableCadastrouGanhouMGM() {
    this.global.CadastrouGanhou = false;
  }
}
