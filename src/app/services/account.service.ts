import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import * as OktaSignIn from '@okta/okta-signin-widget';
import { environment } from "../../environments/environment";

@Injectable()
export class AccountService {

  public accountInfo : any;
  private widget;

  constructor(private http: Http) {
    this.widget = new OktaSignIn({
      baseUrl: 'https://dev-825764.oktapreview.com',
      clientId: environment.okta_clientId,
      redirectUri: `${environment.self_host}/implicit/callback`,
      authParams: {
        issuer: 'default'
      }
    });
   }

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

  public getWidget() {
    return this.widget;
  }

  public getCurrentAccountData()
  {
    return this.accountInfo;
  }

}
