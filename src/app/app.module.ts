import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './routes/app-routing.module';
import { NavMenuComponent } from './modules/nav-menu/nav-menu.component';
import { MoveListComponent } from './modules/move-list/move-list.component';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { PlayAgainstComponent } from './modules/play-against/play-against.component';
import { ComputerModeComponent } from './modules/computer-mode/computer-mode.component';

@NgModule({
  declarations: [AppComponent, ChessBoardComponent, ComputerModeComponent],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NavMenuComponent,
    MoveListComponent,
    PlayAgainstComponent,
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
