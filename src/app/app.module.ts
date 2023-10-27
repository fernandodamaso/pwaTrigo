import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { FormsModule } from "@angular/forms";
import { IonicStorageModule } from "@ionic/storage-angular";
import { IonicRatingModule } from "ionic-rating";

@NgModule({
  declarations: [AppComponent, ForgotPasswordComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, IonicRatingModule, FormsModule, IonicStorageModule.forRoot()],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
