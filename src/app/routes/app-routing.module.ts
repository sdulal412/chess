import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChessBoardComponent } from '../modules/chess-board/chess-board.component';
import { ComputerModeComponent } from '../modules/computer-mode/computer-mode.component';

const routes: Routes = [
  {
    path: 'against-friend',
    component: ChessBoardComponent,
    title: 'Chess | vs Friend',
  },
  {
    path: 'against-computer',
    component: ComputerModeComponent,
    title: 'Chess | vs Computer',
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})

export class AppRoutingModule {}