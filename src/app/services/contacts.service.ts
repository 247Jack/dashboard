import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../../environments/environment';

@Injectable()
export class ContactsService {
  constructor(private http: Http) { }
  public phoneSuggested = '';

  public getContacts(pm_id, company, type?) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
    const options = new RequestOptions({ 'headers': headers });

    const selected_type = type ? `?type=${type}` : '';
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

  public getSingleContact(pm_id, company, contactId) {
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

  public addContact(pm_id, currentCompany, contactData, type) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', currentCompany);
    const options = new RequestOptions({ 'headers': headers });
    console.log(contactData);
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
        // window.location.reload();
        return Observable.throw(error.message || error);
      });
  }

  public getAddressSuggestion(address, city, zip) {
    const data = { 'address': address, 'city': city, 'zip': zip };
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ 'headers': headers });
    console.log(options);
    return this.http
      .post('https://15kcv4z18f.execute-api.us-east-1.amazonaws.com/dev/dashboard/utils/address', data, options)
      .map(res => {
        console.log(res.json());
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }

  public getPhoneSuggestion(phone) {
    const data = { 'phone': phone };
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ 'headers': headers });
    console.log(options);
    return this.http
      .post('https://15kcv4z18f.execute-api.us-east-1.amazonaws.com/dev/dashboard/utils/phone', data, options)
      .map(res => {
        console.log(res.json());
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }
  
  public getPhoneReturned() { return this.phoneSuggested; }
  public setphoneSuggested(phoneSuggested) { this.phoneSuggested = phoneSuggested; }

  public editContact(pm_id, contactData, type) {

  }

}
