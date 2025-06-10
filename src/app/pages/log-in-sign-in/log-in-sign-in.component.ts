import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-log-in-sign-in',
  templateUrl: './log-in-sign-in.component.html',
  styleUrls: ['./log-in-sign-in.component.css']
})
export class LogInSignINComponent implements OnInit {
  signupForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
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
      role: ['', Validators.required]
    });

    // === Formulaire de connexion ===
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      isAdmin: [false]
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

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.toastr.error(
        'Veuillez corriger les erreurs avant de soumettre.',
        'Erreur',
        { positionClass: 'toast-top-right' }
      );
      return;
    }

    // Ici, appel au service REST pour créer le compte...
    this.toastr.success(
      'Le compte a été créé avec succès.',
      'Succès',
      { positionClass: 'toast-top-right' }
    );

    this.signupForm.reset();
  }
onLogin(): void {
  // …
  const { isAdmin } = this.loginForm.value;
  console.log(isAdmin);

  this.toastr.success(
    isAdmin ? 'Connexion admin réussie.' : 'Connexion réussie.',
    'Succès',
    { positionClass: 'toast-top-right' }
  );
  
  this.authService.setAdmin(isAdmin);
  this.loginForm.reset({ isAdmin: false });

  if (isAdmin) {
    this.router.navigate(['/admin']);
  } else {
    this.router.navigate(['/questionnaire']);
  }


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
    case 'role': return 'Le rôle est obligatoire.';
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
}
