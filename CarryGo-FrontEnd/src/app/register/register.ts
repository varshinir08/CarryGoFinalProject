import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
selector: 'app-register',
standalone: true,
imports: [FormsModule, RouterLink, NgIf],
templateUrl: './register.html',
styleUrls: ['./register.css']
})
export class Register {
user = {
  name: '',
  email: '',
  phone: '',
  countryCode: '+91',
  password: '',
  confirmPassword: '',
  role: 'user'
};

get isCommuter(): boolean { return this.user.role === 'commuter'; }

showPassword = false;
showConfirmPassword = false;

@ViewChild('registerForm') registerForm?: NgForm;

constructor(private authService: AuthService) {}

  onSubmit() {
    const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_+=\[\]{};:',.<>/?]).{8,}$/;
    if (!passwordPattern.test(this.user.password)) {
      alert('Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.authService.register(this.user).subscribe({
      next: () => alert('Registration successful'),
      error: () => alert('Registration failed')
    });
  }

  resetForm() {
    this.user = {
      name: '',
      email: '',
      phone: '',
      countryCode: '+91',
      password: '',
      confirmPassword: '',
      role: this.user.role
    };
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.registerForm?.resetForm({
      name: '',
      email: '',
      phone: '',
      countryCode: '+91',
      password: '',
      confirmPassword: ''
    });
  }
}
