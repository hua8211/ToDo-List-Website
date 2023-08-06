package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"github.com/gin-gonic/gin"
    "bytes"
    "strings"
    "encoding/json"
    "github.com/stretchr/testify/assert"
)

func TestAdd(t *testing.T) {
	list := New()
	todo := Todo{
		ID:       "1",
		Title:    "Test Todo",
		Complete: false,
	}
	list.Add(todo)
	if len(list.Todos) != 1 {
		t.Errorf("Expected length of Todos to be 1, got %d", len(list.Todos))
	}
	if list.Todos[0].ID != "1" {
		t.Errorf("Expected ID of first Todo to be '1', got %s", list.Todos[0].ID)
	}
	if list.Todos[0].Title != "Test Todo" {
		t.Errorf("Expected Title of first Todo to be 'Test Todo', got %s", list.Todos[0].Title)
	}
	if list.Todos[0].Complete != false {
		t.Errorf("Expected Complete of first Todo to be false, got %t", list.Todos[0].Complete)
	}
}

func TestGetAll(t *testing.T) {
	list := New()
	todo1 := Todo{
		ID:       "1",
		Title:    "Test Todo 1",
		Complete: false,
	}
	todo2 := Todo{
		ID:       "2",
		Title:    "Test Todo 2",
		Complete: true,
	}
	list.Add(todo1)
	list.Add(todo2)
	result := list.GetAll()
	if len(result) != 2 {
		t.Errorf("Expected length of result to be 2, got %d", len(result))
	}
	if result[0].ID != "1" {
		t.Errorf("Expected ID of first Todo to be '1', got %s", result[0].ID)
	}
    if result[0].Title != "Test Todo 1" {
		t.Errorf("Expected Title of first Todo to be 'Test Todo 1', got %s", list.Todos[0].Title)
	}
	if result[0].Complete != false {
		t.Errorf("Expected Complete of first Todo to be false, got %t", list.Todos[0].Complete)
	}
	if result[1].ID != "2" {
		t.Errorf("Expected ID of second Todo to be '2', got %s", result[1].ID)
	}
    if result[1].Title != "Test Todo 2" {
		t.Errorf("Expected Title of second Todo to be 'Test Todo 2', got %s", list.Todos[0].Title)
	}
	if result[1].Complete != true {
		t.Errorf("Expected Complete of second Todo to be true, got %t", list.Todos[0].Complete)
	}
}

func TestGetTodos(t *testing.T) {
	gin.SetMode(gin.TestMode)

	todoList := New()
	todoList.Add(Todo{ID: "1", Title: "Test Todo", Complete: false})

	r := gin.Default()
	r.GET("/api/todos", getTodos(todoList))

	req, err := http.NewRequest(http.MethodGet, "/api/todos", nil)
	if err != nil {
		t.Fatalf("Couldn't create request: %v\n", err)
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected to get status %d but instead got %d\n", http.StatusOK, w.Code)
	}
}

func TestCreateTodo(t *testing.T) {
	list := New()
	router := gin.Default()
	router.POST("/todos", createTodo(list))

	w := httptest.NewRecorder()
	reqBody := bytes.NewBufferString(`{"title":"Test Todo","complete":false}`)
	req, _ := http.NewRequest("POST", "/todos", reqBody)
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("Expected response code to be %d, got %d", http.StatusNoContent, w.Code)
	}

	result := list.GetAll()
	if len(result) != 1 {
		t.Errorf("Expected length of Todos to be 1, got %d", len(result))
	}
	if result[0].Title != "Test Todo" {
		t.Errorf("Expected Title of first Todo to be 'Test Todo', got %s", result[0].Title)
	}
	if result[0].Complete != false {
		t.Errorf("Expected Complete of first Todo to be false, got %t", result[0].Complete)
	}
}

func TestUpdateTodoStatus(t *testing.T) {
	list := New()
	todo := Todo{
		ID:       "1",
		Title:    "Test Todo",
		Complete: false,
	}
	list.Add(todo)

	router := gin.Default()
	router.PUT("/todos/:id", updateTodoStatus(list))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/todos/1", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("Expected response code to be %d, got %d", http.StatusNoContent, w.Code)
	}

	result := list.GetAll()
	if len(result) != 1 {
		t.Errorf("Expected length of Todos to be 1, got %d", len(result))
	}
	if result[0].Complete != true {
		t.Errorf("Expected Complete of first Todo to be true, got %t", result[0].Complete)
	}
}

func TestDeleteTodo(t *testing.T) {
	list := New()
	todo1 := Todo{
		ID:       "1",
		Title:    "Test Todo 1",
		Complete: false,
	}
	todo2 := Todo{
		ID:       "2",
		Title:    "Test Todo 2",
		Complete: true,
	}
	list.Add(todo1)
	list.Add(todo2)

	router := gin.Default()
	router.DELETE("/todos/:id", deleteTodo(list))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", "/todos/1", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("Expected response code to be %d, got %d", http.StatusNoContent, w.Code)
	}

	result := list.GetAll()
	if len(result) != 1 {
		t.Errorf("Expected length of Todos to be 1, got %d", len(result))
	}
	if result[0].ID != "2" {
		t.Errorf("Expected ID of remaining Todo to be '2', got %s", result[0].ID)
	}
}

func TestWhatever(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.Default()
	router.OPTIONS("/api/todos/:id", whatever())

	req, _ := http.NewRequest(http.MethodOptions, "/api/todos/1", nil)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)
}

func TestCreateTodoWithInvalidJSON(t *testing.T) {
	list := New()
	router := gin.Default()
	router.POST("/todos", createTodo(list))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/todos", strings.NewReader(`{"title": "test`))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d, but got %d", http.StatusBadRequest, w.Code)
	}
}

func TestUpdateTodoStatusWithInvalidID(t *testing.T) {
	list := New()
	router := gin.Default()
	router.PUT("/todos/:id", updateTodoStatus(list))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/todos/invalid-id", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d, but got %d", http.StatusBadRequest, w.Code)
	}
}

func TestDeleteTodoWithInvalidID(t *testing.T) {
	list := New()
	router := gin.Default()
	router.DELETE("/todos/:id", deleteTodo(list))

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", "/todos/invalid-id", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d, but got %d", http.StatusBadRequest, w.Code)
	}
}

func TestCreateInvalidTodo(t *testing.T) {
	list := New()
	router := gin.Default()
	router.POST("/todos", createTodo(list))

	w := httptest.NewRecorder()
	body, _ := json.Marshal(map[string]interface{}{
		"title": "",
	})
	req, _ := http.NewRequest("POST", "/todos", bytes.NewBuffer(body))
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}