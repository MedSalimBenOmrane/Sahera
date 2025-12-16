import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Admin } from 'src/app/models/admin.model';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { TranslationService } from 'src/app/services/translation.service';

type FieldType = 'text' | 'email' | 'password' | 'number' | 'checkbox';

interface FormField {
  key: keyof AdminForm;
  labelKey: string;
  type: FieldType;
  placeholderKey?: string;
}

type AdminForm = Admin;

@Component({
  selector: 'app-edit-admin',
  templateUrl: './edit-admin.component.html',
  styleUrls: ['./edit-admin.component.css']
})
export class EditAdminComponent implements OnInit {
  @ViewChild('dialog', { static: true }) dialogRef!: ElementRef<HTMLDialogElement>;

  form: Partial<AdminForm> = {};
  formFields: FormField[] = [
    { key: 'nom',              labelKey: 'auth.signup.name',          type: 'text' },
    { key: 'prenom',           labelKey: 'auth.signup.firstName',     type: 'text' },
    { key: 'email',            labelKey: 'auth.signup.email',         type: 'email' },
    { key: 'mot_de_passe',     labelKey: 'auth.signup.password',      type: 'password' },
    { key: 'mail_sender_name', labelKey: 'admin.mail.senderName',     type: 'text' },
    { key: 'mail_sender_email',labelKey: 'admin.mail.senderEmail',    type: 'email' },
    { key: 'smtp_host',        labelKey: 'admin.mail.smtpHost',       type: 'text' },
    { key: 'smtp_port',        labelKey: 'admin.mail.smtpPort',       type: 'number' },
    { key: 'smtp_use_tls',     labelKey: 'admin.mail.smtpUseTls',     type: 'checkbox' },
    { key: 'smtp_username',    labelKey: 'admin.mail.smtpUsername',   type: 'email' },
    { key: 'smtp_password',    labelKey: 'admin.mail.smtpPassword',   type: 'password' },
  ];

  isLoading = false;
  isSaving = false;
  errorMsg: string | null = null;
  private adminId: number | null = null;

  constructor(
    private adminService: AdminService,
    private auth: AuthService,
    public i18n: TranslationService
  ) {}

  ngOnInit(): void {
    this.adminId = this.auth.user?.id ?? null;
  }

  open(): void {
    if (!this.adminId) {
      this.errorMsg = 'navbar.error.loadProfile';
      return;
    }
    this.loadAdmin(true);
  }

  private loadAdmin(openDialog: boolean): void {
    if (this.adminId === null) return;
    this.isLoading = true;
    this.errorMsg = null;

    this.adminService.getById(this.adminId).subscribe({
      next: (admin) => {
        this.fillForm(admin);
        this.isLoading = false;
        if (openDialog) {
          (this.dialogRef.nativeElement as any).showModal();
        }
      },
      error: () => {
        this.errorMsg = 'navbar.error.loadProfile';
        this.isLoading = false;
      }
    });
  }

  private fillForm(admin: Admin): void {
    const email = admin.email ?? '';
    const displayName = `${admin.prenom ?? ''} ${admin.nom ?? ''}`.trim();
    this.form = {
      ...admin,
      mot_de_passe: '',
      mail_sender_email: admin.mail_sender_email || email,
      mail_sender_name: admin.mail_sender_name || displayName,
      smtp_host: admin.smtp_host || '',
      smtp_port: admin.smtp_port ?? 587,
      smtp_use_tls: admin.smtp_use_tls ?? true,
      smtp_username: admin.smtp_username || email,
      smtp_password: admin.smtp_password || '',
    };
  }

  save(): void {
    if (this.adminId === null) return;
    this.isSaving = true;
    this.errorMsg = null;

    const trimmedEmail = (this.form.email || '').trim();
    const payload: Partial<Admin> = {
      nom: (this.form.nom || '').trim(),
      prenom: (this.form.prenom || '').trim(),
      email: trimmedEmail,
      mail_sender_email: (this.form.mail_sender_email || trimmedEmail).trim(),
      mail_sender_name: (this.form.mail_sender_name || '').trim(),
      smtp_host: (this.form.smtp_host || '').trim(),
      smtp_port: this.form.smtp_port ? Number(this.form.smtp_port) : undefined,
      smtp_use_tls: this.form.smtp_use_tls ?? true,
      smtp_username: (this.form.smtp_username || trimmedEmail).trim(),
      smtp_password: (this.form.smtp_password || '').trim(),
    };

    const password = (this.form.mot_de_passe || '').trim();
    if (password) {
      payload.mot_de_passe = password;
    }

    this.adminService.update(this.adminId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.close();
      },
      error: () => {
        this.errorMsg = 'navbar.error.updateProfile';
        this.isSaving = false;
      }
    });
  }

  close(): void {
    (this.dialogRef.nativeElement as any).close();
  }
}
