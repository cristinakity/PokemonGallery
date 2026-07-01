import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokeCard } from '../poke-card';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  // private http = inject(HttpClient);
  //private apiUrl = "http://localhost:5062/pokemon";
  private apiUrl = "/api/pokemon";
  constructor(private http: HttpClient){}

  getPokemons(){
    return this.http.get<PokeCard[]>(this.apiUrl);
  }
}
