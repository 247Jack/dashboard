import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../../environments/environment';

@Injectable()
export class ContactsService {
  constructor(private http: Http) { }
  public originalContactData = null;
  public phoneSuggested = new BehaviorSubject<string>('');

  // Phone E.164 standardizeD returnEd by the 'phone API'  GLobal Variable
  currentPhoneSuggested = this.phoneSuggested.asObservable();
  changePhone(phone: string) {
    this.phoneSuggested.next(phone);
  }

  // GLobal Current Contact Data
  public getCurrentContactData() { return this.originalContactData; }
  public setCurrentContactData(originalContactData) {
    this.originalContactData = null;
    this.originalContactData = originalContactData;
  }

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

  public getAddressSuggestion(addressToValidate) {
    const data = { 'address': addressToValidate.address, 'city': addressToValidate.city, 'zip': addressToValidate.zip };
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .post('https://15kcv4z18f.execute-api.us-east-1.amazonaws.com/dev/dashboard/utils/address', data, options)
      .map(res => {
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
    return this.http
      .post('https://15kcv4z18f.execute-api.us-east-1.amazonaws.com/dev/dashboard/utils/phone', data, options)
      .map(res => {
        return res.json();
      })
      .catch(error => {
        return Observable.throw(error.message || error);
      });
  }

  /**
  * POST the updated data of a specific contact
  * @param enableFields:bool enable or disable form fields
  * @returns void
  */
  public editContact(contactData, pm_id, currentCompany, contactId, type): Observable<any> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', currentCompany);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .post(
        `${environment.api_domain}/dashboard/contacts/${contactId}?user_type=${type}`,
        contactData,
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