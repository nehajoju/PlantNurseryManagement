import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PlantService } from '../../services/plant';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-plants',
  imports: [RouterLink],
  templateUrl: './plants.html',
  styleUrl: './plants.css'
})
export class Plants implements OnInit {

  plants: any[] = [];

  loading = true;

  deleting = false;


  constructor(
    private plantService: PlantService,
    private alert: AlertService
  ) {}


  ngOnInit(): void {

    this.loadPlants();

  }


  // Load all plants

  loadPlants(): void {

    this.plantService.getPlants().subscribe({

      next: (data) => {

        this.plants = data;

        this.loading = false;

        console.log(
          'Admin Plants:',
          this.plants
        );

      },

      error: (error) => {

        console.error(
          'Error loading plants:',
          error
        );

        this.loading = false;

      }

    });

  }


  // Delete plant

  deletePlant(id: number, name: string): void {

    const confirmed = confirm(
      `Are you sure you want to delete "${name}"?`
    );


    if (!confirmed) {

      return;

    }


    this.deleting = true;


    this.plantService.deletePlant(id).subscribe({

      next: () => {

        this.alert.success(
          'Plant deleted successfully! 🌿'
        );


        // Remove deleted plant from the table

        this.plants = this.plants.filter(
          plant => plant.id !== id
        );


        this.deleting = false;

      },


      error: (error) => {

        console.error(
          'Error deleting plant:',
          error
        );


        this.deleting = false;


        this.alert.error(
          'Unable to delete plant.'
        );

      }

    });

  }

}


