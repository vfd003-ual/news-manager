import { Component, OnInit } from "@angular/core"
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms"
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

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.loadUserProfile()
  }

  loadUserProfile(): void {
    this.loading = true;
    
    this.authService.getUserInfo().subscribe({
      next: (data: User) => {
        this.user = data;
        // Verificamos que existan las propiedades antes de acceder a ellas
        this.loading = false;
      },
      error: (error: Error) => {
        console.error("Error al cargar perfil de usuario:", error);
        this.loading = false;
        this.errorMessage = "No se pudo cargar la información del perfil";
      },
    });
  }

  
}

