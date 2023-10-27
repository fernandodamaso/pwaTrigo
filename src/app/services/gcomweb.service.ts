import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { GlobalService } from "./global.service";
import { Storage } from "@ionic/storage";
import { environment } from "src/app/environments/environment";
import { AuthService } from "./auth.service";
import { Cliente } from "../models/Cliente";
import { debug } from "console";
import { IRegisterResult } from "../models/IRegisterResult";

@Injectable({
  providedIn: "root",
})
export class GcomwebService {
  public isAzure = true;

  // public myheader = new HttpHeaders().set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6InNlZ3VyYW5jYWdjb20iLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3NpZCI6Ii0xIiwibmJmIjoxNjUyMzY0NjY1LCJleHAiOjE2NTQ5NTY2NjUsImlhdCI6MTY1MjM2NDY2NX0.iqMJshJKO5FInIKGgGUvzvGFqJr-xTgHJS4j_x78BFY')

  public myheader;
  private wsgcomToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6InNlZ3VyYW5jYWdjb20iLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3NpZCI6Ii0xIiwibmJmIjoxNjUyMzY0NjY1LCJleHAiOjE2NTQ5NTY2NjUsImlhdCI6MTY1MjM2NDY2NX0.iqMJshJKO5FInIKGgGUvzvGFqJr-xTgHJS4j_x78BFY";

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private global: GlobalService
  ) {}

  importKey(): PromiseLike<CryptoKey> {
    var url = environment.urlGcomWsRest + "api/cryptography/getkey";

    return new Promise((resolve, reject) => {
      this.http
        .get(`${url}`, {
          headers: new HttpHeaders().set(
            "Authorization",
            "Bearer " + this.wsgcomToken
          ),
        })
        .subscribe(
          (result) => {
            var jwkKey = JSON.parse(atob(String(result)));

            var cryptoKey = window.crypto.subtle
              .importKey(
                "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
                jwkKey,
                {
                  //these are the algorithm options
                  name: "RSA-OAEP",
                  hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                },
                false, //whether the key is extractable (i.e. can be used in exportKey)
                ["encrypt"] //"encrypt" or "wrapKey" for public key import or
                //"decrypt" or "unwrapKey" for private key imports
              )
              .then(function (publicKey) {
                //returns a publicKey (or privateKey if you are importing a private key)
                return publicKey;
              });

            resolve(cryptoKey);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  crypt(str, publicKey): PromiseLike<string> {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }

    return window.crypto.subtle
      .encrypt(
        {
          name: "RSA-OAEP",
          //label: Uint8Array([...]) //optional
        },
        publicKey, //from generateKey or importKey above
        buf //ArrayBuffer of data you want to encrypt
      )
      .then(function (encrypted) {
        //returns an ArrayBuffer containing the encrypted data
        var base64String = btoa(
          String.fromCharCode.apply(null, new Uint8Array(encrypted))
        );

        return base64String;
      });
  }

  login(email: string, password: string, facebookId: string, googleId: string) {
    // var url = 'https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/Login/1/-1/null';
    var url = environment.urlAPIGateway + "/Login/Login";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            // value: {
            email: email.toLowerCase(),
            senha: password,
            facebook_id: facebookId,
            google_id: googleId,
            id_mrc: this.global.id_marca,
            id_shop: this.global.id_shopping,
            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  //TESTE ALEX

  register(
    nome_completo: string,
    cpfcnpj: string,
    senha: string,
    data_nascimento: string,
    email1: string,
    ddd: number,
    numero: number,
    facebookId: string,
    googleId: string,
    appleId: string,
    aceitaTermosFidelidade: boolean,
    IdOracle: number,
    aceitaEmail: boolean,
    aceitaSms: boolean,
    app: string,
    appLocation: string
  ) {
    let idMarca = this.global.id_marca;

    // var url = 'https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/InsertClienteAsync/1/-1/null';

    var url =
      environment.urlAPIGateway +
      "/api/Cliente/InsertClienteAsync/InsertClienteAsync";

    let social_info = this.getSocialIdInfo(
      { name: PROVIDERS[PROVIDERS.GOOGLE], value: googleId },
      { name: PROVIDERS[PROVIDERS.APPLE], value: appleId },
      { name: PROVIDERS[PROVIDERS.FACEBOOK], value: facebookId }
    );

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_marca: idMarca,
            id_shop: this.global.id_shopping,
            operacao: "PRIMEIRO_ACESSO",
            nome_completo: nome_completo,
            cpf_cnpj: cpfcnpj,
            senha: senha,
            data_nascimento: data_nascimento,
            email1: email1.toLowerCase(),
            aceitaTermosFidelidade: aceitaTermosFidelidade,
            IdOracle: IdOracle,
            ic_aceita_sms: aceitaSms ? "S" : "N",
            ic_aceita_email: aceitaEmail ? "S" : "N",
            telefones: [
              {
                ic_tipo: "M",
                ddd: ddd,
                numero: numero,
                dc_tipo: "Celular",
              },
            ],
            AccessInfo: {
              Source: {
                App: app,
                Location: appLocation,
                LoginProvider: social_info
                  ? PROVIDERS[social_info.source.loginProvider]
                  : PROVIDERS.GCOM,
              },
              SocialIDs: social_info ? [social_info.socialId] : null,
            },
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getSocialIdInfo(...params: Array<{ name: string; value: string }>): {
    socialId: { loginProvider: number; id: string };
    source: { loginProvider: string };
  } {
    const p = params.find((p) => !!p.value);
    if (!p) return null;

    return {
      socialId: { loginProvider: PROVIDERS[p.name], id: p.value },
      source: { loginProvider: p.name },
    };
  }

  updateProfile(
    id_cliente: number,
    nome_completo: string,
    cpfcnpj: number,
    data_nascimento: string,
    email1: string,
    ddd: number,
    numero: number,
    senha: string,
    aceitaTermosFidelidade: boolean,
    IdOracle: number,
    aceitaEmail: boolean,
    aceitaSms: boolean
  ) {
    let idMarca = this.global.id_marca;

    var url = environment.urlAPIGateway + `/AtualizaCliente/AtualizaCliente`;

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            // cliente: {
            id_marca: idMarca,
            id_shopping: this.global.id_shopping,
            operacao: "ATUALIZA_DADOS",
            id_cliente: id_cliente,
            nome_completo: nome_completo,
            cpf_cnpj: cpfcnpj,
            senha: senha,
            data_nascimento: data_nascimento,
            email1: email1.toLowerCase(),
            aceitaTermosFidelidade: aceitaTermosFidelidade,
            IdOracle: IdOracle,
            ic_aceita_sms: aceitaSms ? "S" : "N",
            ic_aceita_email: aceitaEmail ? "S" : "N",
            telefones: [
              {
                ic_tipo: "M",
                ddd: ddd,
                numero: numero,
                dc_tipo: "Celular",
              },
            ],
            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  changePassword(user: any, currentPassword: string, newPassword: string) {
    let idMarca = this.global.id_marca;

    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/AtualizarSenha/1/${user.id_cliente}/null`;

    var url =
      environment.urlAPIGateway + "/api/Cliente/AtualizarSenha/AtualizarSenha";

    return new Promise((resolve, reject) => {
      this.http
        .put(
          `${url}`,
          {
            // cliente: {
            id_marca: idMarca,
            id_shop: this.global.id_shopping,
            Operacao: "SENHA",
            id_cliente: user.id_cliente,
            nome_completo: user.nome_completo,
            senha_antiga: currentPassword,
            senha: newPassword,
            cpf: user.cpf_cnpj,
            data_nascimento: user.data_nascimento,
            email1: user.email1.toLowerCase(),
            telefones: user.telefones,

            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  addAddress(
    idCliente: number,
    CEP: string,
    Nome: string,
    Estado: string,
    Cidade: string,
    Logradouro: string,
    Numero: string,
    Complemento: string,
    Referencia: string,
    Bairro: string,
    Latitude: string,
    Longitude: string,
    GooglePlaceId: string,
    user: any,
    NomeCidade: string,
    NomeEstado: string
  ) {
    let idMarca = this.global.id_marca;

    if (this.global.id_shopping != 0) idMarca = 0;

    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/AtualizaCliente/1/${idCliente}/null`;

    var url = environment.urlAPIGateway + "/AtualizaCliente/AtualizaCliente";

    var enderecoAzure = {
      id_cliente: idCliente,
      nome: Nome,
      cep: CEP,
      logradouro: Logradouro,
      complemento: Complemento,
      referencia: Referencia,
      bairro: Bairro,
      numero: String(Numero),
      municipio: { id_municipio: Number(Cidade), nome: NomeCidade },
      estado: { id_uf: Number(Estado), sigla: NomeEstado, nome: NomeEstado },
      latitude: String(Latitude),
      longitude: String(Longitude),
      google_place_id: GooglePlaceId,
    };

    if (user.enderecos != null) {
      user.enderecos.push(enderecoAzure);
    } else {
      user.enderecos = [enderecoAzure];
    }

    user.Operacao = "ADICIONA_ENDERECO";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          // { cliente: user }
          user,
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  editAddress(
    id_cliente: number,
    id_endereco: number,
    CEP: string,
    Nome: string,
    Estado: string,
    Cidade: string,
    Logradouro: string,
    Numero: string,
    Complemento: string,
    Referencia: string,
    Bairro: string
  ) {
    let idMarca = this.global.id_marca;

    if (this.global.id_shopping != 0) idMarca = 0;

    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/EnderecoIndentificadoUpdate/1/${id_cliente}/null`;

    var url =
      environment.urlAPIGateway +
      "/api/EnderecoIndentificados/Update/" +
      id_cliente +
      "/Update";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            // indicators: {
            id_mrc: idMarca,
            id_shop: this.global.id_shopping,
            operacao: "ENDERECO",
            cliente: {
              id_cliente: id_cliente,
              enderecos: [
                {
                  id_cliente: id_cliente,
                  id_endereco: id_endereco,
                  nome: Nome,
                  cep: CEP,
                  logradouro: Logradouro,
                  complemento: Complemento,
                  referencia: Referencia,
                  bairro: Bairro,
                  numero: Numero,
                  municipio: { id_municipio: Cidade },
                  estado: { id_uf: Estado },
                },
              ],
            },
            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getClienteById(idCliente: number) {
    var url =
      environment.urlCliente +
      "/api/Cliente/SelecionaDadosCliente/" +
      idCliente +
      "/" +
      this.global.id_marca +
      "/" +
      "Seguro";
    return this.http.get(url).pipe(map((data: any) => data.data));
  }

  searchAddress(CEP: string) {
    CEP = CEP.replace(" ", "");
    var url = environment.urlGeo + "GeoLocalizacao/Localization/" + CEP;

    return new Promise((resolve, reject) => {
      this.http
        .get(`${url}`, {
          headers: new HttpHeaders().set(
            "Authorization",
            "Bearer " + this.wsgcomToken
          ),
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  SetAceiteTermosPolitica(id_cliente: number) {
    var url =
      environment.urlGcomWsRest +
      "api/AppGcom/Clientes/SetAceiteTermosPolitica";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_mrc: this.global.id_marca,
            id_cliente,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  listAddress(id_cliente): Observable<any> {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/EnderecosCliente/1/${id_cliente}/${id_cliente}|${this.global.id_marca}|${this.global.id_shopping}`;

    var url =
      environment.urlAPIGateway +
      "/api/Cliente/" +
      id_cliente +
      "/" +
      this.global.id_marca +
      "/0/Enderecos";

    return this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(map((results) => results["data"]));
  }

  deleteAddress(id_cliente: number, id_endereco: number) {
    let idMarca = this.global.id_marca;

    if (this.global.id_shopping != 0 && this.global.id_shopping != undefined)
      idMarca = 0;

    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/DeleteEndereco/1/${id_cliente}/null`;

    var url = environment.urlAPIGateway + "/DeleteEndereco/DeleteEndereco";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            // cliente: {
            id_marca: idMarca,
            id_shopping: this.global.id_shopping,

            id_cliente: id_cliente,
            enderecos: [
              {
                id_cliente: id_cliente,
                id_endereco: id_endereco,
              },
            ],
            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  listProducts(storeId, deliveryMode, shoppingId): Observable<any> {
    if (deliveryMode == "QRCODE") deliveryMode = "TAKEAWAY";
    else if (deliveryMode == "DRIVETHRU") deliveryMode = "DRIVE THRU";
    else if (deliveryMode == "DINEIN") deliveryMode = "DINE IN";

    var url =
      this.global.baseUrl +
      "api/AppGcom/Lojas/" +
      storeId +
      "/" +
      this.global.id_marca +
      "/Cardapio?orderMethod=" +
      deliveryMode +
      "&id_shop=" +
      shoppingId;

    if (this.isAzure)
      url =
        environment.urlCardapio +
        "api/Cardapio/Lojas/" +
        storeId +
        "/" +
        this.global.id_marca +
        "/CardapioAsync?orderMethod=" +
        deliveryMode;

    var variavel = this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(map((results) => results));

    localStorage.setItem("teste", variavel["message"]);

    return this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(
        map((results) =>
          results["data"] != null ? results["data"] : results["message"]
        )
      );
  }

  listDefaultProducts(): Observable<any> {
    var url =
      this.global.baseUrl +
      "api/AppGcom/Lojas/" +
      this.global.id_marca +
      "/CardapioPadrao" +
      "?orderMethod=DELIVERY";

    if (this.isAzure)
      url =
        environment.urlCardapio +
        "api/CardapioPadrao/Lojas/" +
        this.global.id_marca +
        "/CardapioPadrao";

    return this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(
        map((results) => (this.isAzure ? results["data"] : results["data"]))
      );
  }

  listStore(endereco, orderMethod, storeID): Observable<any> {
    if (orderMethod == "DRIVETHRU") orderMethod = "DRIVE THRU";
    else if (orderMethod == "DINEIN") orderMethod = "DINE IN";

    var url =
      this.global.baseUrl +
      "api/AppGcom/Lojas/" +
      "?orderMethod=" +
      orderMethod;

    if (this.isAzure) {
      if (storeID != null && storeID != 0) {
        url =
          environment.urlLoja +
          `api/Lojas/GetByIdMarcaAsync/${storeID}/${this.global.id_marca}/${orderMethod}/`;
        // url = 'https://gcom-pwa-loja-api-br.azurewebsites.net/' + `api/Lojas/GetByIdMarcaAsync/${storeID}/${this.global.id_marca}/${orderMethod}/`;

        if (orderMethod == "DELIVERY") {
          url = url + `${endereco.latitude}/${endereco.longitude}`;
        }

        return this.http
          .get(`${url}`, {
            headers: this.myheader,
          })
          .pipe(map((results) => results["data"]));
      } else {
        url =
          environment.urlLoja + "api/Lojas/GetLojas?orderMethod=" + orderMethod;
      }
    }
    if (endereco.numero == null) {
      endereco.numero = "";
    } else {
      endereco.numero = endereco.numero.toString();
    }

    console.log(endereco.numero);
    return this.http
      .post(
        `${url}`,
        {
          id_mrc: this.global.id_marca,
          id_shop: this.global.id_shopping,
          endereco: endereco,
          id_etb_gcom: storeID,
        },
        {
          headers: this.myheader,
        }
      )
      .pipe(map((results) => results["data"]));
  }

  listAllStores(id_marca: number): Observable<any> {
    //Aqui é para chamar essa outra API que retorna todas as lojas da marca independente se está disponível para o PWA ou não
    var url = environment.urlLoja + `api/Lojas/GetByIdMarcaAsync/${id_marca}`;

    return this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(map((stores) => stores["data"]));
  }

  placeOrder(storeId, order) {
    var url =
      environment.urlComunicacao +
      "api/acesso/RealizaComunicacaoObject/5/SendOrder?id_shop=";

    return new Promise((resolve, reject) => {
      this.http
        .post(`${url}`, order, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
            // resolve((JSON.parse(JSON.stringify(result[0]))));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  placeOrderAzure(storeId, order) {
    var paymentsFormatted = [];

    if (order.payments != null && order.payments.length > 0) {
      paymentsFormatted.push({
        Id: 0,
        Name: order.payments[0].name,
        Code: order.payments[0].code,
        Value: order.payments[0].value,
        Prepaid: order.payments[0].prepaid,
        Transaction: order.payments[0].transaction,
        Issuer: order.payments[0].issuer,
        client_card_id: order.payments[0].client_card_id,
        transaction_id_gcom: 0,
      });
    }

    var itemsFormatted = [];

    order.items.forEach((item) => {
      var subItemsFormatted = [];

      item.subItems.forEach((subItem) => {
        subItemsFormatted.push({
          id: subItem.id,
          name: subItem.name,
          quantity: subItem.quantity,
          price: subItem.price,
          totalPrice: subItem.totalPrice,
          discount: subItem.discount,
          addition: subItem.addition,
          externalCode: subItem.externalCode,
          NM_CUSTOM: subItem.NM_CUSTOM,
          ID_CUSTOM_SEQ: subItem.ID_CUSTOM_SEQ,
          internalCode: subItem.internalCode,
          SKU: subItem.SKU,
          IC_TIP_DSC_PRO: subItem.IC_TIP_DSC_PRO,
        });
      });

      itemsFormatted.push({
        id: item.id,
        internalCode: item.internalCode,
        externalCode: item.externalCode,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subItemsPrice: item.subItemsPrice,
        totalPrice: item.totalPrice,
        discount: 0,
        addition: 0,
        subItems: subItemsFormatted,
        observations: item.observations,
        orderOrigin: item.orderOrigin,
      });
    });

    var shippingFormatted = {
      addressId:
        order.deliveryAddress.addressId == null ||
        isNaN(order.deliveryAddress.addressId)
          ? 0
          : order.deliveryAddress.addressId,
      formattedAddress: order.deliveryAddress.formattedAddress,
      country: order.deliveryAddress.country,
      state: order.deliveryAddress.state,
      city: order.deliveryAddress.city,
      coordinates: {
        Latitude: order.deliveryAddress.coordinates.latitude,
        Longitude: order.deliveryAddress.coordinates.longitude,
      },
      neighborhood: order.deliveryAddress.neighborhood,
      streetName: order.deliveryAddress.streetName,
      streetNumber:
        order.deliveryAddress.streetNumber == null
          ? 0
          : Number(order.deliveryAddress.streetNumber).toString(),
      postalCode: order.deliveryAddress.postalCode,
      complement: order.deliveryAddress.complement,
      googlePlaceId: order.deliveryAddress.googlePlaceId,
    };

    var formattedBenefits = [];

    if (order.benefits != null && order.benefits.length > 0) {
      formattedBenefits.push({
        id_empresa_responsavel: order.benefits[0].ID_EMP_GCOM_RSP,
        id_cupom: order.benefits[0].ID_CPN_CBO,
        id_sequencia: order.benefits[0].ID_SEQ_VER,
        value: order.benefits[0].value,
        target: order.benefits[0].target,
        coupon: order.benefits[0].coupon,
        integrationCode: order.benefits[0].integrationCode,
        addedOn: order.benefits[0].addedOn,
        sponsorshipValues: order.benefits[0].sponsorshipValues,
      });
    }

    var orderFormatted = {
      Id: 0,
      Name: "0",
      CreatedAt: order.createdAt,
      EditeddAt: "0",
      UserAt: 0,
      UserEdited: 0,
      Active: true,
      Status: 0,
      idCliente: this.global.id_marca,
      Reference: "",
      ShortReference: "",
      Customer: {
        id: order.customer.id,
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email.toLowerCase(),
        ordersCountOnRestaurant: order.customer.ordersCountOnRestaurant,
        document: order.customer.document,
        taxPayerIdentificationNumber:
          order.customer.taxPayerIdentificationNumber,
        idCosmos: order.customer.idCosmos,
        idOracle: order.customer.idOracle,
      },
      Payments: paymentsFormatted,
      Items: itemsFormatted,
      SubTotal: order.subTotal,
      // "PriceDiscount": 0, --> ATENÇÃO
      TotalPrice: order.totalPrice,
      Shipping: shippingFormatted,
      ShopId: 0,
      externalcode: String(order.id_etb_gcom),
      deliveryFee: order.deliveryFee,
      ShippingMethod: {
        Id: order.deliveryMethod.id,
        minTime: order.deliveryMethod.minTime,
        maxTime: order.deliveryMethod.maxTime,
        mode: order.deliveryMethod.mode,
      },
      packingCost: order.packingCost,
      benefits: formattedBenefits,
      usedCashback: order.usedCashback,
    };

    //https://pwa-pedido-homolog.azurewebsites.net/api/Order/Post/123
    var url = environment.urlPedido + "api/Order/Post/123";

    return new Promise((resolve, reject) => {
      this.http
        .post(`${url}`, orderFormatted, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
            // resolve((JSON.parse(JSON.stringify(result[0]))));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  async listPaymentTypes(storeId): Promise<Observable<any>> {
    const paymentForms = (
      await this.storage.get("store" + this.global.storageId())
    )[0].formas_pagamento;
    return of<any>(paymentForms);
  }

  listOrders(id_cliente): Observable<any> {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwapedido/GetStatusByUserId/2/${id_cliente}/${id_cliente}|${this.global.id_marca}`;
    var url =
      environment.urlPedido +
      `api/Order/GetStatusByUser/${id_cliente}/${this.global.id_marca}/GetStatusByUser`;

    return this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(
        map((results) => (this.isAzure ? results["Data"] : results["data"]))
      );
  }

  listOpenOrder(id_cliente) {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwapedido/GetStatusByUserPendente/2/${id_cliente}/${id_cliente}|${this.global.id_marca}`;
    var url =
      environment.urlPedido +
      `api/Order/GetStatusByUserPendente/${id_cliente}/${this.global.id_marca}/GetStatusByUserPendente`;

    return new Promise((resolve, reject) => {
      this.http
        .get(`${url}`, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(this.isAzure ? result["Data"][0] : result["data"]);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getOrderDetail(id_loja, id_pedido, id_marca) {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwapedido/GetById/2/-1/${id_pedido}`;
    var url = environment.urlPedido + `api/Order/Get/${id_pedido}/Get`;

    return new Promise((resolve, reject) => {
      this.http
        .get(`${url}`, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(result["Data"]);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  listCities(id_uf): Observable<any> {
    var url =
      environment.urlGcomWsRest +
      "api/AppGcom/Estados/" +
      id_uf +
      "/Municipios";

    return this.http
      .get(`${url}`, {
        headers: new HttpHeaders().set(
          "Authorization",
          "Bearer " + this.wsgcomToken
        ),
      })
      .pipe(map((results) => results["data"]));
  }

  addCard(
    id_cliente,
    cardNumber,
    cardSecurityCode,
    cardValidThru,
    id_bandeira_sitef,
    id_bandeira_gcom,
    cardHolderName,
    cardHolderDocument,
    CEP,
    Estado,
    Cidade,
    Logradouro,
    Numero,
    Complemento,
    Referencia,
    Bairro,
    NomeCidade,
    SiglaEstado,
    id_etb_gcom,
    id_forma_pagamento,
    nm_bandeira,
    token_cartao_mercado_livre
  ) {
    if (this.isAzure) {
      CEP = String(CEP);
      Estado = Number(Estado);
      Cidade = Number(Cidade);
    }

    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/ArmazenarCartao/1/${id_cliente}/${id_cliente}|${this.global.id_marca}|${this.global.id_shopping}/`;

    var url =
      environment.urlAPIGateway +
      "/api/Cartoes/ArmazenarCartao/" +
      id_cliente +
      "/" +
      this.global.id_marca +
      "/0/ArmazenarCartao";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          //  { cartao: card }
          {
            vigencia: cardValidThru,
            numero: cardNumber,
            cvv: cardSecurityCode,
            id_bandeira_sitef: id_bandeira_sitef,
            id_bandeira_gcom: id_bandeira_gcom,
            nm_bandeira: nm_bandeira,
            nome_portador: cardHolderName,
            cpf_portador: cardHolderDocument,
            id_etb_gcom: id_etb_gcom,
            id_forma_pagamento: id_forma_pagamento,
            token_cartao_mercado_livre: token_cartao_mercado_livre,
            endereco_cobranca: {
              id_cliente: id_cliente,
              id_endereco: 0,
              nome: "",
              cep: CEP,
              logradouro: Logradouro,
              complemento: Complemento,
              rereferencia: Referencia,
              bairro: Bairro,
              numero: Numero.toString(),
              latitude: "",
              longitude: "",
              municipio: {
                id_municipio: Cidade,
                id_uf: Estado,
                nome: NomeCidade,
              },
              estado: {
                id_uf: Estado,
                nome: "",
                sigla: SiglaEstado,
              },
            },
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  listCards(id_cliente, id_forma_pagamento): Observable<any> {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/ListarCartoesCliente/1/${id_cliente}/${id_cliente}|${this.global.id_marca}/`;

    var url =
      environment.urlAPIGateway +
      "/api/Cartoes/ListarCartoesCliente/" +
      id_cliente +
      "/" +
      this.global.id_marca +
      "/ListarCartoesCliente";

    return this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(map((results) => results["data"]));
  }

  getCardBin(
    id_cliente: number,
    id_mrc: number,
    id_cartao: number,
    id_gateway: number
  ) {
    var url =
      environment.urlAPIGateway +
      `/api/Cartoes/RecuperarBINMercadoPago/${id_cliente}/${id_mrc}/${id_cartao}/${id_gateway}`;

    return new Promise((resolve, reject) => {
      this.http
        .get(`${url}`, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  removeCard(id_cliente, id_cartao) {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/ExcluirCartao/1/${id_cliente}/${id_cliente}|${this.global.id_marca}|${id_cartao}|${this.global.id_shopping}/`;
    var url =
      environment.urlAPIGateway +
      "/api/Cartoes/ExcluirCartao/" +
      id_cliente +
      "/" +
      this.global.id_marca +
      "/" +
      id_cartao +
      "/" +
      this.global.id_shopping +
      "/ExcluirCartao";

    return new Promise((resolve, reject) => {
      this.http
        .delete(`${url}`, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  confirmDelivery(store_id, id_pedido, id_marca) {
    var url =
      environment.urlGcomWsRest +
      "api/AppGcom/Lojas/" +
      store_id +
      "/" +
      id_marca +
      "/Pedidos/" +
      id_pedido +
      "/status/delivered?id_shop=" +
      this.global.id_shopping;

    return new Promise((resolve, reject) => {
      this.http
        .post(`${url}`, {
          headers: new HttpHeaders().set(
            "Authorization",
            "Bearer " + this.wsgcomToken
          ),
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  checkBIN(BIN: string, id_forma_pagamento: string) {
    var url =
      this.global.baseUrl +
      "api/Pagamentos/VerificarBin/" +
      BIN +
      "?id_forma_pagamento=" +
      id_forma_pagamento;

    if (this.isAzure)
      url =
        environment.urlPagamento +
        "api/Transaction/VerificarBin/" +
        BIN +
        "/" +
        id_forma_pagamento;

    return new Promise((resolve, reject) => {
      this.http.get(`${url}`).subscribe(
        (result) => {
          resolve(result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  sendCodeConfirmPhone(ddd: string, celular: string, id_mrc: number) {
    const data = {
      ddd,
      celular,
      id_mrc,
    };
    var url = environment.urlGcomWsRest + "api/pwa/EnviaSMSCadastro/";
    return new Promise((resolve, reject) => {
      this.http
        .post(`${url}`, data, {
          headers: { Authorization: `Bearer 123` },
        })
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  verifyCodeConfirmPhone(
    ddd: string,
    celular: string,
    id_mrc: number,
    codigo: string
  ) {
    const data = {
      ddd,
      celular,
      id_mrc,
      codigo,
    };
    var url = environment.urlGcomWsRest + "api/pwa/ValidaChaveSMSCadastro/";
    return new Promise((resolve, reject) => {
      this.http
        .post(`${url}`, data, {
          headers: new HttpHeaders().set("Authorization", "Bearer 123"),
        })
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  sendCodeConfirmEmail(cliente) {
    var url = environment.urlCliente + "api/Cliente/CodigoAcesso/123";
    return new Promise((resolve, reject) => {
      this.http.post(`${url}`, cliente).subscribe(
        (result) => {
          resolve(result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
  verifyCodeConfirmEmail(codigo, origem, emailorphone) {
    var url =
      environment.urlCliente +
      `api/ClienteCode/ValidarCodigo/${codigo}/${origem}/${emailorphone}/123`;
    return new Promise((resolve, reject) => {
      this.http.get(`${url}`).subscribe(
        (result) => {
          resolve(result);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  sendVerifyCode(email) {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/RecuperarSenhaEmail/1/-1/null`;
    var url = environment.urlAPIGateway + "/api/Cliente/Email/Email";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            // cliente: {
            id_marca: this.global.id_marca,
            email1: email.toLowerCase(),
            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  checkVerifyCode(email, verifyCode) {
    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/ValidaChaveRecuperacaoSenha/1/-1/null`;
    var url =
      environment.urlAPIGateway +
      "/ValidaChaveRecuperacaoSenha/ValidaChaveRecuperacaoSenha";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            // recuperarSenhaDto: {
            id_marca: this.global.id_marca,
            email1: email.toLowerCase(),
            chave: verifyCode,
            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  resetPassword(cliente) {
    let idMarca = this.global.id_marca;

    if (this.global.id_shopping != 0 && this.global.id_shopping != undefined)
      idMarca = 0;

    // var url = `https://segurancapwa-br.azurewebsites.net/api/Security/pwacliente/AtualizaCliente/1/-1/null`;
    var url = environment.urlAPIGateway + "/AtualizaCliente/AtualizaCliente";

    cliente.Operacao = "RECUPERACAO_SENHA";
    cliente.id_marca = idMarca;
    cliente.id_shopping = this.global.id_shopping;

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            // cliente: {
            id_cliente: cliente.id_cliente,
            id_marca: cliente.id_marca,
            Operacao: cliente.Operacao,
            senha: cliente.senha,
            // }
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  checkCouponCode(id_cliente, storeID, couponCode, order) {
    var url =
      this.global.baseUrl +
      "api/AppGcom/Clientes/" +
      id_cliente +
      "/Lojas/" +
      storeID +
      "/" +
      this.global.id_marca +
      "/Pedidos/28/Cupom/" +
      couponCode;

    if (this.isAzure) {
      url =
        environment.urlCarrinho +
        "api/Cupom/ValidaCupom/" +
        id_cliente +
        "/" +
        storeID +
        "/" +
        this.global.id_marca +
        "/28";
    }

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            couponCode: couponCode,
            order,
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  listCategories(): Observable<any> {
    var url =
      environment.urlGcomWsRest +
      "api/AppGcom/Shopping/" +
      this.global.id_shopping +
      "/Categorias";

    return this.http
      .get(`${url}`, {
        headers: new HttpHeaders().set(
          "Authorization",
          "Bearer " + this.wsgcomToken
        ),
      })
      .pipe(map((results) => results["data"]));
  }

  addFavoriteStore(idCliente: number, idLoja: number, idMarca: number) {
    var url =
      this.global.baseUrl + "api/AppGcom/Clientes/" + idCliente + "/Favoritos";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_etb_gcom: idLoja,
            id_mrc: idMarca,
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  deleteFavoriteStore(idCliente: number, idLoja: number, idMarca: number) {
    var url =
      this.global.baseUrl +
      "api/AppGcom/Clientes/" +
      idCliente +
      "/Favoritos/" +
      idLoja +
      "/" +
      idMarca;

    return new Promise((resolve, reject) => {
      this.http
        .delete(`${url}`, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  listRating(id_cliente): Observable<any> {
    var url = this.global.baseUrl + "api/AppGcom/Clientes/" + id_cliente + "/";

    if (this.global.id_shopping == 0)
      url +=
        this.global.id_marca +
        "/Pedidos?ic_pedido_aberto=N" +
        "&Config_avaliacao=S";

    console.log(url);

    // else
    //   url += '0/Pedidos?ic_pedido_aberto=N&id_shop=' + this.global.id_shopping;

    return this.http
      .get(`${url}`, {
        headers: this.myheader,
      })
      .pipe(map((results) => results["data"]));
  }

  listFavoriteStores(idCliente: number) {
    var url =
      this.global.baseUrl +
      "api/AppGcom/Shopping/" +
      this.global.id_shopping +
      "/Clientes/" +
      idCliente +
      "/Favoritos";

    return new Promise((resolve, reject) => {
      this.http
        .get(`${url}`, {
          headers: this.myheader,
        })
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  addOrderEvaluation(
    idCliente: number,
    idLoja: number,
    idMarca: number,
    idPedido: number,
    nNota: number,
    sComentarios: string
  ) {
    var url =
      this.global.baseUrl + "api/AppGcom/Clientes/" + idCliente + "/Avaliacao";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_etb_gcom: idLoja,
            id_ori_ped_web: 29,
            id_shop: this.global.id_shopping,
            id_mrc: idMarca,
            nr_orc_loc_ext_ref: idPedido,
            nr_nota_pedido: nNota,
            dc_aval_cri: sComentarios,
          },
          {
            headers: this.myheader,
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  tokenLogin(token: string) {
    var url = environment.urlGcomWsRest + "api/AppGcom/AutenticaAcesso";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {},
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getVehicleBrands(tipo: string) {
    var url = "https://fipeapi.appspot.com/api/1/" + tipo + "/marcas.json";

    return new Promise((resolve, reject) => {
      this.http.get(`${url}`).subscribe(
        (result) => {
          resolve(JSON.parse(JSON.stringify(result)));
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  getVehicleModels(tipo: string, brandId) {
    var url =
      "https://fipeapi.appspot.com/api/1/" +
      tipo +
      "/veiculos/" +
      brandId +
      ".json";

    return new Promise((resolve, reject) => {
      this.http.get(`${url}`).subscribe(
        (result) => {
          resolve(JSON.parse(JSON.stringify(result)));
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getLoyaltySettings() {
    var url =
      environment.urlGcomWsRest +
      "api/pwa/Settings/Fidelidade?id_marca=" +
      this.global.id_marca;

    return new Promise((resolve, reject) => {
      this.http
        .get(`${url}`, {
          headers: new HttpHeaders().set(
            "Authorization",
            "Bearer " + this.wsgcomToken
          ),
        })
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getLoyaltyPoints(telefone: string, id_loja: number) {
    var url = environment.urlGcomWsRest + "api/Fidelidade/ConsultaPontoCliente";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            cpf: "",
            telefone: telefone,
            id_loja: id_loja,
            id_marca: this.global.id_marca,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  //A - ANIVERSÁRIO
  //B - BONIFICAÇÃO
  //D - DEVOLUÇÃO
  //E - ESTORNO
  //P - REVISÃO
  //R - RESGATE
  //V - VENDA
  //X - EXPIRAÇÃO
  //S - SUBIU DE NÍVEL 1
  //C - CAIU DE NÍVEL  1
  //K - SE MANTEVE     1
  getLoyaltyCostumerExtract(
    idCliente: number,
    tipoMovimento: string,
    qtdMes: number
  ) {
    var url =
      environment.urlGcomWsRest +
      "api/Fidelidade/Cliente/" +
      idCliente +
      "/ConsultaExtratoClienteFidelidade";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            Id_Empresa: "0",
            Id_Marca: this.global.id_marca,
            Tipo_Movimento: tipoMovimento,
            Qtd_Mes: qtdMes,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  setLoyaltyOptin(idCliente: number) {
    var url =
      environment.urlGcomWsRest +
      "api/Fidelidade/Cliente/" +
      idCliente +
      "/AtualizarAceiteProgramaFidelidade";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            nId_Mrc: this.global.id_marca,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getUncompletedUser(email: string, telefone: string) {
    var url =
      environment.urlGcomWsRest +
      "api/Fidelidade/ConsultaClienteCadastroIncompleto";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            telefone: telefone,
            email: email.toLowerCase(),
            cpf: "",
            Id_Marca: this.global.id_marca,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getFavoriteOrders(id_cliente, id_marca): Observable<any> {
    var url =
      environment.urlGcomWsRest +
      "api/AppGcom/Clientes/" +
      id_cliente +
      "/PedidoFavorito?id_marca=" +
      id_marca;

    return this.http
      .get(`${url}`, {
        headers: new HttpHeaders().set(
          "Authorization",
          "Bearer " + this.wsgcomToken
        ),
      })
      .pipe(map((results) => results["data"]));
  }

  createFavoriteOrders(
    id_cliente,
    id_marca,
    id_etb_gcom,
    id_pedido,
    json_pedido,
    nome_pedido
  ) {
    var url =
      environment.urlGcomWsRest +
      "api/AppGcom/Clientes/" +
      id_cliente +
      "/PedidoFavorito";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_cliente: id_cliente,
            id_etb_gcom: id_etb_gcom,
            id_marca: id_marca,
            id_pedido: id_pedido,
            json_pedido: json_pedido,
            nome_pedido: nome_pedido,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  deleteFavoriteOrders(id_cliente, id_etb_gcom, id_mrc, id_pedido) {
    //var url = this.baseUrl + 'api/AppGcom/Clientes/' + id_cliente + '/' + this.id_marca + '/Cartoes/' + id_cartao;

    var url =
      environment.urlGcomWsRest +
      "api/AppGcom/Clientes/" +
      id_cliente +
      "/DeletarPedidoFavorito";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_cliente: id_cliente,
            id_etb_gcom: Number(id_etb_gcom),
            id_marca: id_mrc,
            id_pedido: id_pedido,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  listUserCoupons(cpf, telefone, id_loja) {
    var url = environment.urlGcomWsRest + "api/Cupons/ConsultaCuponsCliente/";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            cpf: cpf,
            telefone: telefone,
            id_loja: id_loja,
            id_marca: this.global.id_marca,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  reserveUserCoupons(
    id_cliente,
    id_loja,
    id_marca,
    id_empresa_cupom,
    id_cupom,
    versao_cupom,
    sequencial
  ) {
    var url = environment.urlGcomWsRest + "api/Cupons/GravarUtilizacaoCupom/";
    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_cliente: id_cliente,
            id_loja: id_loja,
            id_marca: id_marca,
            id_empresa_cupom: id_empresa_cupom,
            id_cupom: id_cupom,
            versao_cupom: versao_cupom,
            sequencial: sequencial,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  deleteReserveUserCoupons(
    id_cliente,
    id_loja,
    id_marca,
    id_empresa_cupom,
    id_cupom,
    versao_cupom,
    sequencial
  ) {
    var url = environment.urlGcomWsRest + "api/Cupons/ExcluirUtilizacaoCupom/";

    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${url}`,
          {
            id_cliente: id_cliente,
            id_loja: id_loja,
            id_marca: id_marca,
            id_empresa_cupom: id_empresa_cupom,
            id_cupom: id_cupom,
            versao_cupom: versao_cupom,
            sequencial: sequencial,
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + this.wsgcomToken
            ),
          }
        )
        .subscribe(
          (result) => {
            resolve(JSON.parse(JSON.stringify(result)));
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  gerarCupom(idCliente: string, idmarca: number) {
    let url = `${environment.urlConvite}api/Convite/InsertConvite/${idCliente}/${idmarca}`;
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    let options = { headers: headers };
    return this.http.post(url, {}, options);
  }

  async registerMGM(
    nome_completo: string,
    cpfcnpj: string,
    senha: string,
    data_nascimento: string,
    email1: string,
    ddd: number,
    numero: number,
    facebookId: string,
    googleId: string,
    appleId: string,
    aceitaTermosFidelidade: boolean,
    IdOracle: number,
    aceitaEmail: boolean,
    aceitaSms: boolean,
    app: string,
    idIndicador: string,
    idConfiguracaoUncrypt: string
  ): Promise<any> {
    var url =
      environment.urlCliente +
      `api/Cliente/InsertClienteIndicadoSqlAsync/${idIndicador}/${idConfiguracaoUncrypt}/token`;

    let social_info = this.getSocialIdInfo(
      { name: PROVIDERS[PROVIDERS.GOOGLE], value: googleId },
      { name: PROVIDERS[PROVIDERS.APPLE], value: appleId },
      { name: PROVIDERS[PROVIDERS.FACEBOOK], value: facebookId }
    );

    console.log(this.global.id_marca);
    return await this.http
      .post(
        `${url}`,
        {
          id_marca: this.global.id_marca,
          id_shop: this.global.id_shopping,
          operacao: "InsertClienteAsync",
          nome_completo: nome_completo,
          cpf_cnpj: cpfcnpj,
          senha: senha,
          data_nascimento: data_nascimento,
          email1: email1.toLowerCase(),
          aceitaTermosFidelidade: aceitaTermosFidelidade,
          IdOracle: IdOracle,
          ic_aceita_sms: aceitaSms ? "S" : "N",
          ic_aceita_email: aceitaEmail ? "S" : "N",
          telefones: [
            {
              ic_tipo: "M",
              ddd: ddd,
              numero: numero,
              dc_tipo: "Celular",
            },
          ],
          AccessInfo: {
            Source: {
              App: app,
              Location: "MGM",
              LoginProvider: social_info
                ? PROVIDERS[social_info.source.loginProvider]
                : PROVIDERS.GCOM,
            },
            SocialIDs: social_info ? [social_info.socialId] : null,
          },
        },
        {
          headers: this.myheader,
        }
      )
      .toPromise();
  }

  insertClienteIndicado(
    nome_completo: string,
    cpfcnpj: string,
    senha: string,
    data_nascimento: string,
    email1: string,
    ddd: string,
    numero: string,
    facebookId: string,
    googleId: string,
    appleId: string,
    aceitaTermosFidelidade: boolean,
    IdOracle: number,
    aceitaEmail: boolean,
    aceitaSms: boolean,
    app: string,
    appLocation: string,
    idIndicador: string
  ) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    let token = "token";
    let options = { headers: headers };
    let body = {
      id_marca: this.global.id_marca,
      id_shop: this.global.id_shopping,
      operacao: "InsertClienteAsync",
      facebook_id: facebookId,
      google_id: googleId,
      nome_completo: nome_completo,
      cpf_cnpj: cpfcnpj,
      senha: senha,
      data_nascimento: data_nascimento,
      email1: email1.toLowerCase(),
      aceitaTermosFidelidade: aceitaTermosFidelidade,
      IdOracle: IdOracle,
      ic_aceita_sms: aceitaSms ? "S" : "N",
      ic_aceita_email: aceitaEmail ? "S" : "N",
      telefones: [
        {
          ic_tipo: "M",
          ddd: ddd,
          numero: numero,
          dc_tipo: "Celular",
        },
      ],
    };

    let result: IRegisterResult;
    this.http
      .post<IRegisterResult>(
        environment.urlCliente +
          `api/Cliente/InsertClienteIndicadoAsync/${idIndicador}/${token}`,
        body,
        options
      )
      .subscribe((data) => {
        result = data;
      });
    return result;
  }
  gerarConvite(idCliente: string, idmarca: number) {
    let url = `${environment.urlConvite}api/Convite/InsertConvite/${idCliente}/${idmarca}`;
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    let options = { headers: headers };
    return this.http.post(url, {}, options);
  }

  GetStoryOrder(idmarca: number, id_cosmos: number, token: string) {
    let url = `${environment.urlPedido}api/StoryOrder/GetByMarcaIdCosmos/${idmarca}/${id_cosmos}/${token}`;
    return this.http.get(url);
  }
}

enum PROVIDERS {
  GCOM = 0,
  GOOGLE = 1,
  APPLE = 2,
  FACEBOOK = 3,
}
