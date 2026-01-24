import { Injectable } from '@angular/core';
import { Color, FENChar } from 'src/app/chess-logic/models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, of, switchMap } from 'rxjs';
import { ChessMove, ComputerConfiguration, StockfishQueryParams } from './models';

@Injectable({
  providedIn: 'root',
})

export class StockfishService {

  private readonly api: string = 'https://stockfish.online/api/s/v2.php';

  public computerConfiguration$ = new BehaviorSubject<ComputerConfiguration>({
    color: Color.Black, level: 1,
  });

  constructor(private http: HttpClient) {}

  private convertColumnLetterToYCoord(string: string): number {
    return string.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  private promotedPiece(piece: string | undefined): FENChar | null {
    if (!piece) return null;
    const computerColor: Color = this.computerConfiguration$.value.color;
    if (piece === 'n')
      return computerColor === Color.White
        ? FENChar.WhiteKnight
        : FENChar.BlackKnight;
    if (piece === 'b')
      return computerColor === Color.White
        ? FENChar.WhiteBishop
        : FENChar.BlackBishop;
    if (piece === 'r')
      return computerColor === Color.White
        ? FENChar.WhiteRook
        : FENChar.BlackRook;
    return computerColor === Color.White
      ? FENChar.WhiteQueen
      : FENChar.BlackQueen;
  }

  private moveFromStockfishString(move: string): ChessMove {
    if (!move || move.length < 4) {
      return { prevX: 0, prevY: 0, newX: 0, newY: 0, promotedPiece: null };
    }
    const prevY: number = this.convertColumnLetterToYCoord(move[0]);
    const prevX: number = Number(move[1]) - 1;
    const newY: number = this.convertColumnLetterToYCoord(move[2]);
    const newX: number = Number(move[3]) - 1;
    const promotedPiece = this.promotedPiece(move[4]);
    return { prevX, prevY, newX, newY, promotedPiece };
  }

  public getBestMove(fen: string): Observable<ChessMove> {
    if (!fen) return EMPTY;

    const queryParams: StockfishQueryParams = {
      fen,
      depth: this.computerConfiguration$.value.level + 5,
    };

    let params = new HttpParams().appendAll(queryParams);

    return this.http.get<any>(this.api, { params }).pipe(
      switchMap((response) => {
        if (response.success === false) {
          return EMPTY;
        }
        const bestMoveString = response.bestmove;

        if (!bestMoveString) return EMPTY;

        const moveParts = bestMoveString.split(' ');
        const bestMove = moveParts[moveParts.indexOf('bestmove') + 1];

        return of(this.moveFromStockfishString(bestMove));
      }),
    );
  }
}