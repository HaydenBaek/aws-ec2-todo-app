const listEl = document.getElementById("todoList");
const statusEl = document.getElementById("status");
const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function renderTodos(todos) {
  listEl.innerHTML = "";
  todos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.text;
    listEl.appendChild(li);
  });
}

async function loadTodos() {
  setStatus("Loading...");
  const res = await fetch("/api/todos");
  const data = await res.json();
  renderTodos(data);
  setStatus("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return setStatus("Type something first.");

  setStatus("Saving...");
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!res.ok) return setStatus("Save failed.");

  input.value = "";
  await loadTodos();
});

loadTodos();
