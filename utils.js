export const STATUS_LABELS = {
  open: "Open",
  overdue: "Overdue",
  complete: "Complete",
};

export const STATUS_STYLES = {
  open: "status-open",
  overdue: "status-overdue",
  complete: "status-complete",
};

export function getStatus({ dueDate, completed }) {
  if (completed) {
    return "complete";
  }

  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(due.getTime())) {
    return "open";
  }

  return due < today ? "overdue" : "open";
}

export function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
