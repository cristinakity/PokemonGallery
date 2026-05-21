import { Component, OnInit, signal, Signal } from '@angular/core';
import { PokeCard } from '../poke-card';
import { Card } from '../card/card';
import { Search } from "../shared/search/search";
import { Header } from "../header/header";
import { SearchService } from '../shared/search.service';
import { PokemonService } from '../shared/pokemon.service';
import { PokeType } from '../poke-type';

@Component({
  selector: 'app-gallery',
  imports: [Card, Search, Header],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})

export class Gallery implements OnInit {
  pokeList = signal<PokeCard[]>([]);
  pokeListFull: PokeCard[] = [];

  constructor(private searchService: SearchService, private pokemonService: PokemonService) {
    this.searchService.onSearch$.subscribe((searchName: string) => {
      this.findSearch(searchName);
    });

    {
      // const bulbasaur = {
      //   nombre: 'Bulbasaur',
      //   pokedexNumber: 1,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      //   type: [
      //     { type: 'Grass', color: '#9bcc50' },
      //     { type: 'Poison', color: '#b97fc9' }
      //   ]
      // };
      // this.pokeList.push(bulbasaur);

      // const ivysaur = {
      //   nombre: 'Ivysaur',
      //   pokedexNumber: 1,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
      //   type: [
      //     { type: 'Grass', color: '#9bcc50' },
      //     { type: 'Poison', color: '#b97fc9' }
      //   ]
      // };
      // this.pokeList.push(ivysaur);

      //   const venusaur = {
      //   nombre: 'Venusaur',
      //   pokedexNumber: 3,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
      //   type: [
      //     { type: 'Grass', color: '#9bcc50' },
      //     { type: 'Poison', color: '#b97fc9' }
      //   ]
      // };
      // this.pokeList.push(venusaur);

      //   const charmander = {
      //   nombre: 'Charmander',
      //   pokedexNumber: 4,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
      //   type: [
      //     { type: 'Fire', color: '#fd7d24' },
      //   ]
      // };
      // this.pokeList.push(charmander);

      // const charmeleon = {
      //   nombre: 'Charmeleon',
      //   pokedexNumber: 5,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png',
      //   type: [
      //     { type: 'Fire', color: '#fd7d24' },
      //   ]
      // };
      // this.pokeList.push(charmeleon);

      // const charizard = {
      //   nombre: 'Charizard',
      //   pokedexNumber: 6,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
      //   type: [
      //     { type: 'Fire', color: '#fd7d24' },
      //   ]
      // };
      // this.pokeList.push(charizard);


      // const squirtle = {
      //   nombre: 'Squirtle',
      //   pokedexNumber: 7,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
      //   type: [
      //     { type: 'Water', color: '#4592c4' }
      //   ]
      // };

      // this.pokeList.push(squirtle);

      // const wartortle = {
      //   nombre: 'Wartortle',
      //   pokedexNumber: 8,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png',
      //   type: [
      //     { type: 'Water', color: '#4592c4' }
      //   ]
      // };

      // this.pokeList.push(wartortle);

      // const blastoise = {
      //   nombre: 'Blastoise',
      //   pokedexNumber: 9,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
      //   type: [
      //     { type: 'Water', color: '#4592c4' }
      //   ]
      // };

      // this.pokeList.push(blastoise);

      // const pikachu = {
      //   nombre: 'pikachu',
      //   pokedexNumber: 6,
      //   imagen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      //   type: [
      //     { type: 'Fire', color: '#F8D030' }
      //   ]
      // };
      // this.pokeList.push(pikachu);
    }

  }
  ngOnInit(): void {
    this.GetPokemons();
  }

  // ngAfterViewInit(): void {
  //   this.pokeList = this.pokeList.slice();
  // }

  private GetPokemons() {
    this.pokemonService.getPokemons().subscribe({
      next: (data) => {
        this.pokeList.set(data);
        console.log(this.pokeList);
        this.pokeListFull = [...data];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  findSearch(searchName: string) {
    // this.pokeList.set([...this.pokeListFull]);
    this.pokeList.update(current => [
      ...this.pokeListFull
    ])
    // this.pokeList.set(this.pokeListFull.filter(poke => poke.nombre.toLowerCase().includes(searchName.toLowerCase())));
    this.pokeList.update(current => [
      ...this.pokeListFull.filter(poke => poke.nombre.toLowerCase().includes(searchName.toLowerCase()))
    ])
  }
}