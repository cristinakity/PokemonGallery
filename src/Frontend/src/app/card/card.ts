import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { PokeCard } from '../poke-card';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [LucideDynamicIcon, CommonModule, JsonPipe],
  templateUrl: './card.html',
  styleUrl: './card.css',
})

export class Card implements OnInit, OnChanges {
  @Input() currentCard: PokeCard | any;
  cardClass: string = '';
  gradientStyle: any = {};

  constructor() {

  }

  updateStyles() {
    if (this.currentCard?.type?.length > 1) {
      const color1 = this.currentCard.type[0]?.color;
      const color2 = this.currentCard.type[1]?.color;
      this.gradientStyle = {
        'background': `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`
      };
      this.cardClass = `w-75 h-auto p-4 border-4 border-slate-900 shadow-xl rounded-lg`;
    } else {
      this.cardClass = `w-75 h-auto p-4 border-4 border-slate-900 shadow-xl rounded-lg`;
      this.gradientStyle = {
        'background-color': this.currentCard?.type[0]?.color ?? '#FFFFFF'
      }
    };
  }

  ngOnInit(): void {
    this.updateStyles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateStyles();
  }
}