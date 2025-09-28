import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Todo App
 * - Header
 * - Add Todo form
 * - Todo list (toggle, edit, delete)
 * - Footer
 * Persistent in localStorage, clean design, subtle shadows, rounded corners, smooth transitions.
 */

// Helpers
const uuid = () => Math.random().toString(36).slice(2, 10);

// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  /** Persist state in localStorage with JSON serialization. */
  const [stored, setStored] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      // ignore quota errors
    }
  }, [key, stored]);

  return [stored, setStored];
}

// PUBLIC_INTERFACE
function App() {
  /** Root component for the Todo app UI following Ocean Professional style. */
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [filter, setFilter] = useState('all'); // all | active | completed

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    return { total, done, remaining: total - done };
  }, [todos]);

  const addTodo = (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos(prev => [{ id: uuid(), title: trimmed, completed: false, createdAt: Date.now() }, ...prev]);
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const updateTodo = (id, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, title: trimmed } : t)));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const hasCompleted = todos.some(t => t.completed);

  return (
    <div className="ocean-app">
      <GradientBackdrop />
      <Header theme={theme} onToggleTheme={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))} />

      <main className="container">
        <Card>
          <AddTodoForm onAdd={addTodo} />
          <Toolbar
            filter={filter}
            setFilter={setFilter}
            stats={stats}
            clearCompleted={clearCompleted}
            hasCompleted={hasCompleted}
          />
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
          />
        </Card>
      </main>

      <Footer />
    </div>
  );
}

function GradientBackdrop() {
  return <div className="gradient-backdrop" aria-hidden="true" />;
}

function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-badge">✓</span>
        <div className="brand-text">
          <h1 className="brand-title">Simple Todo</h1>
          <p className="brand-subtitle">Ocean Professional</p>
        </div>
      </div>
      <button
        className="btn btn-ghost"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
}

function Card({ children }) {
  return <section className="card">{children}</section>;
}

function AddTodoForm({ onAdd }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  };

  return (
    <form className="add-form" onSubmit={submit}>
      <div className="input-wrap">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a new task..."
          aria-label="Add a new task"
          className="input"
        />
        <button type="submit" className="btn btn-primary" aria-label="Add todo">
          Add
        </button>
      </div>
      <p className="helper">Press Enter to quickly add. Keep tasks short and actionable.</p>
    </form>
  );
}

function Toolbar({ filter, setFilter, stats, clearCompleted, hasCompleted }) {
  return (
    <div className="toolbar">
      <div className="filters" role="tablist" aria-label="Todo filters">
        <button
          className={`chip ${filter === 'all' ? 'chip-active' : ''}`}
          onClick={() => setFilter('all')}
          role="tab"
          aria-selected={filter === 'all'}
        >
          All
        </button>
        <button
          className={`chip ${filter === 'active' ? 'chip-active' : ''}`}
          onClick={() => setFilter('active')}
          role="tab"
          aria-selected={filter === 'active'}
        >
          Active
        </button>
        <button
          className={`chip ${filter === 'completed' ? 'chip-active' : ''}`}
          onClick={() => setFilter('completed')}
          role="tab"
          aria-selected={filter === 'completed'}
        >
          Completed
        </button>
      </div>
      <div className="stats-actions">
        <span className="stats">
          {stats.remaining} remaining • {stats.done} completed
        </span>
        <button
          className="btn btn-ghost danger"
          onClick={clearCompleted}
          disabled={!hasCompleted}
          aria-disabled={!hasCompleted}
          title="Clear completed tasks"
        >
          Clear completed
        </button>
      </div>
    </div>
  );
}

function TodoList({ todos, onToggle, onDelete, onUpdate }) {
  if (!todos.length) {
    return (
      <div className="empty">
        <span className="empty-icon">📄</span>
        <p>No todos to show. Add your first task above.</p>
      </div>
    );
  }
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => onToggle(todo.id)}
          onDelete={() => onDelete(todo.id)}
          onUpdate={(title) => onUpdate(todo.id, title)}
        />
      ))}
    </ul>
  );
}

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const handleSave = () => {
    if (!title.trim()) {
      setTitle(todo.title);
      setEditing(false);
      return;
    }
    onUpdate(title);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTitle(todo.title);
      setEditing(false);
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <button
        className={`check ${todo.completed ? 'checked' : ''}`}
        onClick={onToggle}
        aria-pressed={todo.completed}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
        title={todo.completed ? 'Mark as active' : 'Mark as completed'}
      >
        {todo.completed ? '✓' : ''}
      </button>

      {!editing ? (
        <div className="title-wrap" onDoubleClick={() => setEditing(true)}>
          <span className="title-text">{todo.title}</span>
          <div className="actions">
            <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit todo" title="Edit">
              ✏️
            </button>
            <button className="icon-btn danger" onClick={onDelete} aria-label="Delete todo" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      ) : (
        <div className="edit-wrap">
          <input
            className="input edit-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Edit todo"
          />
          <div className="edit-actions">
            <button className="btn btn-secondary" onClick={() => { setTitle(todo.title); setEditing(false); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">
        Built with <span className="heart">♥</span> • <a href="https://react.dev" target="_blank" rel="noreferrer">React</a>
      </p>
    </footer>
  );
}

export default App;
