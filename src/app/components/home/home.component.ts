import { Component, OnInit } from "@angular/core";
import { StatsService } from "../../services/stats.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  public stats = Array;
  public currentPropertyManager = Array;
  status: boolean = false;
  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private stat: StatsService
  ) {}

  ngOnInit() {
    var waitForPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(
        localStorage.getItem("propertyManagerData")
      );
      if (this.currentPropertyManager) {
        clearInterval(waitForPMData);
        this.loadStats();
      }
    }, 100);
  }
  0;
  public loadStats() {
    this.spinnerService.show();
    this.stat
      .getStats(this.currentPropertyManager["_id"], 30)
      .subscribe(data => {
        this.stats = data;
        this.spinnerService.hide();
        this.status = true;
      });
  }
}
