import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MgmComponent } from "./mgm.component";
import { mgmRoutingModule } from "./mgm-routing.module";
import { IonicRatingModule } from "ionic-rating";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [MgmComponent],
  imports: [CommonModule, mgmRoutingModule, IonicRatingModule, IonicModule, FormsModule],
})
export class MgmModule {}
