import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { environment } from "../../environments/environment";

@Injectable()
export class IssuesService {

  constructor(private http: Http) { }

  public getIssues() {
    return this.http
      .get(
        `${environment.api_domain}/dashboard/issues`
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }

}
