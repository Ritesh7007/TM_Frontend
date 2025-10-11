const backendUrl = "https://tm-backend-10.onrender.com/tasks";
const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const logoutBtn = document.getElementById("logoutBtn");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const showAll = document.getElementById("showAll");
const showPending = document.getElementById("showPending");
const showCompleted = document.getElementById("showCompleted");

let allTasks = [];
let currentFilter = "all";

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

async function fetchTasks() {
  const res = await fetch(`${backendUrl}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  allTasks = await res.json();
  renderTasks();
  updateCounts();
}

async function addTask() {
  const title = taskInput.value.trim();
  const category = categorySelect.value;
  if (!title) return alert("Enter a task");

  await fetch(`${backendUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, category }),
  });

  taskInput.value = "";
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${backendUrl}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  fetchTasks();
}

async function toggleComplete(id, completed) {
  await fetch(`${backendUrl}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ completed }),
  });
  fetchTasks();
}

async function editTask(id, oldTitle) {
  const li = document.querySelector(`li[data-id="${id}"]`);
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldTitle;
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";

  li.innerHTML = "";
  li.appendChild(input);
  li.appendChild(saveBtn);

  saveBtn.addEventListener("click", async () => {
    const newTitle = input.value.trim();
    if (!newTitle) return alert("Enter valid title");
    await fetch(`${backendUrl}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle }),
    });
    fetchTasks();
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  let tasksToRender = allTasks;

  if (currentFilter === "pending") {
    tasksToRender = allTasks.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    tasksToRender = allTasks.filter(t => t.completed);
  }

  tasksToRender.forEach((task) => {
    const li = document.createElement("li");
    li.setAttribute("data-id", task._id);
    const date = new Date(task.createdAt).toLocaleString();

    li.innerHTML = `
      <div>
        <input type="checkbox" ${task.completed ? "checked" : ""} 
          onchange="toggleComplete('${task._id}', this.checked)">
        <span class="${task.completed ? "completed" : ""}">${task.title}</span>
        <span class="category-tag ${task.category.toLowerCase()}">[${task.category}]</span>
        <div class="date-tag">${date}</div>
      </div>
      <div>
        <button class="edit-btn" onclick="editTask('${task._id}', '${task.title}')">Edit</button>
        <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function updateCounts() {
  const total = allTasks.length;
  const pending = allTasks.filter(t => !t.completed).length;
  const completed = allTasks.filter(t => t.completed).length;

  totalCount.textContent = total;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;
}

// 🔹 Filter Buttons
function setActiveFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  if (filter === "all") showAll.classList.add("active");
  if (filter === "pending") showPending.classList.add("active");
  if (filter === "completed") showCompleted.classList.add("active");
  renderTasks();
}

showAll.addEventListener("click", () => setActiveFilter("all"));
showPending.addEventListener("click", () => setActiveFilter("pending"));
showCompleted.addEventListener("click", () => setActiveFilter("completed"));

addBtn.addEventListener("click", addTask);
fetchTasks();

