import React, { useMemo, useState, useEffect } from "react";
import { uid } from "../utils/uid";

const STORAGE_KEY = "jao_todos";

const DEFAULT_TODOS = [
  { id: uid(), text: "Follow up with Acme recruiter", done: false, priority: "High" },
  { id: uid(), text: "Tailor resume for Product Analyst role", done: false, priority: "Medium" },
  { id: uid(), text: "Schedule mock interview", done: true, priority: "Low" },
];

const PRIORITIES = ["Low", "Medium", "High"];

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TODOS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TODOS;
    return parsed;
  } catch (err) {
    console.error("Failed to load todos:", err);
    return DEFAULT_TODOS;
  }
}

export default function TodoPage() {
  const [todos, setTodos] = useState(loadTodos);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const counts = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    return { total, done, active: total - done };
  }, [todos]);

  function addTodo() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos([{ id: uid(), text: trimmed, done: false, priority }, ...todos]);
    setText("");
    setPriority("Medium");
  }

  function toggleTodo(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="todoPage">
      <div className="todoHero">
        <div>
          <h2>Todo Studio</h2>
          <p className="muted">Stay focused with a sleek, theme-aware task board.</p>
        </div>
        <div className="todoStats">
          <div className="todoStatCard">
            <span>Total</span>
            <strong>{counts.total}</strong>
          </div>
          <div className="todoStatCard">
            <span>Active</span>
            <strong>{counts.active}</strong>
          </div>
          <div className="todoStatCard">
            <span>Done</span>
            <strong>{counts.done}</strong>
          </div>
        </div>
      </div>

      <div className="todoShell">
        <div className="todoPanel">
          <div className="todoPanelHeader">
            <h3>Create a task</h3>
            <div className="todoFilters">
              <button
                className={`chip ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`chip ${filter === "active" ? "active" : ""}`}
                onClick={() => setFilter("active")}
              >
                Active
              </button>
              <button
                className={`chip ${filter === "done" ? "active" : ""}`}
                onClick={() => setFilter("done")}
              >
                Done
              </button>
            </div>
          </div>

          <div className="todoForm">
            <input
              className="todoInput"
              placeholder="Add a new todo..."
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTodo();
              }}
            />
            <select
              className="todoSelect"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {PRIORITIES.map((level) => (
                <option key={level} value={level}>
                  {level} Priority
                </option>
              ))}
            </select>
            <button className="primary" onClick={addTodo}>
              Add Task
            </button>
          </div>
        </div>

        <div className="todoPanel">
          <div className="todoPanelHeader">
            <h3>Your tasks</h3>
            <button className="ghost" onClick={clearCompleted}>
              Clear Completed
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">No tasks here yet. Add one to get rolling.</div>
          ) : (
            <ul className="todoList">
              {filtered.map((todo) => (
                <li key={todo.id} className={`todoItem ${todo.done ? "done" : ""}`}>
                  <label className="todoCheck">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span className="todoText">{todo.text}</span>
                  </label>
                  <div className="todoMeta">
                    <span className={`todoPriority ${todo.priority.toLowerCase()}`}>
                      {todo.priority}
                    </span>
                    <button className="ghost" onClick={() => deleteTodo(todo.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

