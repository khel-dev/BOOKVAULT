let notifications = [];
let filteredNotifications = [];
let currentView = "list";

function getUid() {
  const uid = window.authService?.getCurrentUserId?.() || null;
  if (uid) return uid;
  const stored = localStorage.getItem("registeredUser");
  if (!stored) return null;
  try {
    return JSON.parse(stored)?.uid || null;
  } catch {
    return null;
  }
}

function toast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `notification notification-${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function updateProfile() {
  const stored = localStorage.getItem("registeredUser");
  if (!stored) return;
  const u = JSON.parse(stored);
  const fb = "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";
  document.getElementById("userAvatarHeader") && (document.getElementById("userAvatarHeader").src = u.profilePicture || fb);
  document.getElementById("userAvatarProfile") && (document.getElementById("userAvatarProfile").src = u.profilePicture || fb);
  const n = document.getElementById("profileName");
  if (n) n.textContent = u.username || "User";
}

async function waitForServices() {
  let a = 0;
  while ((!window.userDataService || !getUid()) && a++ < 60) await new Promise((r) => setTimeout(r, 120));
  return !!window.userDataService && !!getUid();
}

function formatTime(ts) {
  const d = new Date(ts?.toDate ? ts.toDate() : ts);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function iconFor(type) {
  return { payment: "dollar-sign", overdue: "triangle-exclamation", reminder: "bell", update: "info-circle" }[type] || "bell";
}

async function loadNotifications() {
  if (!(await waitForServices())) return;
  notifications = await window.userDataService.getNotifications(getUid());
  filteredNotifications = [...notifications];
  renderNotifications();
  updateStats();
}

function renderNotifications() {
  const c = document.getElementById("notificationsList");
  if (!c) return;
  if (!filteredNotifications.length) {
    c.innerHTML = `<div class="empty-notifications"><i class="fas fa-bell-slash"></i><h3>No notifications</h3><p>You're all caught up.</p></div>`;
    return;
  }
  c.innerHTML = filteredNotifications
    .map(
      (n) => `
    <div class="notification-item ${n.read ? "read" : "unread"}">
      <div class="notification-icon ${n.type || "update"}"><i class="fas fa-${iconFor(n.type)}"></i></div>
      <div class="notification-content">
        <div class="notification-title">${escapeHtml(n.title || "Notice")}</div>
        <div class="notification-message">${escapeHtml(n.message || "")}</div>
        <div class="notification-meta"><span class="notification-time"><i class="fas fa-clock"></i> ${formatTime(n.createdAt)}</span></div>
      </div>
      <div class="notification-actions">
        ${!n.read ? `<button type="button" class="notification-action-btn" onclick="markAsRead('${n.id}')">Mark read</button>` : ""}
        <button type="button" class="notification-action-btn" onclick="dismissNotification('${n.id}')">Dismiss</button>
      </div>
    </div>`,
    )
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyFilters() {
  const type = document.getElementById("typeFilter")?.value || "all";
  const status = document.getElementById("statusFilter")?.value || "all";
  const q = (document.getElementById("notificationSearch")?.value || "").toLowerCase();
  filteredNotifications = notifications.filter((n) => {
    const tm = type === "all" || n.type === type;
    const sm = status === "all" || (status === "read" ? !!n.read : !n.read);
    const sq =
      !q ||
      String(n.title || "")
        .toLowerCase()
        .includes(q) ||
      String(n.message || "")
        .toLowerCase()
        .includes(q);
    return tm && sm && sq;
  });
  renderNotifications();
}

function clearFilters() {
  const a = document.getElementById("typeFilter");
  const b = document.getElementById("statusFilter");
  const c = document.getElementById("notificationSearch");
  if (a) a.value = "all";
  if (b) b.value = "all";
  if (c) c.value = "";
  filteredNotifications = [...notifications];
  renderNotifications();
}

function updateStats() {
  const urgent = notifications.filter((n) => n.priority === "urgent" && !n.read).length;
  const dueSoon = notifications.filter((n) => n.type === "payment" && !n.read).length;
  const reminders = notifications.filter((n) => n.type === "reminder" && !n.read).length;
  const updates = notifications.filter((n) => n.type === "update" && !n.read).length;
  const unread = notifications.filter((n) => !n.read).length;
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(v);
  };
  set("urgentCount", urgent);
  set("dueSoonCount", dueSoon);
  set("remindersCount", reminders);
  set("updatesCount", updates);
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    badge.textContent = String(unread);
    badge.style.display = unread > 0 ? "flex" : "none";
  }
}

async function markAsRead(id) {
  await window.userDataService.markNotificationRead(getUid(), id);
  await loadNotifications();
}

async function dismissNotification(id) {
  await window.userDataService.deleteNotification(getUid(), id);
  await loadNotifications();
}

async function markAllRead() {
  await window.userDataService.markAllNotificationsRead(getUid());
  await loadNotifications();
  toast("All marked read.", "success");
}

function sendPaymentReminders() {
  toast("Reminder workflow: use Billing → Send Reminders.", "info");
}

function scheduleReminder() {
  document.getElementById("scheduleReminderModal")?.classList.add("active");
}

function closeScheduleReminderModal() {
  document.getElementById("scheduleReminderModal")?.classList.remove("active");
  document.getElementById("scheduleReminderForm")?.reset();
}

async function saveReminder() {
  const title = document.getElementById("reminderTitle")?.value?.trim();
  const description = document.getElementById("reminderDescription")?.value?.trim();
  const priority = document.getElementById("reminderPriority")?.value || "medium";
  if (!title) return toast("Title required.", "error");
  await window.userDataService.addNotification(getUid(), {
    type: "reminder",
    title,
    message: description || "Reminder",
    priority,
    read: false,
  });
  closeScheduleReminderModal();
  await loadNotifications();
  toast("Reminder added.", "success");
}

function populateClientSelect() {
  /* optional: load clients for reminder association */
}

function viewCalendar() {
  toast("Calendar view coming soon.", "info");
}

function openNotificationSettings() {
  document.getElementById("notificationSettingsModal")?.classList.add("active");
}
function closeNotificationSettingsModal() {
  document.getElementById("notificationSettingsModal")?.classList.remove("active");
}
function saveNotificationSettings() {
  closeNotificationSettingsModal();
  toast("Preferences saved locally.", "success");
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".notifications-header .view-btn").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-view") === view);
  });
  const list = document.getElementById("notificationsList");
  if (list) list.classList.toggle("card-view", view === "card");
  renderNotifications();
}

function openProfileModal() {
  document.getElementById("profileModal")?.classList.add("active");
}
function closeProfileModal() {
  document.getElementById("profileModal")?.classList.remove("active");
}
function editProfile() {
  window.location.href = "settings.html";
}
function changePassword() {
  window.location.href = "forgot-password.html";
}
function goToNotifications() {
  window.location.href = "notifications.html";
}
function logout() {
  if (typeof bookvaultLogout === "function") return bookvaultLogout();
  localStorage.removeItem("registeredUser");
  window.location.href = "login.html";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProfileModal();
    closeScheduleReminderModal();
    closeNotificationSettingsModal();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  updateProfile();
  document.getElementById("notificationSearch")?.addEventListener("input", applyFilters);
  document.getElementById("typeFilter")?.addEventListener("change", applyFilters);
  document.getElementById("statusFilter")?.addEventListener("change", applyFilters);
  await loadNotifications();
});
