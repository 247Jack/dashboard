import { Injectable } from '@angular/core';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in.min.js';
import { environment } from '../../environments/environment';
@Injectable()
export class Okta {
  widget;

  constructor() {
    this.widget = new OktaSignIn({
      baseUrl: "https://dev-825764.oktapreview.com",
      clientId: environment.okta_clientId,
      redirectUri: `${environment.self_host}/implicit/callback`,
    });
  }

  getWidget() {
    return this.widget;
  }
}

