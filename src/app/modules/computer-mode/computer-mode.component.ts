import { Router } from '@angular/router';
import { Color } from 'src/app/chess-logic/models';
import { MatDialog } from '@angular/material/dialog';
import { StockfishService } from './stockfish.service';
import { ChessBoard } from 'src/app/chess-logic/chess-board';
import { Subscription, defaultIfEmpty, firstValueFrom } from 'rxjs';
import { ChessBoardService } from '../chess-board/chess-board.service';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { OnInit, inject, OnDestroy, Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-computer-mode',
  styleUrls: ['../chess-board/chess-board.component.css'],
  templateUrl: '../chess-board/chess-board.component.html',
})
export class ComputerModeComponent
  extends ChessBoardComponent
  implements OnInit, OnDestroy
{
  public override isThinking: boolean = false;
  private computerSubscriptions$ = new Subscription();
  private stockfishService = inject(StockfishService);

  constructor() {
    super(
      inject(Router),
      inject(ChessBoardService),
      inject(MatDialog),
      inject(ChangeDetectorRef),
    );
  }

  public override restartGame(): void {
    this.isThinking = false;
    this.gameHistoryPointer = 0;
    this.chessBoard = new ChessBoard();
    this.chessBoardService.restartGame();
    this.chessBoardView = this.chessBoard.chessBoardView;

    const config = this.stockfishService.computerConfiguration$.value;
    if (config.color === 0) {
      setTimeout(() => {
        this.handleComputerMove(this.chessBoard.boardAsFEN);
      }, 500);
    }
    this.cdr.detectChanges();
  }
  public override ngOnInit(): void {
    super.ngOnInit();

    const configSub = this.stockfishService.computerConfiguration$.subscribe(
      (config) => {
        if (config.color === Color.White && !this.flipMode) {
          this.flipBoard();
        }
        setTimeout(() => {
          const fen = this.chessBoard.boardAsFEN;
          const isWhiteTurn = fen.split(' ')[1] === 'w';

          if (isWhiteTurn && config.color === Color.White) {
            this.handleComputerMove(fen);
          }
        }, 1200);
      },
    );
    this.computerSubscriptions$.add(configSub);

    const stateSub = this.chessBoardService.chessBoardState$.subscribe(
      (fen) => {
        const currentPlayer =
          fen.split(' ')[1] === 'w' ? Color.White : Color.Black;
        const config = this.stockfishService.computerConfiguration$.value;

        if (currentPlayer === config.color) {
          this.handleComputerMove(fen);
        }
      },
    );
    this.computerSubscriptions$.add(stateSub);
  }

  private async handleComputerMove(FEN: string): Promise<void> {
    if (this.chessBoard.isGameOver) return;

    this.isThinking = true;
    this.cdr.detectChanges();

    try {
      const move = await firstValueFrom(
        this.stockfishService.getBestMove(FEN).pipe(defaultIfEmpty(null)),
      );

      if (move) {
        this.updateBoard(
          move.prevX,
          move.prevY,
          move.newX,
          move.newY,
          move.promotedPiece,
        );
      }
    } finally {
      this.isThinking = false;
      this.cdr.detectChanges();
    }
  }

  public override ngOnDestroy(): void {
    this.computerSubscriptions$.unsubscribe();
    super.ngOnDestroy();
  }
}
