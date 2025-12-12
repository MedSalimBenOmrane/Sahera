import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { interval, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-log-in-sign-in',
  templateUrl: './log-in-sign-in.component.html',
  styleUrls: ['./log-in-sign-in.component.css']
})
export class LogInSignINComponent implements OnInit {
  dateInputType: 'text' | 'date' = 'text';
maxDate = new Date().toISOString().slice(0,10);

onDateBlur() {
  // si l’utilisateur n’a rien choisi, on re-affiche le placeholder
  const v = this.signupForm.get('dateNaissance')?.value;
  if (!v) this.dateInputType = 'text';
}
  signupForm!: FormGroup;
  loginForm!: FormGroup;
    regToken: string | null = null;
  otpDigits: string[] = ["","","","",""];
  verifying = false;
  resendCooldown = 0;
  private cooldownSub?: Subscription;

  // Consentement et OTP (inscription)
  consentScrolled = false;     // devient true quand l’utilisateur a scrollé jusqu’en bas
  consentChecked = false;      // case cochée
  private signupPayload: any | null = null; // payload à envoyer quand l’utilisateur consent
  private codeRequested = false;            // évite envois multiples


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
fpError = ''; // message rouge au-dessus de l’OTP
slides: string[] = [
  
  'assets/images/left-2.png',
  'assets/images/left-3.png',
];

captions: string[] = [
  'SaHera',
  'Auriculothérapie et Intelligence Artificielle.',
  
  
];
ethniciteOptions: string[] = [
  'Amérindien ou Autochtone d’Alaska',
  'Asiatique',
  'Noir ou Afro-Américain',
  'Hispanique ou Latino',
  'Moyen-Oriental ou Nord-Africain',
  'Océanien (Hawaïen ou des îles du Pacifique)',
  'Blanc ou Européen Américain'
];

  currentSlide = 0;
  private slideSub?: Subscription;
    @ViewChild('dialog', { static: true })
    private dialogRef!: ElementRef<HTMLDialogElement>;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
     private route: ActivatedRoute 
  ) { }

  ngOnInit(): void {
    // === Formulaire d'inscription ===
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

    // === Formulaire de connexion ===
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      isAdmin: [false]
    });
    this.startSlideshow();
  }
    ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
  }

  private startSlideshow(): void {
    if (!this.slides?.length) return;
    this.slideSub = interval(5000).subscribe(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    });
  }

  // ========== Fonctions d’affichage d’erreurs et toasts ==========

  onBlurField(fieldName: string): void {
    const control = this.signupForm.get(fieldName);
    if (!control) { return; }

    control.markAsTouched();

    if (control.invalid) {
      // Champ vide requis
      if (control.hasError('required')) {
        this.toastr.error(
          this.getRequiredMessage(fieldName),
          'Champ obligatoire',
          { positionClass: 'toast-top-right' }
        );
      }
      // Email mal formaté
      else if (fieldName === 'email' && control.hasError('email')) {
        this.toastr.error(
          'Le format de l’email est invalide.',
          'Email incorrect',
          { positionClass: 'toast-top-right' }
        );
      }
      // Mot de passe trop court
      else if (fieldName === 'password' && control.hasError('minlength')) {
        this.toastr.error(
          'Le mot de passe doit contenir au moins 8 caractères.',
          'Mot de passe trop court',
          { positionClass: 'toast-top-right' }
        );
      }
      // Numéro de téléphone invalide
      else if (fieldName === 'telephone' && control.hasError('pattern')) {
        this.toastr.error(
          'Le numéro de téléphone doit contenir uniquement des chiffres.',
          'Téléphone invalide',
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
      // Champ vide requis
      if (control.hasError('required')) {
        this.toastr.error(
          this.getLoginRequiredMessage(fieldName),
          'Champ obligatoire',
          { positionClass: 'toast-top-right' }
        );
      }
      // Email mal formaté
      else if (fieldName === 'email' && control.hasError('email')) {
        this.toastr.error(
          'Le format de l’email est invalide.',
          'Email incorrect',
          { positionClass: 'toast-top-right' }
        );
      }
    }
  }
  openCreateDialog() {
    // on cast en any pour accéder à showModal()
    (this.dialogRef.nativeElement as any).showModal();
  }
    closeDialog() {
      (this.dialogRef.nativeElement as any).close();
    }
    
 
onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.toastr.error('Veuillez corriger les erreurs avant de soumettre.', 'Erreur', { positionClass: 'toast-top-right' });
      return;
    }

    // IMPORTANT : le back attend "mot_de_passe"
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

    // Nouveau flux: ouvrir la modale de consentement + OTP
    this.signupPayload = payload;
    this.regToken = null;            // pas encore de code
    this.codeRequested = false;
    this.consentScrolled = false;
    this.consentChecked = false;
    this.otpDigits = ["","","","",""];
    this.resendCooldown = 0;
    this.openCreateDialog();
  }

  // Appelé lors du scroll dans la zone de consentement
  onConsentScroll(ev: Event) {
    const el = ev.target as HTMLElement;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    if (atBottom) this.consentScrolled = true;
  }

  // Appelé quand la case est cochée/décochée
  onConsentChanged(checked: boolean) {
    this.consentChecked = checked;
    if (checked && !this.codeRequested && this.signupPayload) {
      this.codeRequested = true;
      this.authService.requestCode(this.signupPayload).subscribe({
        next: (resp) => {
          this.regToken = resp.reg_token;
          this.otpDigits = ["","","","",""];
          this.startResendCooldown(30);
          this.toastr.info('Un code vous a été envoyé.', 'Vérification', { positionClass: 'toast-top-right' });
          setTimeout(() => this.focusOtp(0));
        },
        error: err => {
          this.codeRequested = false; // permettre un retry si besoin
          this.toastr.error(err?.error?.message || 'Erreur lors de l’envoi du code.', 'Inscription', { positionClass: 'toast-top-right' });
        }
      });
    }
  }

    verifyOtp() {
    const code = this.otpDigits.join('');
    if (!this.regToken || code.length !== 5) {
      this.toastr.error('Code incomplet.', 'Vérification',{ positionClass: 'toast-top-right' });
      return;
    }
    this.verifying = true;
    this.authService.verifyCode(this.regToken, code).subscribe({
      next: (resp) => {
        this.verifying = false;
        if (resp.token) localStorage.setItem('token', resp.token);
        this.closeDialog();
        this.toastr.success('Compte créé ✅', 'Succès',{ positionClass: 'toast-top-right' });
        this.signupForm.reset();
        this.regToken = null;
      },
      error: err => {
        this.verifying = false;
        this.toastr.error(err?.error?.message || 'Code invalide.', 'Erreur');
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
        this.toastr.info('Nouveau code envoyé.', 'Vérification',{ positionClass: 'toast-top-right' });
        setTimeout(() => this.focusOtp(0));
      },
      error: err => this.toastr.error(err?.error?.message || 'Erreur.', 'Renvoyer code')
    });
  }

  // ===== OTP UX helpers =====
  onOtpInput(i: number, ev: Event) {
    const input = ev.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, ''); // digits only
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

  // force l’affichage dans les inputs
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
    this.toastr.error('Veuillez renseigner tous les champs.', 'Erreur',{ positionClass: 'toast-top-right' });
    return;
  }
  const { email, password, isAdmin} = this.loginForm.value;
  console.log('[LoginComponent] isAdmin checkbox =', isAdmin);
this.authService.login(email, password, isAdmin).subscribe({
  next: () => {
    this.toastr.success('Connexion réussie.', 'Succès', { positionClass: 'toast-top-right' });

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      return;
    }

    // lit l'info réelle depuis le service / localStorage
    const reallyAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    this.router.navigate([reallyAdmin ? '/admin/dashboard' : '/questionnaire'], { replaceUrl: true });
  },
  error: err => {
    const msg = err.error?.message || 'Email ou mot de passe incorrect.';
    this.toastr.error(msg, 'Erreur d’authentification', { positionClass: 'toast-top-right' });
  }
});

}

    

  // ======== Méthodes utilitaires pour messages “required” ========
  private getLoginRequiredMessage(field: string): string {
  switch (field) {
    case 'email': return 'L’email est obligatoire.';
    case 'password': return 'Le mot de passe est obligatoire.';
    default: return 'Ce champ est obligatoire.';
  }
}

  private getRequiredMessage(field: string): string {
  switch (field) {
    case 'nom': return 'Le nom est obligatoire.';
    case 'prenom': return 'Le prénom est obligatoire.';
    case 'email': return 'L’email est obligatoire.';
    case 'password': return 'Le mot de passe est obligatoire.';
    case 'telephone': return 'Le téléphone est obligatoire.';
    case 'dateNaissance': return 'La date de naissance est obligatoire.';
    case 'genre': return 'Le genre est obligatoire.';
    case 'ethnicite': return 'L’ethnicité est obligatoire.';
    default: return 'Ce champ est obligatoire.';
  }
}

// ======== Helpers pour lier la classe “error-border” dans le template ========
isFieldInvalid(fieldName: string): boolean {
  const control = this.signupForm.get(fieldName);
  return !!(control && control.invalid && control.touched);
}

isLoginFieldInvalid(fieldName: string): boolean {
  const control = this.loginForm.get(fieldName);
  return !!(control && control.invalid && control.touched);
}

  // Accès rapide aux controls dans le template, si besoin
  get s() { return this.signupForm.controls; }
  get l() { return this.loginForm.controls; }

toasterError(msg: string): void {
  this.toastr.error(
    msg,
    'Erreur',
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

// envoyer le code à l’email
sendResetCode() {
  this.fpError = '';
  const email = (this.fpEmail || '').trim();
  if (!email) {
    this.fpError = "L’email est requis.";
    return;
  }
  this.authService.forgotRequest(email).subscribe({
    next: (resp) => {
      if (resp.reset_token) {
        this.fpResetToken = resp.reset_token;
        this.fpOtpDigits = ["","","","",""];
        this.startFpResendCooldown(30);
        this.toastr.info('Un code vous a été envoyé.', 'Vérification', { positionClass: 'toast-top-right' });
      } else {
        // flux non divulgatif : on affiche juste un message
        this.toastr.info(resp.message || 'Si un compte existe pour cet email, un code a été envoyé.', 'Info', { positionClass: 'toast-top-right' });
      }
    },
    error: err => {
      this.toastr.error(err?.error?.message || 'Erreur lors de l’envoi du code.', 'Erreur', { positionClass: 'toast-top-right' });
    }
  });
}

verifyResetOtp() {
  this.fpError = '';
  const code = this.fpOtpDigits.join('');
  if (!this.fpResetToken) {
    this.fpError = "Demandez d’abord un code.";
    return;
  }
  if (code.length !== 5) {
    this.fpError = "Code incomplet.";
    return;
  }
  this.fpVerifying = true;
  this.authService.forgotVerify(this.fpResetToken, code).subscribe({
    next: (resp) => {
      this.fpVerifying = false;
      this.fpVerified = true;
      this.fpResetToken = resp.reset_token; // token rafraîchi avec verified=true
      this.toastr.success('Code vérifié ✅', 'Succès', { positionClass: 'toast-top-right' });
    },
    error: err => {
      this.fpVerifying = false;
      this.fpError = err?.error?.message || "Code invalide.";
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
      this.toastr.info('Nouveau code envoyé.', 'Vérification', { positionClass: 'toast-top-right' });
    },
    error: err => {
      this.toastr.error(err?.error?.message || 'Erreur lors du renvoi.', 'Erreur', { positionClass: 'toast-top-right' });
    }
  });
}

saveNewPassword() {
  this.fpError = '';
  if (!this.fpVerified) {
    this.fpError = "Validez d’abord le code.";
    return;
  }
  if (!this.newPw || this.newPw.length < 8) {
    this.fpError = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }
  if (this.newPw !== this.newPw2) {
    this.fpError = "Les mots de passe ne correspondent pas.";
    return;
  }
  if (!this.fpResetToken) {
    this.fpError = "Token manquant, recommencez le processus.";
    return;
  }
  this.authService.forgotReset(this.fpResetToken, this.newPw).subscribe({
    next: () => {
      this.toastr.success('Mot de passe mis à jour ✅', 'Succès', { positionClass: 'toast-top-right' });
      this.closeForgotDialog();
    },
    error: err => {
      this.fpError = err?.error?.message || "Impossible d’enregistrer le nouveau mot de passe.";
    }
  });
}

// OTP UX (modale forgot)
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

