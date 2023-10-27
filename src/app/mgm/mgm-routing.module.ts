import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MgmComponent } from "./mgm.component";

const routes: Routes = [{ path: "", component: MgmComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class mgmRoutingModule {}
