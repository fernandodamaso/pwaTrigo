import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { Convite } from '../models/Convite';
import { BehaviorSubject } from 'rxjs';
import { Indicado } from '../models/Indicado';
import { ILoyaltyExternalPointsSettings } from '../models/LoyaltyExternalPointsSettings';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    myheader = new HttpHeaders().set('Authorization', 'Authorization')

    constructor(private http: HttpClient) { }

    loyaltyExternalPointsSettings: ILoyaltyExternalPointsSettings = {
        Home: {
          HOME_HEADER_BUTTON_PONTOS: 'Trocar meus pontos por cupons',
          HOME_HEADER_SUBTITLES: 'Meus cupons',
          HOME_HEADER_SUBTITLES_HISTORY: 'Ver histórico',
        },
        History: {
          HISTORY_TITLE: 'Histórico de cupons!',
        },
        Store: {
          COUPONS_STORE_TITLE: 'Na Domino´s você escolhe seu cupom ideal!',
        },
        Resume: {
          COUPONS_RESUME_TITLE_BUTTON:
            'Na Domino´s você escolhe seu cupom ideal!',
          COUPONS_RESUME_NAME_BUTTON: 'Quero esse!',
        },
        Result: {
          TITLE_SUCCESS: 'Tudo certo!',
          TITLE_UNSUCCESS: 'Não é você, somos nós!',

          MESSAGE_SUCCESS: 'Seu cupom já está disponível para uso',
          MESSAGE_UNSUCCESS:
            'Tivemos um probleminha para converter seus pontos no cupom escolhido. \n Mas, não se preocupe, está tudo certo com seus pontos e pode tentar novamente mais tarde.',
        },
      }

    baseUrl = "https://www.gcom.com.br/WsRestAppGcom/";

    // NOVO
    privacyPolicy = {
        logoUrl: 'https://www.gcom.com.br/ImagesAppGcom/logo-trigo.png',
        dpo: {
            nome: 'Bruno Tavares Torreira',
            endereco: 'Rua da Quitanda, nº 86, Sala 301, Centro, Rio de Janeiro/RJ, CEP: 20.091-902.',
            email: 'dpo@grupotrigo.com.br'
        },
        empresasDoGrupo: [
            {
                marca: 'Spoleto',
                razao_social: 'SPT Franchising Ltda',
                CNPJ: '03.724.731/0001-78'
            },
            {
                marca: 'Koni Store',
                razao_social: 'FRM Franquia Ltda',
                CNPJ: '08.781.810/0001-34'
            },
            {
                marca: 'Gurumê',
                razao_social: 'Gurume Restaurante Ltda',
                CNPJ: '19.726.452/0001-83'
            },
            {
                marca: 'LeBonton',
                razao_social: 'LBT Franchising Eireli',
                CNPJ: '32.193.756/0001-90'
            },
            {
                marca: 'China in Box',
                razao_social: 'Trend Foods Franqueadora Ltda',
                CNPJ: '10.849.922/0001-21'
            },
            {
                marca: 'Gendai',
                razao_social: 'Trend Foods Franqueadora Ltda',
                CNPJ: '10.849.922/0001-21'
            },
            {
                marca: 'TrigoLab',
                razao_social: 'Cozinha Trigo Comercio e Servicos Ltda',
                CNPJ: '35.218.923/0001-07'
            }
        ]
    }

    resources = {
        text: {
            checkCep: {
                deliveryMode: {
                    header: 'Será que chegamos até aí? Conte para nós onde você está'
                }
            }
        }
    }

    ifoodUrl = 'https://ifoodbr.onelink.me/F4X4/spoleto';
    rappiUrl = 'https://rappi.app.link/psWFB0b8t6';
    uberEatsUrl = 'https://www.ubereats.com/search/?q=spoleto';
    beFranchiseeUrl = 'https://grupo.trigofranquias.com.br/seja-um-franqueado-spoleto';// NOVO
    mgm: boolean = true
    id_etb_gcom;
    id_shopping = 0;
    id_marca;
    nm_marca = "CARREGANDO";
    nr_telefone = "";
    cnpj = "";
    endereco = "";
    style = null;
    confirmEmail = false;
    confirmPhone = false;
    optInEmail = "";
    optInSms = "";
    logoUrl = "";

    public get logoLoyaltyUrl(): string {
        if(this.id_marca == 5) return "https://www.gcom.com.br/ImagesAppGcom/5/logo-fidelidade.png";
        if(this.id_marca == 29) return "https://www.gcom.com.br/ImagesAppGcom/29/logo-fidelidade.png";
        if(this.id_marca == 13) return "https://www.gcom.com.br/ImagesAppGcom/13/logo-fidelidade.png";
        return this.logoUrl;
    }

    useAvaliacaoSql: boolean;
    getUrlAvaliacao() {
        if (this.useAvaliacaoSql == true)
            return environment.urlAvalicaoSql;

        return environment.url;
    }
    msgCashback = "";
    msgConfirmacao = "";
    perguntaAvaliacao = "";
    textoEntrada = "";
    textoObservacao = "";
    tituloAvaliacao = "";
    tituloCashback = "";
    tituloEntrada = "";

    imgMoeda1 = "";
    imgMoeda2 = "";
    imgdeFundo = "";
    corPrimaria = "";
    corSecundaria = "";
    cordeFundo1 = "";
    cordeFundo2 = "";
    cordeTexto = "";
    cordeTextoChat = "";

    pageTitle = "";
    pageFavicon = "";
    metaDescription = "";

    facebookLogin = false;
    googleAnalytics = false;
    enhancedCommerce = true;

    loginGoogle = false;

    delivery = true;
    takeaway = true;
    dinein = true;
    qrcode = false;
    drivethru = false;
    emailContato = "";
    numeroContato = "";
    showDefaultPrices = false;
    mobileCartButton = false;
    sidemenu = true;// NOVO
    restaurantList = true;// NOVO
    menuDigital = false;
    onlyLoyalty = false;
    loyaltyMode = "CASHBACK";
    loyaltyCompany = "GCOM";
    brMallsLogin = false;
    coinName = "R$P";

    cardapioLayout = "";

    metaKeywords = "";
    pushnewsId = "";
    googleMapsKey = "";
    gtm = "";
    facebookId = "";
    publicKeyMercadoPago = "";

    facebookUrl = "";
    instagramUrl = "";
    twitterUrl = "";
    youtubeUrl = "";
    memberGetMember: boolean;
    CadastrouGanhou: boolean;
    MGMcomprou: boolean = false;
    pedidoAnterior: boolean;
    mensagemCupomGerado = "";//NOVO MGM
    conviteMGM: any;
    indicados: Indicado[]
    MGMConfig: any
    MGMConvite: Convite
    idcrpytMGM = "";
    linkMGM = ""
    whatsAppMGM = ""
    telegramMGM = ""
    idConfigCrypt
    UserLogin: BehaviorSubject<boolean> = new BehaviorSubject(false)
    pinMaxDistanceAdjustOnAddNewAddress: number = 100;
    usePinAdjustOnAddNewAddress: boolean = false;
    showStores = { // NOVO
        listLenght: 10,
        radiusLenght: 20
    }

    getBrand() {
        return this.id_marca;
    }

    getOrderMethodCount() {
        var count = 0;
        if (this.delivery)
            count++;

        if (this.takeaway)
            count++;

        if (this.dinein)
            count++;

        if (this.qrcode)
            count++;

        if (this.drivethru)
            count++;

        return count;

    }

    storageId() {
        return (this.id_shopping == 0 ? (this.id_marca == 0 || this.id_marca == 66 ? "" : String(this.id_marca)) : String(this.id_shopping));
    }

    loadBrand(dominio: string) {
        // var url = 'https://gcom-pwa-config-br.azurewebsites.net/Settings/Dominio?domin=' + dominio;
        // var url = 'https://gcom-pwa-config-br.azurewebsites.net/Settings/Dominio?domin=' + dominio;
        // var url = 'https://app-gcom-publicacao-homolog.azurewebsites.net/Settings/Dominio?domin=' + dominio;
        var url = environment.urlPublicacao + 'Settings/DominioAgregado?domin=' + dominio;

        return new Promise((resolve, reject) => {

            this.http.get(`${url}`,
                {
                    headers: this.myheader
                }
            ).subscribe((result) => {
                resolve((JSON.parse(JSON.stringify(result))));

                if (result === 'object') {
                }
            }
                ,
                (error) => {
                    reject(error);
                });
        });
    }
}
