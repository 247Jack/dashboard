import { Component, OnInit } from "@angular/core";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { TicketsService } from "../../services/tickets.service";
import { ContactsService } from "../../services/contacts.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  public tickets;
  public time;
  public date;
  public currentPropertyManager;
  public currentTicket;
  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private ticket: TicketsService
  ) {}

  ngOnInit() {
    this.spinnerService.show();
    var waitForPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(
        localStorage.getItem("propertyManagerData")
      );
      if (this.currentPropertyManager) {
        clearInterval(waitForPMData);
        this.ticket
          .getTickets(this.currentPropertyManager["_id"])
          .subscribe(data => {
            console.log(data);
            this.spinnerService.hide();
            this.tickets = data;
            for (let i in data) {
              this.date = data[i].creationDate.split("T")[0];
              this.time = data[i].creationDate.split(/\.|\T/)[1];
            }
          });
      }
    }, 100);
  }

  public checkPendientTask(event, task) {
    this.currentTicket = task;
  }

  public evaluateTask(response) {
    //console.log(response)
    this.ticket
      .evaluateTaskThreshold(
        this.currentTicket._id,
        response,
        this.currentPropertyManager._id
      )
      .subscribe(data => {
        console.log(data);
      });
  }
}
