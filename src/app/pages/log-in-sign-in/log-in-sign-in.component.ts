import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { interval, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-log-in-sign-in',
  templateUrl: './log-in-sign-in.component.html',
  styleUrls: ['./log-in-sign-in.component.css']
})
export class LogInSignINComponent implements OnInit, OnDestroy {
  nativeDateSupported = false;
  dateInputType: 'text' | 'date' = 'text';
  maxDate = new Date().toISOString().slice(0,10);

  signupForm!: FormGroup;
  loginForm!: FormGroup;
  regToken: string | null = null;
  otpDigits: string[] = ["","","","",""];
  verifying = false;
  resendCooldown = 0;
  private cooldownSub?: Subscription;

  consentScrolled = false;
  consentChecked = false;
  private signupPayload: any | null = null;
  private codeRequested = false;

  @ViewChildren('otpInput', { read: ElementRef })
  otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('forgotDialog', { static: true }) private forgotDialogRef!: ElementRef<HTMLDialogElement>;

  fpEmail = '';
  fpResetToken: string | null = null;
  fpOtpDigits: string[] = ["","","","",""];
  fpVerifying = false;
  fpResendCooldown = 0;
  private fpCooldownSub?: Subscription;
  fpVerified = false;

  newPw = '';
  newPw2 = '';
  fpError = '';
  genderOptions = this.i18n.getOptions('gender');
  ethniciteOptions = this.i18n.getOptions('ethnicity');

  @ViewChild('dialog', { static: true })
  private dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    public i18n: TranslationService
  ) { }

  setLang(lang: 'fr' | 'en') {
    this.i18n.setLanguage(lang);
  }

  ngOnInit(): void {
    this.nativeDateSupported = this.detectNativeDateSupport();
    this.dateInputType = this.nativeDateSupported ? 'date' : 'text';

    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      dateNaissance: ['', Validators.required],
      genre: ['', Validators.required],
      ethnicite: [null, Validators.required] 
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      isAdmin: [false]
    });
  }

  ngOnDestroy(): void {
    this.cooldownSub?.unsubscribe();
    this.fpCooldownSub?.unsubscribe();
  }

  private t(key: string, params?: Record<string,string|number>): string {
    return this.i18n.translate(key, params);
  }

  onDateFocus() {
    if (this.nativeDateSupported) {
      this.dateInputType = 'date';
    }
  }

  onDateBlur() {
    const control = this.signupForm.get('dateNaissance');
    if (!control) { return; }
    control.markAsTouched();

    const rawValue = control.value;

    if (!rawValue) {
      this.dateInputType = this.nativeDateSupported ? 'date' : 'text';
      return;
    }

    if (!this.nativeDateSupported) {
      const normalized = this.normalizeDateInput(rawValue);
      if (!normalized) {
        const invalidMsg = this.t('auth.toast.invalidDate');
        const toastMsg = invalidMsg === 'auth.toast.invalidDate'
          ? 'Date invalide. Utilisez JJ/MM/AAAA'
          : invalidMsg;
        control.setErrors({ ...(control.errors || {}), invalidDate: true });
        this.toastr.error(
          toastMsg,
          this.t('auth.toast.errorTitle'),
          { positionClass: 'toast-top-right' }
        );
        return;
      }
      control.setValue(normalized, { emitEvent: false });
    }

    if (new Date(control.value) > new Date(this.maxDate)) {
      control.setValue(this.maxDate, { emitEvent: false });
    }

    this.dateInputType = this.nativeDateSupported ? 'date' : 'text';
  }

  private detectNativeDateSupport(): boolean {
    if (typeof document === 'undefined') {
      return true;
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'date');
    const isDateType = input.type === 'date';
    input.value = '2025-01-01';
    return isDateType && input.value === '2025-01-01';
  }

  private normalizeDateInput(value: unknown): string | null {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    const raw = value == null ? '' : String(value).trim();
    if (!raw) return null;

    const cleaned = raw
      .replace(/[.]/g, '/')
      .replace(/-/g, '/')
      .replace(/\s+/g, '');

    let day: number;
    let month: number;
    let year: number;

    const dmy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    const ymd = cleaned.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);

    if (ymd) {
      year = parseInt(ymd[1], 10);
      month = parseInt(ymd[2], 10);
      day = parseInt(ymd[3], 10);
    } else if (dmy) {
      day = parseInt(dmy[1], 10);
      month = parseInt(dmy[2], 10);
      year = parseInt(dmy[3], 10);
      if (year < 100) {
        year += 2000;
      }
    } else {
      return null;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const candidate = new Date(Date.UTC(year, month - 1, day));
    const valid =
      candidate.getUTCFullYear() === year &&
      candidate.getUTCMonth() === month - 1 &&
      candidate.getUTCDate() === day;

    if (!valid) {
      return null;
    }

    const iso = candidate.toISOString().slice(0, 10);
    return iso > this.maxDate ? this.maxDate : iso;
  }

  onBlurField(fieldName: string): void {
    const control = this.signupForm.get(fieldName);
    if (!control) { return; }

    control.markAsTouched();

    if (control.invalid) {
      if (control.hasError('required')) {
        this.toastr.error(
          this.t('auth.toast.required'),
          this.t('auth.toast.errorTitle'),
          { positionClass: 'toast-top-right' }
        );
      }
      else if (fieldName === 'email' && control.hasError('email')) {
        this.toastr.error(
          this.t('auth.toast.invalidEmail'),
          this.t('auth.toast.emailTitle'),
          { positionClass: 'toast-top-right' }
        );
      }
      else if (fieldName === 'password' && control.hasError('minlength')) {
        this.toastr.error(
          this.t('auth.toast.shortPassword'),
          this.t('auth.toast.passwordTitle'),
          { positionClass: 'toast-top-right' }
        );
      }
      else if (fieldName === 'telephone' && control.hasError('pattern')) {
        this.toastr.error(
          this.t('auth.toast.phoneInvalid'),
          this.t('auth.toast.errorTitle'),
          { positionClass: 'toast-top-right' }
        );
      }
    }
  }

  onBlurLoginField(fieldName: string): void {
    const control = this.loginForm.get(fieldName);
    if (!control) return;

    control.markAsTouched();
    if (control.invalid) {
      if (control.hasError('required')) {
        this.toastr.error(
          this.t('auth.toast.required'),
          this.t('auth.toast.errorTitle'),
          { positionClass: 'toast-top-right' }
        );
      }
      else if (fieldName === 'email' && control.hasError('email')) {
        this.toastr.error(
          this.t('auth.toast.invalidEmail'),
          this.t('auth.toast.emailTitle'),
          { positionClass: 'toast-top-right' }
        );
      }
    }
  }

  openCreateDialog() {
    (this.dialogRef.nativeElement as any).showModal();
  }
    closeDialog() {
      (this.dialogRef.nativeElement as any).close();
    }
    
 
onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.toastr.error(this.t('auth.toast.fixErrors'), this.t('auth.toast.errorTitle'), { positionClass: 'toast-top-right' });
      return;
    }

    const rawDate = this.signupForm.value.dateNaissance;
    const date_naissance =
      rawDate instanceof Date
        ? rawDate.toISOString().slice(0,10)
        : (typeof rawDate === 'string' ? rawDate : '');

    const payload = {
      nom: this.signupForm.value.nom,
      prenom: this.signupForm.value.prenom,
      email: this.signupForm.value.email,
      mot_de_passe: this.signupForm.value.password,
      telephone: this.signupForm.value.telephone,
      date_naissance,
      genre: this.signupForm.value.genre,
      ethnicite: this.signupForm.value.ethnicite
    };

    this.signupPayload = payload;
    this.regToken = null;
    this.codeRequested = false;
    this.consentScrolled = false;
    this.consentChecked = false;
    this.otpDigits = ["","","","",""];
    this.resendCooldown = 0;
    this.openCreateDialog();
  }

  onConsentScroll(ev: Event) {
    const el = ev.target as HTMLElement;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    if (atBottom) this.consentScrolled = true;
  }

  onConsentChanged(checked: boolean) {
    this.consentChecked = checked;
    if (checked && !this.codeRequested && this.signupPayload) {
      this.codeRequested = true;
      this.authService.requestCode(this.signupPayload).subscribe({
        next: (resp) => {
          this.regToken = resp.reg_token;
          this.otpDigits = ["","","","",""];
          this.startResendCooldown(30);
          this.toastr.info(this.t('auth.toast.signupSent'), this.t('auth.toast.verifyCode'), { positionClass: 'toast-top-right' });
          setTimeout(() => this.focusOtp(0));
        },
        error: err => {
          this.codeRequested = false;
          this.toastr.error(err?.error?.message || this.t('auth.toast.verifyCodeError'), this.t('auth.toast.errorTitle'), { positionClass: 'toast-top-right' });
        }
      });
    }
  }

    verifyOtp() {
    const code = this.otpDigits.join('');
    if (!this.regToken || code.length !== 5) {
      this.toastr.error(this.t('auth.toast.codeIncomplete'), this.t('auth.toast.verifyCode'),{ positionClass: 'toast-top-right' });
      return;
    }
    this.verifying = true;
    this.authService.verifyCode(this.regToken, code).subscribe({
      next: (resp) => {
        this.verifying = false;
        if (resp.token) localStorage.setItem('token', resp.token);
        this.closeDialog();
        this.toastr.success(this.t('auth.toast.signupCreated'), this.t('auth.toast.signupSuccess'),{ positionClass: 'toast-top-right' });
        this.signupForm.reset();
        this.regToken = null;
      },
      error: err => {
        this.verifying = false;
        this.toastr.error(err?.error?.message || this.t('auth.toast.verifyCodeError'), this.t('auth.toast.errorTitle'));
      }
    });
  }

  resendCode() {
    if (!this.regToken || this.resendCooldown > 0) return;
    this.authService.resendCode(this.regToken).subscribe({
      next: (resp) => {
        this.regToken = resp.reg_token;
        this.otpDigits = ["","","","",""];
        this.startResendCooldown(30);
        this.toastr.info(this.t('auth.toast.resend'), this.t('auth.toast.verifyCode'),{ positionClass: 'toast-top-right' });
        setTimeout(() => this.focusOtp(0));
      },
      error: err => this.toastr.error(err?.error?.message || this.t('auth.toast.verifyCodeError'), this.t('auth.toast.errorTitle'))
    });
  }

  onOtpInput(i: number, ev: Event) {
    const input = ev.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.otpDigits[i] = input.value.slice(0,1);
    if (this.otpDigits[i] && i < 4) this.focusOtp(i+1);
  }

  onOtpKeydown(i: number, ev: KeyboardEvent) {
    const input = ev.target as HTMLInputElement;
    if (ev.key === 'Backspace') {
      if (!input.value && i > 0) this.focusOtp(i-1);
      else this.otpDigits[i] = '';
    }
  }

onOtpPaste(ev: ClipboardEvent) {
  const data = ev.clipboardData?.getData('text') ?? '';
  if (!/^\d{5}$/.test(data)) return;
  ev.preventDefault();
  this.otpDigits = data.split('').slice(0,5);

  setTimeout(() => this.otpInputs.forEach((inp, idx) => {
    inp.nativeElement.value = this.otpDigits[idx] ?? '';
  }));
}

private focusOtp(i: number) {
  const el = this.otpInputs?.toArray()?.[i]?.nativeElement;
  el?.focus();
  el?.select?.();
}

  startResendCooldown(seconds: number) {
    this.resendCooldown = seconds;
    this.cooldownSub?.unsubscribe();
    this.cooldownSub = interval(1000).subscribe(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) this.cooldownSub?.unsubscribe();
    });
  }
onLogin(): void {
  if (this.loginForm.invalid) {
    this.toastr.error(this.t('auth.toast.errorGeneric'), this.t('auth.toast.errorTitle'),{ positionClass: 'toast-top-right' });
    return;
  }
  const { email, password, isAdmin} = this.loginForm.value;
  this.authService.login(email, password, isAdmin).subscribe({
  next: () => {
    this.toastr.success(this.t('auth.toast.loginSuccess'), this.t('auth.toast.loginSuccessTitle'), { positionClass: 'toast-top-right' });

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      return;
    }

    const reallyAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    this.router.navigate([reallyAdmin ? '/admin/dashboard' : '/questionnaire'], { replaceUrl: true });
  },
  error: err => {
    const msg = err.error?.message || this.t('auth.toast.loginFailed');
    this.toastr.error(msg, this.t('auth.toast.signinTitle'), { positionClass: 'toast-top-right' });
  }
});

}

  isFieldInvalid(fieldName: string): boolean {
  const control = this.signupForm.get(fieldName);
  return !!(control && control.invalid && control.touched);
}

isLoginFieldInvalid(fieldName: string): boolean {
  const control = this.loginForm.get(fieldName);
  return !!(control && control.invalid && control.touched);
}

  get s() { return this.signupForm.controls; }
  get l() { return this.loginForm.controls; }

toasterError(msg: string): void {
  this.toastr.error(
    msg,
    this.t('auth.toast.errorTitle'),
    { positionClass: 'toast-top-right' }
  );
}


openForgotDialog() {
  (this.forgotDialogRef.nativeElement as any).showModal();
  this.resetForgotState();
}

closeForgotDialog() {
  (this.forgotDialogRef.nativeElement as any).close();
}

private resetForgotState() {
  this.fpEmail = '';
  this.fpResetToken = null;
  this.fpOtpDigits = ["","","","",""];
  this.fpVerified = false;
  this.newPw = '';
  this.newPw2 = '';
  this.fpError = '';
  this.fpResendCooldown = 0;
  this.fpCooldownSub?.unsubscribe();
}

sendResetCode() {
  this.fpError = '';
  const email = (this.fpEmail || '').trim();
  if (!email) {
    this.fpError = 'auth.error.emailRequired';
    return;
  }
  this.authService.forgotRequest(email).subscribe({
    next: (resp) => {
      if (resp.reset_token) {
        this.fpResetToken = resp.reset_token;
        this.fpOtpDigits = ["","","","",""];
        this.startFpResendCooldown(30);
        this.toastr.info(this.t('auth.toast.signupSent'), this.t('auth.toast.verifyCode'), { positionClass: 'toast-top-right' });
      } else {
        this.toastr.info(resp.message || this.t('auth.toast.signupSent'), 'Info', { positionClass: 'toast-top-right' });
      }
    },
    error: err => {
      this.toastr.error(err?.error?.message || this.t('auth.toast.verifyCodeError'), this.t('auth.toast.errorTitle'), { positionClass: 'toast-top-right' });
    }
  });
}

verifyResetOtp() {
  this.fpError = '';
  const code = this.fpOtpDigits.join('');
  if (!this.fpResetToken) {
    this.fpError = 'auth.error.requestCodeFirst';
    return;
  }
  if (code.length !== 5) {
    this.fpError = 'auth.error.codeIncomplete';
    return;
  }
  this.fpVerifying = true;
  this.authService.forgotVerify(this.fpResetToken, code).subscribe({
    next: (resp) => {
      this.fpVerifying = false;
      this.fpVerified = true;
      this.fpResetToken = resp.reset_token;
      this.toastr.success(this.t('auth.toast.signupCreated'), this.t('auth.toast.signupSuccess'), { positionClass: 'toast-top-right' });
    },
    error: err => {
      this.fpVerifying = false;
      this.fpError = err?.error?.message || 'auth.toast.verifyCodeError';
    }
  });
}

resendResetCode() {
  if (!this.fpResetToken || this.fpResendCooldown > 0) return;
  this.authService.forgotResend(this.fpResetToken).subscribe({
    next: (resp) => {
      this.fpResetToken = resp.reset_token;
      this.fpOtpDigits = ["","","","",""];
      this.startFpResendCooldown(30);
      this.toastr.info(this.t('auth.toast.resend'), this.t('auth.toast.verifyCode'), { positionClass: 'toast-top-right' });
    },
    error: err => {
      this.toastr.error(err?.error?.message || this.t('auth.toast.verifyCodeError'), this.t('auth.toast.errorTitle'), { positionClass: 'toast-top-right' });
    }
  });
}

saveNewPassword() {
  this.fpError = '';
  if (!this.fpVerified) {
    this.fpError = 'auth.error.requestCodeFirst';
    return;
  }
  if (!this.newPw || this.newPw.length < 8) {
    this.fpError = 'auth.error.passwordLength';
    return;
  }
  if (this.newPw !== this.newPw2) {
    this.fpError = 'auth.error.passwordMismatch';
    return;
  }
  if (!this.fpResetToken) {
    this.fpError = 'auth.error.tokenMissing';
    return;
  }
  this.authService.forgotReset(this.fpResetToken, this.newPw).subscribe({
    next: () => {
      this.toastr.success(this.t('auth.toast.signupCreated'), this.t('auth.toast.signupSuccess'), { positionClass: 'toast-top-right' });
      this.closeForgotDialog();
    },
    error: err => {
      this.fpError = err?.error?.message || 'auth.error.savePassword';
    }
  });
}

onFpOtpInput(i: number, ev: Event) {
  const input = ev.target as HTMLInputElement;
  input.value = input.value.replace(/\D/g, '');
  this.fpOtpDigits[i] = input.value.slice(0,1);
  if (this.fpOtpDigits[i] && i < 4) {
    const els = (this.forgotDialogRef.nativeElement as any).querySelectorAll('.fp-otp-input');
    els?.[i+1]?.focus();
    els?.[i+1]?.select?.();
  }
}
onFpOtpKeydown(i: number, ev: KeyboardEvent) {
  const input = ev.target as HTMLInputElement;
  if (ev.key === 'Backspace') {
    if (!input.value && i > 0) {
      const els = (this.forgotDialogRef.nativeElement as any).querySelectorAll('.fp-otp-input');
      els?.[i-1]?.focus();
      els?.[i-1]?.select?.();
    } else {
      this.fpOtpDigits[i] = '';
    }
  }
}
onFpOtpPaste(ev: ClipboardEvent) {
  const data = ev.clipboardData?.getData('text') ?? '';
  if (!/^\d{5}$/.test(data)) return;
  ev.preventDefault();
  this.fpOtpDigits = data.split('').slice(0,5);
  setTimeout(() => {
    const els = (this.forgotDialogRef.nativeElement as any).querySelectorAll('.fp-otp-input');
    this.fpOtpDigits.forEach((d, idx) => els[idx].value = d);
  });
}

private startFpResendCooldown(seconds: number) {
  this.fpResendCooldown = seconds;
  this.fpCooldownSub?.unsubscribe();
  this.fpCooldownSub = interval(1000).subscribe(() => {
    this.fpResendCooldown--;
    if (this.fpResendCooldown <= 0) this.fpCooldownSub?.unsubscribe();
  });
}
}
