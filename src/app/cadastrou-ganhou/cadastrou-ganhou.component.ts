import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-cadastrou-ganhou',
  templateUrl: './cadastrou-ganhou.component.html',
  styleUrls: ['./cadastrou-ganhou.component.scss']
})
export class CadastrouGanhouComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit(): void {
  }

  dismiss(){
    this.modalCtrl.dismiss({
      'return': 'cancel'
    });
  }
}
