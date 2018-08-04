import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { environment } from "../../environments/environment";

@Injectable()
export class ContactsService {
  constructor(private http: Http) {}

  public getContacts(pm_id, type?) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });

    var selected_type = type ? `?type=${type}` : '';
    return this.http
      .get(
        `${environment.api_domain}/dashboard/contacts${selected_type}`,
        options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }
}
