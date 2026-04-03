import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PlayAgainstComponent } from '../play-against/play-against.component';

@Component({
  standalone: true,
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  imports: [MatToolbarModule, MatButtonModule, RouterModule, MatDialogModule],
})
export class NavMenuComponent {
  constructor(private dialog: MatDialog) {}

  public playAgainstComputer(): void {
    this.dialog.open(PlayAgainstComponent);
  }
}
