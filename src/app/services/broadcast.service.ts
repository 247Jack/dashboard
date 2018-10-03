import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { environment } from "../../environments/environment";

@Injectable()
export class BroadcastService {

  constructor(private http: Http) { }

  public makeBroadcast(pm_id, contactType, contactsList, message)
  {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .post(
        `${environment.api_domain}/dashboard/broadcast/`,{
            contactType: contactType,
            contactsList: contactsList,
            message: message
        },options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        window.location.reload();
        return error;
      });
  }

}
