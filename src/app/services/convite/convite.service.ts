import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Convite } from "src/app/models/Convite";
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable } from "rxjs";
import { Indicado } from "../models/Indicado";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class conviteService {
  public IsRedirected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  getAll() {
    return this.http.get<Convite[]>(environment.urlConvite + "api/Convite/GetConvites");
  }

  getConvitesByIdIndicador_gerador_link(idIndicador: any, idmarca: any): Observable<Convite> {
    return this.http.get<Convite>(`${environment.urlConvite}api/Convite/GetConviteIdIndicador/${idIndicador}/${idmarca}`);
  }

  redirect() {
    this.IsRedirected.next(true);
  }

  getConvitesByIdIndicador(idIndicador: any): Observable<Convite> {
    return this.http.get<Convite>(`${environment.urlConvite}api/Convite/GetConviteIdIndicador/${idIndicador}`);
  }

  GetConvitesByIndicado(idIndicado: any): Observable<Convite> {
    return this.http.get<Convite>(`${environment.urlConvite}api/Convite/GetConvitesByIndicado/${idIndicado}`);
  }

  getValorBeneficio(idIndicador: any): Observable<number> {
    return this.http.get<number>(`${environment.urlConvite}api/Convite/GetConviteIdIndicador/${idIndicador}`);
  }

  GetUltimaConfigAtiva(idmarca: number, isIndicador: boolean) {
    return this.http.get<any>(`${environment.urlConvite}api/Configuracao/GetUltimaConfigAtiva/${idmarca}/${isIndicador}`);
  }

  getIndicadosByIdIndicador(idIndicador: any): Observable<Indicado[]> {
    return this.http.get<Indicado[]>(`${environment.urlConvite}api/Indicado/GetIndicadosByIdIndicador/${idIndicador}`).pipe(map((data: any) => data.data));
  }

  insertConvite(convite: Convite, idIndicador: string) {
    const body = convite;
    this.http.post<Convite>(`${environment.urlConvite}api/Convite/GetConviteIdIndicador/${idIndicador}`, body).subscribe((data) => {
      return data;
    });
  }

  deleteConvite(idConvite: string) {
    this.http.delete<any>(`${environment.urlConvite}api/Convite/InsertConvite/${idConvite}`).subscribe((data) => {
      return data;
    });
  }

  GetDadosClienteIndicador(idcliente: any, idmarca: any, token: any) {
    return this.http.get(`${environment.urlCliente}api/Cliente/SelecionaDadosCliente/${idcliente}/${idmarca}/${token}`);
  }

  updateConvite(convite: Convite, idConvite: string) {
    this.http.put<Convite>(`${environment.urlConvite}api/Convite/${idConvite}`, convite).subscribe((data) => {
      return data;
    });
  }
}
