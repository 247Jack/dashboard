import { Component, OnInit } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { TicketsService } from "../../services/tickets.service";

@Component({
  selector: 'app-wo',
  templateUrl: './wo.component.html',
  styleUrls: ['./wo.component.css']
})
export class WoComponent implements OnInit {

  public tickets;
  public time;
  public date;
  public currentPropertyManager;
  public currentCompany;
  public currentTicket;
  public limitRows = 8;
  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private ticket: TicketsService
  ) {}

  ngOnInit() {
    var waitForPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(
        sessionStorage.getItem("propertyManagerData")
      );
      this.currentCompany = sessionStorage.getItem("PMcompany")
      if (this.currentPropertyManager && this.currentCompany) {
        clearInterval(waitForPMData);
        this.loadTasks();
        this.ticket.update.subscribe(updating => {
          this.loadTasks();
        });
      }
    }, 100);
  }

  public checkPendientTask(event, task) {
    this.currentTicket = task;
  }

  public evaluateTask(response) {
    this.ticket
      .evaluateTaskThreshold(
        this.currentTicket._id,
        response,
        this.currentPropertyManager._id,
        this.currentCompany
      )
      .subscribe(data => {
        this.loadTasks()
      });
  }

  private loadTasks(){
    this.spinnerService.show();
    this.ticket
    .getTickets(this.currentPropertyManager["_id"], this.currentCompany)
    .subscribe(data => {
      console.log(data)
      this.spinnerService.hide();
      this.tickets = data;
      this.tickets.reverse()
      for (let i in data) {
        this.date = data[i].creationDate.split("T")[0];
        this.time = data[i].creationDate.split(/\.|\T/)[1];
      }
    });
  }
  onChange(deviceValue) {
    this.limitRows = deviceValue;
  }

}
