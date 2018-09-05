import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-company",
  templateUrl: "./company.component.html",
  styleUrls: ["./company.component.css"]
})
export class CompanyComponent implements OnInit {

  itemList = [];
  selectedItems = [];
  settings = {};

  constructor() {}
  ngOnInit() {
    this.itemList = [
      { id: 1, itemName: "Property 1"},
      { id: 2, itemName: "Property 2" },
      { id: 3, itemName: "Property 3" },
    ];
    this.settings = { singleSelection: true, text: "Select Property" };
  }
  onItemSelect(item: any) {
    console.log(item);
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
