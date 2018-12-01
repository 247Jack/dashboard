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

    validate(c: AbstractControl): Observable<{ [key: string]: any }> {
        return this.validatePhoneObservable(c.value);
    }

    validatePhoneObservable(phone: string) {
        return new Observable(observer => {
            console.log(phone);
            this.contacts.getPhoneSuggestion(phone).subscribe(data => {
                if (data.errorMessage !== 'The given number is not valid') {
                    if (data.formattedPhone) {
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
                this.contacts.changePhone(data.formattedPhone);
                observer.complete();
            });
        });
    }
}
