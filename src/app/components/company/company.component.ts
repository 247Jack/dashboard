import { Component, OnInit } from "@angular/core";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { CompanyService } from "../../services/companies.service"

@Component({
  selector: "app-company",
  templateUrl: "./company.component.html",
  styleUrls: ["./company.component.css"]
})
export class CompanyComponent implements OnInit {

  private currentPropertyManager: any;
  public itemList = [];
  public selectedItems = [];
  public settings = {};

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private companies: CompanyService
  ) {}
  ngOnInit() {
    this.settings = { singleSelection: true, text: "Select Property" };
    this.spinnerService.show();
    this.currentPropertyManager = JSON.parse(localStorage.getItem('propertyManagerData'));
    this.companies.getCompanies(this.currentPropertyManager['_id']).subscribe(data => {
      this.spinnerService.hide();
      for(var co in data)
      {
        var currentItem = {
          id: data[co]['_id'],
          itemName: data[co]['name']
        }
        this.itemList.push(currentItem)
        if(data[co]['name'] === this.currentPropertyManager.company)
        {
          this.selectedItems.push(currentItem)
        }
      }
    })
  }
  onItemSelect(item: any) {
    this.companies.switchCompany(this.currentPropertyManager['_id'],item.id).subscribe(data => {
      window.location.href = "/home";
    });
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
