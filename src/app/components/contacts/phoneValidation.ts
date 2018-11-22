import { Directive, forwardRef } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl, AsyncValidator } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ContactsService } from '../../services/contacts.service';


@Directive({
    selector: '[asyncValidator][ngModel]',
    providers: [{
        provide: NG_ASYNC_VALIDATORS, useExisting: forwardRef(() => AsyncPhoneValidator), multi: true

    }]
})

export class AsyncPhoneValidator implements Validator {
    constructor(private contacts: ContactsService) { }

    validate(c: AbstractControl): Observable<{ [key: number]: any }> {
        return this.validatePhoneObservable(c.value);
    }

    validatePhoneObservable(phone: string) {
        return new Observable(observer => {
            console.log(phone);
            this.contacts.getPhoneSuggestion(phone).subscribe(data => {
                // console.log(data);
                // console.log(data.formattedPhone);
                // console.log(data.formattedPhone.includes(phone));

                // observer.next(data.formattedPhone.includes(phone) ? null : { asyncInvalid: true });
                if (data.errorMessage !== 'The given number is not valid') {
                    if (data.formattedPhone.includes(phone)) {
                        observer.next(null);
                        console.log('valid');
                    } else {
                        observer.next({ asyncInvalid: true });
                        console.log('invalid');
                    }
                } else {
                    observer.next({ asyncInvalid: true });
                    console.log('invalid');
                }
                console.log(data);
                observer.complete();
            });

            // observer.next(phone === 123 ? null : { asyncInvalid: true });
         
        });
    }
}
