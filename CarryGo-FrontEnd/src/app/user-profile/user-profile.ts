import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Wallet } from '../services/wallet/wallet';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {

  user: any = {};
  walletBalance = 0;
  totalDeliveries = 0;
  deliveredCount = 0;

  showEditModal = false;
  isSaving = false;
  saveSuccess = '';
  saveError = '';

  editForm = { name: '', phone: '' };

  showPasswordModal = false;
  isSavingPassword = false;
  passwordError = '';
  passwordSuccess = '';
  showNewPwd = false;
  showConfirmPwd = false;
  passwordForm = { newPassword: '', confirmPassword: '' };

  private readonly apiBase = 'https://carrygo-production.up.railway.app/api';

  constructor(
    private authService: AuthService,
    private walletService: Wallet,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const loggedInUser = this.authService.getCurrentUser();
    if (!loggedInUser) { this.router.navigate(['/login']); return; }
    this.user = loggedInUser;
    this.loadWallet();
    this.loadDeliveryStats();
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private loadWallet(): void {
    if (!this.user.userId) return;
    this.walletService.getWalletByUserId(this.user.userId)
      .pipe(catchError(() => of({ balance: 0 })))
      .subscribe((w: any) => { this.walletBalance = w?.balance ?? 0; this.cdr.detectChanges(); });
  }

  private loadDeliveryStats(): void {
    if (!this.user.userId) return;
    this.http.get<any[]>(`${this.apiBase}/deliveries/user/${this.user.userId}`)
      .pipe(catchError(() => of([])))
      .subscribe((deliveries: any[]) => {
        this.totalDeliveries = deliveries.length;
        this.deliveredCount = deliveries.filter((d: any) => (d.status || '').toUpperCase() === 'DELIVERED').length;
        this.cdr.detectChanges();
      });
  }

  /* ── Edit Profile ── */

  openEditModal(): void {
    this.editForm = { name: this.user.name || '', phone: this.user.phone || '' };
    this.saveError = '';
    this.saveSuccess = '';
    this.showEditModal = true;
  }

  closeEditModal(): void { this.showEditModal = false; }

  saveProfile(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    this.saveError = '';

    this.http.put<any>(`${this.apiBase}/users/${this.user.userId}`, {
      name: this.editForm.name,
      phone: this.editForm.phone,
    }).subscribe({
      next: () => {
        this.user.name = this.editForm.name;
        this.user.phone = this.editForm.phone;
        sessionStorage.setItem('currentUser', JSON.stringify(this.user));
        this.isSaving = false;
        this.showEditModal = false;
        this.saveSuccess = 'Profile updated successfully!';
        setTimeout(() => { this.saveSuccess = ''; this.cdr.detectChanges(); }, 3000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'Failed to save. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  /* ── Change Password ── */

  openPasswordModal(): void {
    this.passwordForm = { newPassword: '', confirmPassword: '' };
    this.passwordError = '';
    this.passwordSuccess = '';
    this.showPasswordModal = true;
  }

  closePasswordModal(): void { this.showPasswordModal = false; }

  changePassword(): void {
    if (this.isSavingPassword) return;

    const pattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_+=\[\]{};:',.<>/?]).{8,}$/;
    if (!pattern.test(this.passwordForm.newPassword)) {
      this.passwordError = 'Min 8 chars with at least 1 uppercase, 1 number & 1 special character.';
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    this.isSavingPassword = true;
    this.passwordError = '';

    this.http.put<any>(`${this.apiBase}/users/${this.user.userId}`, {
      password: this.passwordForm.newPassword,
    }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.showPasswordModal = false;
        this.passwordSuccess = 'Password changed successfully!';
        setTimeout(() => { this.passwordSuccess = ''; this.cdr.detectChanges(); }, 3000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingPassword = false;
        this.passwordError = 'Failed to change password. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.showEditModal = false; this.showPasswordModal = false; }

  logout(): void { this.authService.logout(); }
}
