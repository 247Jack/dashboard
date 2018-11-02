import { Component, OnInit } from "@angular/core";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { CompanyService } from "../../services/companies.service"

@Component({
  selector: "app-company",
  templateUrl: "./company.component.html",
  styleUrls: ["./company.component.css"]
})
export class CompanyComponent implements OnInit {

  public currentPropertyManager: any;
  public currentCompany = ""
  public itemList = [];
  public selectedItems = [];
  public settings = {};
  public currectSelectItem

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private companies: CompanyService
  ) {}
  ngOnInit() {
    var waitForPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(
        sessionStorage.getItem("propertyManagerData")
      );
      this.currentCompany = sessionStorage.getItem("PMcompany")
      if (this.currentPropertyManager && this.currentCompany) {
        clearInterval(waitForPMData);
        this.spinnerService.show();
        this.companies.getCompanies(this.currentPropertyManager['_id']).subscribe(data => {
          console.log(data)
          this.spinnerService.hide();
          for(var co in data)
          {
            var currentItem = {
              id: co,
              itemName: data[co]
            }
            this.itemList.push(currentItem)
            if(data[co] === this.currentCompany)
            {
              this.selectedItems.push(currentItem)
              this.currectSelectItem = currentItem
            }
          }
        })
      }
    }, 100);
    this.settings = { singleSelection: true, text: "Select Property" };
    
  }
  onItemSelect(item: any) {
    window.open(`/?company=${item.itemName}`, '_blank');
    this.selectedItems = []
    this.selectedItems.push(this.currectSelectItem)
    /*
    this.companies.switchCompany(this.currentPropertyManager['_id'],item.id).subscribe(data => {
      window.location.href = "/home";
    });
    */
  }
  OnItemDeSelect(item: any) {
    console.log(item);
  }
  onSelectAll(item: any) {
    console.log(item);
  }
  onDeSelectAll(item: any) {
    console.log(item);
  }
}
