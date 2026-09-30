import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Auth } from '../../services/auth';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-staff',
  imports: [FormsModule, DatePipe],
  templateUrl: './staff.html',
  styleUrl: './staff.css'
})
export class Staff implements OnInit {

  private apiUrl =
    'http://https://plantnurserymanagement.onrender.com/api/users/admin/staff/';

  private responsibilityUrl =
    'http://https://plantnurserymanagement.onrender.com/api/users/admin/staff/';

  staff: any[] = [];

  selectedStaff: any = null;

  searchTerm = '';

  loading = true;
  saving = false;
  savingResponsibilities = false;

  showStaffModal = false;
  showFormModal = false;
  showResponsibilityModal = false;

  isEditMode = false;

  staffForm: any = {
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    is_active: true
  };

  responsibilityForm: any = {
    can_delivery: false,
    can_stock: false,
    can_gardening: false
  };

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  // =====================================================
  // LOAD STAFF
  // =====================================================

  loadStaff(): void {

    this.loading = true;

    const token = this.auth.getToken();

    this.http.get<any[]>(
      this.apiUrl,
      {
        headers: {
          Authorization: `Token ${token}`
        },
        params: {
          search: this.searchTerm
        }
      }
    ).subscribe({

      next: (data) => {

        if (!data || data.length === 0) {
          this.staff = [];
          this.loading = false;
          return;
        }

        const responsibilityRequests = data.map(member =>
          this.http.get<any>(
            `${this.responsibilityUrl}${member.id}/responsibilities/`,
            {
              headers: {
                Authorization: `Token ${token}`
              }
            }
          )
        );

        forkJoin(responsibilityRequests).subscribe({

          next: (responsibilities) => {

            this.staff = data.map((member, index) => {

              const responsibility = responsibilities[index];

              return {
                ...member,

                can_delivery:
                  responsibility?.can_delivery ?? false,

                can_stock:
                  responsibility?.can_stock ?? false,

                can_gardening:
                  responsibility?.can_gardening ?? false
              };

            });

            this.loading = false;
          },

          error: (error) => {

            console.error(
              'Error loading staff responsibilities:',
              error
            );

            this.staff = data.map(member => ({
              ...member,
              can_delivery: false,
              can_stock: false,
              can_gardening: false
            }));

            this.loading = false;
          }

        });

      },

      error: (error) => {

        console.error(
          'Error loading staff:',
          error
        );

        this.loading = false;

        if (error.status === 401) {

          this.alert.error(
            'Your admin session has expired. Please login again.'
          );

        } else {

          this.alert.error(
            'Unable to load staff members.'
          );

        }

      }

    });

  }

  // =====================================================
  // SEARCH
  // =====================================================

  searchStaff(): void {
    this.loadStaff();
  }

  clearSearch(): void {

    this.searchTerm = '';

    this.loadStaff();
  }

  // =====================================================
  // ADD STAFF
  // =====================================================

  openAddStaff(): void {

    this.isEditMode = false;

    this.selectedStaff = null;

    this.staffForm = {

      username: '',
      password: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      is_active: true

    };

    this.showFormModal = true;
  }

  // =====================================================
  // VIEW STAFF
  // =====================================================

  openViewStaff(member: any): void {

    this.http.get<any>(
      `${this.apiUrl}${member.id}/`,
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.selectedStaff = {

          ...data,

          can_delivery:
            member.can_delivery ?? false,

          can_stock:
            member.can_stock ?? false,

          can_gardening:
            member.can_gardening ?? false

        };

        this.showStaffModal = true;
      },

      error: (error) => {

        console.error(
          'Error loading staff details:',
          error
        );

        this.alert.error(
          'Unable to load staff details.'
        );

      }

    });

  }

  // =====================================================
  // EDIT STAFF
  // =====================================================

  openEditStaff(member: any): void {

    this.http.get<any>(
      `${this.apiUrl}${member.id}/`,
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.selectedStaff = {

          ...data,

          can_delivery:
            member.can_delivery ?? false,

          can_stock:
            member.can_stock ?? false,

          can_gardening:
            member.can_gardening ?? false

        };

        this.staffForm = {

          username:
            data.username,

          password:
            '',

          first_name:
            data.first_name || '',

          last_name:
            data.last_name || '',

          email:
            data.email || '',

          phone:
            data.phone || '',

          address:
            data.address || '',

          city:
            data.city || '',

          state:
            data.state || '',

          pincode:
            data.pincode || '',

          is_active:
            data.is_active

        };

        this.isEditMode = true;

        this.showFormModal = true;
      },

      error: (error) => {

        console.error(
          'Error loading staff details:',
          error
        );

        this.alert.error(
          'Unable to load staff details.'
        );

      }

    });

  }
  // =====================================================
  // PASSWORD VALIDATION HELPERS
  // =====================================================

  hasUppercase(value: string): boolean {
    return /[A-Z]/.test(value || '');
  }

  hasLowercase(value: string): boolean {
    return /[a-z]/.test(value || '');
  }

  hasNumber(value: string): boolean {
    return /[0-9]/.test(value || '');
  }

  hasSpecialCharacter(value: string): boolean {
    return /[^A-Za-z0-9]/.test(value || '');
  }
  // =====================================================
  // DIGIT INPUT
  // =====================================================

  allowDigitsOnly(
    field: 'phone' | 'pincode',
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    let value =
      input.value.replace(/\D/g, '');

    if (field === 'phone') {
      value = value.slice(0, 10);
    }

    if (field === 'pincode') {
      value = value.slice(0, 6);
    }

    input.value = value;

    this.staffForm[field] = value;
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  validateStaffForm(): boolean {

    // Trim text fields
    this.staffForm.username =
      this.staffForm.username?.trim() || '';

    this.staffForm.first_name =
      this.staffForm.first_name?.trim() || '';

    this.staffForm.last_name =
      this.staffForm.last_name?.trim() || '';

    this.staffForm.email =
      this.staffForm.email?.trim() || '';

    this.staffForm.phone =
      this.staffForm.phone?.trim() || '';

    this.staffForm.city =
      this.staffForm.city?.trim() || '';

    this.staffForm.state =
      this.staffForm.state?.trim() || '';

    this.staffForm.pincode =
      this.staffForm.pincode?.trim() || '';

    this.staffForm.address =
      this.staffForm.address?.trim() || '';


    // =================================================
    // USERNAME
    // =================================================

    if (!this.staffForm.username) {

      this.alert.warning(
        'Username is required.'
      );

      return false;
    }

    if (
      this.staffForm.username.length < 3 ||
      this.staffForm.username.length > 30
    ) {

      this.alert.warning(
        'Username must contain 3 to 30 characters.'
      );

      return false;
    }

    if (
      !/^[A-Za-z0-9._-]+$/.test(
        this.staffForm.username
      )
    ) {

      this.alert.warning(
        'Username can contain only letters, numbers, dot, underscore and hyphen.'
      );

      return false;
    }


    // =================================================
    // PASSWORD
    // =================================================

    if (
      !this.isEditMode &&
      !this.staffForm.password
    ) {

      this.alert.warning(
        'Password is required.'
      );

      return false;
    }

    // Password is optional during edit
    if (this.staffForm.password) {

      if (this.staffForm.password.length < 8) {

        this.alert.warning(
          'Password must contain at least 8 characters.'
        );

        return false;
      }

      if (!/[A-Z]/.test(this.staffForm.password)) {

        this.alert.warning(
          'Password must contain at least one uppercase letter.'
        );

        return false;
      }

      if (!/[a-z]/.test(this.staffForm.password)) {

        this.alert.warning(
          'Password must contain at least one lowercase letter.'
        );

        return false;
      }

      if (!/[0-9]/.test(this.staffForm.password)) {

        this.alert.warning(
          'Password must contain at least one number.'
        );

        return false;
      }

      if (!/[^A-Za-z0-9]/.test(this.staffForm.password)) {

        this.alert.warning(
          'Password must contain at least one special character.'
        );

        return false;
      }

    }


    // =================================================
    // FIRST NAME
    // =================================================

    if (!this.staffForm.first_name) {

      this.alert.warning(
        'First name is required.'
      );

      return false;
    }

    if (
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
        this.staffForm.first_name
      )
    ) {

      this.alert.warning(
        'First name can contain only letters, spaces, apostrophe or hyphen.'
      );

      return false;
    }


    // =================================================
    // LAST NAME
    // =================================================

    if (!this.staffForm.last_name) {

      this.alert.warning(
        'Last name is required.'
      );

      return false;
    }

    if (
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
        this.staffForm.last_name
      )
    ) {

      this.alert.warning(
        'Last name can contain only letters, spaces, apostrophe or hyphen.'
      );

      return false;
    }


    // =================================================
    // EMAIL
    // =================================================

    if (!this.staffForm.email) {

      this.alert.warning(
        'Email is required.'
      );

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
        this.staffForm.email
      )
    ) {

      this.alert.warning(
        'Please enter a valid email address.'
      );

      return false;
    }


    // =================================================
    // PHONE
    // =================================================

    if (!this.staffForm.phone) {

      this.alert.warning(
        'Phone number is required.'
      );

      return false;
    }

    if (
      !/^\d{10}$/.test(
        this.staffForm.phone
      )
    ) {

      this.alert.warning(
        'Phone number must contain exactly 10 digits.'
      );

      return false;
    }


    // =================================================
    // CITY
    // =================================================

    if (!this.staffForm.city) {

      this.alert.warning(
        'City is required.'
      );

      return false;
    }

    if (
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
        this.staffForm.city
      )
    ) {

      this.alert.warning(
        'City can contain only letters, spaces, apostrophe or hyphen.'
      );

      return false;
    }


    // =================================================
    // STATE
    // =================================================

    if (!this.staffForm.state) {

      this.alert.warning(
        'State is required.'
      );

      return false;
    }

    if (
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
        this.staffForm.state
      )
    ) {

      this.alert.warning(
        'State can contain only letters, spaces, apostrophe or hyphen.'
      );

      return false;
    }


    // =================================================
    // PINCODE
    // =================================================

    if (!this.staffForm.pincode) {

      this.alert.warning(
        'Pincode is required.'
      );

      return false;
    }

    if (
      !/^\d{6}$/.test(
        this.staffForm.pincode
      )
    ) {

      this.alert.warning(
        'Pincode must contain exactly 6 digits.'
      );

      return false;
    }


    // =================================================
    // ADDRESS
    // =================================================

    if (!this.staffForm.address) {

      this.alert.warning(
        'Address is required.'
      );

      return false;
    }

    if (
      this.staffForm.address.length < 5
    ) {

      this.alert.warning(
        'Address must contain at least 5 characters.'
      );

      return false;
    }


    return true;
  }

  // =====================================================
  // SAVE STAFF
  // =====================================================

  saveStaff(): void {

    if (!this.validateStaffForm()) {
      return;
    }

    this.saving = true;

    const token = this.auth.getToken();


    // =================================================
    // CREATE
    // =================================================

    if (!this.isEditMode) {

      const createData = {

        username:
          this.staffForm.username,

        password:
          this.staffForm.password,

        first_name:
          this.staffForm.first_name,

        last_name:
          this.staffForm.last_name,

        email:
          this.staffForm.email,

        phone:
          this.staffForm.phone,

        address:
          this.staffForm.address,

        city:
          this.staffForm.city,

        state:
          this.staffForm.state,

        pincode:
          this.staffForm.pincode,

        is_active:
          this.staffForm.is_active
      };

      this.http.post<any>(
        this.apiUrl,
        createData,
        {
          headers: {
            Authorization:
              `Token ${token}`
          }
        }
      ).subscribe({

        next: () => {

          this.saving = false;

          this.showFormModal = false;

          this.loadStaff();

          this.alert.success(
            'Staff account created successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Error creating staff:',
            error
          );

          this.saving = false;

          this.alert.error(
            error.error?.error ||
            error.error?.detail ||
            'Unable to create staff account.'
          );

        }

      });

      return;
    }


    // =================================================
    // UPDATE
    // =================================================

    const updateData: any = {

      first_name:
        this.staffForm.first_name,

      last_name:
        this.staffForm.last_name,

      email:
        this.staffForm.email,

      phone:
        this.staffForm.phone,

      address:
        this.staffForm.address,

      city:
        this.staffForm.city,

      state:
        this.staffForm.state,

      pincode:
        this.staffForm.pincode,

      is_active:
        this.staffForm.is_active
    };


    // Only send password if changed
    if (this.staffForm.password) {

      updateData.password =
        this.staffForm.password;
    }


    this.http.patch<any>(
      `${this.apiUrl}${this.selectedStaff.id}/`,
      updateData,
      {
        headers: {
          Authorization:
            `Token ${token}`
        }
      }
    ).subscribe({

      next: () => {

        this.saving = false;

        this.showFormModal = false;

        this.loadStaff();

        this.alert.success(
          'Staff details updated successfully.'
        );

      },

      error: (error) => {

        console.error(
          'Error updating staff:',
          error
        );

        this.saving = false;

        this.alert.error(
          error.error?.error ||
          error.error?.detail ||
          'Unable to update staff.'
        );

      }

    });

  }

  // =====================================================
  // STAFF STATUS
  // =====================================================

  async toggleStaffStatus(member: any): Promise<void> {

    const newStatus =
      !member.is_active;

    const action =
      newStatus
        ? 'activate'
        : 'deactivate';


    const confirmed =
      await this.alert.confirm(
        `Are you sure you want to ${action} ${member.username}?`,
        `${newStatus ? 'Activate' : 'Deactivate'} Staff`,
        newStatus
          ? 'Activate'
          : 'Deactivate',
        'Cancel'
      );


    if (!confirmed) {
      return;
    }


    this.http.patch<any>(
      `${this.apiUrl}${member.id}/`,
      {
        is_active:
          newStatus
      },
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: () => {

        this.loadStaff();

        this.alert.success(
          `Staff ${action}d successfully.`
        );

      },

      error: (error) => {

        console.error(
          'Error changing staff status:',
          error
        );

        this.alert.error(
          error.error?.error ||
          'Unable to change staff status.'
        );

      }

    });

  }

  // =====================================================
  // RESPONSIBILITIES
  // =====================================================

  openResponsibilities(member: any): void {

    this.selectedStaff = member;

    this.responsibilityForm = {

      can_delivery:
        member.can_delivery ?? false,

      can_stock:
        member.can_stock ?? false,

      can_gardening:
        member.can_gardening ?? false

    };

    this.showResponsibilityModal = true;

    const token =
      this.auth.getToken();


    this.http.get<any>(
      `${this.responsibilityUrl}${member.id}/responsibilities/`,
      {
        headers: {
          Authorization:
            `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.responsibilityForm = {

          can_delivery:
            data.can_delivery ?? false,

          can_stock:
            data.can_stock ?? false,

          can_gardening:
            data.can_gardening ?? false

        };

      },

      error: (error) => {

        console.error(
          'Error loading responsibilities:',
          error
        );

        this.alert.error(
          'Unable to load staff responsibilities.'
        );

        this.showResponsibilityModal = false;

      }

    });

  }

  saveResponsibilities(): void {

    if (!this.selectedStaff) {
      return;
    }

    this.savingResponsibilities = true;

    const token =
      this.auth.getToken();


    this.http.patch<any>(
      `${this.responsibilityUrl}${this.selectedStaff.id}/responsibilities/`,
      {

        can_delivery:
          this.responsibilityForm.can_delivery,

        can_stock:
          this.responsibilityForm.can_stock,

        can_gardening:
          this.responsibilityForm.can_gardening

      },
      {
        headers: {
          Authorization:
            `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.savingResponsibilities = false;


        this.selectedStaff = {

          ...this.selectedStaff,

          can_delivery:
            data.can_delivery,

          can_stock:
            data.can_stock,

          can_gardening:
            data.can_gardening

        };


        const index =
          this.staff.findIndex(
            member =>
              member.id ===
              this.selectedStaff.id
          );


        if (index !== -1) {

          this.staff[index] = {

            ...this.staff[index],

            can_delivery:
              data.can_delivery,

            can_stock:
              data.can_stock,

            can_gardening:
              data.can_gardening

          };

        }


        this.showResponsibilityModal = false;


        this.alert.success(
          'Staff responsibilities updated successfully.'
        );

      },

      error: (error) => {

        console.error(
          'Error updating responsibilities:',
          error
        );

        this.savingResponsibilities = false;

        this.alert.error(
          error.error?.error ||
          'Unable to update staff responsibilities.'
        );

      }

    });

  }

  // =====================================================
  // MODALS
  // =====================================================

  closeResponsibilityModal(): void {

    if (this.savingResponsibilities) {
      return;
    }

    this.showResponsibilityModal = false;
  }

  closeViewModal(): void {

    this.showStaffModal = false;

    this.selectedStaff = null;
  }

  closeFormModal(): void {

    if (this.saving) {
      return;
    }

    this.showFormModal = false;
  }

  // =====================================================
  // HELPERS
  // =====================================================

  get totalStaff(): number {
    return this.staff.length;
  }

  get activeStaff(): number {

    return this.staff.filter(
      member =>
        member.is_active
    ).length;
  }

  get inactiveStaff(): number {

    return this.staff.filter(
      member =>
        !member.is_active
    ).length;
  }

  getStaffName(member: any): string {

    const name =
      `${member.first_name || ''} ${member.last_name || ''}`
        .trim();

    return name || member.username;
  }

  getResponsibilityCount(member: any): number {

    let count = 0;

    if (member.can_delivery) {
      count++;
    }

    if (member.can_stock) {
      count++;
    }

    if (member.can_gardening) {
      count++;
    }

    return count;
  }

  hasAnyResponsibility(member: any): boolean {

    return (
      member.can_delivery ||
      member.can_stock ||
      member.can_gardening
    );
  }

}