import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { UserDashboard } from './user-dashboard/user-dashboard';
import { PorterDashboardComponent } from './homepage-porter/porter-homepage';
import { PorterDeliveriesComponent } from './porter-deliveries/porter-deliveries';
import { PorterKycComponent } from './porter-kyc/porter-kyc';
import { PorterProfileComponent } from './porter-profile/porter-profile';
import { AuthGuard } from './services/auth.guard';
import { PorterGuard } from './services/porter.guard';
import { SendParcelComponent } from './send-parcel/send-parcel';
import { CommuterRegisterComponent } from './commuter-register/commuter-register';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'user-dashboard/:userId', component: UserDashboard, canActivate: [AuthGuard] },
  { path: 'user-dashboard', component: UserDashboard, canActivate: [AuthGuard] },
  { path: 'send-parcel/:userId', component: SendParcelComponent, canActivate: [AuthGuard] },
  { path: 'send-parcel', component: SendParcelComponent, canActivate: [AuthGuard] },
  { path: 'commuter-register/:userId', component: CommuterRegisterComponent, canActivate: [AuthGuard] },
  { path: 'commuter-register', component: CommuterRegisterComponent, canActivate: [AuthGuard] },
  { path: 'porter-dashboard/:userId', component: PorterDashboardComponent, canActivate: [PorterGuard] },
  { path: 'porter-dashboard', component: PorterDashboardComponent, canActivate: [PorterGuard] },
  { path: 'porter-deliveries/:userId', component: PorterDeliveriesComponent, canActivate: [PorterGuard] },
  { path: 'porter-deliveries', component: PorterDeliveriesComponent, canActivate: [PorterGuard] },
  { path: 'porter-kyc/:userId', component: PorterKycComponent, canActivate: [PorterGuard] },
  { path: 'porter-kyc', component: PorterKycComponent, canActivate: [PorterGuard] },
  { path: 'porter-profile/:userId', component: PorterProfileComponent, canActivate: [PorterGuard] },
  { path: 'porter-profile', component: PorterProfileComponent, canActivate: [PorterGuard] },
  { path: '**', redirectTo: '/login' }
];
