import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserWarningComponent } from './components/user-warning/user-warning';
import { TodoService, TodoItem } from './todo';
import { forkJoin } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TodoItemComponent } from "./components/todo-item/todo-item";
import { FormsModule } from '@angular/forms';

export type Priority = 'low' | 'medium' | 'high';

export interface TodoItem {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
  priority: Priority;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UserWarningComponent, TodoItemComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  toggleHandler() {
    throw new Error('Method not implemented.');
  }

  private todoService = inject(TodoService);

  USER_ID = signal<number>(1);
  newTodoTitle = signal<string>('');
  todos = signal<TodoItem[]>([]);
  rrorMessage = signal<string>('');
  filter = signal<'all' | 'active' | 'completed'>('all');

  tempTodo = signal<TodoItem | null>(null);
  deletedTodoIds = signal<number[]>([]);
  editingTodoId = signal<number | null>(null);
  editingId = signal<number | null>(null);
  editTitle = signal<string>('');
  priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

  startEdit(todo: TodoItem) {
    this.editTitle.set(todo.title);
    this.editingId.set(todo.id);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(todo: TodoItem) {
    const newTitle = this.editTitle().trim();

    if (newTitle === todo.title) {
      this.editingId.set(null);
      return;
    }

    if (!newTitle) {
      this.removeTodo(todo.id);
      return;
    }

    this.todoService.updateTodo(todo.id, { title: newTitle }).subscribe({
      next: (updated) => {
        this.todos.update(all => all.map(t => t.id === todo.id ? updated : t));
        this.editingId.set(null);
      },
      error: () => this.rrorMessage.set('Не вдалося оновити назву')
    });
  }

  activeToggleButton = computed(() => {
    const allTodos = this.todos();

    return allTodos.length > 0 && allTodos.every(todo => todo.completed);
  });

  toggleTodo(todo: TodoItem) {
    const newStatus = !todo.completed;

    this.todos.update(currentTodos =>
      currentTodos.map(t => t.id === todo.id
        ? { ...t, completed: newStatus }
        : t
      )
    );

    this.todoService.updateTodo(todo.id, { completed: newStatus }).subscribe({
      next: (response) => {
        console.log('Синхронізовано з сервером', response);
      },
      error: () => {
        if (todo.id <= 200) {
          this.todos.update(currentTodos =>
            currentTodos.map(t => t.id === todo.id
              ? { ...t, completed: !newStatus }
              : t
            )
          );
          this.rrorMessage.set('Не вдалося оновити статус на сервері');
        }
      }
    });
  }

  ngOnInit() {
    if (this.USER_ID() > 0) {
      this.loadTodos();
    }
  }

  filteredTodos = computed(() => {
    const all = this.todos();
    const currentFilter = this.filter();

    if (currentFilter === 'active') return all.filter(t => !t.completed);
    if (currentFilter === 'completed') return all.filter(t => t.completed);
    return all;
  });

  loadTodos() {
    this.todoService.getTodos(this.USER_ID()).subscribe({
      next: (data) => {
        this.todos.set(data);
        console.log('Дані отримано з сервера:', data);
      },
      error: () => {
        this.rrorMessage.set('Unable to load todos');
      }
    });
  }

  addTodo() {
    const title = this.newTodoTitle().trim();
    if (!title) return;

    this.tempTodo.set({
      id: 0,
      userId: this.USER_ID(),
      title,
      completed: false,
      priority: 'low'
    });

    this.todoService.createTodo(this.USER_ID(), title)
      .subscribe({
        next: (newTodo) => {
          const uniqueTodo: TodoItem = {
            ...newTodo,
            id: Date.now(),
            priority: 'low'
          };

          this.todos.update(current => [uniqueTodo, ...current]);
          this.newTodoTitle.set('');
          this.tempTodo.set(null);
        },
        error: () => {
          this.tempTodo.set(null);
          this.rrorMessage.set('Помилка при додаванні');
        }
      });
  }

  onHandler() {
    this.rrorMessage.set('');
  }

  removeTodo(id: number) {
    this.deletedTodoIds.update(ids => [...ids, id]);

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos.update(current => current.filter(t => t.id !== id));
        this.deletedTodoIds.update(ids => ids.filter(itemId => itemId !== id));
      },
      error: () => {
        this.rrorMessage.set('Unable to delete todo');
        this.deletedTodoIds.update(ids => ids.filter(itemId => itemId !== id));
      }
    });
  }
}
