// Sample archive data
let archiveItems = [
  {
    id: 1,
    type: "client",
    title: "Metro Food Services",
    description: "Inactive client - Contract ended December 2023",
    category: "clients",
    date: "2023-12-31",
    size: "2.3 MB",
    status: "archived",
  },
  {
    id: 2,
    type: "invoice",
    title: "INV-2023-156 - Metro Food Services",
    description: "Final invoice - ₱5,500 (Paid)",
    category: "invoices",
    date: "2023-12-15",
    size: "156 KB",
    status: "completed",
  },
  {
    id: 3,
    type: "document",
    title: "Service Agreement - Tech Solutions Inc.",
    description: "Signed contract and terms of service",
    category: "documents",
    date: "2023-11-20",
    size: "890 KB",
    status: "archived",
  },
  {
    id: 4,
    type: "report",
    title: "Q4 2023 Financial Report",
    description: "Quarterly financial summary and analysis",
    category: "reports",
    date: "2023-12-31",
    size: "1.2 MB",
    status: "completed",
  },
  {
    id: 5,
    type: "client",
    title: "Sunrise Bakery",
    description: "Inactive client - Business closed",
    category: "clients",
    date: "2023-08-15",
    size: "1.8 MB",
    status: "archived",
  },
  {
    id: 6,
    type: "invoice",
    title: "INV-2023-089 - Sunrise Bakery",
    description: "Monthly service fee - ₱2,800 (Paid)",
    category: "invoices",
    date: "2023-08-01",
    size: "142 KB",
    status: "completed",
  },
  {
    id: 7,
    type: "document",
    title: "Tax Filing Documents 2022",
    description: "Complete tax documentation package",
    category: "documents",
    date: "2023-04-15",
    size: "3.4 MB",
    status: "archived",
  },
  {
    id: 8,
    type: "report",
    title: "Annual Report 2022",
    description: "Complete yearly financial analysis",
    category: "reports",
    date: "2023-01-31",
    size: "2.1 MB",
    status: "completed",
  },
  {
    id: 9,
    type: "client",
    title: "Green Valley Restaurant",
    description: "Inactive client - Switched to different provider",
    category: "clients",
    date: "2022-10-30",
    size: "2.7 MB",
    status: "archived",
  },
  {
    id: 10,
    type: "invoice",
    title: "INV-2022-234 - Green Valley Restaurant",
    description: "Final billing - ₱4,200 (Paid)",
    category: "invoices",
    date: "2022-10-15",
    size: "178 KB",
    status: "completed",
  },
];

let filteredArchiveItems = [...archiveItems];
let currentView = "list";

function updateProfileSection() {
    const storedUserData = localStorage.getItem("registeredUser");
    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        updateProfilePicture(userData.profilePicture);
        updateProfileName(userData.username || "User Name");
    }
}

function updateProfilePicture(profilePicture) {
    console.log("Updating profile picture based on profilePicture");
    const headerAvatar = document.getElementById("userAvatarHeader");
    const profileAvatar = document.getElementById("userAvatarProfile");
    const imageUrl = profilePicture || "https://www.clipartmax.com/png/small/186-1864115_user-icon-man-profile-icon.png";

    if (headerAvatar) headerAvatar.src = imageUrl;
    if (profileAvatar) profileAvatar.src = imageUrl;
}

function updateProfileName(username) {
    console.log("Updating profile name:", username);
    const profileNameElement = document.getElementById("profileName");
    if (profileNameElement) profileNameElement.textContent = username;
}

function setupModal() {
    const profileModal = document.getElementById('profileModal');
    const userAvatarHeaderBtn = document.querySelector('.user-avatar');
    const profileModalCloseBtn = document.querySelector('.profile-modal-close');

    function openProfileModal() {
        if (profileModal) profileModal.classList.add('show');
    }

    function closeProfileModal() {
        if (profileModal) profileModal.classList.remove('show');
    }

    if (userAvatarHeaderBtn) {
        userAvatarHeaderBtn.addEventListener('click', openProfileModal);
    }
    if (profileModalCloseBtn) {
        profileModalCloseBtn.addEventListener('click', closeProfileModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            closeProfileModal();
        }
    });
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    updateProfileSection();
    setupModal();
    updateStats();
    renderArchiveItems();
    setupEventListeners();
});

function setupEventListeners() {
    // Search functionality
    document
        .getElementById("archiveSearch")
        .addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filteredArchiveItems = archiveItems.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm)
            );
            updateStats();
            renderArchiveItems();
        });

    // Filter functionality
    document
        .getElementById("categoryFilter")
        .addEventListener("change", applyFilters);
    document
        .getElementById("dateFilter")
        .addEventListener("change", applyFilters);
}

function applyFilters() {
    const categoryFilter = document.getElementById("categoryFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;

    filteredArchiveItems = archiveItems.filter((item) => {
        const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
        const dateMatch = dateFilter === "all" || item.date.startsWith(dateFilter);
        return categoryMatch && dateMatch;
    });

    updateStats();
    renderArchiveItems();
}

function updateStats() {
    const inactiveClients = archiveItems.filter((item) => item.category === "clients").length;
    const oldInvoices = archiveItems.filter((item) => item.category === "invoices").length;
    const documents = archiveItems.filter((item) => item.category === "documents").length;
    const reports = archiveItems.filter((item) => item.category === "reports").length;

    const totalSize = archiveItems.reduce((sum, item) => {
        const size = parseFloat(item.size);
        return sum + (isNaN(size) ? 0 : size);
    }, 0);
    const oldestRecord = archiveItems.reduce((oldest, item) => {
        const itemDate = new Date(item.date);
        return oldest ? (new Date(oldest.date) < itemDate ? oldest : item) : item;
    }, null);

    document.getElementById("inactiveClientsCount").textContent = inactiveClients;
    document.getElementById("oldInvoicesCount").textContent = oldInvoices;
    document.getElementById("storageUsed").textContent =
        totalSize >= 1000 ? `${(totalSize / 1000).toFixed(1)}GB` : `${totalSize.toFixed(1)}MB`;
    document.getElementById("oldestRecord").textContent = oldestRecord
        ? `${Math.floor((new Date() - new Date(oldestRecord.date)) / (1000 * 60 * 60 * 24 * 365))} Years`
        : "N/A";

    document.querySelector(".category-grid .category-card:nth-child(1) .category-count").textContent = `${inactiveClients} items`;
    document.querySelector(".category-grid .category-card:nth-child(2) .category-count").textContent = `${oldInvoices} items`;
    document.querySelector(".category-grid .category-card:nth-child(3) .category-count").textContent = `${documents} items`;
    document.querySelector(".category-grid .category-card:nth-child(4) .category-count").textContent = `${reports} items`;
}

function clearFilters() {
    document.getElementById("categoryFilter").value = "all";
    document.getElementById("dateFilter").value = "all";
    document.getElementById("archiveSearch").value = "";
    filteredArchiveItems = [...archiveItems];
    updateStats();
    renderArchiveItems();
}

function switchView(view) {
    currentView = view;
    document
        .querySelectorAll(".view-btn")
        .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`.view-btn.${view}`).classList.add("active");

    const container = document.getElementById("archiveList");
    if (view === "grid") {
        container.classList.add("grid-view");
    } else {
        container.classList.remove("grid-view");
    }
    renderArchiveItems();
}

function showCategory(category) {
    document.getElementById("categoryFilter").value = category;
    applyFilters();
    showNotification(`Showing ${category} archive`, "info");
}

function renderArchiveItems() {
    const container = document.getElementById("archiveList");

    if (filteredArchiveItems.length === 0) {
        container.innerHTML = `
            <div class="empty-archive">
                <i class="fas fa-archive"></i>
                <h3>No archived items found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    if (currentView === "grid") {
        container.innerHTML = filteredArchiveItems
            .map(
                (item) => `
                    <div class="archive-item" onclick="viewItem(${item.id})">
                        <div class="grid-header">
                            <div class="archive-icon ${item.type}">
                                <i class="fas fa-${getArchiveIcon(item.type)}"></i>
                            </div>
                            <div class="archive-actions">
                                <button class="archive-action-btn btn-restore" onclick="restoreItem(${item.id});event.stopPropagation()">
                                    <i class="fas fa-undo"></i>
                                </button>
                                <button class="archive-action-btn btn-download" onclick="downloadItem(${item.id});event.stopPropagation()">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="archive-action-btn btn-delete-permanent" onclick="deleteItemPermanent(${item.id});event.stopPropagation()">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="grid-content">
                            <div class="archive-title">${item.title}</div>
                            <div class="archive-description">${item.description}</div>
                        </div>
                        <div class="grid-footer">
                            <div class="archive-meta">
                                <div class="archive-date">
                                    <i class="fas fa-calendar"></i>
                                    ${formatDate(item.date)}
                                </div>
                                <div class="archive-size">
                                    <i class="fas fa-file"></i>
                                    ${item.size}
                                </div>
                            </div>
                        </div>
                    </div>
                `
            )
            .join("");
    } else {
        container.innerHTML = filteredArchiveItems
            .map(
                (item) => `
                    <div class="archive-item" onclick="viewItem(${item.id})">
                        <div class="archive-icon ${item.type}">
                            <i class="fas fa-${getArchiveIcon(item.type)}"></i>
                        </div>
                        <div class="archive-content">
                            <div class="archive-title">${item.title}</div>
                            <div class="archive-description">${item.description}</div>
                            <div class="archive-meta">
                                <div class="archive-date">
                                    <i class="fas fa-calendar"></i>
                                    ${formatDate(item.date)}
                                </div>
                                <div class="archive-size">
                                    <i class="fas fa-file"></i>
                                    ${item.size}
                                </div>
                            </div>
                        </div>
                        <div class="archive-actions">
                            <button class="archive-action-btn btn-restore" onclick="restoreItem(${item.id});event.stopPropagation()">
                                <i class="fas fa-undo"></i> Restore
                            </button>
                            <button class="archive-action-btn btn-download" onclick="downloadItem(${item.id});event.stopPropagation()">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="archive-action-btn btn-delete-permanent" onclick="deleteItemPermanent(${item.id});event.stopPropagation()">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `
            )
            .join("");
    }
}

function getArchiveIcon(type) {
    const icons = {
        client: "users",
        invoice: "file-invoice",
        document: "file-alt",
        report: "chart-bar",
    };
    return icons[type] || "file";
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function viewItem(itemId) {
    const item = archiveItems.find((i) => i.id === itemId);
    if (item) {
        showNotification(`Viewing "${item.title}" details`, "info");
    }
}

function restoreItem(itemId) {
    const item = archiveItems.find((i) => i.id === itemId);
    if (item && confirm(`Are you sure you want to restore "${item.title}"?`)) {
        showNotification(`"${item.title}" has been restored`, "success");
        const index = archiveItems.findIndex((i) => i.id === itemId);
        if (index > -1) {
            archiveItems.splice(index, 1);
            filteredArchiveItems = [...archiveItems];
            updateStats();
            renderArchiveItems();
        }
    }
}

function downloadItem(itemId) {
    const item = archiveItems.find((i) => i.id === itemId);
    if (item) {
        showNotification(`Downloading "${item.title}"...`, "info");
    }
}

function deleteItemPermanent(itemId) {
    const item = archiveItems.find((i) => i.id === itemId);
    if (
        item &&
        confirm(
            `Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`
        )
    ) {
        const index = archiveItems.findIndex((i) => i.id === itemId);
        if (index > -1) {
            archiveItems.splice(index, 1);
            filteredArchiveItems = [...archiveItems];
            updateStats();
            renderArchiveItems();
            showNotification(`"${item.title}" has been permanently deleted`, "info");
        }
    }
}

function exportArchive() {
    showNotification("Exporting archive data...", "info");
}

function cleanupArchive() {
    if (
        confirm("This will permanently delete items older than 3 years. Continue?")
    ) {
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 3);

        const itemsToDelete = archiveItems.filter(
            (item) => new Date(item.date) < cutoffDate
        );

        if (itemsToDelete.length > 0) {
            archiveItems = archiveItems.filter(
                (item) => new Date(item.date) >= cutoffDate
            );
            filteredArchiveItems = [...archiveItems];
            updateStats();
            renderArchiveItems();
            showNotification(`Cleaned up ${itemsToDelete.length} old items`, "success");
        } else {
            showNotification("No items older than 3 years found", "info");
        }
    }
}

function refreshArchive() {
    showNotification("Refreshing archive data...", "info");
    renderArchiveItems();
}

function goToNotifications() {
    window.location.href = "notifications.html";
}

function openProfileModal() {
    document.getElementById("profileModal").classList.add("show");
}

function closeProfileModal() {
    document.getElementById("profileModal").classList.remove("show");
}

function editProfile() {
    showNotification("Opening profile edit page...", "info");
}

function changePassword() {
    showNotification("Opening password change page...", "info");
}

function logout() {
    if (typeof bookvaultLogout === "function") {
        bookvaultLogout();
        return;
    }
    window.location.href = "login.html";
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${
            type === "success"
                ? "check-circle"
                : type === "error"
                ? "exclamation-circle"
                : "info-circle"
        }"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add("show"), 100);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}