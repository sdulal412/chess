import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { FENConverter } from 'src/app/chess-logic/FENConverter';

@Injectable({
  providedIn: 'root',
})
export class ChessBoardService {
  public chessBoardState$ = new BehaviorSubject<string>(
    FENConverter.initalPosition,
  );

  public restartGame(): void {
    this.chessBoardState$.next(FENConverter.initalPosition);
  }
}
