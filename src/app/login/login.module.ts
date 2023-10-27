import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { LoginPageRoutingModule } from "./login-routing.module";
import { LoginPage } from "./login.page";
import { loginMgmPage } from "./login-mgm.page";
import { PopupLoginBComponent } from "./popup-login.component";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LoginPageRoutingModule],
  exports: [PopupLoginBComponent],
  declarations: [LoginPage, loginMgmPage, PopupLoginBComponent],
})
export class LoginPageModule {}
