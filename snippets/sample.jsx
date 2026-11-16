// React JSX Sample
// This file demonstrates React JavaScript components with:
// - React hooks (useState, useEffect)
// - Event handlers and state management
// - JSX syntax and component composition
// - PropTypes for type checking
// - Functional components with hooks

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./App.css";

// Functional component with hooks
const App = ({ title, initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Effect hook for side effects
  useEffect(() => {
    document.title = `${title} - Count: ${count}`;
  }, [title, count]);

  // Event handlers
  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const handleDecrement = () => {
    setCount((prevCount) => Math.max(0, prevCount - 1));
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTodos((prevTodos) => [
        ...prevTodos,
        {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
        },
      ]);
      setInputValue("");
    }
  };

  const handleToggleTodo = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>{title}</h1>
        <div className="counter">
          <button onClick={handleDecrement} disabled={count === 0}>
            -
          </button>
          <span className="count-value">{count}</span>
          <button onClick={handleIncrement}>+</button>
        </div>
      </header>

      <main className="app-main">
        <section className="todo-section">
          <h2>Todo List</h2>
          <form onSubmit={handleAddTodo} className="todo-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new todo..."
              className="todo-input"
            />
            <button type="submit" className="add-button">
              Add Todo
            </button>
          </form>

          <ul className="todo-list">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

// Todo item component
const TodoItem = ({ todo, onToggle, onDelete }) => {
  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="todo-checkbox"
      />
      <span className="todo-text">{todo.text}</span>
      <button
        onClick={() => onDelete(todo.id)}
        className="delete-button"
        aria-label="Delete todo"
      >
        ×
      </button>
    </li>
  );
};

// PropTypes for type checking
App.propTypes = {
  title: PropTypes.string.isRequired,
  initialCount: PropTypes.number,
};

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default App;
