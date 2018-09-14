import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-broadcast",
  templateUrl: "./broadcast.component.html",
  styleUrls: ["./broadcast.component.css"]
})
export class BroadcastComponent implements OnInit {
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  ngOnInit() {
    this.dropdownList = [
      { id: 1, itemName: "India" },
      { id: 2, itemName: "Singapore" },
      { id: 3, itemName: "Australia" },
      { id: 4, itemName: "Canada" },
      { id: 5, itemName: "South Korea" },
      { id: 6, itemName: "Germany" },
      { id: 7, itemName: "France" },
      { id: 8, itemName: "Russia" },
      { id: 9, itemName: "Italy" },
      { id: 10, itemName: "Sweden" }
    ];
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Receivers",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
    };
  }
  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
}
