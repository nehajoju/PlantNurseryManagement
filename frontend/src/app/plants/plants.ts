import { Component, OnInit } from '@angular/core';
import { PlantService } from '../services/plant';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-plants',
  imports: [RouterLink],
  templateUrl: './plants.html',
  styleUrl: './plants.css'
})
export class Plants implements OnInit {

  plants: any[] = [];

  constructor(private plantService: PlantService) {}

  ngOnInit(): void {
    this.getPlants();
  }

  getPlants(): void {

    this.plantService.getPlants().subscribe({

      next: (data) => {
        this.plants = data;
        console.log('Plants:', this.plants);
      },

      error: (error) => {
        console.error('Error loading plants:', error);
      }

    });

  }

}


