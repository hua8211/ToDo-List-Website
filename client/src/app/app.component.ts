import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { MatTableDataSource } from '@angular/material/table';

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
  constructor(private httpClient: HttpClient) {}
  id = ''
  title = ''
  complete = false
  deleteTodoId = ''
  dataSource: any
  todoItems: ITodoItem[] = []
  displayedColumns: string[] = ['select',  'title'];
  filterColumns: string[] = ['select', 'title_filter'];
  selectedTodos: ITodoItem[] = [];
  columns = [
    {id: 'select', name: 'Blank'},
    {id: 'id', name: 'ID'},
    {id: 'title', name: 'Todo Item'},
    {id: 'complete', name: 'Status'},
  ];
  filterValues: string[] = ['','',''];  

  async ngOnInit() {
    this.loadTodoItems()
  }

  async loadTodoItems() {
    this.todoItems = (await this.httpClient.get<ITodoItem[]>('http://localhost:8080/api/todos').toPromise()) ?? []
    if (this.todoItems === undefined) {
      this.todoItems = [];
    }
    this.dataSource = new MatTableDataSource(this.todoItems);
    this.dataSource.filterPredicate = (data: ITodoItem, filter: string) => {
      const filterValues = filter.split(',');
      return data.id.toLowerCase().includes(filterValues[0]) &&              
             data.title.toLowerCase().includes(filterValues[1])
    };
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

  async updateTodoStatus(row: any){
    await this.httpClient.put(`http://localhost:8080/api/todos/${row.id}`, { complete: !row.complete }).toPromise();
  }

  async deleteTodo(){
    for (let temp of this.selectedTodos){
      await this.httpClient.delete(`http://localhost:8080/api/todos/${temp.id}`, {}).toPromise();
      this.loadTodoItems()
    }
    this.selectedTodos = []
  }
  
  applyFilter(event: Event, index: number) {     
    this.filterValues[index] = (event.target as HTMLInputElement).value.toLowerCase();
    this.dataSource.filter = this.filterValues.join(',');
    console.log(this.dataSource.filter)
  }

  select(row: any) {
    const index = this.selectedTodos.indexOf(row);
    if (index > -1) {
      this.selectedTodos.splice(index, 1);
    } else {
      this.selectedTodos.push(row);
    }
    this.updateTodoStatus(row)
  }
}
