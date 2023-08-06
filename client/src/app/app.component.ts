import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'

export interface ITodoItem {
  id: string
  title: string
  complete: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  public id = ''
  public title = ''
  public complete = false
  public deleteTodoId = ''
  public todoItems: ITodoItem[] = []

  constructor(private httpClient: HttpClient) {}
  
  async ngOnInit() {
    this.loadTodoItems()
  }

  async loadTodoItems() {
    this.todoItems = (await this.httpClient.get<ITodoItem[]>('http://localhost:8080/api/todos').toPromise()) ?? []
  }

  async addTodo() {
    if (this.title.trim() !== '') {
      await this.httpClient.post('http://localhost:8080/api/todos', {
        id: this.id,
        title: this.title,
        complete: false
      }).toPromise()

      this.id = ''
      this.title = ''
      this.complete = false
  
      this.loadTodoItems()
    }
  }

  async updateTodoStatus(id: string) {
    const todoItem = this.todoItems.find(item => item.id === id);
    if (todoItem) {
      const updatedStatus = !todoItem.complete;
      await this.httpClient.put(`http://localhost:8080/api/todos/${id}`, { complete: updatedStatus }).toPromise();
      this.loadTodoItems()
    }
  }

  async deleteTodo(id: string) { 
    this.deleteTodoId = id
    await this.httpClient.delete(`http://localhost:8080/api/todos/${this.deleteTodoId}`, {}).toPromise();
    this.loadTodoItems()
    this.deleteTodoId = ''
   }
}