import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { environment } from "../../environments/environment";

@Injectable()
export class AccountService {

  public accountInfo : any;

  constructor(private http: Http) { }

  public getAccountData(email) {
    return this.http
      .get(
        `${environment.api_domain}/dashboard/authentication/${email}`
      )
      .map(res => {
        this.accountInfo = res.json();
        return res.json();
      })
      .catch(error => {
        return error;
      });
  }

  public getCurrentAccountData()
  {
    return this.accountInfo;
  }

}
