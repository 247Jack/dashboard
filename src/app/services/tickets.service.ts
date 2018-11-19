import { Injectable, Output, EventEmitter } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { environment } from "../../environments/environment";

@Injectable()
export class TicketsService {

  @Output() update: EventEmitter<boolean> = new EventEmitter();

  constructor(private http: Http) { }

  public getTickets(pm_id, company) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/tasks/`,
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

  public createTicket(ticketInfo, pm_id, company) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
    const options = new RequestOptions({ 'headers': headers });
    return this.http.post(
      `${environment.api_domain}/dashboard/tasks/`,
      ticketInfo,
      options
    )
      .catch(error => {
        window.location.reload();
        return Observable.throw(error.message || error);
      });
  }

  public evaluateTaskThreshold(task_id, action, pm_id) {
    /*
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    const options = new RequestOptions({ 'headers': headers });
    */
    return this.http.get(
      `${environment.api_domain}/dashboard/tasks/${task_id}/evaluatethreshold?type=${action}`,
      {}
    )
      .catch(error => {
        window.location.reload();
        return Observable.throw(error.message || error);
      });
  }

  public updateDashoboard() {
    this.update.emit(null);
  }

  public editTask(task_id, pm_id, pm_company, updateData) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', pm_company);
    const options = new RequestOptions({ 'headers': headers });
    return this.http.post(
      `${environment.api_domain}/dashboard/tasks/${task_id}`,
      updateData,
      options
    ).map(res => {
      return res.json();
    })
      .catch(error => {
        window.location.reload();
        return Observable.throw(error.message || error);
      });
  }

  public getBitlyLink(task_id, vendor_id) {
    return this.http.post(
      `${environment.api_domain}/dashboard/tasks/${task_id}/joblink`,
      {
        "vendor_id": vendor_id
      }
    )
      .map(res => {
        return res.json();
      })
      .catch(error => {
        window.location.reload();
        return Observable.throw(error.message || error);
      });
  }

  public getEditTask(pm_id, company, task_id) {
    const headers = new Headers();
    headers.append('property_manager_id', pm_id);
    headers.append('property_manager_company', company);
    const options = new RequestOptions({ 'headers': headers });
    return this.http
      .get(
        `${environment.api_domain}/dashboard/tasks/${task_id}`,
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
//   public deleteField(task_id , pm_id, company ) {
//     const headers = new Headers();
//     headers.append('property_manager_id', pm_id);
//     headers.append('property_manager_company', company);
//     const options = new RequestOptions({ 'headers': headers });
//     return this.http
//       .delete(
//         `${environment.api_domain}/dashboard/tasks/${task_id}`,
//         options
//       )
//       .map(res => {
//         return res.json();
//       })
//       .catch(error => {
//         window.location.reload();
//         return Observable.throw(error.message || error);
//       });
//   }
}
