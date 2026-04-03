import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Color } from 'src/app/chess-logic/models';
import { MatDialog } from '@angular/material/dialog';
import { StockfishService } from '../computer-mode/stockfish.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-play-against',
  styleUrls: ['./play-against.component.css'],
  templateUrl: './play-against.component.html',
})
export class PlayAgainstComponent {
  public stockfishLevel: number = 1;
  public stockfishLevels: readonly number[] = [1, 2, 3, 4, 5];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private stockfishService: StockfishService,
  ) {}

  public selectStockfishLevel(level: number): void {
    this.stockfishLevel = level;
  }

  public play(playerColorChoice: 'w' | 'b'): void {
    const computerColor = playerColorChoice === 'b' ? Color.White : Color.Black;

    this.stockfishService.computerConfiguration$.next({
      color: computerColor,
      level: this.stockfishLevel,
    });

    this.dialog.closeAll();
    this.router.navigate(['against-computer']);
  }

  public closeDialog(): void {
    this.dialog.closeAll();
  }
}
