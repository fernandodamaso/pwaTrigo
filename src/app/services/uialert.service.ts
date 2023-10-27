import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UIAlertService {

  constructor(private toastController: ToastController,
              public alertController: AlertController,
              private loadingController: LoadingController) { }

  private loading;

  async presentToast(message, duration, color) {
    const toast = await this.toastController.create({
      message: message, //'Your settings have been saved.',
      duration: duration, //2000
      color: color
    });
    toast.present();
  }

  async presentAlert(header, subheader, message, buttons) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subheader,
      message: message,
      buttons: (buttons != null ? buttons : ['OK']),
    });

    await alert.present();
    let result = await alert.onDidDismiss();
  }

  async presentLoading(time?:number) {
    this.loading = await this.loadingController.create({
      message: 'Aguarde...',
      duration: time === 0 ? 0 : 3500

    });
    await this.loading.present();

    const { role, data } = await this.loading.onDidDismiss();

  }

  dismissLoading() {

    let timeout = 0;

    if(this.loading == null)
      timeout = 1000;

    setTimeout(() => {
      this.loading.dismiss();
    }, timeout);

  }
}
