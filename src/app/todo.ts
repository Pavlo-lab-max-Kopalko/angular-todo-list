import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TodoItem {
  priority: any;
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private http = inject(HttpClient);
  private BASE_URL = 'https://jsonplaceholder.typicode.com';

  getTodos(userId: number): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(`${this.BASE_URL}/todos?userId=${userId}`);
  }

  createTodo(userId: number, title: string): Observable<TodoItem> {
    return this.http.post<TodoItem>(`${this.BASE_URL}/todos`, {
      userId,
      title,
      completed: false
    });
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/todos/${id}`);
  }

  updateTodo(id: number, data: Partial<TodoItem>): Observable<TodoItem> {
    return this.http.patch<TodoItem>(`${this.BASE_URL}/todos/${id}`, data);
  }
}
