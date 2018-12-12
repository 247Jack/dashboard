import { style, animate, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ContactsService } from '../../services/contacts.service';
import { ModalComponent } from 'dsg-ng2-bs4-modal/ng2-bs4-modal';
import { Tenant, Vendor, PropertyManager } from './contact-interfaces';
import { IssuesService } from '../../services/issues.service';
// import { AsyncPhoneValidator } from './phoneValidation';
import * as _ from 'lodash';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
// import { timingSafeEqual } from 'crypto';
// import { Console } from '@angular/core/src/console';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})

export class ContactsComponent implements OnInit, OnDestroy {

  // Session storage data: user data
  public currentCompany;
  public currentPropertyManager: any;

  // Data from db: Users list
  private getContactsConnection;
  public contactsTenants = [];
  public contactsVendors = [];
  public contactsPropertyManagers = [];

  // The contacts inside this array are those displayed into the UI
  public currentContacts = [];

  // Flag to watch when contacts data from db has been fully loaded on the above objects
  public dataLoaded = false;

  // Holds the data retrieved from getSingleContact() service for current contact selected
  public currentContact: any;
  public currentContactType = '';

  // Input from search contact textbox
  public filtercontacts = '';

  // Variables for 'Add Contact' feature
  public newTenantInitials = [];
  public newVendorInitials = [];
  public newContactType = '';

  // Variables for 'Edit Contact' feature
  public enableEditFields = false;
  public originalContact = null;

  // Variables to setup the services dropdown
  public issuelist = [];
  public issuesSelectedItems = [];
  public issuesettings = {};
  public getIssuesConn;

  // Variables for the Address Validation requiremnt
  public addressSuggestion = false;
  public invalidAddress = false;
  public addressComparisonHtml = [];

  public addressToValidate = {
    address: '',
    city: '',
    zip: ''
  };

  public suggestedAddress = {
    address: '',
    city: '',
    zip: ''
  };

  // Modal Variables
  @ViewChild('modalmessage')
  modal: ModalComponent;
  public modalTitle = '';
  public modalBody = '';

  // 'Edit Contact' feature objects
  public updateStoreProcessFinished = false;

  // public editResidentData: Tenant; // TODO
  public editResidentData = {
    initials: '',
    firstName: '',
    lastName: '',
    portfolio: '',
    unit_abbr_name: '',
    service_threshold: '',
    originalAddress: '',
    address: '',
    address2: '',
    city: '',
    zip: '',
    endDate: '',
    phone: '',
    homePhone: '',
    workPhone: '',
    email: '',
    alexa: '',
    fb: '',
    ghome: '',
    sms: ''
  };

  // public editVendorData: Vendor; // TODO
  public editVendorData = {
    initials: '',
    jobType: '',
    services: [],
    name: '',
    phone: '',
    ext: '',
    address: '',
    email: '',
    comments: ''
  };

  // public editPMData: PropertyManager; // TODO
  public editPMData = {
    initials: '',
    email: '',
    name: '',
    surname: '',
    phone: '',
    address: ''
  };

  // 'Add Contact' feature object
  // public newResidentData: Tenant; // TODO
  public newResidentData = {
    firstName: '',
    lastName: '',
    portfolio: '',
    service_threshold: '',
    originalAddress: '',
    address: '',
    address2: '',
    city: '',
    zip: '',
    phone: '',
    homePhone: '',
    workPhone: '',
    email: '',
    alexa: '',
    fb: '',
    sms: '',
    ghome: ''
  };

  // public newVendorData: Vendor; // TODO
  public newVendorData = {
    jobType: '',
    services: [],
    name: '',
    vendorName: '',
    phone: '',
    ext: '',
    address: '',
    email: '',
    comments: ''
  };

  // public newPMData: PropertyManager; // TODO
  public newPMData = {
    email: '',
    name: '',
    surname: '',
    phone: '',
    address: ''
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private contacts: ContactsService,
    private issues: IssuesService,
    private router: Router
  ) { }

  // get diagnostic() { return JSON.stringify(this.newVendorData); }

  ngOnInit() {
    this.waitForPMData();
  }

  ngOnDestroy() {
    if (this.getContactsConnection) {
      this.getContactsConnection.unsubscribe();
    }
  }

  waitForPMData() {
    this.spinnerService.show();
    const waitPMData = setInterval(() => {
      this.currentPropertyManager = JSON.parse(sessionStorage.getItem('propertyManagerData'));
      this.currentCompany = sessionStorage.getItem('PMcompany');
      if (this.currentPropertyManager && this.currentCompany) {
        clearInterval(waitPMData);
        this.currentPropertyManager = JSON.parse(sessionStorage.getItem('propertyManagerData'));
        this.getContactsConnection = this.contacts.getContacts(this.currentPropertyManager['_id'], this.currentCompany).subscribe(data => {
          this.mapContactsObjectsByTypes(data);
        });
        this.activatedRoute.queryParams.subscribe(queryparams => {
          const waitForContacts = setInterval(() => {
            if (this.dataLoaded) {
              this.currentContacts = [];
              switch (queryparams['typecontact']) {
                case 'tenants':
                  this.currentContacts = this.contactsTenants;
                  // console.log(this.currentContacts);
                  break;
                case 'providers':
                  this.currentContacts = this.contactsVendors;
                  // console.log(this.currentContacts);
                  break;
                case 'managers':
                  this.currentContacts = this.contactsPropertyManagers;
                  // console.log(this.currentContacts);
                  break;
                case 'all':
                  this.currentContacts = this.currentContacts.concat(this.contactsTenants, this.contactsVendors, this.contactsPropertyManagers);
                  // console.log(this.currentContacts);
                  break;
                default:
                  this.currentContacts = this.currentContacts.concat(this.contactsTenants, this.contactsVendors, this.contactsPropertyManagers);
                  break;
              }
              clearInterval(waitForContacts);
            }
          }, 100);
        });
        this.activatedRoute.params.subscribe(params => {
          this.currentContactType = '';
          if (params.contactId) {
            document.getElementById('openModalButton').click();
            this.contacts.getSingleContact(this.currentPropertyManager._id, this.currentCompany, params.contactId)
              .subscribe(contactDataFromDatabase => {
                this.mapContactData(contactDataFromDatabase);
                this.currentContactType = contactDataFromDatabase.contactType;
                this.currentContact = contactDataFromDatabase.contactResult;
              });
          }
        });
        this.setIssuesDropdown();
      }
    }, 100);
  }

  /**
   * Get the selected items from the new vendor services and assign those to the this.editVendorData object
   * @param none
   * @returns arrayServices[]
   */
  setNewVendortServices() {
    const arrayServices = [];
    for (const i in this.issuesSelectedItems) {
      if (this.issuesSelectedItems) {
        arrayServices.push(this.issuesSelectedItems[i]);
      }
    }
    return arrayServices;
    // this.editVendorData.services = arrayServices;
    // console.log(this.editVendorData.services);
    // console.log(arrayServices);
  }

  /**
   * This function maps the issues retrieved from db to dropdown
   * @param none
   * @returns void
   */
  setIssuesDropdown() {
    this.issuesSelectedItems = this.editVendorData.services;
    console.log(this.issuesSelectedItems);
    this.bindIssuesSettings();
    this.getIssuesConn = this.issues
      .getIssues(this.currentPropertyManager['_id'])
      .subscribe(listIssues => {
        const issueListNav = [];
        for (const i in listIssues) {
          if (listIssues) {
            issueListNav.push({
              id: listIssues[i]._id,
              itemName: listIssues[i].issueToken
            });
          }
        }
        this.issuelist = issueListNav;
      });
  }

  /**
   * This function maps the current contacts data to the corresponding arrays by contacts types
   * @param contactData:any this is the contact data retrieved from db
   * @returns void
   */
  mapContactsObjectsByTypes(data) {
    for (const i in data.usersResult) {
      if (data.usersResult) {
        const userData = {
          id: data.usersResult[i]._id,
          contact_type: 'user',
          color: 'tenant-color',
          name: `${data.usersResult[i].firstName} ${
            data.usersResult[i].lastName
            }`,
          initials: `${data.usersResult[i].firstName[0]}${
            data.usersResult[i].lastName[0]
            }`,
          email: data.usersResult[i].contact.email,
          mobile: data.usersResult[i].app.sms,
          originalData: data.usersResult[i]
        };
        this.contactsTenants.push(userData);
      }
    }
    for (const i in data.vendorsResult) {
      if (data.vendorsResult) {
        const userData = {
          id: data.vendorsResult[i]._id,
          contact_type: 'provider',
          color: 'vendor-color',
          name: data.vendorsResult[i].vendorData.name,
          initials:
            (data.vendorsResult[i].vendorData.name && data.vendorsResult[i].vendorData.name.split(' ').length > 1)
              ? `${data.vendorsResult[i].vendorData.name.split(' ')[0][0]}${
              data.vendorsResult[i].vendorData.name.split(' ')[1][0]
              }`
              : '',
          email: data.vendorsResult[i].vendorData.email,
          mobile: data.vendorsResult[i].vendorData.phone || data.vendorsResult[i].vendorData.mobile,
          originalData: data.vendorsResult[i]
        };
        this.contactsVendors.push(userData);
      }
    }
    for (const i in data.pManagersResult) {
      if (data.pManagersResult) {
        const userData = {
          id: data.pManagersResult[i]._id,
          contact_type: 'property manager',
          color: 'pms-color',
          name: `${data.pManagersResult[i].name} ${
            data.pManagersResult[i].surname
            }`,
          initials: `${data.pManagersResult[i].name[0]}${
            data.pManagersResult[i].surname[0]
            }`,
          email: data.pManagersResult[i].email,
          mobile: data.pManagersResult[i].contact.mobile,
          originalData: data.pManagersResult[i]
        };
        this.contactsPropertyManagers.push(userData);
      }
    }
    this.currentContacts = this.currentContacts.concat(this.contactsTenants, this.contactsVendors, this.contactsPropertyManagers);
    this.dataLoaded = true;
    this.spinnerService.hide();
    // console.log('mapContactsObjectsByTypes: currentContacts');
    // console.log(this.currentContacts);
  }

  /**
   * This function map the current contact data with the properties of the db
   * @param contactData:any this is the contact data retrieved from db
   * @returns void
   */
  mapContactData(contactData) {
    // console.log(contactData.contactResult);
    switch (contactData.contactType) {
      case 'tenant':
        this.editResidentData.initials = contactData.contactResult.firstName[0] + contactData.contactResult.lastName[0];
        this.editResidentData.firstName = contactData.contactResult.firstName;
        this.editResidentData.lastName = contactData.contactResult.lastName;
        this.editResidentData.portfolio = contactData.contactResult.portfolio;
        this.editResidentData.unit_abbr_name = contactData.contactResult.unit_abbr_name;
        this.editResidentData.service_threshold = contactData.contactResult.service_threshold;
        this.editResidentData.address = contactData.contactResult.building.address;
        this.editResidentData.address2 = contactData.contactResult.building.address2;
        this.editResidentData.city = contactData.contactResult.building.city;
        this.editResidentData.zip = contactData.contactResult.building.zip;
        this.editResidentData.phone = contactData.contactResult.contact.phone;
        this.editResidentData.workPhone = contactData.contactResult.contact.workPhone;
        this.editResidentData.email = contactData.contactResult.contact.email;
        this.editResidentData.alexa = contactData.contactResult.app.alexa;
        this.editResidentData.ghome = contactData.contactResult.app.ghome;
        this.editResidentData.fb = contactData.contactResult.app.fb;
        this.editResidentData.sms = contactData.contactResult.app.sms;
        break;
      case 'vendor':
        this.editVendorData.initials =
          (contactData.contactResult.vendorData.name && contactData.contactResult.vendorData.name.split(' ').length > 1)
            ? `${contactData.contactResult.vendorData.name.split(' ')[0][0]}` +
            `${contactData.contactResult.vendorData.name.split(' ')[1][0]}`
            : '';
        this.editVendorData.name = contactData.contactResult.vendorData.name;
        this.editVendorData.address = contactData.contactResult.vendorData.address;
        this.editVendorData.jobType = contactData.contactResult.vendorData.jobType;
        this.editVendorData.phone = contactData.contactResult.vendorData.phone;
        this.editVendorData.email = contactData.contactResult.vendorData.email;
        this.editVendorData.comments = contactData.contactResult.vendorData.comments;
        this.editVendorData.services = contactData.contactResult.vendorData.services;
        break;
      case 'property manager':
        this.editPMData.initials = contactData.contactResult.name[0] + contactData.contactResult.surname[0];
        this.editPMData.name = contactData.contactResult.name;
        this.editPMData.surname = contactData.contactResult.surname;
        this.editPMData.email = contactData.contactResult.email;
        this.editPMData.phone = contactData.contactResult.phone;
        this.editPMData.address = contactData.contactResult.address;
        break;
      default:
    }
    // console.log('currentContact:');
    // console.log(this.currentContact);
  }

  /**
   * Setup form to start editing user data
   * @param enableFields:bool enable or disable form fields
   * @returns void
   */
  setupContactForm(enableFields) {
    this.enableEditFields = enableFields;
    this.setIssuesDropdown();
  }

  /**
   * Stores new contact on the database via HTTP POST by contacts.service
   * @param none
   * @returns void
   */
  async saveNewContact() {
    if (this.newContactType) {
      let newContactData;
      switch (this.newContactType) {
        case 'tenant':
        await this.contacts.currentPhoneSuggested.subscribe(phone => {
          this.newResidentData.phone = phone;
          this.newResidentData.sms = phone;
          newContactData = this.newResidentData;
        });
          break;
        case 'vendor':
          this.newVendorData.services = this.setNewVendortServices();
          this.newVendorData.name = this.newVendorData.vendorName;
          await this.contacts.currentPhoneSuggested.subscribe(phone => {
            if (phone) {
              this.newVendorData.phone = phone;
            } else {
              this.newVendorData.phone = ' ';
            }
            newContactData = this.newVendorData;
          });
          break;
        case 'property_manager':
          newContactData = this.newPMData;
          break;
        default:
          newContactData = {};
          break;
      }
      this.contacts.addContact(this.currentPropertyManager._id, this.currentCompany, newContactData, this.newContactType).subscribe(data => {
        this.resetContactData(this.newContactType);
        this.updateStoreProcessFinished = true;
        this.modalAddContactResult(data.ok);
        this.spinnerService.hide();
      });
    }
  }

  /**
  * After store new contact on DB thus method reset the new contact data
  * @param contactType contact data to reset
  * @returns void
  */
  resetContactData(contactType) {
    if (contactType === 'tenant') {
      this.newResidentData = {
        firstName: '',
        lastName: '',
        portfolio: '',
        service_threshold: '',
        originalAddress: '',
        address: '',
        address2: '',
        city: '',
        zip: '',
        phone: '',
        homePhone: '',
        workPhone: '',
        email: '',
        alexa: '',
        fb: '',
        sms: '',
        ghome: ''
      };
      this.newTenantInitials = [];
    } else if (contactType === 'vendor') {
      this.newVendorData = {
        jobType: '',
        services: [],
        name: '',
        vendorName: '',
        phone: '',
        ext: '',
        address: '',
        email: '',
        comments: ''
      };
      this.newVendorInitials = [];
    }
  }

  /**
  * This event handles the "Edit Contact" form submit event
  * @param form Frontend Form object
  * @returns void
  */
  onSubmitEdit(form) {
    if (form.valid) {
      if (this.currentContactType === 'tenant') {
        this.addressSuggestion = true;
        this.formatAddress('edit');
      } else if (this.currentContactType === 'vendor') {
        this.updateContact();
      }
    } else {
      this.modalShowMessage('MissingFields');
    }
  }

  /**
   * This event handles the "Add Contact" form submit event
   * @param form Frontend Form object
   * @returns void
   */
  onSubmit(form) {
    if (form.valid) {
      if (this.newContactType === 'tenant') {
        this.addressSuggestion = true;
        this.formatAddress('add');
      } else if (this.newContactType === 'vendor') {
        this.saveNewContact();
      } else {
        this.modalShowMessage('MissingFields');
      }
    } else {
      this.modalShowMessage('MissingFields');
    }
  }

  /**
    * Process the user decision about taking the address suggested byt the Smarty Streets API
    * @param processType:string type of process: add, edit, remove
    * @returns void
    */
  formatAddress(processType) {
    this.spinnerService.show();
    switch (processType) {
      case 'add':
        this.addressToValidate = {
          address: this.newResidentData.address,
          city: this.newResidentData.city,
          zip: this.newResidentData.zip
        };
        break;
      case 'edit':
        this.addressToValidate = {
          address: this.editResidentData.address,
          city: this.editResidentData.city,
          zip: this.editResidentData.zip
        };
        break;
      default:
        break;
    }
    this.contacts.getAddressSuggestion(this.addressToValidate).subscribe(data => {
      this.addressComparisonHtml = [];
      if (data.length > 0) {
        this.suggestedAddress = {
          address: data[0].deliveryLine1,
          city: data[0].components.cityName,
          zip: data[0].components.zipCode
        };
        this.addressComparisonHtml.push(
          '<strong>Address entered:</strong><br>',
          this.addressToValidate.address, ' ', this.addressToValidate.city, ' ', this.addressToValidate.zip,
          '<hr><strong>Suggested:</strong><br>',
          data[0].deliveryLine1, ' ', data[0].components.cityName, ' ', data[0].components.zipCode,
        );
        // console.log(this.suggestedAddress);
        // console.log(this.addressComparisonHtml);
        this.invalidAddress = false;
      } else {
        this.invalidAddress = true;
      }
      this.spinnerService.hide();
      this.modalShowMessage('CorrectAddress');
    });
  }

  /**
    * Process the user decision about taking the address suggested byt the Smarty Streets API
    * @param boolean false if the suggestion is declined, true if user accepts suggestion
    * @returns void
    */
  processSuggestion(suggestionAccepted) {
    this.spinnerService.show();
    if (suggestionAccepted) {
      if (this.enableEditFields) {
        this.editResidentData.originalAddress =
          `${this.editResidentData.address} ${this.editResidentData.address2} ${this.editResidentData.city} ${this.editResidentData.zip}`;
        this.editResidentData.address = this.suggestedAddress.address;
        this.editResidentData.city = this.suggestedAddress.city;
        this.editResidentData.zip = this.suggestedAddress.zip;
      } else {
        this.newResidentData.originalAddress =
          `${this.newResidentData.address} ${this.newResidentData.address2} ${this.newResidentData.city} ${this.newResidentData.zip}`;
        this.newResidentData.address = this.suggestedAddress.address;
        this.newResidentData.city = this.suggestedAddress.city;
        this.newResidentData.zip = this.suggestedAddress.zip;
      }
    }
    this.addressComparisonHtml = [];
    this.modal.close();
    this.addressSuggestion = false;
    this.updateStoreProcessFinished = false;
    this.enableEditFields ? this.updateContact() : this.saveNewContact();
  }

  /**
    * Show success or error message if contact is added properly
    * @param serviceResult This is the result of the "Ok" value of the Contacte Service
    * @returns void
    */
  modalAddContactResult(serviceResult) {
    if (serviceResult === 1) {
      this.modalShowMessage('ContactAdded');
    } else {
      this.modalShowMessage('SystemError');
    }
    this.contactsTenants = [];
    this.contactsVendors = [];
    this.contactsPropertyManagers = [];
    this.currentContacts = [];
    this.waitForPMData();
  }

  /**
  * Show success or error message if contact is updated properly
  * @param serviceResult This is the result of the "Ok" value of the Contacte Service
  * @returns void
  */
  modalUpdateContactResult(serviceResult) {
    if (serviceResult === 1) {
      this.modalShowMessage('ContactUpdated');
    } else {
      this.modalShowMessage('SystemError');
    }
    this.contactsTenants = [];
    this.contactsVendors = [];
    this.contactsPropertyManagers = [];
    this.currentContacts = [];
    this.waitForPMData();
  }

  /**
     * Updates the initials of the user avatar
     * @param event Frontend event handler
     * @param position First or Last name initial
     * @returns void
     */
  updateInitials(event, position) {
    const initial = event.target.value.toLowerCase().charAt(0).toUpperCase();
    if (this.newContactType === 'tenant') {
      this.newTenantInitials[position] = initial;
    } else {
      this.newVendorInitials[position] = initial;
    }
  }

  /**
   * Set Focus on the first input field of the "Add Contact" form
   * @param contactType Contact Type
   * @returns void
   */
  onChange(contactType) {
    switch (contactType) {
      case 'tenant':
        setTimeout(() => document.getElementById('firstName').focus(), 0);
        break;
      case 'vendor':
        this.enableEditFields = true;
        this.bindIssuesSettings();
        setTimeout(() => document.getElementById('vendorName').focus(), 0);
        break;
      default:
        break;
    }
  }

  /**
    * Prevent non numeric chars on input field
    * @param event Input KeyPress event object
    * @returns void
    */
  onlyNumberKey(event) {
    return (event.charCode === 8 || event.charCode === 0) ? null : event.charCode >= 48 && event.charCode <= 57;
  }

  /**
    * Capitalize first and last Name
    * @param string value to capitalize
    * @returns capitalized string
    */
  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
    * Shows specific modal message from a given option
    * @param string modal message to throw
    * @returns void
    */
  modalShowMessage(messageType) {
    switch (messageType) {
      case 'ContactAdded': {
        this.modalTitle = 'Contact Added';
        this.modalBody = 'The contact information has been successfully stored.';
        break;
      }
      case 'SystemError': {
        this.modalTitle = 'System Error';
        this.modalBody = "Oops! It looks like something went wrong on our side. Please try again. If the issue remains, send us a note at support@247jack.com";
        break;
      }
      case 'ContactUpdated': {
        this.modalTitle = 'Contact Updated';
        this.modalBody = 'The contact information has been successfully stored.';
        break;
      }
      case 'CorrectAddress': {
        this.modalTitle = 'Correct Address';
        this.modalBody = '';
        // this.modalBody = this.addressComparisonHtml.join('');
        break;
      }
      case 'MissingFields': {
        this.modalTitle = 'Missing required fields';
        this.modalBody = 'Oops! It looks like we missing some important information in the contact.';
        break;
      }
      default: {
        this.modalTitle = 'Oops!';
        this.modalBody = 'Something went wrong on our end. Nothing terrible; however, you will need to enter the request information.';
        break;
      }
    }
    this.modal.open();
  }

  /**
      * Cancel ad close the new contact form
      * @param none
      * @returns void
      */
  cancelNewContact() {
    switch (this.newContactType) {
      case 'tenant':
        for (var key in this.newResidentData) {
          this.newResidentData[key] = '';
        }
        break;
      case 'vendor':
        for (var key in this.newVendorData) {
          this.newVendorData[key] = '';
        }
        break;
      case 'property_manager':
        for (var key in this.newPMData) {
          this.newPMData[key] = '';
        }
        break;
    }
  }

  /**
    * Cancel ad close the edit contact form
    * @param none
    * @returns void
    */
  async updateContact() {
    this.spinnerService.show();
    if (this.currentContact) {
      let editContactData;
      switch (this.currentContactType) {
        case 'tenant':
          await this.contacts.currentPhoneSuggested.subscribe(phone => {
            this.editResidentData.phone = phone;
            this.editResidentData.sms = phone;
            editContactData = this.editResidentData;
          });
          break;
        case 'vendor':
          this.editVendorData.services = this.setNewVendortServices();
          await this.contacts.currentPhoneSuggested.subscribe(phone => {
            if (phone) {
              this.editVendorData.phone = phone;
            } else {
              this.editVendorData.phone = '';
            }
            editContactData = this.editVendorData;
          });
          break;
        case 'property_manager':
          editContactData = this.editPMData;
          break;
        default:
          editContactData = {};
          break;
      }
      console.log('editContactData.services');
      console.log(editContactData.services);
      this.contacts.editContact(
        editContactData,
        this.currentPropertyManager._id,
        this.currentCompany,
        this.currentContact._id,
        this.currentContactType
      ).subscribe(data => {
        console.log(data);
        this.updateStoreProcessFinished = true;
        this.modalUpdateContactResult(data.ok);
        this.spinnerService.hide();
      });
    }
  }

  /**
    * Cancel ad close the edit contact form
    * @param none
    * @returns void
    */
  cancelEditContact() {
    this.enableEditFields = false;
    this.issuesSelectedItems = [];
    this.bindIssuesSettings();
    this.router.navigate(['/contacts'], { queryParamsHandling: 'merge' });
  }

  /**
    * Setup the properties for the multiselect
    * @param none
    * @returns void
    */
  bindIssuesSettings() {
    this.issuesettings = {
      singleSelection: false,
      text: 'Select',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      badgeShowLimit: 20,
      disabled: !this.enableEditFields
    };
  }
  afterHidden(e) { }

  onUploadError(e) { }

  onUploadSuccess(e) { }


}


