let archiveItems = [];
let filteredArchiveItems = [];
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

function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  const dt = new Date(dateValue);
  if (Number.isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function normalizeArchiveItem(item) {
  const rawDate = item.archivedAt || item.createdAt || item.date || new Date().toISOString();
  const type = item.type || "document";
  return {
    id: item.id,
    type,
    title: item.title || item.name || "Archived item",
    description: item.description || "No description.",
    category: item.category || (type === "invoice" ? "invoices" : `${type}s`),
    date: rawDate?.toDate ? rawDate.toDate().toISOString() : rawDate,
    size: item.size || "—",
    status: item.status || "archived",
  };
}

async function waitForServices() {
  let attempts = 0;
  while ((!window.userDataService || !getUid()) && attempts++ < 60) {
    await new Promise((r) => setTimeout(r, 150));
  }
  return !!window.userDataService && !!getUid();
}

async function loadArchiveItems() {
  if (!(await waitForServices())) {
    showNotification("Please sign in to load archives.", "error");
    return;
  }
  try {
    const uid = getUid();
    const items = await window.userDataService.getArchives(uid);
    archiveItems = items.map(normalizeArchiveItem);
    filteredArchiveItems = [...archiveItems];
    updateStats();
    renderArchiveItems();
    updateNotificationBadge();
  } catch (e) {
    console.error(e);
    showNotification("Could not load archives.", "error");
  }
}

function updateStats() {
  const inactiveClients = archiveItems.filter((i) => i.category === "clients").length;
  const oldInvoices = archiveItems.filter((i) => i.category === "invoices").length;
  const documents = archiveItems.filter((i) => i.category === "documents").length;
  const reports = archiveItems.filter((i) => i.category === "reports").length;
  const oldest = [...archiveItems].sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const setText = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  setText("inactiveClientsCount", String(inactiveClients));
  setText("oldInvoicesCount", String(oldInvoices));
  setText("storageUsed", `${archiveItems.length} items`);
  setText("oldestRecord", oldest ? formatDate(oldest.date) : "N/A");

  const counts = document.querySelectorAll(".category-grid .category-count");
  if (counts[0]) counts[0].textContent = `${inactiveClients} items`;
  if (counts[1]) counts[1].textContent = `${oldInvoices} items`;
  if (counts[2]) counts[2].textContent = `${documents} items`;
  if (counts[3]) counts[3].textContent = `${reports} items`;
}

function renderArchiveItems() {
  const container = document.getElementById("archiveList");
  if (!container) return;

  if (!filteredArchiveItems.length) {
    container.innerHTML = `
      <div class="empty-archive">
        <i class="fas fa-archive"></i>
        <h3>No archived items</h3>
        <p>Archived clients and records will appear here.</p>
      </div>`;
    return;
  }

  container.innerHTML = filteredArchiveItems
    .map(
      (item) => `
      <div class="archive-item" onclick="viewItem('${item.id}')">
        <div class="archive-icon ${item.type}"><i class="fas fa-${getArchiveIcon(item.type)}"></i></div>
        <div class="archive-content">
          <div class="archive-title">${item.title}</div>
          <div class="archive-description">${item.description}</div>
          <div class="archive-meta">
            <div class="archive-date"><i class="fas fa-calendar"></i>${formatDate(item.date)}</div>
            <div class="archive-size"><i class="fas fa-file"></i>${item.size}</div>
          </div>
        </div>
        <div class="archive-actions">
          <button type="button" class="archive-action-btn btn-restore" onclick="restoreItem('${item.id}');event.stopPropagation();">
            <i class="fas fa-undo"></i> Restore
          </button>
          <button type="button" class="archive-action-btn btn-delete-permanent" onclick="deleteItemPermanent('${item.id}');event.stopPropagation();">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>`,
    )
    .join("");

  if (currentView === "grid") container.classList.add("grid-view");
  else container.classList.remove("grid-view");
}

function getArchiveIcon(type) {
  return { client: "users", invoice: "file-invoice", document: "file-alt", report: "chart-bar" }[type] || "file";
}

function applyFilters() {
  const categoryFilter = document.getElementById("categoryFilter")?.value || "all";
  const dateFilter = document.getElementById("dateFilter")?.value || "all";
  const search = (document.getElementById("archiveSearch")?.value || "").toLowerCase();
  filteredArchiveItems = archiveItems.filter((item) => {
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
    const dateMatch = dateFilter === "all" || String(item.date).startsWith(dateFilter);
    const searchMatch =
      item.title.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
    return categoryMatch && dateMatch && searchMatch;
  });
  renderArchiveItems();
}

function clearFilters() {
  const cf = document.getElementById("categoryFilter");
  const df = document.getElementById("dateFilter");
  const s = document.getElementById("archiveSearch");
  if (cf) cf.value = "all";
  if (df) df.value = "all";
  if (s) s.value = "";
  filteredArchiveItems = [...archiveItems];
  renderArchiveItems();
}

function showCategory(category) {
  const f = document.getElementById("categoryFilter");
  if (f) f.value = category;
  applyFilters();
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
  const btn = document.querySelector(`.view-btn[onclick="switchView('${view}')"]`) || document.querySelector(`.view-btn.${view}`);
  if (btn) btn.classList.add("active");
  renderArchiveItems();
}

function viewItem(itemId) {
  const item = archiveItems.find((i) => i.id === itemId);
  if (item) showNotification(`Archived: ${item.title}`, "info");
}

async function restoreItem(itemId) {
  const item = archiveItems.find((i) => i.id === itemId);
  if (!item || !confirm(`Restore "${item.title}"?`)) return;
  try {
    await window.userDataService.deleteArchive(getUid(), itemId);
    await window.userDataService.addNotification(getUid(), {
      type: "update",
      title: "Restored from archive",
      message: `"${item.title}" was removed from archive.`,
      priority: "low",
    });
    showNotification("Restored.", "success");
    await loadArchiveItems();
  } catch (e) {
    console.error(e);
    showNotification("Restore failed.", "error");
  }
}

async function deleteItemPermanent(itemId) {
  const item = archiveItems.find((i) => i.id === itemId);
  if (!item || !confirm(`Permanently delete "${item.title}"?`)) return;
  try {
    await window.userDataService.deleteArchive(getUid(), itemId);
    showNotification("Deleted.", "info");
    await loadArchiveItems();
  } catch (e) {
    console.error(e);
    showNotification("Delete failed.", "error");
  }
}

function exportArchive() {
  const rows = [["Title", "Description", "Category", "Date"], ...archiveItems.map((i) => [i.title, i.description, i.category, i.date])];
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `archive_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function cleanupArchive() {
  showNotification("Use filters and delete items individually.", "info");
}

async function refreshArchive() {
  await loadArchiveItems();
}

function updateProfileSection() {
  const stored = localStorage.getItem("registeredUser");
  if (!stored) return;
  const u = JSON.parse(stored);
  updateProfilePicture(u.profilePicture);
  updateProfileName(u.username || "User");
}

function updateProfilePicture(url) {
  const fb = "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";
  const h = document.getElementById("userAvatarHeader");
  const p = document.getElementById("userAvatarProfile");
  if (h) h.src = url || fb;
  if (p) p.src = url || fb;
}

function updateProfileName(name) {
  const el = document.getElementById("profileName");
  if (el) el.textContent = name;
}

async function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (!badge || !window.userDataService || !getUid()) return;
  try {
    const n = await window.userDataService.getUnreadNotificationCount(getUid());
    badge.textContent = String(n);
    badge.style.display = n > 0 ? "inline-flex" : "none";
  } catch (e) {
    console.warn(e);
  }
}

function openProfileModal() {
  document.getElementById("profileModal")?.classList.add("show");
}
function closeProfileModal() {
  document.getElementById("profileModal")?.classList.remove("show");
}
function editProfile() {
  window.location.href = "settings.html";
}
function changePassword() {
  window.location.href = "settings.html";
}
function goToNotifications() {
  window.location.href = "notifications.html";
}
function logout() {
  if (typeof bookvaultLogout === "function") return bookvaultLogout();
  localStorage.removeItem("registeredUser");
  window.location.href = "login.html";
}

function showNotification(message, type = "info") {
  const n = document.createElement("div");
  n.className = `notification notification-${type}`;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => n.classList.add("show"), 30);
  setTimeout(() => {
    n.classList.remove("show");
    setTimeout(() => n.remove(), 250);
  }, 2400);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProfileModal();
});

window.addEventListener("click", (e) => {
  const m = document.getElementById("profileModal");
  if (e.target === m) closeProfileModal();
});

document.addEventListener("DOMContentLoaded", () => {
  updateProfileSection();
  document.getElementById("archiveSearch")?.addEventListener("input", applyFilters);
  document.getElementById("categoryFilter")?.addEventListener("change", applyFilters);
  document.getElementById("dateFilter")?.addEventListener("change", applyFilters);
  loadArchiveItems();
});
