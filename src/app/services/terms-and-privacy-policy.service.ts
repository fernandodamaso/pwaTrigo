import { Injectable } from "@angular/core";
import { ModalController, ToastController } from "@ionic/angular";
import { GlobalService } from "src/app/services/global.service";
import { PrivacyPolicyComponent } from "../privacy-policy/privacy-policy.component";
import { GcomwebService } from "./gcomweb.service";
import { LocalStorageService } from "../helpers/storage";

@Injectable({
    providedIn: 'root'
  })
export class TermsAndPrivacyPolicyService {

    constructor(
        private storage: LocalStorageService,
        private global: GlobalService,
        private gcomwebService: GcomwebService,
        private toastController: ToastController,
        public modalController: ModalController,
        ){}


        private clearAllowTerms(){
          this.storage.clearAllowTerms();
        }

        async showToastPolicy(){

          // marca deve ter politica de privacidade
          if(! this.global['privacyPolicy']) return;
      
          const user = await this.storage.getUser();
      
          // usuario nao pode ter aceito
          if(user && user.dt_aceite_ter_pol_priv) return;
            
          // não ter aceite pendente
          if(await this.storage.getAllowTerms()){
            await this.syncUserAceptTerms();
            return;
          }
      
          const toast = await this.toastController.create({
              message: 'Utilizamos cookies essenciais e tecnologias semelhantes de acordo com a nossa Política de Privacidade e, ao continuar navegando, você concorda com estas condições.',
              color: 'primary',
              buttons: [
                {
                  text: 'Ver política',
                  handler: async (): Promise<any> => {
                    this.presentTermsAndPolicy();
                  }
                }, {
                  text: 'Ok',
                  role: 'cancel',
                  handler: async () : Promise<any> => {
                      this.storage.setAllowTerms();
                      
                      await this.syncUserAceptTerms();
                      
                      if((!user || !user.dt_aceite_ter_pol_priv) && !(await this.storage.getAllowTerms()))
                        this.showToastPolicy(); 
                  }
                }
              ]
            });
      
          toast.present();

          let userDetectInterval = setInterval( async ()=>{
            const user = await this.storage.getUser();
            if(user && user.dt_aceite_ter_pol_priv){
              toast.dismiss();
              clearInterval(userDetectInterval);
            }
          }, 1000);
                    
        }
      
        async syncUserAceptTerms(){
          const user = await this.storage.getUser();
          
          if(user && !user.dt_aceite_ter_pol_priv && await this.storage.getAllowTerms()){
          
            try {
              await this.gcomwebService.SetAceiteTermosPolitica(user.id_cliente);
              user.dt_aceite_ter_pol_priv = new Date().toLocaleDateString();
              await this.storage.setUser(user);
              await this.clearAllowTerms();
            } catch (error) {
        
            }
          }

          if(user && user.dt_aceite_ter_pol_priv && await this.storage.getAllowTerms()){
            await this.clearAllowTerms();
          }

        }

        private async presentTermsAndPolicy(){
          const data = await this.presentModalTermsAndPolicy();
          if (data != null && data.return == "cancel")
            this.showToastPolicy();
        }

        async presentModalTermsAndPolicy() {
          var modal = await this.modalController.create({
            component: PrivacyPolicyComponent
          });
      
          await modal.present();
      
          const { data } = await modal.onDidDismiss();
      
          return data;
        }

}