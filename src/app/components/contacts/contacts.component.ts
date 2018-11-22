import { style, state, animate, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ContactsService } from '../../services/contacts.service';
import { ModalComponent } from 'dsg-ng2-bs4-modal/ng2-bs4-modal';
import { AsyncPhoneValidator } from './phoneValidation';
import * as _ from 'lodash';
import { Console } from '@angular/core/src/console';
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

export class ContactsComponent implements OnInit {

  private getContactsConn;
  public contactsUsers = [];
  public contactsProviders = [];
  public contactsPropertyManagers = [];
  public currentContacts = [];
  public currentContact: any;
  public currentContactType = '';
  public currentPropertyManager: any;
  public currentCompany;
  public filtercontacts = '';
  public newTenantInitials = [];
  public newVendorInitials = [];
  public newContactType = '';
  public dataLoaded = false;
  @ViewChild('modalmessage')
  modal: ModalComponent;
  public modalTitle = '';
  public modalBody = '';
  public addressSuggestion = false;
  public invalidAddress = false;
  public addressComparisonHtml = [];
  public suggestedAddress = {
    address: '',
    city: '',
    zip: ''
  };

  public editResidentData = {
    initials: '',
    firstName: '',
    lastName: '',
    portfolio: '',
    unit_abbr_name: '',
    service_threshold: '',
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
    sms: ''
  };

  public editVendorData = {
    initials: '',
    jobType: '',
    name: '',
    phone: '',
    ext: '',
    address: '',
    email: '',
    comments: ''
  };

  public editPMData = {
    initials: '',
    email: '',
    name: '',
    surname: '',
    phone: '',
    address: ''
  };

  public newResidentData = {
    firstName: '',
    lastName: '',
    portfolio: '',
    // unit_abbr_name: '', suspended
    service_threshold: '',
    address: '',
    address2: '',
    city: '',
    zip: '',
    // endDate: '', suspended
    phone: '',
    homePhone: '',
    workPhone: '',
    email: '',
    alexa: '',
    fb: '',
    sms: '',
    ghome: ''
  };

  public newVendorData = {
    jobType: '',
    name: '',
    vendorFirstName: '',
    vendorLastName: '',
    phone: '',
    ext: '',
    address: '',
    email: '',
    comments: ''
  };

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
    private contacts: ContactsService
  ) { }

  // get diagnostic() { return JSON.stringify(this.newVendorData); }

  ngOnInit() {
    this.waitForPMData();
  }

  ngOnDestroy() {
    if (this.getContactsConn) {
      this.getContactsConn.unsubscribe();
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
        this.getContactsConn = this.contacts.getContacts(this.currentPropertyManager['_id'], this.currentCompany).subscribe(data => {
          for (let i in data.usersResult) {
            let userData = {
              id: data.usersResult[i]._id,
              contact_type: "user",
              color: "tenant-color",
              name: `${data.usersResult[i].firstName} ${
                data.usersResult[i].lastName
                }`,
              initials: `${data.usersResult[i].firstName[0]}${
                data.usersResult[i].lastName[0]
                }`,
              email: data.usersResult[i].contact.email,
              mobile: data.usersResult[i].contact.email,
              originalData: data.usersResult[i]
            };
            this.contactsUsers.push(userData);
          }
          for (let i in data.vendorsResult) {
            let userData = {
              id: data.vendorsResult[i]._id,
              contact_type: "provider",
              color: "vendor-color",
              name: data.vendorsResult[i].vendorData.name,
              initials:
                (data.vendorsResult[i].vendorData.name && data.vendorsResult[i].vendorData.name.split(" ").length > 1)
                  ? `${data.vendorsResult[i].vendorData.name.split(" ")[0][0]}${
                  data.vendorsResult[i].vendorData.name.split(" ")[1][0]
                  }`
                  : '',
              email: data.vendorsResult[i].vendorData.email,
              mobile: data.vendorsResult[i].vendorData.mobile || '',
              originalData: data.vendorsResult[i]
            };
            this.contactsProviders.push(userData);
          }
          for (let i in data.pManagersResult) {
            let userData = {
              id: data.pManagersResult[i]._id,
              contact_type: "property manager",
              color: "pms-color",
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
          this.currentContacts = this.currentContacts.concat(this.contactsUsers, this.contactsProviders, this.contactsPropertyManagers);
          this.dataLoaded = true;
          this.spinnerService.hide();
          // console.log(this.currentContacts);
        });
        this.activatedRoute.queryParams.subscribe(queryparams => {
          const waitForContacts = setInterval(() => {
            if (this.dataLoaded) {
              this.currentContacts = [];
              switch (queryparams['typecontact']) {
                case 'tenants':
                  this.currentContacts = this.contactsUsers;
                  // console.log(this.currentContacts);
                  break;
                case 'providers':
                  this.currentContacts = this.contactsProviders;
                  // console.log(this.currentContacts);
                  break;
                case 'managers':
                  this.currentContacts = this.contactsPropertyManagers;
                  // console.log(this.currentContacts);
                  break;
                case 'all':
                  this.currentContacts = this.currentContacts.concat(this.contactsUsers, this.contactsProviders, this.contactsPropertyManagers);
                  // console.log(this.currentContacts);
                  break;
                default:
                  this.currentContacts = this.currentContacts.concat(this.contactsUsers, this.contactsProviders, this.contactsPropertyManagers);
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
              .subscribe(contactData => {
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
                this.currentContactType = contactData.contactType;
                this.currentContact = contactData.contactResult;
              });
          }
        });
      }
    }, 100);
  }


  /**
 * Stores new contact on the database via HTTP POST by contacts.service
 * @param none
 * @returns void
 */
  saveNewContact() {
    this.spinnerService.show();
    if (this.newContactType) {
      let contactData;
      switch (this.newContactType) {
        case 'tenant':
          if (this.newResidentData.workPhone.length > 0) {
            this.newResidentData.workPhone = '+1' + this.newResidentData.workPhone;
          }
          if (this.newResidentData.workPhone.length > 0) {
            this.newResidentData.sms = '+1' + this.newResidentData.sms;
          }
          this.newResidentData.phone = '+1' + this.newResidentData.phone;
          contactData = this.newResidentData;
          break;
        case 'vendor':
          this.newVendorData.name = this.newVendorData.vendorFirstName + ' ' + this.newVendorData.vendorLastName;
          contactData = this.newVendorData;
          break;
        case 'property_manager':
          contactData = this.newPMData;
          break;
        default:
          contactData = {};
          break;
      }
      this.contacts.addContact(this.currentPropertyManager._id, this.currentCompany, contactData, this.newContactType).subscribe(data => {
        this.modalAddContactResult(data.ok);
        console.log(data);
      });
      this.spinnerService.hide();
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
        this.formatAddress();
      }
    } else {
      this.modalShowMessage('MissingFields');
    }
  }

  /**
  * Process the user decision about taking the address suggested byt the Smarty Streets API
  * @param none
  * @returns void
  */
  formatAddress() {
    this.spinnerService.show();
    this.contacts.getAddressSuggestion(
      this.newResidentData.address,
      this.newResidentData.city,
      this.newResidentData.zip
    ).subscribe(data => {
      this.addressComparisonHtml = [];
      if (data.length > 0) {
        this.suggestedAddress = {
          address: data[0].deliveryLine1,
          city: data[0].components.cityName,
          zip: data[0].components.zipCode
        };
        this.addressComparisonHtml.push(
          '<strong>Address entered:</strong><br>',
          this.newResidentData.address, ' ', this.newResidentData.city, ' ', this.newResidentData.zip,
          '<hr><strong>Suggested:</strong><br>',
          data[0].deliveryLine1, ' ', data[0].components.cityName, ' ', data[0].components.zipCode,
        );
        console.log(this.suggestedAddress);
        console.log(this.addressComparisonHtml);
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
    if (suggestionAccepted) {
      this.newResidentData.address = this.suggestedAddress.address;
      this.newResidentData.city = this.suggestedAddress.city;
      this.newResidentData.zip = this.suggestedAddress.zip;
    }
    console.log(this.newResidentData);
    this.addressComparisonHtml = [];
    this.modal.close();
    this.saveNewContact();
    this.addressSuggestion = false;
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
        setTimeout(() => document.getElementById('vendorFirstName').focus(), 0);
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

  updateContact() {
    this.modalShowMessage('ContactUpdated');
  }

  cancelEditContact() {
    switch (this.currentContactType) {
      case 'tenant':
        for (var key in this.editResidentData) {
          this.editResidentData[key] = '';
        }
        break;
      case 'vendor':
        for (var key in this.editVendorData) {
          this.editVendorData[key] = '';
        }
        break;
      case 'property manager':
        for (var key in this.editPMData) {
          this.editPMData[key] = '';
        }
        break;
    }
  }

  afterHidden(e) { }

  onUploadError(e) { }

  onUploadSuccess(e) { }


}
