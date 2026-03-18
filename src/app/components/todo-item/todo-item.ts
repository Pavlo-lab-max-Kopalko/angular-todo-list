import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { TodoItem } from '../../todo';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './todo-item.html',
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: TodoItem;
  @Input() isDeleting = false; // стан для лоадера Bulma
  @Input() isEditing = false;

  @Output() delete = new EventEmitter<number>();
  @Output() update = new EventEmitter<{ id: number, title?: string, completed?: boolean }>();
  @Output() toggleEdit = new EventEmitter<number | null>();

  // Локальний стан для тексту при редагуванні
  editingTitle = '';
  startTitle = '';

  onEdit() {
    this.editingTitle = this.todo.title;
    this.startTitle = this.todo.title;
    this.toggleEdit.emit(this.todo.id);
  }

  onCancel() {
    this.toggleEdit.emit(null);
  }

  onSave() {
    const trimmedTitle = this.editingTitle.trim();

    if (trimmedTitle === this.startTitle) {
      this.toggleEdit.emit(null);
      return;
    }

    if (!trimmedTitle) {
      this.delete.emit(this.todo.id);
      return;
    }

    this.update.emit({ id: this.todo.id, title: trimmedTitle });
    this.toggleEdit.emit(null);
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }
}
