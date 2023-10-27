import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UIAlertService } from '../services/uialert.service';
import { GlobalService } from '../services/global.service';
import { ModalController, NavParams } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { RegisterComponent } from '../register/register.component';
import * as EmailValidator from 'email-validator';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { EProvider } from '../login/EProvider';

// declare function signup(provider, userId, email, nome, telefone): any;
declare function ecommerce_login(path, method) : any;

@Component({
  selector: 'app-popup-login',
  templateUrl: './popup-login.component.html',
  styleUrls: ['./popup-login.component.scss'],
})
export class PopupLoginComponent implements OnInit {

  public loginPhrase: string;

  private _tempEmail: string;

  public set tempEmail(value: string) {
    this._tempEmail = value;
    this.emailValidation = "";
  }

  public get tempEmail(): string { return this._tempEmail; }

  public emailValidation: string;

  public login_data: { email?: string, password?: string } = {};

  public userExistis: boolean = false;
  
  public passwordIsRequested: boolean = false;
  
  public emailSuggestionsList: string[] = [];

  public fastAccessCodeIsRequested: boolean = false;

  private registrationInProgress: boolean = false;

  public loadInProgress: boolean = false;

  public brandId;

  constructor(
    private uiAlertService: UIAlertService,
    private storage: Storage,
    private global: GlobalService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private nav: NavParams,
    private router: Router
  ) { 
    if(this.nav.get("email")){
      this._tempEmail = this.nav.get("email")
      this.requestPassOrRegister();
    }
  }

  ngOnInit() { 
    this.brandId = this.global.id_marca;
  }

  async googleSignin() {
    await this.authService.logout();

    const response = await firebase.default.auth().signInWithPopup(new firebase.default.auth.GoogleAuthProvider());
    this.loadInProgress = true;

    let userExistis = await (await this.authService.userExistis(response.user.email, EProvider.GOOGLE, (response.additionalUserInfo.profile as any).id));

    this.loadInProgress = false;

    if (userExistis == null) {
      this.uiAlertService.presentAlert('Ops!', '', "Não conseguimos buscar os dados desse cadastro.", ['OK']);
      return;
    }

    // if(userExistis.existis && !userExistis.social){
    //   this.uiAlertService.presentAlert('Ops!', '', "No momento você não pode entrar usando sua conta Google.\nPor favor, use email e senha cadastrados!", ['OK']);
    //   return;
    // }

    if (!userExistis.existis) {
      let nameParts = (response.user.displayName?.split(' '))||['',''];

      this.registrationInProgress = true;
      const data = await this.openModalRegister(response.user.email, nameParts[0]||'', nameParts[1]||'', EProvider.GOOGLE, (response.additionalUserInfo.profile as any).id);
      this.registrationInProgress = false;
    }

    await this.authService.authenticate(await response.user.getIdToken());
    await this.loadAndStoreUserInfo('google');
  }

  async appleSignin() {
    console.log('appleSignin');

    await this.authService.logout();

    const provider = new firebase.default.auth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    const response = await firebase.default.auth().signInWithPopup(provider);

    if(response.user.isAnonymous){
      this.uiAlertService.presentAlert('Ops!', '', "Seu perfil na apple não pode ser anônimo.", ['OK']);
      return;
    }

    this.loadInProgress = true;
    let userExistis = await this.authService.userExistis(response.user.email, EProvider.APPLE, (response.additionalUserInfo.profile as any).sub);
    this.loadInProgress = false;
    
    if (userExistis == null) {
      this.uiAlertService.presentAlert('Ops!', '', "Não conseguimos buscar os dados desse cadastro.", ['OK']);
      return;
    }

    // if(userExistis.existis && !userExistis.social){
    //   this.uiAlertService.presentAlert('Ops!', '', "No momento você não pode entrar usando sua conta Apple.\nPor favor, use email e senha cadastrados!", ['OK']);
    //   return;
    // }

    if (!userExistis.existis) {
      let nameParts = (response.user.displayName?.split(' '))||['',''];

      this.registrationInProgress = true;
      const data = await this.openModalRegister(response.user.email, nameParts[0]||'', nameParts[1]||'', EProvider.APPLE, (response.additionalUserInfo.profile as any).sub);
      this.registrationInProgress = false;
    }

    await this.authService.authenticate(await response.user.getIdToken());
    await this.loadAndStoreUserInfo('apple');
  }

  async gcomSignin() {
    console.log('gcomSignin');
    console.log('this.login_data', this.login_data);

    if (!this.login_data.email) {
      this.uiAlertService.presentAlert('Ops!', '', 'Favor preencher o e-mail cadastrado para realizar o login.  ', null);
      return;
    }

    if (!this.login_data.password) {
      this.uiAlertService.presentAlert('Ops!', '', 'Favor preencher a senha cadastrada para realizar o login.  ', null);
      return;
    }

    this.loadInProgress = true;
    await this.authService.login(this.login_data.email, this.login_data.password);

    if (!await this.authService.userIsLogged()) {
      this.uiAlertService.presentAlert('Ops!', '', "Email ou senha inválidos.", ['OK']);
      this.loadInProgress = false;
      return;
    }

    await this.loadAndStoreUserInfo('Gcom');
  }

  async loadAndStoreUserInfo(provider: string) {
    console.log('loadAndStoreUserInfo');

    const user = await this.authService.getUserInfo(true)

    if (!user) {
      this.uiAlertService.presentAlert('Ops!', '', "Tivemos um problema ao carregar seus dados.", ['OK']);
      this.loadInProgress = false;
      return
    }

    await this.storage.set('user' + this.global.storageId(), user);
    this.loadInProgress = false;

    this.uiAlertService.presentToast('Bem vindo ' + user.nome_completo, 3000, 'primary');
    this.modalCtrl.dismiss({ 'return': "ok" });

    if (this.global.googleAnalytics == true || this.global.enhancedCommerce == true)
      ecommerce_login(this.router.url, provider);  
    // signup(provider, user.id_cliente, user.email1, user.nome_completo, (user.telefones[0]?.ddd + user.telefones[0]?.numero));

    if(this.nav.get("redirect"))
      this.router.navigate([this.nav.get("redirect")])
  }

  async emailEnter(ev){
    console.log('emailEnter');

    if(!(ev.key == '@') && !this.tempEmail.includes('@') || ev.key == 'Enter'){
      ev.target.setAttribute('list','');
      return;
    }
    else
      ev.target.setAttribute('list', 'suggestions');

    const emailParts = ev.target.value.split('@');

    const email = emailParts[0];
    let domain = emailParts[1] || null;

    const emailDomains = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'icloud.com', 'bol.com.br', 'uol.com.br', 'live.com', 'terra.com.br', 'yahoo.com', 'ig.com.br']
    this.emailSuggestionsList = emailDomains.filter(d=> domain == null || d.startsWith(domain)).map(d => email+'@'+d) || [];

    if(ev.target.value == '' || this.emailSuggestionsList.some(e => e == ev.target.value)|| window.innerWidth <= 1024){
      this.emailSuggestionsList = [];
      ev.target.setAttribute('list','');
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
    console.log('requestPassOrRegister');

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
      this.uiAlertService.presentAlert('Ops!', '', "Não conseguimos buscar os dados desse cadastro.", ['OK']);
      this.userExistis = userExistis;
      return;
    }

    if (this.registrationInProgress) return;

    if (!userExistis) {
      this.registrationInProgress = true;
      await this.openModalRegister(this._tempEmail, '', '', EProvider.NONE, '');
      this.registrationInProgress = false;
      this.userExistis = userExistis;
      return;
    }

    this.login_data.email = this._tempEmail;
    this.passwordIsRequested = true;
    this.userExistis = userExistis;
  }

  async openModalRegister(email: string, firstname: string, lastname: string, provider: EProvider, providerId: string) {
    const modal = await this.modalCtrl.create({
      component: RegisterComponent,
      cssClass: 'popup-register',
      componentProps: { emailInput: email, firstname, lastname, provider, id_in_provider: providerId }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();


    
    if(data?.return != "ok" || !data?.email || !data?.senha) return;

    this.login_data.email = data.email;
    this.login_data.password = data.senha;
    
    setTimeout(() => {
      this.gcomSignin().then(() => {
        if(this.nav.get("redirect"))
          this.router.navigate([this.nav.get("redirect")]);
      
        return data;
      });
    }, 1000);
  }

  async openModalForgotPassword() {
    console.log('openModalForgotPassword');

    const modal = await this.modalCtrl.create({
      component: ForgotPasswordComponent,
      componentProps: { emailInput: this._tempEmail },
      backdropDismiss:false 
    });

    await modal.present();
    await modal.onWillDismiss();
  }

  async fastAccessByEmailRequest() {
    console.log('fastAccessByEmailRequest');

    if (!this.login_data.email) return;

    this.passwordIsRequested = false;
    this.loadInProgress = true;
    this.fastAccessCodeIsRequested = true;

    try {
      const success = await this.authService.requestFastAccessEmail(this.login_data.email);
      if(!success){
        this.uiAlertService.presentAlert('Ops!', '', "Tivemos um problema ao enviar o email de acesso rápido.", ['OK']);
        return;
      }
      
      this.uiAlertService.presentAlert('Sucesso', '', "Enviamos um email com o link de acesso rápido a sua conta.", ['OK']);
      
    } catch (err) {
    }finally{
      this.fastAccessCodeIsRequested = false;
      this.loadInProgress = false;
      this.passwordIsRequested = true;
    }
  }

}
