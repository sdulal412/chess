import { Router } from '@angular/router';
import { SelectedSquare } from './models';
import { MatDialog } from '@angular/material/dialog';
import { ChessBoardService } from './chess-board.service';
import { Subscription, filter, fromEvent, tap } from 'rxjs';
import { ChessBoard } from 'src/app/chess-logic/chess-board';
import { FENConverter } from 'src/app/chess-logic/FENConverter';
import { PlayAgainstComponent } from '../play-against/play-against.component';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CheckState, Color, Coords, FENChar, GameHistory, LastMove, MoveList, MoveType, SafeSquares, pieceImagePaths } from 'src/app/chess-logic/models';

@Component({
  selector: 'app-chess-board',
  styleUrls: ['./chess-board.component.css'],
  templateUrl: './chess-board.component.html',
})

export class ChessBoardComponent implements OnInit, OnDestroy {

  public flipMode: boolean = false;
  public isThinking: boolean = false;

  public pieceImagePaths = pieceImagePaths;
  protected chessBoard = new ChessBoard();
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;

  protected selectedSquare: SelectedSquare = { piece: null };
  protected pieceSafeSquares: Coords[] = [];
  protected lastMove: LastMove | undefined = this.chessBoard.lastMove;
  protected checkState: CheckState = this.chessBoard.checkState;

  public gameHistoryPointer: number = 0;
  protected subscriptions$ = new Subscription();

  public isPromotionActive: boolean = false;
  protected promotionCoords: Coords | null = null;
  protected promotedPiece: FENChar | null = null;

  public restartGame(): void {
    this.chessBoard = new ChessBoard();
    this.chessBoardView = this.chessBoard.chessBoardView;
    this.gameHistoryPointer = 0;
    this.unmarkingPreviouslySlectedAndSafeSquares();
    this.chessBoardService.restartGame();
    this.cdr.detectChanges();
  }
  constructor(
    public router: Router,
    protected chessBoardService: ChessBoardService,
    protected dialog: MatDialog,
    protected cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    const sub = fromEvent<KeyboardEvent>(document, 'keyup')
      .pipe(
        filter((e) => e.key === 'ArrowRight' || e.key === 'ArrowLeft'),
        tap((e) => {
          if (
            e.key === 'ArrowRight' &&
            this.gameHistoryPointer < this.gameHistory.length - 1
          )
            this.gameHistoryPointer++;
          if (e.key === 'ArrowLeft' && this.gameHistoryPointer > 0)
            this.gameHistoryPointer--;
          this.showPreviousPosition(this.gameHistoryPointer);
          this.cdr.markForCheck();
        }),
      )
      .subscribe();
    this.subscriptions$.add(sub);
  }

  public ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.chessBoardService.chessBoardState$.next(FENConverter.initalPosition);
  }

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }

  public getLabel(y: number): string {
    return String.fromCharCode(97 + y);
  }

  public promotionPieces(): FENChar[] {
    return this.playerColor === Color.White
      ? [
          FENChar.WhiteKnight,
          FENChar.WhiteBishop,
          FENChar.WhiteRook,
          FENChar.WhiteQueen,
        ]
      : [
          FENChar.BlackKnight,
          FENChar.BlackBishop,
          FENChar.BlackRook,
          FENChar.BlackQueen,
        ];
  }

  public get playerColor(): Color {
    return this.chessBoard.playerColor;
  }

  public get safeSquares(): SafeSquares {
    return this.chessBoard.safeSquares;
  }

  public get gameOverMessage(): string | undefined {
    return this.chessBoard.gameOverMessage;
  }

  public get moveList(): MoveList {
    return this.chessBoard.moveList;
  }

  public get gameHistory(): GameHistory {
    return this.chessBoard.gameHistory;
  }

  public get gameHistoryLength(): number {
    return this.gameHistory.length;
  }

  public move(x: number, y: number): void {
    if (this.isSquareSafeForSelectedPiece(x, y)) {
      this.placingPiece(x, y);
      return;
    }
    this.selectingPiece(x, y);
  }

  protected selectingPiece(x: number, y: number): void {
    if (this.gameOverMessage !== undefined) return;
    const piece = this.chessBoardView[x][y];
    if (!piece || this.isWrongPieceSelected(piece)) return;

    const s = this.selectedSquare as any;
    if (s.x === x && s.y === y) {
      this.unmarkingPreviouslySlectedAndSafeSquares();
      this.cdr.detectChanges();
      return;
    }

    this.unmarkingPreviouslySlectedAndSafeSquares();
    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(x + ',' + y) || [];
    this.cdr.detectChanges();
  }

  protected placingPiece(newX: number, newY: number): void {
    const s = this.selectedSquare as any;
    if (!s.piece) return;
    if (
      (s.piece === FENChar.WhitePawn || s.piece === FENChar.BlackPawn) &&
      (newX === 7 || newX === 0)
    ) {
      this.isPromotionActive = true;
      this.promotionCoords = { x: newX, y: newY };
      this.cdr.markForCheck();
      return;
    }
    this.updateBoard(s.x, s.y, newX, newY, this.promotedPiece);
  }

  public updateBoard(
    prevX: number,
    prevY: number,
    newX: number,
    newY: number,
    promotedPiece: FENChar | null,
  ): void {

    this.unmarkingPreviouslySlectedAndSafeSquares();
    this.chessBoard.move(prevX, prevY, newX, newY, promotedPiece);
    this.chessBoardView = this.chessBoard.chessBoardView.map((row) => [...row]);

    this.markLastMoveAndCheckState(
      this.chessBoard.lastMove,
      this.chessBoard.checkState,
    );

    this.gameHistoryPointer++;
    this.chessBoardService.chessBoardState$.next(this.chessBoard.boardAsFEN);
    this.cdr.detectChanges();
  }

  public trackBySquare(index: number, piece: FENChar | null): string {
    return `sq-${index}-${piece}-${this.gameHistoryPointer}`;
  }

  public showPreviousPosition(moveIndex: number): void {
    const { board, checkState, lastMove } = this.gameHistory[moveIndex];
    this.chessBoardView = [...board.map((row) => [...row])];
    this.markLastMoveAndCheckState(lastMove, checkState);
    this.gameHistoryPointer = moveIndex;
    this.cdr.markForCheck();
  }

  public trackByRow(index: number): number {
    return index;
  }

  public promotePiece(piece: FENChar): void {
    if (!this.promotionCoords) return;
    const s = this.selectedSquare as any;
    this.updateBoard(
      s.x,
      s.y,
      this.promotionCoords.x,
      this.promotionCoords.y,
      piece,
    );
  }

  public closePawnPromotionDialog(): void {
    this.unmarkingPreviouslySlectedAndSafeSquares();
    this.cdr.markForCheck();
  }

  public isSquareSelected(x: number, y: number): boolean {
    const s = this.selectedSquare as any;
    return s.x === x && s.y === y;
  }
  
  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some((c) => c.x === x && c.y === y);
  }

  public isSquareLastMove(x: number, y: number): boolean {
    return false;
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhite = piece === piece.toUpperCase();
    return (
      (isWhite && this.playerColor === Color.Black) ||
      (!isWhite && this.playerColor === Color.White)
    );
  }

  private unmarkingPreviouslySlectedAndSafeSquares(): void {
    this.selectedSquare = { piece: null };
    this.pieceSafeSquares = [];
    this.isPromotionActive = false;
    this.promotionCoords = null;
  }

  private markLastMoveAndCheckState(
    lastMove: LastMove | undefined,
    checkState: CheckState
  ): void {
    this.lastMove = lastMove;
    this.checkState = checkState;

    if (this.lastMove) {
      this.moveSound(this.lastMove.moveType);
    }
    this.cdr.detectChanges();
  }

  private moveSound(moveType: Set<MoveType>): void {
    const moveSound = new Audio('assets/sound/move.mp3');
    if (moveType.has(MoveType.Promotion))
      moveSound.src = 'assets/sound/promote.mp3';
    else if (moveType.has(MoveType.Capture))
      moveSound.src = 'assets/sound/capture.mp3';
    moveSound.play().catch(() => {});
  }

  public flipBoard(): void {
    this.flipMode = !this.flipMode;
  }

  public playAgainstFriend(): void {
    this.router.navigate(['/against-friend']);
  }

  public playAgainstComputer(): void {
    const dialogRef = this.dialog.open(PlayAgainstComponent);
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/against-computer']);
    });
  }
}