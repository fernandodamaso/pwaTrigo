import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { GlobalService } from "../services/global.service";

@Component({
  selector: "app-use-terms",
  templateUrl: "./use-terms.component.html",
  styleUrls: ["./use-terms.component.scss"],
})
export class UseTermsComponent implements OnInit {
  constructor(private modalController: ModalController, private global: GlobalService) {}

  public brandId;

  ngOnInit() {
    this.brandId = this.global.getBrand();
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      return: "cancel",
    });
  }
}
