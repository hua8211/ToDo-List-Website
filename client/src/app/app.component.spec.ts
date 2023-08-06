import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent, ITodoItem } from './app.component';
import { HttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AppComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load todo items on ngOnInit', fakeAsync(() => {
    const mockTodoItems: ITodoItem[] = [
      { id: '1', title: 'Todo 1', complete: false },
      { id: '2', title: 'Todo 2', complete: true }
    ];
    component.ngOnInit();
    const req = httpTestingController.expectOne('http://localhost:8080/api/todos');
    expect(req.request.method).toBe('GET');
    req.flush(mockTodoItems);
    tick();
    expect(component.todoItems).toEqual(mockTodoItems);
  }));

  it('should add a todo item', fakeAsync(() => {
    const mockTodoItem: ITodoItem = { id: '1', title: 'New Todo', complete: false };
    component.id = mockTodoItem.id;
    component.title = mockTodoItem.title;
    component.addTodo();
    const req = httpTestingController.expectOne('http://localhost:8080/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id: mockTodoItem.id, title: mockTodoItem.title, complete: false });
    req.flush({});
    tick();
    expect(component.id).toBe('');
    expect(component.title).toBe('');
    expect(component.complete).toBe(false);
    const loadTodoItemsReq = httpTestingController.expectOne('http://localhost:8080/api/todos');
    expect(loadTodoItemsReq.request.method).toBe('GET');
    loadTodoItemsReq.flush([mockTodoItem]);
    tick();
    expect(component.todoItems).toEqual([mockTodoItem]);
  }));

  it('should not add todo item if title is empty', fakeAsync(() => {
    spyOn(httpClient, 'post')
    component.title = '';
    component.addTodo();
    expect(httpClient.post).not.toHaveBeenCalled();
    httpTestingController.expectNone('http://localhost:8080/api/todos');
    expect(component.todoItems).toEqual([]);
  }));

  it('should update todo item status', fakeAsync(() => {
    const mockTodoItem: ITodoItem = { id: '1', title: 'Todo', complete: false };
    component.todoItems = [mockTodoItem];
    component.updateTodoStatus(mockTodoItem.id);
    const req = httpTestingController.expectOne(`http://localhost:8080/api/todos/${mockTodoItem.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ complete: true });
    req.flush({});
    tick();
    const loadTodoItemsReq = httpTestingController.expectOne('http://localhost:8080/api/todos');
    expect(loadTodoItemsReq.request.method).toBe('GET');
    loadTodoItemsReq.flush([mockTodoItem]);
    tick();
    expect(component.todoItems[0].complete).toBe(false);
  }));

  it('should not update todo item if ID is not found', fakeAsync(() => {
    spyOn(httpClient, 'put')
    component.todoItems = [
      { id: '1', title: 'Task 1', complete: false },
      { id: '2', title: 'Task 2', complete: false }
    ];
    const nonExistingId = '3'; 
    component.updateTodoStatus(nonExistingId);
    expect(httpClient.put).not.toHaveBeenCalled();
    httpTestingController.expectNone(`http://localhost:8080  /api/todos/${nonExistingId}`);
    expect(component.todoItems).toEqual([
      { id: '1', title: 'Task 1', complete: false },
      { id: '2', title: 'Task 2', complete: false }
    ]);
  }));
  
  it('should delete a todo item', fakeAsync(() => {
    const mockTodoItem: ITodoItem = { id: '1', title: 'Todo', complete: false };
    component.todoItems = [mockTodoItem];
    component.deleteTodo(mockTodoItem.id);
    const req = httpTestingController.expectOne(`http://localhost:8080/api/todos/${mockTodoItem.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    tick();
    const loadTodoItemsReq = httpTestingController.expectOne('http://localhost:8080/api/todos');
    expect(loadTodoItemsReq.request.method).toBe('GET');
    loadTodoItemsReq.flush([]);
    tick();
    expect(component.todoItems).toEqual([]);
    expect(component.deleteTodoId).toBe('');
  }));
});
