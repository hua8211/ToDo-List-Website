import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent, ITodoItem } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AppComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should call loadTodoItem on ngOnInit', () => {
      spyOn(component,'loadTodoItems');
      component.ngOnInit();
      expect(component.loadTodoItems).toHaveBeenCalled();
    });
  });

  describe('loadTodoItems()', () => {
    it('should load todo items', fakeAsync(() => {
      const mockTodoItems: ITodoItem[] = [
        { id: '1', title: 'Todo 1', complete: false },
        { id: '2', title: 'Todo 2', complete: true }
      ];
      component.loadTodoItems();
      const req = httpTestingController.expectOne('http://localhost:8080/api/todos');
      expect(req.request.method).toBe('GET');
      req.flush(mockTodoItems);
      tick();
      expect(component.todoItems).toEqual(mockTodoItems);
    }));
  });

  describe('addTodo()', () => {
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
  });

  describe('updateTodoStatus()', () => {
    it('should update todo item status', fakeAsync(() => {
      const mockTodoItem: ITodoItem = { id: '1', title: 'Todo', complete: false };
      component.updateTodoStatus(mockTodoItem);
      const req = httpTestingController.expectOne(`http://localhost:8080/api/todos/${mockTodoItem.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ complete: true });
      req.flush({});
      tick();
    }));
  });

  describe('deleteTodo()', () => {
    it('should delete a todo item', fakeAsync(() => {
      const mockTodoItems: ITodoItem[] = [
        { id: '1', title: 'Todo 1', complete: false },
        { id: '2', title: 'Todo 2', complete: true }
      ];
      component.selectedTodos = mockTodoItems;
      component.deleteTodo();
      for(const item of mockTodoItems) {
        const req = httpTestingController.expectOne(`http://localhost:8080/api/todos/${item.id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
        tick();
        const loadTodoItemsReq = httpTestingController.expectOne('http://localhost:8080/api/todos');
        expect(loadTodoItemsReq.request.method).toBe('GET');
        loadTodoItemsReq.flush([]);
        tick();
      }
      expect(component.todoItems).toEqual([]);
    }));
  });

  describe('appyFilter()', () => {
    it('should apply filter to data source', () => {
      component.dataSource = new MatTableDataSource([]);
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: { value: 'test' } });
      component.applyFilter(event, 0);
      expect(component.dataSource.filter).toEqual('test');
    });
  });

  describe('select()', () => {
    it('should select and unselect a todo item', () => {
      const mockTodoItems: ITodoItem = { id: '1', title: 'Todo 1', complete: false };
      spyOn(component, 'updateTodoStatus');
      component.select(mockTodoItems);
      expect(component.selectedTodos).toEqual([mockTodoItems]);
      component.select(mockTodoItems);
      expect(component.selectedTodos).toEqual([]);
    });
  });
});
