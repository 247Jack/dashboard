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

  public getContacts(pm_id, company, type?) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
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
        window.location.reload();
        return Observable.throw(error.message || error);
      });
  }

  public getSingleContact(pm_id, company, contactId)
  {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/contacts/${contactId}`,
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

  public addContact(pm_id, contactData, type)
  {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    console.log(contactData)
    return this.http
      .post(
        `${environment.api_domain}/dashboard/contacts?contact_type=${type}`,
        contactData,
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

  public editContact(pm_id, contactData, type)
  {

  }

}
