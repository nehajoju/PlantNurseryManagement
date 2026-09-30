import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Plants } from './plants/plants';
import { PlantDetail } from './plant-detail/plant-detail';
import { CartComponent } from './cart/cart';
import { Checkout } from './checkout/checkout';
import { authGuard } from './guards/auth-guard';
import { Orders } from './orders/orders';
import { Profile } from './profile/profile';
import { Admin } from './admin/admin';
import { adminGuard } from './guards/admin.guard';
import { Plants as AdminPlants } from './admin/plants/plants';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { AddPlant } from './admin/plants/add-plant/add-plant';
import { Categories } from './admin/categories/categories';
import { Orders as AdminOrders } from './admin/orders/orders';
import { Customers as AdminCustomers } from './admin/customers/customers';
import { Staff } from './admin/staff/staff';
import { StaffLayout } from './staff/staff-layout/staff-layout';
import { staffGuard } from './guards/staff-guard';
import { Dashboard } from './staff/dashboard/dashboard';
import { Orders as StaffOrders } from './staff/orders/orders';
import { Deliveries } from './staff/deliveries/deliveries';
import { Stock } from './staff/stock/stock';
import { Gardening } from './staff/gardening/gardening';
import { Chat } from './chat/chat';

import { Gardening as AdminGardening } from './admin/gardening/gardening';
import { Wishlist } from './wishlist/wishlist';
import { GardeningHelp } from './pages/gardening-help/gardening-help';

export const routes: Routes = [

  {
    path: '',
    component: Home
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },

  {
    path: 'plants',
    component: Plants,
    canActivate: [authGuard]
  },

  {
    path: 'plants/:id',
    component: PlantDetail,
    canActivate: [authGuard]
  },

  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard]
  },

  {
    path: 'checkout',
    component: Checkout,
    canActivate: [authGuard]
  },
{
  path: 'orders',
  component: Orders,
  canActivate: [authGuard]
},
{
  path: 'profile',
  component: Profile,
  canActivate: [authGuard]
},

{
  path: 'chat',
  component: Chat
},
{ path: 'wishlist', component: Wishlist, canActivate: [authGuard] },

{
  path: 'gardening-help',
  component: GardeningHelp
},
{
  path: 'admin',
  component: AdminLayout,
  canActivate: [adminGuard],
  children: [
    {
      path: '',
      component: Admin
    },
    {
      path: 'plants',
      component: AdminPlants
    },
    {
      path: 'plants/add',
      component: AddPlant
    },
    {
  path: 'plants/edit/:id',
  component: AddPlant
},{
  path: 'plants/view/:id',
  component: AddPlant
} ,

{ path: 'categories', component: Categories },
{ path: 'orders', component: AdminOrders },
{ path: 'customers', component: AdminCustomers },
{ path: 'staff', component: Staff },
{
  path: 'gardening',
  component: AdminGardening
}

  ]
},



{
  path: 'staff',
  component: StaffLayout,
  canActivate: [staffGuard],
  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
     {
      path: 'dashboard',
      component: Dashboard
    },
    {
  path: 'orders',
  component: StaffOrders
},
{
  path: 'deliveries',
  component: Deliveries
},
{
  path: 'stock',
  component: Stock
},
{
  path: 'gardening',
  component: Gardening
},

  ]
}


];


