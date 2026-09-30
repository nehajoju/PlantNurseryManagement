import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';

import { PlantService } from '../services/plant';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  plants: any[] = [];

  constructor(
    private plantService: PlantService
  ) {}

  ngOnInit(): void {

    this.loadFeaturedPlants();

  }

  loadFeaturedPlants(): void {

    this.plantService.getPlants().subscribe({

      next: (data) => {

        this.plants = data.slice(0, 4);

      },

      error: (error) => {

        console.error(
          'Error loading featured plants:',
          error
        );

      }

    });

  }

}


