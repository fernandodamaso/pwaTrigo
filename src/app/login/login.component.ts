import { Component, OnInit } from '@angular/core';
import { UIAlertService } from './../services/uialert.service';
import { Storage } from '@ionic/storage';
import { GcomwebService } from './../services/gcomweb.service';
import { ModalController, Platform } from '@ionic/angular';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { RegisterComponent } from '../register/register.component';
import { GlobalService } from '../services/global.service';
import { BrmallService } from '../services/brmall.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
// import { AngularFireAuth } from '@angular/fire/auth';
import { TermsAndPrivacyPolicyService } from '../services/terms-and-privacy-policy.service';

// declare function signup(provider, userId, email, nome, telefone) : any;
declare function ecommerce_login(path, method) : any;


@Component({
  selector: 'app-login-a',
  providers: [TermsAndPrivacyPolicyService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public email;
  public password;
  public brandId;
  public shoppingId;
  public refreshInterval;
  public facebookId;
  public facebookName;
  public facebookEmail;
  public showPassword;
  public loyaltyMode;
  public loyaltyCompany;
  public facebookLoginEnabled;
  public google_id;
  public googleInterval;
  public registro_google;
  public googleLogin;
  public logingoogleAtivo=false;

  constructor(private uiAlertService: UIAlertService, 
              private gcomwebService: GcomwebService, 
              private storage: Storage,
              private modalCtrl: ModalController,
              private platform: Platform,
              private global: GlobalService,
              private route : Router,
              private brmallService : BrmallService,
              private termsService: TermsAndPrivacyPolicyService,
              // public fbauth: AngularFireAuth,
              private authService: AuthService) {

                platform.ready().then((readySource) => {
                  this.screenWidth = platform.width();
                });
  
                this.platform.resize.subscribe(async () => {
                  this.screenWidth = platform.width();
                });

               }

  public screenWidth;

/*  async googleSignin() {

    console.log('apple sign in')
    await this.authService.logout();

    this.fbauth.signInWithPopup(new firebase.default.auth.GoogleAuthProvider()).then(async r=>{

      var tempToken = await r.user.getIdToken();
      await this.authService.authenticate(tempToken);

      const user = await this.authService.getUserInfo(true)
      
      if(user){
        await this.storage.set('user' + this.global.storageId(), user);
        this.uiAlertService.presentToast('Bem vindo ' + user.nome_completo, 3000,'primary');
        this.dismiss('ok')
      }
    });
  }

  async appleSignin() {
    console.log('apple sign in')
    await this.authService.logout();

    const provider = new firebase.default.auth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    this.fbauth.signInWithPopup(new firebase.default.auth.OAuthProvider('apple.com')).then(async r=>{

      var tempToken = await r.user.getIdToken();
      await this.authService.authenticate(tempToken);

      const user = await this.authService.getUserInfo(true);

      if(user){
        this.storage.set('user' + this.global.storageId(), user).then(() =>{
        });
        this.uiAlertService.presentToast('Bem vindo ' + user.nome_completo, 3000,'primary');
        this.dismiss('ok')
      }
    });
    
  }
  */


  async presentModalNewRegister() {
    console.log('presentModalNewRegister');
    
    const modal = await this.modalCtrl.create({
      component: RegisterComponent,
      cssClass: (this.screenWidth >= 1024 ? 'new-register-modal-css' : '')
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

    console.log('data', data);

    if(data != null && data.return == "ok")
    {
      if(this.facebookId != null && this.facebookId != "" )
      {
        setTimeout(() => {
          this.login(true);
        }, 1000);        
      }
      else
      {
        setTimeout(() => {
          this.email = data.email;
          this.password = data.senha;

          console.log('this.email', this.email);
          console.log('this.password', this.password);

          if (this.email != null && this.email != '' && this.password != null && this.password != '')
            console.log('login false');
            this.login(false);
        }, 1000);        
      }
    }
    else
    {
      this.startInterval();
    }
  }

  async presentModalUpdageRegister(email) {
    const modal = await this.modalCtrl.create({
      component: RegisterComponent,
      cssClass: (this.screenWidth >= 1024 ? 'new-register-modal-css' : ''),
      componentProps: { email: email }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if(data != null && data.return == "ok")
    {
      if(this.facebookId != null && this.facebookId != "" )
      {
        setTimeout(() => {
          this.login(true);
        }, 1000);        
      }
      else
      {
        setTimeout(() => {
          this.email = data.email;
          this.password = data.senha;
          if (this.email != null && this.email != '' && this.password != null && this.password != '')
            this.login(false);
        }, 1000);        
      }
    }
    else
    {
      this.startInterval();
    }
  }

  async presentModalForgotPassword() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordComponent,
      cssClass: (this.screenWidth >= 1024 ? 'login-modal-css' : '')
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
  }

  startInterval()
  {
    clearInterval(this.refreshInterval);
    this.facebookName = window["facebookName"] = "";
    this.facebookEmail = window["facebookEmail"] = "";
    this.facebookId = window["facebookId"] = "";
    this.refreshInterval = setInterval(()=> {
      this.verifyFacebookLogin(); 
    }, 1000); 
  }

  ngOnInit() {
    localStorage.setItem("googleLoginAtivo","false");
    this.registro_google = false;   
    this.loadScript();
    this.startInterval();
    
    window["facebookName"] = "";
    window["facebookEmail"] = "";
    window["facebookId"] = "";

    this.brandId = this.global.getBrand();
    this.shoppingId = this.global.id_shopping;
    this.loyaltyMode = this.global.loyaltyMode;
    this.loyaltyCompany = this.global.loyaltyCompany;
    this.facebookLoginEnabled = this.global.facebookLogin;
  }
  
  verifyFacebookLogin() {
    this.facebookName = window["facebookName"];
    this.facebookEmail = window["facebookEmail"];
    this.facebookId = window["facebookId"];

    if (this.facebookId != "")
    {
      this.login(true);
    }
  }

  ionViewDidEnter() {
    // Or to get a key/value pair
    // this.storage.get('user').then((val) => {
    //   if(val != null)
    //   {
    //     if (this.gcomwebService.id_shopping == 0)
    //         this.route.navigate(['/tabs']);
    //     else
    //         this.route.navigate(['/marketplace']);
    //   }
    // });
  }

  async login(facebook) {
    
    clearInterval(this.refreshInterval);

    this.password;
    this.email;
    let googleid = localStorage.getItem("IDGoogle");
    if(this.email != localStorage.getItem("EmailGoogle") && this.password != undefined && facebook != googleid)
    {
      facebook = false;
      googleid = '';
    }
    if (googleid != ''){
      this.registro_google = true;
      this.email = localStorage.getItem("EmailGoogle");
      this.password = localStorage.getItem("IDGoogle");
      this.google_id = localStorage.getItem("IDGoogle");
    }
    else if(facebook != googleid && facebook == true)
    {
      this.email = this.facebookEmail;
      this.password = "facebook";
    }
    else
    {
     
      if (this.email == null || this.email == "")
      {
        this.uiAlertService.presentAlert('Ops!', '', 'Favor preencher o e-mail cadastrado para realizar o login.  ', null);
        return;
      }

      if (this.password == null || this.password == "")
      {
        this.uiAlertService.presentAlert('Ops!', '', 'Favor preencher a senha cadastrada para realizar o login.  ', null);
        return;
      }
     }

     await this.authService.login(this.email, this.password);

     if(!await this.authService.getToken()){
      this.uiAlertService.presentAlert('Ops!', '', "Email ou senha inválidos.", ['OK']);
      return;
     }

     const user = await this.authService.getUserInfo(true);
          if (user)
          {            
                  this.gcomwebService.myheader = new HttpHeaders().set('Authorization', 'Bearer ' + await this.authService.getToken());
                  this.email = "";
                  this.password = "";
        
                  var nome = user.nome_completo.split(' ');
                  this.uiAlertService.presentToast('Bem vindo ' + nome[0], 3000,'primary');
  
                  if(this.global.getBrand() == 93){
                    this.route.navigate(['tabs/loyalty'])
                  }
        
                  this.dismiss('ok');
  
                  if (this.global.googleAnalytics == true || this.global.enhancedCommerce == true)  
                  {
                    var celular = "";
                    if (user.telefones.length > 0)
                    {
                      celular = String(user.telefones[0].ddd) + String(user.telefones[0].numero);
                    }
  
                    // signup((facebook ? 'Facebook' : 'Gcom'), user.id_cliente, user.email1, user.nome_completo, celular);
                  }         
          }
          else
          {
            this.uiAlertService.presentAlert('Ops!', '', "Tivemos um problema ao carregar seus dados.", ['OK']);
          }
  }

  register() {
    this.presentModalNewRegister();
  }

  forgotPassword() {
    this.presentModalForgotPassword();
  }

  dismiss(action)  {
    this.modalCtrl.dismiss({
      'return': action
    });
  }

  passwordShowHide()
  {
    if (this.showPassword != true && this.registro_google != true)
    {
      this.showPassword = true;
    }
    else
    {
      this.showPassword = false;
    }
  }

  passwordKeypress(ev)
  {
    if (ev.charCode == 13){
      this.login(false);
    }
  }

  facebookNotEnabled() {
    this.uiAlertService.presentAlert('Ops!', '', "O login com Facebook está indisponível no momento. Caso você já possua um cadastro conosco utilizando o Facebook, favor utilizar a opção 'Esqueci minha senha' e preencher seu e-mail do Facebook.", null);
  }

  click(){
    localStorage.setItem("IDGoogle", "");

    var element;
    element = document.getElementsByClassName("abcRioButton abcRioButtonLightBlue")[0] as HTMLElement;
    element.click();

    this.googleInterval = setInterval(() => {
      if(localStorage.getItem("IDGoogle") != ""){
        //console.log(localStorage.getItem("IDGoogle"));
        localStorage.setItem("googleLoginAtivo", "true")
        this.login(localStorage.getItem("IDGoogle"));
        clearInterval(this.googleInterval);
      }
    }, 500);

  }

  public loadScript() {
    const url = 'https://apis.google.com/js/platform.js';
    const url2 = 'https://sapwacardapio.blob.core.windows.net/imagens-cardapio/scriptGoogle.js';
    console.log('preparing to load...')

    let node = document.createElement('script');
    node.type = 'text/javascript';
    node.src = url;
    node.async = true;
    node.defer = true;
    node.charset = 'utf-8';

    let node2 = document.createElement('meta');
    node2.name="google-signin-client_id";
    node2.content="919474982167-os4801glhppac95ko88v7h26ui01n66p.apps.googleusercontent.com"

    let node3 = document.createElement('script');
    node3.type = 'text/javascript';
    node3.src = url2;
    node3.charset = 'utf-8';


    document.getElementsByTagName('head')[0].appendChild(node);
    document.getElementsByTagName('head')[0].appendChild(node2);
    document.getElementsByTagName('head')[0].appendChild(node3);

}


}
