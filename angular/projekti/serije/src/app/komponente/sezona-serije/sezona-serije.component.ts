import { Component, Input } from '@angular/core';
import { Sezona } from '../../entiteti/sezona';

@Component({
  selector: 'app-sezona-serije',
  templateUrl: './sezona-serije.component.html',
  styleUrl: './sezona-serije.component.scss',
})
export class SezonaSerijeComponent {
  @Input()
  public sezona?: Sezona;
}
