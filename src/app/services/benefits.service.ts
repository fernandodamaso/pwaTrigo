import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class BenefitsService {
  constructor(private http: HttpClient) {}

  async insertCashback(cashback: any) {
    const body = cashback;

    var url = environment.urlBenefits + "InserirCashBack";

    console.log(`${environment.urlBenefits}InserirCashBack`);
    console.log(body);
    return this.http.post<any>(`${url}`, body).toPromise();
  }
}
