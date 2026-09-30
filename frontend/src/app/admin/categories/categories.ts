import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PlantService } from '../../services/plant';

@Component({
  selector: 'app-categories',
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  categories: any[] = [];

  loading = true;

  adding = false;

  // Add / Edit modal
  showCategoryModal = false;

  categoryName = '';

  editingCategoryId: number | null = null;

  // Delete modal
  showDeleteModal = false;

  deletingCategory: any = null;

  deleting = false;


  constructor(
    private plantService: PlantService
  ) {}


  ngOnInit(): void {

    this.loadCategories();

  }


  // =========================
  // LOAD CATEGORIES
  // =========================

  loadCategories(): void {

    this.plantService.getCategories().subscribe({

      next: (data) => {

        this.categories = data;

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Error loading categories:',
          error
        );

        this.loading = false;

      }

    });

  }


  // =========================
  // OPEN ADD MODAL
  // =========================

  openAddCategory(): void {

    this.categoryName = '';

    this.editingCategoryId = null;

    this.showCategoryModal = true;

  }


  // =========================
  // OPEN EDIT MODAL
  // =========================

  openEditCategory(category: any): void {

    this.categoryName = category.name;

    this.editingCategoryId = category.id;

    this.showCategoryModal = true;

  }


  // =========================
  // CLOSE ADD / EDIT MODAL
  // =========================

  closeCategoryModal(): void {

    if (this.adding) {

      return;

    }

    this.showCategoryModal = false;

    this.categoryName = '';

    this.editingCategoryId = null;

  }


  // =========================
  // ADD OR UPDATE CATEGORY
  // =========================

  saveCategory(): void {

    const name = this.categoryName.trim();


    if (!name) {

      return;

    }


    this.adding = true;


    // EDIT

    if (this.editingCategoryId !== null) {

      this.plantService
        .updateCategory(
          this.editingCategoryId,
          name
        )
        .subscribe({

          next: (updatedCategory) => {

            const index =
              this.categories.findIndex(
                category =>
                  category.id ===
                  this.editingCategoryId
              );


            if (index !== -1) {

              this.categories[index] =
                updatedCategory;

            }


            this.adding = false;

            this.showCategoryModal = false;

            this.categoryName = '';

            this.editingCategoryId = null;

          },


          error: (error) => {

            console.error(
              'Error updating category:',
              error
            );

            this.adding = false;

          }

        });

      return;

    }


    // ADD

    this.plantService
      .createCategory(name)
      .subscribe({

        next: (category) => {

          this.categories.push(category);

          this.adding = false;

          this.showCategoryModal = false;

          this.categoryName = '';

        },


        error: (error) => {

          console.error(
            'Error adding category:',
            error
          );

          this.adding = false;

        }

      });

  }


  // =========================
  // OPEN DELETE MODAL
  // =========================

  openDeleteCategory(category: any): void {

    this.deletingCategory = category;

    this.showDeleteModal = true;

  }


  // =========================
  // CLOSE DELETE MODAL
  // =========================

  closeDeleteModal(): void {

    if (this.deleting) {

      return;

    }

    this.showDeleteModal = false;

    this.deletingCategory = null;

  }


  // =========================
  // DELETE CATEGORY
  // =========================

  deleteCategory(): void {

    if (!this.deletingCategory) {

      return;

    }


    this.deleting = true;


    const categoryId =
      this.deletingCategory.id;


    this.plantService
      .deleteCategory(categoryId)
      .subscribe({

        next: () => {

          this.categories =
            this.categories.filter(
              category =>
                category.id !== categoryId
            );


          this.deleting = false;

          this.showDeleteModal = false;

          this.deletingCategory = null;

        },


        error: (error) => {

          console.error(
            'Error deleting category:',
            error
          );

          this.deleting = false;

        }

      });

  }

}


