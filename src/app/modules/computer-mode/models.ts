import { Color, FENChar } from 'src/app/chess-logic/models';

export type StockfishQueryParams = {
  fen: string;
  depth: number;
};

export type ChessMove = {
  newY: number;
  newX: number;
  prevX: number;
  prevY: number;
  promotedPiece: FENChar | null;
};

export type StockfishResponse = {
  success: boolean;
  bestmove: string;
  mate: number | null;
  continuation: string;
  evaulatuion: number | null;
};

export type ComputerConfiguration = {
  color: Color;
  level: number;
};

export const stockfishLEvels: Readonly<Record<number, number>> = {
  1: 10,
  2: 11,
  3: 12,
  4: 13,
  5: 15,
};