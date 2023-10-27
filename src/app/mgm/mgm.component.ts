import { Component, OnInit } from "@angular/core";

import { ModalController, NavParams, Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { forkJoin } from "rxjs";
import { GlobalService } from "../services/global.service";
import { conviteService } from "../services/convite.service";
import { GcomwebService } from "../services/gcomweb.service";
import { Cliente } from "../models/Cliente";
import { Convite } from "../models/Convite";
import { Indicado } from "../models/Indicado";

import { DomSanitizer } from "@angular/platform-browser";

@Component({
  templateUrl: "./mgm.component.html",
  styleUrls: ["./mgm.component.scss"],
})
export class MgmComponent {
  activeTab = "indique";
  processingRegister: boolean;
  id_cliente: any;
  cliente: Cliente;
  link: string;
  telegram: string;
  whatsapp: string;
  mgmConfiguracaoResponse: any;
  convite: Convite;
  valor: number;
  idMarca: number;
  rota: string;
  mostrarModalAlerta: boolean = true;
  alertaCupomGerado = false;
  alertaCupomGeradoBalao = false;
  mensagemCupom: string;
  nome_ultimo_indicado_beneficio_ativo: string;
  data_cadastro: string;
  isMobile: boolean;

  screenWidth;

  abreCupom: boolean = false;
  UltimoIndicadoBeneficioAtivo: Indicado;
  indicados: Indicado[];
  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private conviteService: conviteService,
    private storage: Storage,
    private global: GlobalService,
    private platform: Platform,
    private navParams: NavParams,
    private gcomwebService: GcomwebService
  ) {}

  ngOnInit(): void {
    this.isMobile = this.checkMobile();
    if (this.isMobile == false) {
      this.ObterUltimoIndicado(this.indicados);
      this.VerificaConfiguracaoAtiva(this.mgmConfiguracaoResponse);
    }
  }

  checkMobile() {
    this.screenWidth = this.platform.width();
    return this.screenWidth < 1024 ? true : false;
  }
  ionViewWillEnter() {
    this.screenWidth = this.platform.width();
    if (this.screenWidth < 1024) {
      this.CarregarMGMMobile();
    }
  }

  dismissAlert() {
    this.alertaCupomGerado = false;
  }

  setActiveTab(activeTab) {
    if (activeTab) {
      // this.CarregarMGMMobile();
      // this.alertaCupomGerado = false;
    }
    this.load(activeTab);
  }

  load(activeTab) {
    this.activeTab = activeTab;
  }

  dismiss() {
    this.modalCtrl.dismiss({
      return: "cancel",
    });
  }

  sanitize(url: string) {
    return url + this.mensagemCupom + " " + this.link;
  }

  copyElementText(id) {
    if (this.link != "") {
      var text = document.getElementById(id).innerText;
      var elem = document.createElement("textarea");
      document.body.appendChild(elem);
      elem.value = "https://" + text;
      elem.select();
      document.execCommand("copy");
      document.body.removeChild(elem);

      setTimeout(() => {
        this.alertaCupomGeradoBalao = true;
      }, 100);
      setTimeout(() => {
        this.alertaCupomGeradoBalao = false;
      }, 3000);
    }
  }

  ObterUltimoIndicado(indicadoArray: Indicado[]) {
    if (indicadoArray.length > 0) {
      let indicados = indicadoArray.filter((x) =>
        this.SomenteBeneficioAtivo(x)
      );
      if (indicados.length == 0) return;
      let indicado = this.sortByStartDate(indicados);
      this.UltimoIndicadoBeneficioAtivo = indicado[indicado.length - 1];
      this.data_cadastro =
        this.UltimoIndicadoBeneficioAtivo.data_beneficio_ativo_indicado;
      this.nome_ultimo_indicado_beneficio_ativo =
        this.UltimoIndicadoBeneficioAtivo.nome;
      if (this.mostrarModalAlerta) {
        this.alertaCupomGerado = true;
        this.abrirAlertaCupomGerado();
      }
    }
  }

  sortByStartDate(array: Indicado[]): Indicado[] {
    return array.sort((a: Indicado, b: Indicado) => {
      return (
        this.getTime(a.data_beneficio_ativo_indicado) -
        this.getTime(b.data_beneficio_ativo_indicado)
      );
    });
  }

  getTime(date?: string) {
    return date != null ? Date.parse(date) : 0;
  }

  SomenteBeneficioAtivo(Indicado: Indicado) {
    return Indicado.beneficio_ativo ? true : false;
  }

  abrirAlertaCupomGerado() {
    if (this.mostrarModalAlerta) {
      this.alertaCupomGerado = true;
      this.mostrarModalAlerta = false;
      setTimeout(() => {
        this.abreCupom = true;
      }, 1000);
    }
  }

  VerificaConfiguracaoAtiva(config: any) {
    {
      if (config.data != "") {
        this.mensagemCupom = config.data.mensagem_convite;
      } else {
        this.mensagemCupom = config.message;
        this.link = "";
      }
    }
  }

  CarregarMGMMobile() {
    this.storage.get("user5").then((dadosCliente) => {
      const rota = window.location.hostname;
      const idCliente = dadosCliente.id_cliente;
      const idMarca = dadosCliente.id_marca;
      this.gcomwebService
        .gerarConvite(idCliente, idMarca)
        .subscribe((data: any) => {
          if (data.status == "Ok") {
            const convite$ =
              this.conviteService.getConvitesByIdIndicador_gerador_link(
                Number(idCliente),
                Number(idMarca)
              );
            const indicadoArray$ =
              this.conviteService.getIndicadosByIdIndicador(idCliente);
            const configuracao$ = this.conviteService.GetUltimaConfigAtiva(
              idMarca,
              false
            );
            const ObservablesArray = [convite$, indicadoArray$, configuracao$];
            forkJoin(ObservablesArray).subscribe((ObservablesArray) => {
              const convite = ObservablesArray[0].data;
              const indicados = ObservablesArray[1];
              const configuracao = ObservablesArray[2];

              ObservablesArray;
              this.GerarDadosMGMMobile(
                idCliente,
                rota,
                convite,
                indicados,
                configuracao
              );
            });
          }
        });
    });
  }

  GerarDadosMGMMobile(idCliente, rota, convite, indicados, configuracao) {
    this.global.idcrpytMGM = btoa(idCliente);
    this.global.idConfigCrypt = btoa(configuracao.data.id);
    let link = `${rota}/convite-cadastro/${this.global.idcrpytMGM}/${this.global.idConfigCrypt}`;
    let linkFinal = link.replace(/=/g, "");
    this.global.linkMGM = linkFinal;
    this.whatsapp = `https://wa.me/?text=`;
    this.telegram = `https://t.me/share/url?url=`;
    this.global.indicados = indicados.sort(
      (x, y) => Number(x.beneficio_ativo) - Number(y.beneficio_ativo)
    );
    this.global.MGMConfig = configuracao;
    this.global.MGMConvite = convite;
    this.mensagemCupom = configuracao.data.mensagem_convite;
    this.indicados = indicados;
    this.mgmConfiguracaoResponse = configuracao.data;
    this.rota = rota;
    this.link = linkFinal;
    this.convite = convite;
    this.VerificaConfiguracaoAtiva(configuracao);
    this.ObterUltimoIndicado(indicados);
  }
}
