import { Piece } from './pieces/piece';

export enum Color {
  White,
  Black,
}

export type Coords = {
  x: number;
  y: number;
};

export enum FENChar {
  BlackPawn = 'p',
  WhitePawn = 'P',
  BlackRook = 'r',
  WhiteRook = 'R',
  BlackKing = 'k',
  WhiteKing = 'K',
  BlackQueen = 'q',
  WhiteQueen = 'Q',
  BlackBishop = 'b',
  WhiteBishop = 'B',
  BlackKnight = 'n',
  WhiteKnight = 'N',
}

export const pieceImagePaths: Readonly<Record<FENChar, string>> = {
  [FENChar.WhitePawn]: 'assets/pieces/white pawn.svg',
  [FENChar.BlackPawn]: 'assets/pieces/black pawn.svg',
  [FENChar.WhiteRook]: 'assets/pieces/white rook.svg',
  [FENChar.BlackRook]: 'assets/pieces/black rook.svg',
  [FENChar.WhiteKing]: 'assets/pieces/white king.svg',
  [FENChar.BlackKing]: 'assets/pieces/black king.svg',
  [FENChar.WhiteQueen]: 'assets/pieces/white queen.svg',
  [FENChar.BlackQueen]: 'assets/pieces/black queen.svg',
  [FENChar.WhiteKnight]: 'assets/pieces/white knight.svg',
  [FENChar.BlackKnight]: 'assets/pieces/black knight.svg',
  [FENChar.WhiteBishop]: 'assets/pieces/white bishop.svg',
  [FENChar.BlackBishop]: 'assets/pieces/black bishop.svg',
};

export type SafeSquares = Map<string, Coords[]>;

export enum MoveType {
  Check,
  Capture,
  Castling,
  Promotion,
  CheckMate,
  BasicMove,
}

export type LastMove = {
  piece: Piece;
  prevX: number;
  prevY: number;
  currX: number;
  currY: number;
  moveType: Set<MoveType>;
};

type KingChecked = {
  x: number;
  y: number;
  isInCheck: true;
};

type KingNotChecked = {
  isInCheck: false;
};

export type CheckState = KingChecked | KingNotChecked;

export type MoveList = [string, string?][];

export type GameHistory = {
  checkState: CheckState;
  board: (FENChar | null)[][];
  lastMove: LastMove | undefined;
}[];
