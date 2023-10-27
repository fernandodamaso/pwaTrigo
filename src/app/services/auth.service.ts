import { Injectable, Provider } from "@angular/core";
import { Storage } from "@ionic/storage";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { GlobalService } from "./global.service";
import * as Forge from "node-forge";
import { EProvider } from "src/app/login/EProvider";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private publicKey: string;

  private readonly SECURITY_URL;
  private readonly CUSTOMER_URL;
  private static user: any;
  private static token: string;

  public get token() {
    return AuthService.token;
  }

  constructor(private http: HttpClient, private storage: Storage, private global: GlobalService) {
    this.SECURITY_URL = environment.urlSecurity;
    this.CUSTOMER_URL = environment.urlCliente;

    var key = "-----BEGIN PUBLIC KEY-----";
    environment.encript_key.split(" ").forEach((l) => (key = key + "\r\n" + l));
    key = key + "\r\n" + "-----END PUBLIC KEY-----";
    this.publicKey = key;
  }

  async login(email: string, password: string) {
    var cryptedPass;
    var emailFormated = email.toLowerCase();
    //compatibilidade com versão em cache
    try {
      cryptedPass = this.encrypt(password);
    } catch (err) {
      console.log(err);
      cryptedPass = password;
    }

    const observable = this.http.post(`${this.SECURITY_URL}/auth/token`, {
      email: emailFormated,
      password: cryptedPass,
    });

    try {
      const response = await observable.toPromise();

      AuthService.token = (response as any).accessToken;
      await this.storage.set("accessToken" + this.global.storageId(), AuthService.token);
    } catch {
      AuthService.token = null;
    }
  }

  async requestFastAccessEmail(email: string) {
    const observable = this.http.post<any>(`${this.SECURITY_URL}/auth/${email.toLowerCase()}/fast-access-email`, null);

    try {
      await observable.toPromise();
      return true;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async requestFastAccessCodeEmail(email: string) {
    const observable = this.http.post<any>(`${this.SECURITY_URL}/auth/${email.toLowerCase()}/fast-access`, null);

    try {
      await observable.toPromise();
      return true;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async loginByAccessCode(code: string) {
    const observable = this.http.get(`${this.SECURITY_URL}/auth/token/${code}/fast-access`);
    try {
      const response = await observable.toPromise();

      AuthService.token = (response as any).accessToken;
      await this.storage.set("accessToken" + this.global.storageId(), AuthService.token);
    } catch {
      AuthService.token = null;
    }
  }

  async logout() {
    AuthService.token = null;
    AuthService.user = null;
    await this.storage.set("accessToken" + this.global.storageId(), null);
    await this.storage.set("user" + this.global.storageId(), null);
    // await this.fbauth.signOut();
  }

  async authenticate(tempToken) {
    var header = new HttpHeaders().set("Authorization", `Bearer ${tempToken}`);

    const observable = this.http.get<{ accessToken: string }>(`${this.SECURITY_URL}/auth/token`, {
      headers: header,
    });

    let response = await observable.toPromise();
    AuthService.token = response.accessToken;
    await this.storage.set("accessToken" + this.global.storageId(), (response as any).accessToken);
  }

  async getUserInfo(forceUpdate?: boolean) {
    const userStorage = await this.storage.get("user" + this.global.storageId());
    if (!AuthService.user) AuthService.user = userStorage;

    if (AuthService.user && !forceUpdate) return AuthService.user;

    if (!(await this.getToken())) return null;

    var observable = this.http.get(`${this.CUSTOMER_URL}api/v2/cliente/customer`, {
      headers: new HttpHeaders().set("Authorization", `Bearer ${await this.getToken()}`),
    });

    try {
      const response = await observable.toPromise();
      AuthService.user = (response as any).data;
      await this.storage.set("user" + this.global.storageId(), AuthService.user);
    } catch {
      this.logout();
    }

    return AuthService.user;
  }

  async userIsLogged() {
    return !!(await this.getToken());
  }

  async getToken() {
    if (AuthService.token) return AuthService.token;

    var accessToken = await this.storage.get("accessToken" + this.global.storageId());

    if (accessToken) AuthService.token = accessToken;

    return AuthService.token;
  }

  async crypt(pass): Promise<string> {
    const jwkKey = JSON.parse(
      atob(
        "eyAJImFsZyI6ICJSU0EtT0FFUC0yNTYiLCAJImUiOiAiQVFBQiIsIAkiZXh0IjogdHJ1ZSwgCSJrdHkiOiAiUlNBIiwgCSJuIjogImxhaWtza2w0anlNTUs1WktTMEhEcXRlUTBPQ3NDbWNCUlNydm56RUc2U3JNcHRpY29EaUEtR1lkcUlYYS1fUGZEMDE1T25iTmdCcWl6SXJRQmhmaE5pQ19TR3prM0ZTNGlBVmkwWERNS1BVQUU5YjRRRXpReU83OTlfSTN0YUVXaklaZ0t5cmFEMUVMZWYwN2FCN3JaUG9FQTQ0V2lsNy1OMnB0OUQ1LUNJdTNuNmhqckFYaHpzOVZ0TTdQV2NMTEpRaGU0dnBFVkVrdGxxYzI4SmNYYkhkSnhZNlk3YnJUTzhvSzJlMUJEbWs1YmFzbFB5SXl5am45SGd3QXpqeWVwNmsxT0dHRjUzazRLUS14cGYzX2RmbVB3Tk9BVTAwNlU0d3VXS0s0YVNtamJOeDJVQ1licXIwM3ZUTlRnZm5tTnYxMFlTaVJ0am5tNDZLV2xHQnptUSIgfQ=="
      )
    );

    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      jwkKey,
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" },
      },
      false,
      ["encrypt"]
    );

    const buf = new ArrayBuffer(pass.length * 2);
    const bufView = new Uint16Array(buf);
    for (var i = 0, strLen = pass.length; i < strLen; i++) {
      bufView[i] = pass.charCodeAt(i);
    }

    return window.crypto.subtle
      .encrypt(
        {
          name: "RSA-OAEP",
        },
        publicKey,
        buf
      )
      .then(function (encrypted) {
        var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(encrypted)));

        return base64String;
      });
  }

  encrypt(valueToEncrypt: string): string {
    const rsa = Forge.pki.publicKeyFromPem(this.publicKey);
    return window.btoa(rsa.encrypt(valueToEncrypt.toString()));
  }

  async userExistis(email: string, provider?: EProvider, idInProvider?: string): Promise<{ existis: boolean; social: boolean }> {
    const observable = this.http.get<{ existis: boolean; social: boolean }>(
      `${this.SECURITY_URL}/auth/${email.toLowerCase()}/verify-existis?idInProvider=${idInProvider || ""}&loginProvider=${provider || EProvider.NONE}`
    );

    try {
      const response = await observable.toPromise();
      return response;
    } catch {
      return null;
    }
  }

  // async userExistis(email: string): Promise<boolean> {
  //   const observable = this.http.get<{existis:boolean}>(`${this.SECURITY_URL}/auth/${email}/verify-existis`)

  //   try{
  //     const response = await observable.toPromise();
  //     return response.existis;
  //   }catch{
  //     return null;
  //   }
  // }
}
