import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { loginMgmPage } from './login-mgm.page';

import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  },
  {
    path: ':id/:idConfiguracao',
    component:loginMgmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {}
