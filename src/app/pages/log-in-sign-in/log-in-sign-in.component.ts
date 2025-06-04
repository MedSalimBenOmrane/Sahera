import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-log-in-sign-in',
  templateUrl: './log-in-sign-in.component.html',
  styleUrls: ['./log-in-sign-in.component.css']
})
export class LogInSignINComponent  implements OnInit {
  signupForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) { }
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
      // (le password du login n’a que "required", pas d’autre validateur)
    }
  }
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
      password: ['', Validators.required]
    });
  }

  // === Action lancée au clic du bouton "S'inscrire" ===
  onSignup(): void {
    if (this.signupForm.invalid) {
      // Marque tous les champs comme "touched" pour afficher les erreurs
      this.signupForm.markAllAsTouched();
      this.toastr.error(
        'Veuillez corriger les erreurs avant de soumettre.',
        'Erreur',
        { positionClass: 'toast-top-right' }
      );
      return;
    }

    // Si tout est valide, on considère que l’inscription a réussi.
    // Ici, on peut appeler le service REST de création de compte…
    this.toastr.success(
      'Le compte a été créé avec succès.',
      'Succès',
      { positionClass: 'toast-top-right' }
    );

    // Réinitialisation du formulaire (optionnelle)
    this.signupForm.reset();
  }

  // === Action lancée au clic du bouton "Se connecter" ===
onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastr.error(
        'Email ou mot de passe incorrect.',
        'Erreur',
        { positionClass: 'toast-top-right' }
      );
      return;
    }

    // Ici, on peut appeler un service d’authentification…
    this.toastr.success(
      'Connexion réussie.',
      'Succès',
      { positionClass: 'toast-top-right' }
    );
    this.router.navigate(['/questionnaire']);
  }
 onBlurField(fieldName: string): void {
    const control = this.signupForm.get(fieldName);
    if (!control) { return; }

    // On marque le control comme "touched" pour que `invalid` soit vraisemblable
    control.markAsTouched();

    // Si invalide, on envoie un toast en fonction de l'erreur
    if (control.invalid) {
      if (control.hasError('required')) {
        this.toastr.error(
          this.getRequiredMessage(fieldName),
          'Champ obligatoire',
          { positionClass: 'toast-top-right' }
        );
      } else if (fieldName === 'email' && control.hasError('email')) {
        this.toastr.error(
          'Le format de l’email est invalide.',
          'Email incorrect',
          { positionClass: 'toast-top-right' }
        );
      } else if (fieldName === 'password' && control.hasError('minlength')) {
        this.toastr.error(
          'Le mot de passe doit contenir au moins 8 caractères.',
          'Mot de passe trop court',
          { positionClass: 'toast-top-right' }
        );
      } else if (fieldName === 'telephone' && control.hasError('pattern')) {
        this.toastr.error(
          'Le numéro de téléphone doit contenir uniquement des chiffres.',
          'Téléphone invalide',
          { positionClass: 'toast-top-right' }
        );
      }
      // Pour les autres types d’erreur spécifiques, vous pouvez ajouter des else if.
    }
  }
  private getLoginRequiredMessage(field: string): string {
    switch (field) {
      case 'email':    return 'L’email est obligatoire.';
      case 'password': return 'Le mot de passe est obligatoire.';
      default:         return 'Ce champ est obligatoire.';
    }
  }
  

  /** Retourne le message personnalisé "Ce champ est obligatoire" selon le fieldName */
  private getRequiredMessage(field: string): string {
    switch (field) {
      case 'nom':
        return 'Le nom est obligatoire.';
      case 'prenom':
        return 'Le prénom est obligatoire.';
      case 'email':
        return 'L’email est obligatoire.';
      case 'password':
        return 'Le mot de passe est obligatoire.';
      case 'telephone':
        return 'Le téléphone est obligatoire.';
      case 'dateNaissance':
        return 'La date de naissance est obligatoire.';
      case 'genre':
        return 'Le genre est obligatoire.';
      case 'role':
        return 'Le rôle est obligatoire.';
      default:
        return 'Ce champ est obligatoire.';
    }
  }
  // Accès facile aux contrôles dans le template
  get s() { return this.signupForm.controls; }
  get l() { return this.loginForm.controls; }
  toasterError( msg:string): void{
            this.toastr.error(
        msg,
        'Erreur',
        { positionClass: 'toast-top-right' }
      );
  }
}
