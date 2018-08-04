import { Component, OnInit } from "@angular/core";
import { ContactsService } from "../../services/contacts.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-contacts",
  templateUrl: "./contacts.component.html",
  styleUrls: ["./contacts.component.css"]
})
export class ContactsComponent implements OnInit {
  public contactsUsers = [];
  public contactsProviders = [];
  public contactsPropertyManagers = [];
  public currentContacts = [];
  public currentUser: any;
  private currentPropertyManager: any;
  public newContactType = "";

  constructor(
    private activatedRoute: ActivatedRoute,
    private userlist: ContactsService
  ) {}

  ngOnInit() {
    this.currentPropertyManager = JSON.parse(localStorage.getItem('propertyManagerData'));

    this.userlist.getContacts(this.currentPropertyManager['_id']).subscribe(data => {
      for (let i in data.usersResult) {
        let userData = {
          id: data.usersResult[i]._id,
          contact_type: "user",
          color: "red",
          name: `${data.usersResult[i].firstName} ${
            data.usersResult[i].lastName
          }`,
          initials: `${data.usersResult[i].firstName[0]}${
            data.usersResult[i].lastName[0]
          }`,
          email: data.usersResult[i].contact.email,
          mobile: data.usersResult[i].contact.email
        };
        this.contactsUsers.push(userData);
      }
      for (let i in data.vendorsResult) {
        let userData = {
          id: data.vendorsResult[i]._id,
          contact_type: "provider",
          color: "green",
          name: data.vendorsResult[i].vendorData.name,
          initials:
            (data.vendorsResult[i].vendorData.name && data.vendorsResult[i].vendorData.name.split(" ").length > 1)
              ? `${data.vendorsResult[i].vendorData.name.split(" ")[0][0]}${
                  data.vendorsResult[i].vendorData.name.split(" ")[1][0]
                }`
              : "",
          email: data.vendorsResult[i].vendorData.email,
          mobile: data.vendorsResult[i].vendorData.mobile
        };
        this.contactsProviders.push(userData);
      }
      for (let i in data.pManagersResult) {
        let userData = {
          id: data.pManagersResult[i]._id,
          contact_type: "property manager",
          color: "blue",
          name: `${data.pManagersResult[i].name} ${
            data.pManagersResult[i].surname
          }`,
          initials: `${data.pManagersResult[i].name[0]}${
            data.pManagersResult[i].surname[0]
          }`,
          email: data.pManagersResult[i].email,
          mobile: data.pManagersResult[i].contact.mobile
        };
        this.contactsPropertyManagers.push(userData);
      }
      this.currentContacts = [];
      this.currentContacts = this.currentContacts.concat(this.contactsUsers);
      this.currentContacts = this.currentContacts.concat(
        this.contactsProviders
      );
      this.currentContacts = this.currentContacts.concat(
        this.contactsPropertyManagers
      );
    });
    this.activatedRoute.queryParams.subscribe(queryparams => {
      switch (queryparams["typecontact"]) {
        case "users":
          this.currentContacts = [];
          this.currentContacts = this.contactsUsers;
          break;
        case "providers":
          this.currentContacts = [];
          this.currentContacts = this.contactsProviders;
          break;
        case "managers":
          this.currentContacts = [];
          this.currentContacts = this.contactsPropertyManagers;
          break;
        default:
          this.currentContacts = [];
          this.currentContacts = this.currentContacts.concat(
            this.contactsUsers
          );
          this.currentContacts = this.currentContacts.concat(
            this.contactsProviders
          );
          this.currentContacts = this.currentContacts.concat(
            this.contactsPropertyManagers
          );
          break;
      }
    });
  }

  onUploadError(e) {}

  onUploadSuccess(e) {}
}
