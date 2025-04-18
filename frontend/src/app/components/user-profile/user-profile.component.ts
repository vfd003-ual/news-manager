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
  preferencesForm: FormGroup

  availableCategories = [
    "Tecnología",
    "Ciencia",
    "Negocios",
    "Salud",
    "Entretenimiento",
    "Deportes",
    "Política",
    "Medio Ambiente",
    "Finanzas",
  ]

  availableSources = [
    "TechNews",
    "ScienceDaily",
    "BusinessInsider",
    "HealthToday",
    "EntertainmentWeekly",
    "SportsCentral",
    "PoliticsNow",
    "WorldNews",
    "FinanceDaily",
  ]

  selectedCategories: string[] = []
  selectedSources: string[] = []
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.preferencesForm = this.fb.group({
      // El formulario se gestiona manualmente a través de checkboxes
    })
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
        this.selectedCategories = data.preferences?.favoriteCategories || [];
        this.selectedSources = data.preferences?.favoriteSources || [];
        this.loading = false;
      },
      error: (error: Error) => {
        console.error("Error al cargar perfil de usuario:", error);
        this.loading = false;
        this.errorMessage = "No se pudo cargar la información del perfil";
      },
    });
  }

  isSelectedCategory(category: string): boolean {
    return this.selectedCategories.includes(category)
  }

  isSelectedSource(source: string): boolean {
    return this.selectedSources.includes(source)
  }

  onCategoryChange(category: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedCategories.includes(category)) {
        this.selectedCategories.push(category);
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    }
  }

  onSourceChange(source: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedSources.includes(source)) {
        this.selectedSources.push(source);
      }
    } else {
      this.selectedSources = this.selectedSources.filter(s => s !== source);
    }
  }

  savePreferences(): void {
    if (!this.user) return

    this.saving = true

    const preferences = {
      favoriteCategories: this.selectedCategories,
      favoriteSources: this.selectedSources,
    }

    this.authService.updateUserPreferences(preferences).subscribe({
      next: (updatedUser: User) => {
        this.user = updatedUser;
        this.saving = false;
        alert("¡Preferencias guardadas correctamente!");
        this.successMessage = "¡Preferencias guardadas correctamente!";
      },
      error: (error: Error) => {
        console.error("Error al guardar preferencias:", error);
        this.saving = false;
        alert("Error al guardar preferencias. Por favor, inténtalo de nuevo.");
        this.errorMessage = "Error al guardar preferencias. Por favor, inténtalo de nuevo.";
      },
    })
  }
}

