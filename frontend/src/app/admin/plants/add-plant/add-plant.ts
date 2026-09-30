import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import { PlantService } from '../../../services/plant';
import { AlertService } from '../../../services/alert';


@Component({
  selector: 'app-add-plant',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './add-plant.html',

  styleUrl: './add-plant.css'
})


export class AddPlant implements OnInit {


  plantForm: FormGroup;


  categories: any[] = [];


  selectedImage: File | null = null;

  // Image preview
  imagePreview = '';


  submitting = false;


  // Mode variables

  isEditMode = false;

  isViewMode = false;

  plantId: number | null = null;


  constructor(

    private fb: FormBuilder,

    private plantService: PlantService,

    private router: Router,

    private route: ActivatedRoute,

    private alert: AlertService

  ) {


    this.plantForm = this.fb.group({

      // Category
      category: [
        '',
        Validators.required
      ],


      // Plant Name
      name: [
        '',
        [
          Validators.required,

          Validators.pattern(
            /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/
          )
        ]
      ],


      // Description
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ],


      // Price
      price: [
        '',
        [
          Validators.required,
          Validators.min(0),

          Validators.pattern(
            /^\d+(\.\d{1,2})?$/
          )
        ]
      ],


      // Stock
      stock: [
        '',
        [
          Validators.required,
          Validators.min(0),

          Validators.pattern(
            /^\d+$/
          )
        ]
      ],


      // Sunlight
      sunlight: [
        '',
        [
          Validators.pattern(
            /^[A-Za-z0-9\s.,()\-]+$/
          )
        ]
      ],


      // Watering
      watering: [
        '',
        [
          Validators.pattern(
            /^[A-Za-z0-9\s.,()\-]+$/
          )
        ]
      ],


      // Care Instructions
      care_instructions: [
        '',
        [
          Validators.pattern(
            /^[A-Za-z0-9\s.,()\-]+$/
          )
        ]
      ]

    });

  }


  ngOnInit(): void {

    this.loadCategories();

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      const mode = this.route.snapshot.url
        .map(segment => segment.path)
        .join('/');


      if (id) {

        this.plantId = Number(id);


        if (mode.includes('view')) {

          this.isViewMode = true;

        } else {

          this.isEditMode = true;

        }


        this.loadPlant(this.plantId);

      }

    });

  }


  // Load categories

  loadCategories(): void {

    this.plantService.getCategories().subscribe({

      next: (data) => {

        this.categories = data;

      },

      error: (error) => {

        console.error(
          'Error loading categories:',
          error
        );

      }

    });

  }


  // Load existing plant

  loadPlant(id: number): void {

    this.plantService.getPlant(id).subscribe({

      next: (plant) => {

        console.log(
          'Plant loaded:',
          plant
        );


        this.plantForm.patchValue({

          category: plant.category,

          name: plant.name,

          description: plant.description,

          price: plant.price,

          stock: plant.stock,

          sunlight: plant.sunlight,

          watering: plant.watering,

          care_instructions:
            plant.care_instructions

        });


        // Show existing image

        if (plant.image) {

          this.imagePreview = plant.image;

        }


        // Disable form in View mode

        if (this.isViewMode) {

          this.plantForm.disable();

        }

      },


      error: (error) => {

        console.error(
          'Error loading plant:',
          error
        );


        this.alert.error(
          'Unable to load plant.'
        );


        this.router.navigate([
          '/admin/plants'
        ]);

      }

    });

  }


  // Select image

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      const file = input.files[0];


      // Check image type

      if (!file.type.startsWith('image/')) {

        this.alert.warning(
          'Please select a valid image file.'
        );

        input.value = '';

        this.selectedImage = null;

        return;

      }


      // Maximum image size: 5 MB

      const maxSize =
        5 * 1024 * 1024;


      if (file.size > maxSize) {

        this.alert.warning(
          'Image size must be less than 5 MB.'
        );

        input.value = '';

        this.selectedImage = null;

        return;

      }


      this.selectedImage = file;


      // Show selected image preview

      this.imagePreview =
        URL.createObjectURL(
          this.selectedImage
        );

    }

  }


  // Add or Update plant

  addPlant(): void {

    // View mode should never submit

    if (this.isViewMode) {

      return;

    }


    // Validate form

    if (this.plantForm.invalid) {

      this.plantForm.markAllAsTouched();


      this.alert.warning(
        'Please correct the highlighted fields before submitting.'
      );

      return;

    }


    this.submitting = true;


    const formData = new FormData();


    Object.keys(
      this.plantForm.value
    ).forEach((key) => {

      const value =
        this.plantForm.value[key];


      formData.append(
        key,
        value !== null && value !== undefined
          ? String(value)
          : ''
      );

    });


    // Add image only if selected

    if (this.selectedImage) {

      formData.append(

        'image',

        this.selectedImage

      );

    }


    // EDIT

    if (
      this.isEditMode &&
      this.plantId !== null
    ) {


      this.plantService.updatePlant(

        this.plantId,

        formData

      ).subscribe({

        next: (response) => {

          console.log(
            'Plant updated:',
            response
          );


          this.alert.success(
            'Plant updated successfully! 🌿'
          );


          this.router.navigate([
            '/admin/plants'
          ]);

        },


        error: (error) => {

          console.error(
            'Error updating plant:',
            error
          );


          this.submitting = false;


          this.alert.error(
            'Unable to update plant.'
          );

        }

      });


    }


    // ADD

    else {


      this.plantService.createPlant(

        formData

      ).subscribe({

        next: (response) => {

          console.log(
            'Plant created:',
            response
          );


          this.alert.success(
            'Plant added successfully! 🌿'
          );


          this.router.navigate([
            '/admin/plants'
          ]);

        },


        error: (error) => {

          console.error(
            'Error creating plant:',
            error
          );


          this.submitting = false;


          this.alert.error(
            'Unable to add plant.'
          );

        }

      });

    }

  }


  // Cancel / Back

  cancel(): void {

    this.router.navigate([
      '/admin/plants'
    ]);

  }

}