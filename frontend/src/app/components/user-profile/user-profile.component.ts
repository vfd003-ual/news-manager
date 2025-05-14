import { Component, OnInit } from "@angular/core"
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { User } from "../../models/user.model"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-user-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  user: User | null = null
  loading = true
  saving = false

  successMessage: string = '';
  errorMessage: string = '';

  profileForm: FormGroup;
  passwordForm: FormGroup;

  originalUserData: {name: string, email: string} | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Suscribirse a los cambios del formulario
    this.profileForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user = user;
        this.originalUserData = {
          name: user.name,
          email: user.email
        };
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.errorMessage = 'Error al cargar el perfil';
        this.loading = false;
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.saving = true;
      this.authService.updateUserProfile(this.profileForm.value).subscribe({
        next: (user) => {
          this.user = user;
          this.successMessage = 'Perfil actualizado correctamente';
          this.saving = false;
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          this.errorMessage = error.error.msg || 'Error al actualizar el perfil';
          this.saving = false;
        }
      });
    }
  }

  updatePassword(): void {
    if (this.passwordForm.valid) {
      this.saving = true;
      this.authService.updateUserProfile({
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      }).subscribe({
        next: () => {
          this.successMessage = 'Contraseña actualizada correctamente';
          this.passwordForm.reset();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error al actualizar contraseña:', error);
          this.errorMessage = error.error.msg || 'Error al actualizar la contraseña';
          this.saving = false;
        }
      });
    }
  }

  checkFormChanges(): boolean {
    if (!this.originalUserData) return false;
    
    const currentValue = this.profileForm.value;
    return currentValue.name !== this.originalUserData.name ||
           currentValue.email !== this.originalUserData.email;
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }
}

