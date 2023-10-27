import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "mgm",
    pathMatch: "full",
  },
  { path: "mgm", loadChildren: () => import("./mgm/mgm.module").then((m) => m.MgmModule) },
  {
    path: "convite-cadastro",
    loadChildren: () => import("./login/login.module").then((m) => m.LoginPageModule),
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
