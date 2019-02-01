import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { environment } from "../../environments/environment";

@Injectable()
export class CompanyService {

  constructor(private http: Http) { }

  public getCompanies(pm_id) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/companies/`,options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        window.location.reload();
        return error;
      });
  }

  public switchCompany(pm_id,companyId)
  {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .post(
        `${environment.api_domain}/dashboard/companies/${companyId}`,{},options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        window.location.reload();
        return error;
      });
  }

  public getCompanyOptions(pm_id,company){
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/companies/options`,options
      )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        window.location.reload();
        return error;
      });
  }

  public setCompanyOptions(pm_id,company,newOptions){
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .post(
        `${environment.api_domain}/dashboard/companies/options`,newOptions,options
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
