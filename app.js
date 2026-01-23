import { formatDate, getStatus, STATUS_LABELS, STATUS_STYLES } from "./utils.js";

const STORAGE_KEY = "soae-dashboard-items";

const form = document.querySelector("#item-form");
const itemsBody = document.querySelector("#items-body");
const emptyState = document.querySelector("#empty-state");
const statusFilter = document.querySelector("#status-filter");
const summary = document.querySelector("#summary");

const initialItems = loadItems();
let items = [...initialItems];

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function buildStatusPill(statusKey) {
  const pill = document.createElement("span");
  pill.className = `status-pill ${STATUS_STYLES[statusKey]}`;
  pill.textContent = STATUS_LABELS[statusKey];
  return pill;
}

function renderSummary(filteredItems) {
  const totals = {
    open: 0,
    overdue: 0,
    complete: 0,
  };

  filteredItems.forEach((item) => {
    const statusKey = getStatus(item);
    totals[statusKey] += 1;
  });

  summary.innerHTML = "";
  Object.entries(totals).forEach(([key, value]) => {
    const card = document.createElement("div");
    card.className = "summary-card";
    card.innerHTML = `<h3>${STATUS_LABELS[key]}</h3><p>${value}</p>`;
    summary.append(card);
  });
}

function renderItems() {
  const filter = statusFilter.value;
  const filteredItems = items.filter((item) => {
    if (filter === "all") {
      return true;
    }
    return getStatus(item) === filter;
  });

  itemsBody.innerHTML = "";
  filteredItems.forEach((item) => {
    const row = document.createElement("tr");
    const statusKey = getStatus(item);

    row.innerHTML = `
      <td>${item.title}</td>
      <td>${item.owner}</td>
      <td>${formatDate(item.dueDate)}</td>
      <td></td>
      <td>${item.notes || ""}</td>
      <td></td>
    `;

    row.children[3].append(buildStatusPill(statusKey));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "action-link";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      items = items.filter((entry) => entry.id !== item.id);
      saveItems();
      renderItems();
    });

    row.children[5].append(removeButton);
    itemsBody.append(row);
  });

  emptyState.style.display = filteredItems.length === 0 ? "block" : "none";
  renderSummary(items);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const newItem = {
    id: crypto.randomUUID(),
    title: formData.get("title").trim(),
    owner: formData.get("owner").trim(),
    dueDate: formData.get("dueDate"),
    completed: formData.get("completed") === "on",
    notes: formData.get("notes").trim(),
  };

  if (!newItem.title || !newItem.owner || !newItem.dueDate) {
    return;
  }

  items.unshift(newItem);
  saveItems();
  form.reset();
  renderItems();
});

statusFilter.addEventListener("change", renderItems);

renderItems();
