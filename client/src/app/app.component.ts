import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { MatTableDataSource } from '@angular/material/table';

export interface ITodoItem {
  id: string;
  title: string;
  complete: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  constructor(private httpClient: HttpClient) {}
  id = '';
  title = '';
  complete = false;
  deleteTodoId = '';
  dataSource: any;
  todoItems: any;
  displayedColumns: string[] = ['select',  'title'];
  columns = [
    {id: 'select', name: 'Blank'},
    {id: 'id', name: 'ID'},
    {id: 'title', name: 'Todo Item'},
    {id: 'complete', name: 'Status'},
  ];
  filterColumns: string[] = ['blank', 'title_filter'];
  filterValues: string[] = [''];  
  selectedTodos: ITodoItem[] = [];


  async ngOnInit() {
    this.loadTodoItems();
  }

  async loadTodoItems() {
    this.todoItems = (await this.httpClient.get<ITodoItem[]>('http://localhost:8080/api/todos').toPromise());
    this.dataSource = new MatTableDataSource(this.todoItems);
    this.dataSource.filterPredicate = (data: ITodoItem, filter: string) => {
      const filterValues = filter.split(',');
      return data.title.toLowerCase().includes(filterValues[1]);
    };
  }

  async addTodo() {
    if (this.title.trim() !== '') {
      await this.httpClient.post('http://localhost:8080/api/todos', {
        id: this.id,
        title: this.title,
        complete: false
      }).toPromise()
      this.id = '';
      this.title = '';
      this.complete = false;
      this.loadTodoItems();
    }
  }

  async updateTodoStatus(row: any){
    await this.httpClient.put(`http://localhost:8080/api/todos/${row.id}`, { complete: !row.complete }).toPromise();
  }

  async deleteTodo(){
    for (const temp of this.selectedTodos){
      await this.httpClient.delete(`http://localhost:8080/api/todos/${temp.id}`, {}).toPromise();
      this.loadTodoItems();
    }
    this.selectedTodos = [];
  }
  
  applyFilter(event: Event, index: number) {     
    this.filterValues[index] = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = this.filterValues.join(',');
  }

  select(row: any) {
    const index = this.selectedTodos.indexOf(row);
    if (index > -1) {
      this.selectedTodos.splice(index, 1);
    } else {
      this.selectedTodos.push(row);
    }
    this.updateTodoStatus(row);
  }
}
