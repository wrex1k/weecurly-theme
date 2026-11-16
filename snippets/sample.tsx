// React TypeScript JSX Sample
// This file demonstrates TypeScript React components with:
// - TypeScript interfaces and type definitions
// - React hooks (useState, useEffect, useCallback)
// - Event handlers with proper typing
// - JSX syntax with TypeScript
// - Custom hooks and component composition
// - CSS modules for styling
import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// Type definitions
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface AppProps {
  title: string;
  initialCount?: number;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

// Custom hook for todos
const useTodos = (initialTodos: Todo[] = []) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const addTodo = useCallback((text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
    };
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo };
};

// Main App component
const App: React.FC<AppProps> = ({ title, initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);
  const [inputValue, setInputValue] = useState<string>("");
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  // Effect hook with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      document.title = `${title} - Count: ${count}`;
    }, 100);

    return () => clearTimeout(timer);
  }, [title, count]);

  // Event handlers with proper typing
  const handleIncrement = (): void => {
    setCount((prev) => prev + 1);
  };

  const handleDecrement = (): void => {
    setCount((prev) => Math.max(0, prev - 1));
  };

  const handleAddTodo = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTodo(inputValue);
      setInputValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  // Computed values
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const totalTodos = todos.length;
  const completionPercentage =
    totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>{title}</h1>
        <div className="counter">
          <button
            onClick={handleDecrement}
            disabled={count === 0}
            aria-label="Decrement counter"
          >
            -
          </button>
          <span className="count-value">{count}</span>
          <button onClick={handleIncrement} aria-label="Increment counter">
            +
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="todo-section">
          <h2>Todo List</h2>
          <div className="todo-stats">
            <p>
              Completed: {completedTodos}/{totalTodos}
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleAddTodo} className="todo-form">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Add a new todo..."
              className="todo-input"
              maxLength={100}
            />
            <button
              type="submit"
              className="add-button"
              disabled={!inputValue.trim()}
            >
              Add Todo
            </button>
          </form>

          <ul className="todo-list">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

// Todo item component with proper typing
const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const handleToggle = (): void => {
    onToggle(todo.id);
  };

  const handleDelete = (): void => {
    onDelete(todo.id);
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className="todo-checkbox"
        aria-label={`Toggle todo: ${todo.text}`}
      />
      <span className="todo-text">{todo.text}</span>
      <span className="todo-date">{todo.createdAt.toLocaleDateString()}</span>
      <button
        onClick={handleDelete}
        className="delete-button"
        aria-label={`Delete todo: ${todo.text}`}
      >
        ×
      </button>
    </li>
  );
};

export default App;
