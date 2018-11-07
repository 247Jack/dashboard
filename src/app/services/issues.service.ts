import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { environment } from "../../environments/environment";
import { EventEmitter, Output } from '@angular/core';

@Injectable()
export class IssuesService {

  @Output() senddata: EventEmitter<any> = new EventEmitter();

  constructor(private http: Http) { }

  public getIssues(pm_id) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/issues`,
        options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        window.location.reload();
        return Observable.throw(error.message || error);
      });
  }

  public sendData(data) {
    this.senddata.emit(data);
  }

}
