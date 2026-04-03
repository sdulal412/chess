import { CommonModule } from '@angular/common';
import { MoveList } from 'src/app/chess-logic/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Input, Output, ViewChild, QueryList, Component, ElementRef, EventEmitter, ViewChildren, AfterViewInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-move-list',
  styleUrls: ['./move-list.component.css'],
  templateUrl: './move-list.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class MoveListComponent implements AfterViewInit {
  @Input({ required: true }) public moveList!: MoveList;
  @Input({ required: true }) public gameHistoryPointer: number = 0;
  @Input({ required: true }) public gameHistoryLength: number = 1;
  @Output() public showPreviousPositionEvent = new EventEmitter<number>();

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChildren('moveRow') private moveRows!: QueryList<ElementRef>;

  public ngAfterViewInit(): void {
    this.moveRows.changes.subscribe(() => {
      this.scrollToBottom();
    });
  }

  public showPreviousPosition(moveIndex: number): void {
    this.showPreviousPositionEvent.emit(moveIndex);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }
}
