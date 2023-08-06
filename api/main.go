package main

import (
	"github.com/gin-gonic/gin"
    "net/http"
    cors "github.com/rs/cors/wrapper/gin"
    "github.com/google/uuid"
)

type Todo struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Complete bool   `json:"complete"`
}

type TodoList struct {
	Todos []Todo `json:"todos"`
}

func New() *TodoList {
    return &TodoList{
        Todos: []Todo{},
    }
}

func (r *TodoList) Add(todo Todo){
    r.Todos = append(r.Todos, todo)
}

func (r *TodoList) GetAll() []Todo {
    return r.Todos
}

func getTodos(list *TodoList) gin.HandlerFunc{
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")

        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")

        result := list.GetAll()
        c.JSON(http.StatusOK, result)
    }
}

type createTodoPost struct {
    ID       string `json:"id"`
	Title    string `json:"title"`
	Complete bool   `json:"complete"`
}

func createTodo(list *TodoList) gin.HandlerFunc{
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")

        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")

        result := createTodoPost{}
        // c.Bind(&result)
        if err := c.BindJSON(&result); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if result.Title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "title cannot be empty"})
			return
		}
        id := uuid.New().String()
        oneTodo := Todo{
            ID: id,
	        Title: result.Title,
	        Complete: result.Complete,
        }
        list.Add(oneTodo)
        c.Status(http.StatusNoContent)
    }
}

func updateTodoStatus(list *TodoList) gin.HandlerFunc{
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")

        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")

        todoID := c.Param("id")

        found := false

        for i := range list.Todos {
            if list.Todos[i].ID == todoID {
                list.Todos[i].Complete = !list.Todos[i].Complete
                c.Status(http.StatusNoContent)
                return
            }
        }
        if !found {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
            return
        }
    }
}

func deleteTodo(list *TodoList) gin.HandlerFunc{
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")

        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")

        todoID := c.Param("id")
        found := false
        for i, todo := range list.Todos { 
            if todo.ID == todoID { 
                list.Todos = append(list.Todos[:i], list.Todos[i+1:]...)
                c.Status(http.StatusNoContent) 
                return
            } 
        }
        if !found {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
            return
        }
    }
}

func whatever() gin.HandlerFunc{
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")

        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")

        c.Status(http.StatusOK)
    }
}

func main() {
    list := New()
    r := gin.Default()

    api := r.Group("/api") 
    {    
        r.Use(cors.Default())
        api.GET("/todos", getTodos(list))
        api.POST("/todos", createTodo(list))
        api.PUT("/todos/:id", updateTodoStatus(list))
        api.DELETE("/todos/:id", deleteTodo(list))
        api.OPTIONS("/todos/:id", whatever() )

    }
    r.Run("localhost:8080")
}